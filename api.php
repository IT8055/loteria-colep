<?php
/*
 * Lotería Colep: JSON API.
 *
 * Every request is a POST with a JSON body carrying an "action" field.
 * Data lives in a SQLite database inside data/, which .htaccess blocks from the web.
 * Tables are created automatically on the first request.
 */

declare(strict_types=1);

const DB_FILE     = __DIR__ . '/data/loteria.sqlite';
const CARD_COUNT  = 24;
const BOARD_SIZE  = 16;
const NAME_MAX    = 20;
const MAX_PLAYERS = 150;
const MAX_ROOMS   = 500;
const ROOM_TTL    = 86400;
const CODE_WORDS  = [
    'SPRAY', 'LATA', 'FORMULA', 'VALVULA', 'MEZCLA', 'TAPA', 'ROBOT', 'PROMPT',
    'LLENADO', 'SELLADO', 'IMPULSO', 'NIEBLA', 'ESPUMA', 'BOQUILLA', 'CHATBOT', 'TARIMA',
];

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(array $data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function fail(string $code, string $message, int $status = 400): void
{
    respond(['ok' => false, 'error' => $code, 'message' => $message], $status);
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dir = dirname(DB_FILE);
    if (!is_dir($dir) && !mkdir($dir, 0755, true)) {
        throw new RuntimeException('Cannot create the data folder.');
    }
    if (!file_exists($dir . '/.htaccess')) {
        file_put_contents($dir . '/.htaccess', "<IfModule mod_authz_core.c>\n  Require all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\n  Order deny,allow\n  Deny from all\n</IfModule>\n");
    }

    $pdo = new PDO('sqlite:' . DB_FILE, null, null, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_TIMEOUT            => 5,
    ]);
    $pdo->exec('PRAGMA foreign_keys = ON');
    $pdo->exec('PRAGMA synchronous = NORMAL');

    $version = (int) $pdo->query('PRAGMA user_version')->fetchColumn();
    if ($version < 1) {
        $pdo->exec('PRAGMA journal_mode = WAL');
        $pdo->exec('CREATE TABLE IF NOT EXISTS rooms (
            code         TEXT PRIMARY KEY,
            caller_token TEXT NOT NULL,
            deck         TEXT NOT NULL,
            position     INTEGER NOT NULL DEFAULT 0,
            status       TEXT NOT NULL DEFAULT \'lobby\',
            round        INTEGER NOT NULL DEFAULT 1,
            created_at   INTEGER NOT NULL
        )');
        $pdo->exec('CREATE TABLE IF NOT EXISTS players (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            room_code TEXT NOT NULL REFERENCES rooms(code) ON DELETE CASCADE,
            name      TEXT NOT NULL,
            name_key  TEXT NOT NULL,
            token     TEXT NOT NULL,
            board     TEXT NOT NULL,
            joined_at INTEGER NOT NULL,
            UNIQUE (room_code, name_key)
        )');
        $pdo->exec('CREATE TABLE IF NOT EXISTS claims (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            room_code  TEXT NOT NULL REFERENCES rooms(code) ON DELETE CASCADE,
            player_id  INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
            valid      INTEGER NOT NULL DEFAULT 0,
            line       TEXT,
            created_at INTEGER NOT NULL
        )');
        $pdo->exec('CREATE INDEX IF NOT EXISTS idx_rooms_created ON rooms(created_at)');
        $pdo->exec('CREATE INDEX IF NOT EXISTS idx_players_room ON players(room_code)');
        $pdo->exec('CREATE INDEX IF NOT EXISTS idx_claims_room ON claims(room_code, valid)');
        $pdo->exec('PRAGMA user_version = 1');
    }

    return $pdo;
}

/* Runs $fn inside a write transaction so concurrent requests on one room cannot interleave. */
function locked(callable $fn)
{
    $pdo = db();
    $pdo->exec('BEGIN IMMEDIATE');
    try {
        $result = $fn($pdo);
        $pdo->exec('COMMIT');
        return $result;
    } catch (Throwable $e) {
        $pdo->exec('ROLLBACK');
        throw $e;
    }
}

/* Input helpers */

function str_in(array $in, string $key): string
{
    $v = $in[$key] ?? '';
    if (is_int($v)) {
        return (string) $v;
    }
    return is_string($v) ? trim($v) : '';
}

function int_in(array $in, string $key, int $default = 0): int
{
    $v = $in[$key] ?? null;
    if (is_int($v)) {
        return $v;
    }
    if (is_string($v) && preg_match('/^-?\d{1,9}$/', $v)) {
        return (int) $v;
    }
    return $default;
}

function text_length(string $s): int
{
    return (int) preg_match_all('/./us', $s);
}

/* Accepts "spray42", "Spray 42" or "SPRAY-42" and returns "SPRAY-42". */
function room_code_in(array $in): string
{
    $raw = preg_replace('/[^A-Z0-9]/', '', strtoupper(str_in($in, 'code')));
    if (!preg_match('/^([A-Z]{2,12})([0-9]{2,3})$/', (string) $raw, $m)) {
        fail('bad_code', 'That room code does not look right. It should look like SPRAY-42.');
    }
    return $m[1] . '-' . $m[2];
}

function clean_name(string $raw): string
{
    $name = preg_replace('/[\p{Cc}\p{Cf}]/u', '', $raw);
    if ($name === null) {
        fail('bad_name', 'The name contains characters we cannot read.');
    }
    $name = trim((string) preg_replace('/\s+/u', ' ', $name));
    if ($name === '') {
        fail('bad_name', 'Please enter a name.');
    }
    if (text_length($name) > NAME_MAX) {
        fail('name_too_long', 'Names can be at most ' . NAME_MAX . ' characters.');
    }
    return $name;
}

/* Case folded form of a name, so "Ana María" and "ANA MARÍA" count as the same player. */
function name_key(string $name): string
{
    if (function_exists('mb_strtolower')) {
        return mb_strtolower($name, 'UTF-8');
    }
    $upper = ['Á', 'É', 'Í', 'Ó', 'Ú', 'Ü', 'Ñ', 'À', 'È', 'Ì', 'Ò', 'Ù', 'Ç'];
    $lower = ['á', 'é', 'í', 'ó', 'ú', 'ü', 'ñ', 'à', 'è', 'ì', 'ò', 'ù', 'ç'];
    return str_replace($upper, $lower, strtolower($name));
}

function token_ok(string $expected, string $given): bool
{
    return $given !== '' && hash_equals($expected, $given);
}

function new_token(): string
{
    return bin2hex(random_bytes(16));
}

/* Game helpers */

function shuffled_deck(): array
{
    $deck = range(1, CARD_COUNT);
    for ($i = count($deck) - 1; $i > 0; $i -= 1) {
        $j = random_int(0, $i);
        $tmp = $deck[$i];
        $deck[$i] = $deck[$j];
        $deck[$j] = $tmp;
    }
    return $deck;
}

function deal_board(): array
{
    return array_slice(shuffled_deck(), 0, BOARD_SIZE);
}

function board_lines(): array
{
    $lines = [];
    for ($i = 0; $i < 4; $i += 1) {
        $lines[] = [$i * 4, $i * 4 + 1, $i * 4 + 2, $i * 4 + 3];
        $lines[] = [$i, $i + 4, $i + 8, $i + 12];
    }
    $lines[] = [0, 5, 10, 15];
    $lines[] = [3, 6, 9, 12];
    return $lines;
}

/* Returns the board positions of the first complete line, or null. */
function winning_line(array $board, array $called): ?array
{
    $isCalled = array_flip($called);
    foreach (board_lines() as $line) {
        $complete = true;
        foreach ($line as $pos) {
            if (!isset($board[$pos], $isCalled[$board[$pos]])) {
                $complete = false;
                break;
            }
        }
        if ($complete) {
            return $line;
        }
    }
    return null;
}

function load_room(PDO $pdo, string $code): array
{
    $stmt = $pdo->prepare('SELECT * FROM rooms WHERE code = ?');
    $stmt->execute([$code]);
    $room = $stmt->fetch();
    if (!$room) {
        fail('room_not_found', 'No room with that code. It may have expired.', 404);
    }
    $room['deck'] = json_decode($room['deck'], true);
    $room['position'] = (int) $room['position'];
    $room['round'] = (int) $room['round'];
    return $room;
}

function require_caller(array $room, array $in): void
{
    if (!token_ok($room['caller_token'], str_in($in, 'caller_token'))) {
        fail('not_caller', 'Only the caller of this room can do that.', 403);
    }
}

function load_player(PDO $pdo, string $code, array $in): array
{
    $stmt = $pdo->prepare('SELECT * FROM players WHERE id = ? AND room_code = ?');
    $stmt->execute([int_in($in, 'player_id'), $code]);
    $player = $stmt->fetch();
    if (!$player || !token_ok($player['token'], str_in($in, 'token'))) {
        fail('not_player', 'We could not find you in this room. Please join again.', 403);
    }
    $player['id'] = (int) $player['id'];
    $player['board'] = json_decode($player['board'], true);
    return $player;
}

/* Actions */

/* Clears out expired rooms, then opens a new room. Returns its code and caller token. */
function open_room(PDO $pdo): array
{
    $cutoff = time() - ROOM_TTL;
    $old = 'SELECT code FROM rooms WHERE created_at < ?';
    $pdo->prepare("DELETE FROM claims WHERE room_code IN ($old)")->execute([$cutoff]);
    $pdo->prepare("DELETE FROM players WHERE room_code IN ($old)")->execute([$cutoff]);
    $pdo->prepare('DELETE FROM rooms WHERE created_at < ?')->execute([$cutoff]);

    if ((int) $pdo->query('SELECT COUNT(*) FROM rooms')->fetchColumn() >= MAX_ROOMS) {
        fail('busy', 'Too many rooms are open right now. Please try again later.', 503);
    }

    $token = new_token();
    $deck = json_encode(shuffled_deck());
    $insert = $pdo->prepare('INSERT INTO rooms (code, caller_token, deck, position, status, round, created_at) VALUES (?, ?, ?, 0, \'lobby\', 1, ?)');

    for ($attempt = 0; $attempt < 40; $attempt += 1) {
        $number = $attempt < 25 ? random_int(10, 99) : random_int(100, 999);
        $code = CODE_WORDS[random_int(0, count(CODE_WORDS) - 1)] . '-' . $number;
        try {
            $insert->execute([$code, $token, $deck, time()]);
            return ['code' => $code, 'caller_token' => $token, 'round' => 1, 'status' => 'lobby'];
        } catch (PDOException $e) {
            if ($e->getCode() !== '23000') {
                throw $e;
            }
        }
    }
    fail('busy', 'Could not find a free room code. Please try again.', 503);
    return [];
}

function action_create_room(): void
{
    respond(['ok' => true] + open_room(db()));
}

/* Deletes the caller's room with all its players and claims, then opens a new room with a new code. */
function action_reset_room(array $in): void
{
    $pdo = db();
    $code = room_code_in($in);
    locked(static function (PDO $pdo) use ($code, $in): void {
        $stmt = $pdo->prepare('SELECT caller_token FROM rooms WHERE code = ?');
        $stmt->execute([$code]);
        $token = $stmt->fetchColumn();
        if ($token === false) {
            return;
        }
        if (!token_ok((string) $token, str_in($in, 'caller_token'))) {
            fail('not_caller', 'Only the caller of this room can do that.', 403);
        }
        $pdo->prepare('DELETE FROM claims WHERE room_code = ?')->execute([$code]);
        $pdo->prepare('DELETE FROM players WHERE room_code = ?')->execute([$code]);
        $pdo->prepare('DELETE FROM rooms WHERE code = ?')->execute([$code]);
    });
    respond(['ok' => true] + open_room($pdo));
}

function action_join(array $in): void
{
    $pdo = db();
    $code = room_code_in($in);
    $name = clean_name(str_in($in, 'name'));
    $room = load_room($pdo, $code);

    $count = $pdo->prepare('SELECT COUNT(*) FROM players WHERE room_code = ?');
    $count->execute([$code]);
    if ((int) $count->fetchColumn() >= MAX_PLAYERS) {
        fail('room_full', 'This room is full.', 409);
    }

    $key = name_key($name);
    $taken = $pdo->prepare('SELECT 1 FROM players WHERE room_code = ? AND name_key = ?');
    $taken->execute([$code, $key]);
    if ($taken->fetchColumn()) {
        fail('name_taken', 'Someone in this room already has that name. Try another one.', 409);
    }

    $token = new_token();
    $board = deal_board();
    try {
        $pdo->prepare('INSERT INTO players (room_code, name, name_key, token, board, joined_at) VALUES (?, ?, ?, ?, ?, ?)')
            ->execute([$code, $name, $key, $token, json_encode($board), time()]);
    } catch (PDOException $e) {
        if ($e->getCode() === '23000') {
            fail('name_taken', 'Someone in this room already has that name. Try another one.', 409);
        }
        throw $e;
    }

    respond([
        'ok'        => true,
        'code'      => $code,
        'player_id' => (int) $pdo->lastInsertId(),
        'token'     => $token,
        'name'      => $name,
        'board'     => $board,
        'round'     => $room['round'],
        'status'    => $room['status'],
    ]);
}

function action_state(array $in): void
{
    $pdo = db();
    $code = room_code_in($in);
    $room = load_room($pdo, $code);

    if (str_in($in, 'caller_token') !== '') {
        require_caller($room, $in);
    }

    $position = $room['position'];
    $roundChanged = int_in($in, 'round', -1) !== $room['round'];
    $since = max(0, int_in($in, 'since'));
    if ($roundChanged || $since > $position) {
        $since = 0;
    }

    $out = [
        'ok'       => true,
        'status'   => $room['status'],
        'round'    => $room['round'],
        'position' => $position,
        'total'    => CARD_COUNT,
        'from'     => $since,
        'called'   => array_slice($room['deck'], $since, $position - $since),
    ];

    $count = $pdo->prepare('SELECT COUNT(*) FROM players WHERE room_code = ?');
    $count->execute([$code]);
    $out['count'] = (int) $count->fetchColumn();
    if (int_in($in, 'pc', -1) !== $out['count']) {
        $names = $pdo->prepare('SELECT name FROM players WHERE room_code = ? ORDER BY id');
        $names->execute([$code]);
        $out['players'] = $names->fetchAll(PDO::FETCH_COLUMN);
    }

    if (int_in($in, 'player_id') > 0) {
        $player = load_player($pdo, $code, $in);
        if ($roundChanged) {
            $out['board'] = $player['board'];
        }
    }

    if ($room['status'] === 'finished') {
        $claims = $pdo->prepare('SELECT c.player_id, c.line, p.name, p.board FROM claims c JOIN players p ON p.id = c.player_id WHERE c.room_code = ? AND c.valid = 1 ORDER BY c.id');
        $claims->execute([$code]);
        $out['claims'] = array_map(static function (array $c): array {
            return [
                'player_id' => (int) $c['player_id'],
                'name'      => $c['name'],
                'board'     => json_decode($c['board'], true),
                'line'      => json_decode((string) $c['line'], true),
            ];
        }, $claims->fetchAll());
    }

    respond($out);
}

function action_draw(array $in): void
{
    $code = room_code_in($in);
    $result = locked(static function (PDO $pdo) use ($code, $in): array {
        $room = load_room($pdo, $code);
        require_caller($room, $in);
        if ($room['status'] === 'finished') {
            fail('round_finished', 'Someone already won this round. Start a new game.', 409);
        }
        if ($room['position'] >= CARD_COUNT) {
            fail('deck_empty', 'All ' . CARD_COUNT . ' cards have been called.', 409);
        }
        $position = $room['position'] + 1;
        $pdo->prepare('UPDATE rooms SET position = ?, status = \'playing\' WHERE code = ?')->execute([$position, $code]);
        return ['position' => $position, 'card' => $room['deck'][$position - 1], 'round' => $room['round']];
    });

    respond(['ok' => true, 'status' => 'playing', 'total' => CARD_COUNT] + $result);
}

function action_claim(array $in): void
{
    $code = room_code_in($in);
    $result = locked(static function (PDO $pdo) use ($code, $in): array {
        $room = load_room($pdo, $code);
        $player = load_player($pdo, $code, $in);
        if ($room['status'] === 'lobby') {
            fail('not_started', 'The game has not started yet.', 409);
        }

        $last = $pdo->prepare('SELECT MAX(created_at) FROM claims WHERE player_id = ?');
        $last->execute([$player['id']]);
        $lastAt = $last->fetchColumn();
        if ($lastAt !== null && time() - (int) $lastAt < 2) {
            fail('slow_down', 'Easy there! Wait a moment before claiming again.', 429);
        }

        $line = winning_line($player['board'], array_slice($room['deck'], 0, $room['position']));
        $valid = $line !== null;

        $already = $pdo->prepare('SELECT 1 FROM claims WHERE player_id = ? AND valid = 1');
        $already->execute([$player['id']]);
        if (!$valid || !$already->fetchColumn()) {
            $pdo->prepare('INSERT INTO claims (room_code, player_id, valid, line, created_at) VALUES (?, ?, ?, ?, ?)')
                ->execute([$code, $player['id'], $valid ? 1 : 0, $valid ? json_encode($line) : null, time()]);
        }
        if ($valid) {
            $pdo->prepare('UPDATE rooms SET status = \'finished\' WHERE code = ?')->execute([$code]);
        }
        return ['valid' => $valid, 'line' => $line, 'position' => $room['position']];
    });

    respond(['ok' => true] + $result);
}

function action_new_game(array $in): void
{
    $code = room_code_in($in);
    $round = locked(static function (PDO $pdo) use ($code, $in): int {
        $room = load_room($pdo, $code);
        require_caller($room, $in);
        $round = $room['round'] + 1;
        $pdo->prepare('UPDATE rooms SET deck = ?, position = 0, status = \'lobby\', round = ? WHERE code = ?')
            ->execute([json_encode(shuffled_deck()), $round, $code]);
        $pdo->prepare('DELETE FROM claims WHERE room_code = ?')->execute([$code]);

        $ids = $pdo->prepare('SELECT id FROM players WHERE room_code = ?');
        $ids->execute([$code]);
        $deal = $pdo->prepare('UPDATE players SET board = ? WHERE id = ?');
        foreach ($ids->fetchAll(PDO::FETCH_COLUMN) as $id) {
            $deal->execute([json_encode(deal_board()), $id]);
        }
        return $round;
    });

    respond(['ok' => true, 'round' => $round, 'status' => 'lobby', 'position' => 0]);
}

/* Request handling */

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'GET') {
    respond(['ok' => true, 'app' => 'loteria-colep']);
}
if ($method !== 'POST') {
    fail('bad_method', 'Use POST.', 405);
}

$raw = file_get_contents('php://input', false, null, 0, 8192);
$in = json_decode($raw === false ? '' : $raw, true);
if (!is_array($in)) {
    fail('bad_request', 'Send a JSON object with an "action" field.');
}

try {
    switch (str_in($in, 'action')) {
        case 'create_room':
            action_create_room();
            break;
        case 'join':
            action_join($in);
            break;
        case 'state':
            action_state($in);
            break;
        case 'draw':
            action_draw($in);
            break;
        case 'claim':
            action_claim($in);
            break;
        case 'reset_room':
            action_reset_room($in);
            break;
        case 'new_game':
            action_new_game($in);
            break;
        default:
            fail('bad_action', 'Unknown action.');
    }
} catch (Throwable $e) {
    error_log('Loteria API: ' . $e->getMessage());
    fail('server_error', 'Something went wrong on the server. Please try again.', 500);
}
