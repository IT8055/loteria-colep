# Lotería Colep

A live multiplayer Mexican Lotería themed around Colep Consumer Products (aerosols, filling lines,
packaging) and AI. Bilingual: Mexican Spanish and English. Installable as a PWA on Android and iOS.

Live: https://walker-jones.eu/dev/loteria/

## How to play

1. On the projector laptop open `https://walker-jones.eu/dev/loteria/?mode=caller` and press **Crear sala / Create room**.
2. Players scan the QR code (or open the site and type the room code) and enter a name.
3. Press **¡Empezar! / Start!**, then **Siguiente carta / Next card** for each card. A presentation
   clicker works too: Right arrow, Page Down, Space and Enter all call the next card.
4. Players tap called cards to place a frijol, then press **¡Lotería!** when they have a full row,
   column or diagonal. The server checks the board.
5. When someone wins, the caller chooses **Otra ronda / Play again** (same players, new boards)
   or **Sala nueva / New room** (a new code to scan).

The **?** button in the header (and the "¿Cómo se juega? / How to play" link) opens the rules in
Spanish or English. Each player picks their own language with the ES/EN toggle. The verse is read aloud
(es-MX or en-GB voice); the speaker button mutes it.

## Files

- `index.html`: the page, plus the 24 cards (names, verses and inline SVG art) in the first script.
- `app.js`: player and caller logic, polling every 2 seconds, speech, confetti, PWA install.
- `style.css`: styles, mobile first, projector layouts above 900px wide.
- `api.php`: JSON API (PDO and SQLite, prepared statements). Creates its tables on first run.
- `data/`: the SQLite database. `data/.htaccess` blocks web access.
- `sw.js`, `manifest.webmanifest`, `icons/`: the PWA.
- `.htaccess`: no directory listings, blocks `data/` and database files, no caching for `sw.js`.

## Deploying

Upload everything except `README.md` into `public_html/dev/loteria/`. The `data/` folder must be
writable by PHP; the database is created on the first API call. Requires PHP 7.4 or newer with
PDO SQLite (standard on cPanel). Rooms older than 24 hours are deleted whenever a new room is created.

When you change `app.js` or `style.css`, bump the `?v=` number in `index.html` and in `sw.js`,
and bump `VERSION` in `sw.js`, so installed phones pick up the update.

Health check: `https://walker-jones.eu/dev/loteria/api.php` returns `{"ok":true,"app":"loteria-colep"}`.
