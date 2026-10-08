/*
 * Lotería Colep client.
 * Player mode is the default; ?mode=caller opens the caller (el gritón) screens.
 * Cards and their SVG drawings come from window.LOTERIA, defined in index.html.
 */
(function () {
  'use strict';

  var L = window.LOTERIA;
  var POLL_MS = 2000;
  var params = new URLSearchParams(location.search);
  var MODE = params.get('mode') === 'caller' ? 'caller' : 'player';

  /* Text */

  var T = {
    es: {
      reconnecting: 'Reconectando...',
      how_to_play: '¿Cómo se juega?',
      rules_ok: '¡Órale, a jugar!',
      install: 'Instalar',
      join_title: 'Únete al juego',
      join_intro: 'Escanea el código QR del gritón o escribe el código de la sala.',
      room_code: 'Código de sala',
      your_name: 'Nombre del jugador',
      join_btn: '¡Entrar!',
      joining: 'Entrando...',
      ios_install: 'Para instalarla: toca Compartir y luego "Agregar a inicio".',
      close: 'Cerrar',
      caller_link: '¿Vas a cantar las cartas? Abre el modo gritón',
      player_link: '¿Vas a jugar? Entra como jugador',
      host_title: 'Modo gritón',
      host_intro: 'Tú cantas las cartas en la pantalla grande. Los jugadores se unen desde su celular.',
      create_room: 'Crear sala',
      creating: 'Creando...',
      or_visit: 'o entra a',
      players: 'Jugadores',
      no_players: 'Esperando jugadores...',
      scan_to_join: 'Escanea para jugar',
      start: '¡Empezar!',
      next_card: 'Siguiente carta',
      new_game: 'Nuevo juego',
      play_again: 'Otra ronda',
      play_again_sub: 'Mismos jugadores, tableros nuevos',
      new_room: 'Sala nueva',
      confirm_room: '¿Crear una sala nueva? Los jugadores tendrán que escanear el código nuevo.',
      cards_called: 'Cartas cantadas',
      confirm_new: '¿Empezar un juego nuevo con los mismos jugadores? Todos reciben tablero nuevo.',
      leave: 'Salir',
      confirm_leave: '¿Salir de la sala? Para volver tendrás que usar otro nombre.',
      loteria_btn: '¡Lotería!',
      now_label: 'Carta cantada',
      waiting_title: '¡Ya estás dentro!',
      waiting_start: 'Esperando a que el gritón empiece...',
      waiting_next: 'Atento a la siguiente carta',
      finished_wait: 'Esperando el siguiente juego...',
      ready_title: '¡Listos!',
      ready_verse: 'Pulsa "¡Empezar!" para cantar la primera carta.',
      count_of: '{n} de {t} cartas',
      players_n: '· {n} jugadores',
      player_1: '· 1 jugador',
      not_yet: '¡Todavía no!',
      you_won: '¡Ganaste!',
      winner: '¡LOTERÍA!',
      and: ' y ',
      new_round: '¡Juego nuevo! Tienes tablero nuevo.',
      deck_done: 'Ya salieron las 24 cartas.',
      mute: 'Silenciar voz',
      unmute: 'Activar voz',
      board: 'Tablero',
      err_network: 'No hay conexión. Inténtalo otra vez.',
      err_bad_code: 'Ese código no se ve bien. Debe ser algo como SPRAY-42.',
      err_room_not_found: 'No encontramos esa sala. Revisa el código o pide uno nuevo.',
      err_bad_name: 'Escribe tu nombre.',
      err_name_too_long: 'El nombre puede tener máximo 20 letras.',
      err_name_taken: 'Ya hay alguien con ese nombre en la sala. Prueba otro.',
      err_room_full: 'La sala está llena.',
      err_not_player: 'No te encontramos en la sala. Vuelve a entrar.',
      err_not_caller: 'Esta pantalla ya no es la del gritón de esa sala.',
      err_deck_empty: 'Ya salieron las 24 cartas. Empieza un juego nuevo.',
      err_round_finished: 'Ya hubo ganador. Empieza un juego nuevo.',
      err_not_started: 'El juego todavía no empieza.',
      err_slow_down: '¡Calma! Espera un segundito.',
      err_busy: 'El servidor está ocupado. Inténtalo en un momento.',
      err_generic: 'Algo salió mal. Inténtalo otra vez.'
    },
    en: {
      reconnecting: 'Reconnecting...',
      how_to_play: 'How to play',
      rules_ok: 'Got it, let\'s play!',
      install: 'Install',
      join_title: 'Join the game',
      join_intro: 'Scan the caller\'s QR code or type the room code.',
      room_code: 'Room code',
      your_name: 'Player\'s name',
      join_btn: 'Let me in!',
      joining: 'Joining...',
      ios_install: 'To install: tap Share, then "Add to Home Screen".',
      close: 'Close',
      caller_link: 'Calling the cards? Open caller mode',
      player_link: 'Playing? Join as a player',
      host_title: 'Caller mode',
      host_intro: 'You call the cards on the big screen. Players join from their phones.',
      create_room: 'Create room',
      creating: 'Creating...',
      or_visit: 'or go to',
      players: 'Players',
      no_players: 'Waiting for players...',
      scan_to_join: 'Scan to play',
      start: 'Start!',
      next_card: 'Next card',
      new_game: 'New game',
      play_again: 'Play again',
      play_again_sub: 'Same players, new boards',
      new_room: 'New room',
      confirm_room: 'Create a new room? Players will need to scan the new code.',
      cards_called: 'Cards called',
      confirm_new: 'Start a new game with the same players? Everyone gets a new board.',
      leave: 'Leave',
      confirm_leave: 'Leave the room? To come back you will need a different name.',
      loteria_btn: 'Lotería!',
      now_label: 'Card called',
      waiting_title: 'You are in!',
      waiting_start: 'Waiting for the caller to start...',
      waiting_next: 'Watch out for the next card',
      finished_wait: 'Waiting for the next game...',
      ready_title: 'Ready!',
      ready_verse: 'Press "Start!" to call the first card.',
      count_of: '{n} of {t} cards',
      players_n: '· {n} players',
      player_1: '· 1 player',
      not_yet: 'Not yet!',
      you_won: 'You won!',
      winner: 'LOTERÍA!',
      and: ' and ',
      new_round: 'New game! You have a fresh board.',
      deck_done: 'All 24 cards have been called.',
      mute: 'Mute voice',
      unmute: 'Turn voice on',
      board: 'Board',
      err_network: 'No connection. Please try again.',
      err_bad_code: 'That code does not look right. It should be like SPRAY-42.',
      err_room_not_found: 'We could not find that room. Check the code or ask for a new one.',
      err_bad_name: 'Please type your name.',
      err_name_too_long: 'Names can be at most 20 characters.',
      err_name_taken: 'Someone in this room already has that name. Try another.',
      err_room_full: 'This room is full.',
      err_not_player: 'We could not find you in this room. Please join again.',
      err_not_caller: 'This screen is no longer the caller for that room.',
      err_deck_empty: 'All 24 cards have been called. Start a new game.',
      err_round_finished: 'We already have a winner. Start a new game.',
      err_not_started: 'The game has not started yet.',
      err_slow_down: 'Easy! Wait a second.',
      err_busy: 'The server is busy. Try again in a moment.',
      err_generic: 'Something went wrong. Please try again.'
    }
  };

  /* Rules. Written separately for each language rather than translated word for word. */

  var RULES = {
    es: {
      title: 'Cómo se juega',
      intro: 'La lotería de toda la vida, pero con aerosoles, latas y un chatbot que inventa cosas. Gana quien llene primero una línea de su tablero.',
      steps: [
        '<b>Entra a la sala.</b> Escanea el código QR de la pantalla grande o escribe el código de sala (algo como <span class="nw">SPRAY-42</span>) y tu nombre.',
        '<b>Revisa tu tablero.</b> Te tocan 16 cartas en una cuadrícula de 4 por 4. Cada quien tiene un tablero distinto.',
        '<b>Ponte atento al gritón.</b> Las cartas se cantan una por una: aparecen arriba de tu tablero y se lee su verso en voz alta.',
        '<b>Ponle frijol.</b> Cuando salga una carta de tu tablero, tócala para ponerle un frijol. Si te equivocaste, tócala otra vez y se lo quitas. Como en la lotería de papel, nadie te detiene si le pones frijol a la carta equivocada, así que fíjate bien.',
        '<b>¡Lotería!</b> Cuando completes una línea de 4 cartas cantadas, aprieta el botón "¡Lotería!". Vale un renglón, una columna o cualquiera de las dos diagonales.',
        '<b>El sistema revisa.</b> Si tu línea está completa, ¡ganaste!, y todos lo ven en su pantalla con confeti. Si no, te sale "¡Todavía no!" y sigues jugando sin bronca.'
      ],
      linesTitle: 'Líneas que ganan',
      lines: ['Renglón', 'Columna', 'Diagonal', 'Diagonal'],
      smallTitle: 'La letra chiquita',
      small: [
        'Gana el primero que cante lotería con una línea completa. Si alguien más completó su línea con esa misma carta, también puede cantar y comparten el triunfo.',
        'El sistema revisa las cartas que ya se cantaron, no tus frijoles. Los frijoles son para que no te pierdas.',
        'Si recargas la página, sigues con el mismo tablero.',
        'En cada juego nuevo, todos reciben un tablero nuevo.',
        'Toca la bocina para silenciar la voz y ES/EN para cambiar de idioma cuando quieras.'
      ],
      callerTitle: 'Para el gritón',
      caller: [
        'Abre el modo gritón en la computadora del proyector y pulsa "Crear sala".',
        'Espera a que aparezcan los nombres de todos y pulsa "¡Empezar!".',
        'Pulsa "Siguiente carta" para cantar cada carta. También funcionan el control de presentaciones, las flechas, la barra espaciadora y Enter.',
        'Cuando alguien gane, elige "Otra ronda" para jugar otra vez con los mismos jugadores (todos reciben tablero nuevo) o "Sala nueva" para empezar con un código nuevo.'
      ]
    },
    en: {
      title: 'How to play',
      intro: 'Classic Mexican Lotería, now with aerosols, cans and a chatbot that makes things up. Think bingo, but with pictures and a lot more shouting. The first to complete a line on their board wins.',
      steps: [
        '<b>Join the room.</b> Scan the QR code on the big screen, or type the room code (something like <span class="nw">SPRAY-42</span>) and your name.',
        '<b>Check your board.</b> You get 16 cards in a 4 by 4 grid. Everyone has a different board.',
        '<b>Listen to the caller.</b> Cards are called one at a time. Each one appears above your board and its verse is read aloud.',
        '<b>Place a bean.</b> When a card on your board is called, tap it to put a frijol (a bean) on it. Tap it again to take the bean off. Just like a paper board, nothing stops you putting a bean on the wrong card, so keep your eyes open.',
        '<b>Lotería!</b> When you have a line of 4 called cards, hit the "Lotería!" button. A row, a column or either diagonal counts.',
        '<b>The game checks.</b> If your line is complete, you win, and everyone sees it on their screen with confetti. If not, you get "Not yet!" and carry on, no penalty.'
      ],
      linesTitle: 'Winning lines',
      lines: ['Row', 'Column', 'Diagonal', 'Diagonal'],
      smallTitle: 'The small print',
      small: [
        'The first player to call Lotería with a complete line wins. If someone else completed a line on that same card, they can still call it and share the win.',
        'The game checks which cards have been called, not your beans. The beans are just there to help you keep track.',
        'If you reload the page, you keep the same board.',
        'Every new game deals everyone a fresh board.',
        'Tap the speaker to mute the voice, and ES/EN to switch language at any time.'
      ],
      callerTitle: 'For the caller',
      caller: [
        'Open caller mode on the projector laptop and press "Create room".',
        'Wait until everyone\'s name has appeared, then press "Start!".',
        'Press "Next card" to call each card. A presentation clicker works too, as do the arrow keys, Space and Enter.',
        'When someone wins, choose "Play again" for another round with the same players (everyone gets a new board), or "New room" to start over with a new code.'
      ]
    }
  };

  var RULE_LINES = [[4, 5, 6, 7], [1, 5, 9, 13], [0, 5, 10, 15], [3, 6, 9, 12]];

  function rulesHTML(code) {
    var R = RULES[code];
    var li = function (x) { return '<li>' + x + '</li>'; };
    var grids = RULE_LINES.map(function (line, k) {
      var cells = '';
      for (var i = 0; i < 16; i += 1) { cells += '<span' + (line.indexOf(i) >= 0 ? ' class="on"' : '') + '></span>'; }
      return '<figure><div class="mini-grid" aria-hidden="true">' + cells + '</div><figcaption>' + R.lines[k] + '</figcaption></figure>';
    }).join('');
    return '<h2 id="rulesTitle">' + R.title + '</h2>' +
      '<p class="rules-intro">' + R.intro + '</p>' +
      '<ol class="rules-steps">' + R.steps.map(li).join('') + '</ol>' +
      '<h3>' + R.linesTitle + '</h3><div class="rules-lines">' + grids + '</div>' +
      '<h3>' + R.smallTitle + '</h3><ul class="rules-bullets">' + R.small.map(li).join('') + '</ul>' +
      '<h3>' + R.callerTitle + '</h3><ul class="rules-bullets">' + R.caller.map(li).join('') + '</ul>';
  }

  /* Storage, always wrapped because private modes can throw */

  function store(kind) {
    return {
      get: function (k) { try { return window[kind].getItem(k); } catch (e) { return null; } },
      set: function (k, v) { try { window[kind].setItem(k, v); } catch (e) { /* ignore */ } },
      del: function (k) { try { window[kind].removeItem(k); } catch (e) { /* ignore */ } }
    };
  }
  var local = store('localStorage');
  var session = store('sessionStorage');

  function readJSON(s, key) {
    try { return JSON.parse(s.get(key) || 'null'); } catch (e) { return null; }
  }

  var lang = local.get('loteria.lang');
  if (lang !== 'es' && lang !== 'en') {
    lang = /^es\b/i.test(navigator.language || '') ? 'es' : 'en';
  }
  var muted = local.get('loteria.muted') === '1';

  function t(key, vars) {
    var s = (T[lang] && T[lang][key]) || T.es[key] || key;
    if (vars) {
      Object.keys(vars).forEach(function (k) { s = s.replace('{' + k + '}', vars[k]); });
    }
    return s;
  }

  function errText(err) {
    if (err && err.network) { return t('err_network'); }
    var key = 'err_' + (err && err.code);
    return T[lang][key] ? t(key) : t('err_generic');
  }

  /* DOM helpers */

  function $(id) { return document.getElementById(id); }

  function show(id) {
    ['screenJoin', 'screenPlay', 'screenHost', 'screenLobby', 'screenCall'].forEach(function (s) {
      $(s).hidden = s !== id;
    });
    window.scrollTo(0, 0);
  }

  function card(id) { return L.byId[id]; }
  function cardText(id) { return card(id)[lang]; }
  function svg(id) { return L.cardSVG(card(id), lang); }

  var BEAN = '<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<path d="M8 22 C4 8 22 2 32 8 C40 13 46 4 54 12 C60 20 52 36 34 34 C22 33 12 36 8 22 Z" fill="#6B3A1F" stroke="#2B1B5A" stroke-width="3"/>' +
    '<path d="M16 15 Q24 9 32 13" fill="none" stroke="#FFFFFF" stroke-opacity="0.55" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M38 26 Q44 28 48 24" fill="none" stroke="#3E1F0D" stroke-width="2" stroke-linecap="round"/></svg>';

  var ICON_SOUND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/></svg>';
  var ICON_MUTED = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M17 9l5 6M22 9l-5 6"/></svg>';

  var toastTimer = null;
  function toast(text, big, ms) {
    var el = $('toast');
    el.textContent = text;
    el.className = 'toast' + (big ? ' big' : '');
    el.hidden = false;
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, ms || 2400);
  }

  function restartAnim(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  function setNet(ok) { $('netPill').hidden = ok; }

  /* API */

  function api(action, data) {
    var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 10000) : null;
    var body = Object.assign({ action: action }, data || {});
    return fetch('api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (res) {
      return res.json().catch(function () {
        var e = new Error('Bad response');
        e.network = true;
        throw e;
      });
    }, function () {
      var e = new Error('Network');
      e.network = true;
      throw e;
    }).then(function (json) {
      if (!json || !json.ok) {
        var e = new Error((json && json.message) || 'Error');
        e.code = json && json.error;
        throw e;
      }
      return json;
    }).finally(function () {
      if (timer) { clearTimeout(timer); }
    });
  }

  /* Repeats fn every POLL_MS. Network errors show the reconnecting pill and keep polling. */
  function poller(fn, onError) {
    var timer = null;
    var busy = false;
    var stopped = false;
    function tick() {
      if (stopped || busy) { return; }
      busy = true;
      clearTimeout(timer);
      fn().then(function () {
        setNet(true);
      }, function (err) {
        if (err.network) { setNet(false); } else if (onError) { onError(err); }
      }).then(function () {
        busy = false;
        if (!stopped) { timer = setTimeout(tick, POLL_MS); }
      });
    }
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) { tick(); }
    });
    window.addEventListener('online', tick);
    tick();
    return {
      now: tick,
      stop: function () { stopped = true; clearTimeout(timer); }
    };
  }

  /* Speech */

  var Speech = {
    voices: [],
    unlocked: false,
    load: function () {
      if (!('speechSynthesis' in window)) { return; }
      Speech.voices = window.speechSynthesis.getVoices() || [];
    },
    pick: function (code) {
      var want = code === 'es' ? 'es-mx' : 'en-gb';
      var list = Speech.voices.map(function (v) {
        return { v: v, lang: String(v.lang || '').replace('_', '-').toLowerCase() };
      });
      var exact = list.filter(function (x) { return x.lang === want; });
      var any = list.filter(function (x) { return x.lang.indexOf(code) === 0; });
      var choice = exact[0] || (code === 'es' ? any.filter(function (x) { return x.lang === 'es-us'; })[0] : null) || any[0];
      return choice ? choice.v : null;
    },
    say: function (text) {
      if (muted || !('speechSynthesis' in window) || !text) { return; }
      var synth = window.speechSynthesis;
      synth.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = lang === 'es' ? 'es-MX' : 'en-GB';
      var v = Speech.pick(lang);
      if (v) { u.voice = v; }
      u.rate = 0.95;
      u.pitch = 1.05;
      synth.speak(u);
    },
    unlock: function () {
      if (Speech.unlocked) { return; }
      Speech.unlocked = true;
      if ('speechSynthesis' in window) {
        var u = new SpeechSynthesisUtterance(' ');
        u.volume = 0;
        window.speechSynthesis.speak(u);
      }
      Sound.ctx();
    }
  };
  if ('speechSynthesis' in window) {
    Speech.load();
    window.speechSynthesis.onvoiceschanged = Speech.load;
  }

  function sayCard(id) {
    var c = cardText(id);
    Speech.say(c.verse + ' ... ' + c.name + '.');
  }

  /* Little sounds, made with Web Audio so there are no files to load */

  var Sound = {
    ac: null,
    ctx: function () {
      try {
        if (!Sound.ac) {
          var AC = window.AudioContext || window.webkitAudioContext;
          if (!AC) { return null; }
          Sound.ac = new AC();
        }
        if (Sound.ac.state === 'suspended') { Sound.ac.resume(); }
        return Sound.ac;
      } catch (e) { return null; }
    },
    tone: function (freq, start, dur, type, vol) {
      var ac = Sound.ctx();
      if (!ac) { return; }
      var o = ac.createOscillator();
      var g = ac.createGain();
      o.type = type || 'triangle';
      o.frequency.value = freq;
      var t0 = ac.currentTime + start;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol || 0.2, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g);
      g.connect(ac.destination);
      o.start(t0);
      o.stop(t0 + dur + 0.05);
    },
    cheer: function () {
      if (muted) { return; }
      [523, 659, 784, 1047].forEach(function (f, i) { Sound.tone(f, i * 0.12, 0.25, 'square', 0.08); });
      Sound.tone(1047, 0.5, 0.6, 'triangle', 0.18);
      Sound.tone(1319, 0.5, 0.6, 'triangle', 0.12);
    },
    bonk: function () {
      if (muted) { return; }
      Sound.tone(220, 0, 0.18, 'sine', 0.25);
      Sound.tone(165, 0.14, 0.25, 'sine', 0.25);
    },
    flip: function () {
      if (muted) { return; }
      Sound.tone(880, 0, 0.08, 'triangle', 0.08);
    }
  };

  /* Confetti */

  var Confetti = (function () {
    var canvas = $('confetti');
    var ctx = canvas.getContext('2d');
    var parts = [];
    var raf = null;
    var colors = ['#FF2E88', '#FFD60A', '#00C2C7', '#FF7A00', '#7B2CBF', '#2BAE66', '#FFFFFF'];

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function frame() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      parts = parts.filter(function (p) { return p.y < window.innerHeight + 30 && p.life > 0; });
      parts.forEach(function (p) {
        p.vy += 0.12;
        p.vx *= 0.995;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life -= 1;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.c;
        if (p.round) {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.rot * 2)));
        }
        ctx.restore();
      });
      if (parts.length) {
        raf = requestAnimationFrame(frame);
      } else {
        raf = null;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    }

    function burst(count) {
      resize();
      var w = window.innerWidth;
      var h = window.innerHeight;
      for (var i = 0; i < (count || 180); i += 1) {
        var fromLeft = i % 2 === 0;
        parts.push({
          x: fromLeft ? 0 : w,
          y: h * 0.7,
          vx: (fromLeft ? 1 : -1) * (4 + Math.random() * 9),
          vy: -(8 + Math.random() * 11),
          rot: Math.random() * 6,
          vr: (Math.random() - 0.5) * 0.4,
          w: 7 + Math.random() * 7,
          h: 10 + Math.random() * 10,
          round: Math.random() < 0.25,
          c: colors[i % colors.length],
          life: 260 + Math.random() * 120
        });
      }
      for (var k = 0; k < 80; k += 1) {
        parts.push({
          x: Math.random() * w, y: -20 - Math.random() * h * 0.5,
          vx: (Math.random() - 0.5) * 3, vy: Math.random() * 2,
          rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3,
          w: 6 + Math.random() * 6, h: 10 + Math.random() * 8,
          round: false, c: colors[k % colors.length], life: 400
        });
      }
      if (!raf) { raf = requestAnimationFrame(frame); }
    }

    return { burst: burst };
  })();

  /* Screen wake lock, so phones and the projector laptop stay awake during a game */

  var wakeLock = null;
  function keepAwake() {
    if (!('wakeLock' in navigator) || document.hidden) { return; }
    navigator.wakeLock.request('screen').then(function (l) { wakeLock = l; }, function () { /* not allowed */ });
  }
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && wakeLock) { keepAwake(); }
  });

  /* Shared rendering */

  function flipTo(flipEl, id, animate) {
    var inner = flipEl.querySelector('.flip-inner');
    inner.querySelector('.face-front').innerHTML = id ? svg(id) : L.cardBackSVG();
    inner.querySelector('.face-back').innerHTML = L.cardBackSVG();
    if (animate) {
      restartAnim(inner, 'go');
      Sound.flip();
    }
  }

  function boardHTML(board, opts) {
    var o = opts || {};
    return board.map(function (id, i) {
      var cls = 'cell';
      if (o.line) { cls += o.line.indexOf(i) >= 0 ? ' win' : ' dim'; }
      var bean = o.marks && o.marks[id] ? '<span class="bean">' + BEAN + '</span>' : '';
      var tag = o.static ? 'div' : 'button';
      var extra = o.static ? '' : ' type="button"';
      return '<' + tag + ' class="' + cls + '" data-id="' + id + '"' + extra + '>' + svg(id) + bean + '</' + tag + '>';
    }).join('');
  }

  function showWinners(claims, opts) {
    var o = opts || {};
    var names = claims.map(function (c) { return c.name; });
    var mine = o.myId && claims.some(function (c) { return c.player_id === o.myId; });
    var first = claims[0];
    $('winTitle').textContent = mine ? t('you_won') : t('winner');
    $('winNames').textContent = mine ? t('winner') : names.join(t('and'));
    $('winBoard').innerHTML = boardHTML(first.board, { static: true, line: first.line || [] });
    $('winCaller').hidden = MODE !== 'caller';
    $('winOverlay').hidden = false;
    Confetti.burst(mine ? 260 : 180);
    Sound.cheer();
    Speech.say(lang === 'es' ? '¡Lotería! ' + names.join(' y ') : 'Lotería! ' + names.join(' and ') + ' wins!');
    if (mine && navigator.vibrate) { navigator.vibrate([100, 60, 100, 60, 300]); }
  }

  /* Header controls */

  function applyLang() {
    document.documentElement.lang = lang === 'es' ? 'es-MX' : 'en-GB';
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    $('rulesBody').innerHTML = rulesHTML(lang);
    $('rulesBtn').setAttribute('aria-label', t('how_to_play'));
    $('rulesBtn').title = t('how_to_play');
    $('rulesClose').setAttribute('aria-label', t('close'));
    $('board').setAttribute('aria-label', t('board'));
    $('installBtn').setAttribute('aria-label', t('install'));
    document.querySelectorAll('.lang-toggle button').forEach(function (b) {
      var on = b.getAttribute('data-lang') === lang;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    renderHeroes();
    if (MODE === 'player') { Player.render(); } else { Caller.render(); }
  }

  function applyMute() {
    var btn = $('muteBtn');
    btn.innerHTML = muted ? ICON_MUTED : ICON_SOUND;
    btn.setAttribute('aria-pressed', muted ? 'true' : 'false');
    btn.setAttribute('aria-label', muted ? t('unmute') : t('mute'));
    btn.title = muted ? t('unmute') : t('mute');
  }

  document.querySelectorAll('.lang-toggle button').forEach(function (b) {
    b.addEventListener('click', function () {
      lang = b.getAttribute('data-lang');
      local.set('loteria.lang', lang);
      if ('speechSynthesis' in window) { window.speechSynthesis.cancel(); }
      applyLang();
      applyMute();
    });
  });

  $('muteBtn').addEventListener('click', function () {
    muted = !muted;
    local.set('loteria.muted', muted ? '1' : '0');
    if (muted && 'speechSynthesis' in window) { window.speechSynthesis.cancel(); }
    applyMute();
  });

  $('winClose').addEventListener('click', function () { $('winOverlay').hidden = true; });

  var rulesOpener = null;
  function openRules(e) {
    rulesOpener = e && e.currentTarget;
    $('rulesOverlay').hidden = false;
    $('rulesOverlay').scrollTop = 0;
    $('rulesClose').focus();
  }
  function closeRules() {
    $('rulesOverlay').hidden = true;
    if (rulesOpener && rulesOpener.focus) { rulesOpener.focus(); }
  }
  document.querySelectorAll('[data-rules]').forEach(function (b) { b.addEventListener('click', openRules); });
  $('rulesClose').addEventListener('click', closeRules);
  $('rulesOk').addEventListener('click', closeRules);
  $('rulesOverlay').addEventListener('click', function (e) {
    if (e.target === $('rulesOverlay')) { closeRules(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !$('rulesOverlay').hidden) { closeRules(); }
  });

  document.addEventListener('pointerdown', Speech.unlock, { once: true });
  document.addEventListener('keydown', Speech.unlock, { once: true });

  function renderHeroes() {
    ['joinHero', 'hostHero'].forEach(function (id, k) {
      var ids = k === 0 ? [5, 1, 21] : [4, 14, 9];
      $(id).innerHTML = ids.map(svg).join('');
    });
  }

  /* Player mode */

  var Player = {
    code: '', pid: 0, token: '', name: '',
    board: [], called: [], marks: {},
    round: -1, position: 0, status: '', count: -1,
    shownPos: 0, winRound: 0, poll: null, lastClaim: 0, sig: '',

    start: function () {
      var saved = readJSON(session, 'loteria.player');
      var urlRoom = (params.get('room') || '').toUpperCase();
      if (saved && saved.code && (!urlRoom || normCode(urlRoom) === saved.code)) {
        Player.code = saved.code;
        Player.pid = saved.pid;
        Player.token = saved.token;
        Player.name = saved.name;
        Player.enter();
        return;
      }
      if (urlRoom) { $('joinCode').value = normCode(urlRoom) || urlRoom; }
      Player.showJoin();
    },

    showJoin: function (message) {
      show('screenJoin');
      $('roomTag').hidden = true;
      var err = $('joinError');
      err.hidden = !message;
      err.textContent = message || '';
      if (isIOS() && !isStandalone() && local.get('loteria.iosHint') !== 'no') { $('iosHint').hidden = false; }
      setTimeout(function () { ($('joinCode').value ? $('joinName') : $('joinCode')).focus(); }, 50);
    },

    join: function (e) {
      e.preventDefault();
      var code = normCode($('joinCode').value);
      var name = $('joinName').value.trim();
      var err = $('joinError');
      if (!code) { err.textContent = t('err_bad_code'); err.hidden = false; return; }
      if (!name) { err.textContent = t('err_bad_name'); err.hidden = false; return; }
      var btn = $('joinBtn');
      btn.disabled = true;
      btn.textContent = t('joining');
      api('join', { code: code, name: name }).then(function (r) {
        Player.code = r.code;
        Player.pid = r.player_id;
        Player.token = r.token;
        Player.name = r.name;
        session.set('loteria.player', JSON.stringify({ code: r.code, pid: r.player_id, token: r.token, name: r.name }));
        history.replaceState(null, '', '?room=' + encodeURIComponent(r.code));
        Player.enter();
      }, function (ex) {
        err.textContent = errText(ex);
        err.hidden = false;
      }).then(function () {
        btn.disabled = false;
        btn.textContent = t('join_btn');
      });
    },

    enter: function () {
      show('screenPlay');
      $('roomTag').textContent = Player.code;
      $('roomTag').hidden = false;
      Player.round = -1;
      Player.sig = '';
      Player.render();
      keepAwake();
      if (Player.poll) { Player.poll.stop(); }
      Player.poll = poller(Player.sync, Player.onPollError);
    },

    leave: function () {
      if (!window.confirm(t('confirm_leave'))) { return; }
      if (Player.poll) { Player.poll.stop(); Player.poll = null; }
      session.del('loteria.player');
      Player.code = '';
      Player.board = [];
      $('joinName').value = '';
      history.replaceState(null, '', location.pathname);
      Player.showJoin();
    },

    onPollError: function (err) {
      if (err.code === 'not_player' || err.code === 'room_not_found') {
        if (Player.poll) { Player.poll.stop(); Player.poll = null; }
        session.del('loteria.player');
        $('joinCode').value = Player.code;
        Player.showJoin(errText(err));
      }
    },

    marksKey: function () { return 'loteria.marks.' + Player.code + '.' + Player.round; },

    sync: function () {
      var fresh = Player.round === -1;
      return api('state', {
        code: Player.code,
        since: Player.position,
        round: Player.round,
        pc: Player.count,
        player_id: Player.pid,
        token: Player.token
      }).then(function (r) {
        if (r.round !== Player.round) {
          var newRound = Player.round !== -1;
          Player.round = r.round;
          Player.board = r.board || Player.board;
          Player.called = [];
          Player.position = 0;
          Player.shownPos = 0;
          Player.marks = readJSON(session, Player.marksKey()) || {};
          $('winOverlay').hidden = true;
          if (newRound) { toast(t('new_round'), true, 3000); }
        }
        Player.called = Player.called.slice(0, r.from).concat(r.called);
        Player.position = r.position;
        Player.status = r.status;
        Player.count = r.count;

        var newest = Player.called[Player.called.length - 1];
        var isNew = Player.position > Player.shownPos;
        Player.shownPos = Player.position;
        var sig = [r.round, r.position, r.status, r.count].join('|');
        if (sig !== Player.sig) {
          Player.sig = sig;
          Player.render(isNew && !fresh ? newest : null);
        }
        if (isNew && !fresh && newest) { sayCard(newest); }

        if (r.status === 'finished' && r.claims && r.claims.length && Player.winRound !== r.round) {
          Player.winRound = r.round;
          showWinners(r.claims, { myId: Player.pid, called: Player.called });
        }
      });
    },

    render: function (freshId) {
      if (!Player.code || !Player.board.length) {
        $('board').innerHTML = '';
        return;
      }
      var newest = Player.called[Player.called.length - 1];
      if (newest) {
        var c = cardText(newest);
        $('playerNowLabel').textContent = t('now_label');
        $('playerNowName').textContent = c.name;
        $('playerNowVerse').textContent = c.verse;
      } else {
        $('playerNowLabel').textContent = Player.name;
        $('playerNowName').textContent = t('waiting_title');
        $('playerNowVerse').textContent = Player.status === 'finished' ? t('finished_wait') : t('waiting_start');
      }
      flipTo($('playerFlip'), newest || 0, !!freshId);
      $('playerCount').textContent = t('count_of', { n: Player.position, t: 24 });
      $('playerPlayers').textContent = Player.count > 0 ? (Player.count === 1 ? t('player_1') : t('players_n', { n: Player.count })) : '';
      $('playerRoom').textContent = '· ' + Player.code;

      $('board').innerHTML = boardHTML(Player.board, { marks: Player.marks });
      $('claimBtn').disabled = Player.status !== 'playing';
    },

    tapCell: function (e) {
      var cell = e.target.closest('.cell');
      if (!cell) { return; }
      var id = Number(cell.getAttribute('data-id'));
      if (Player.marks[id]) {
        delete Player.marks[id];
        var b = cell.querySelector('.bean');
        if (b) { b.remove(); }
      } else {
        Player.marks[id] = 1;
        var span = document.createElement('span');
        span.className = 'bean drop';
        span.innerHTML = BEAN;
        span.firstChild.style.transform = 'rotate(' + Math.round(Math.random() * 60 - 30) + 'deg)';
        cell.appendChild(span);
        if (navigator.vibrate) { navigator.vibrate(15); }
      }
      session.set(Player.marksKey(), JSON.stringify(Player.marks));
    },

    claim: function () {
      var now = Date.now();
      if (now - Player.lastClaim < 2100) { return; }
      Player.lastClaim = now;
      var btn = $('claimBtn');
      btn.disabled = true;
      api('claim', { code: Player.code, player_id: Player.pid, token: Player.token }).then(function (r) {
        if (r.valid) {
          if (Player.poll) { Player.poll.now(); }
        } else {
          restartAnim($('board'), 'shake');
          restartAnim(btn, 'shake');
          Sound.bonk();
          toast(t('not_yet'), true, 2200);
          if (navigator.vibrate) { navigator.vibrate([80, 60, 80]); }
        }
      }, function (err) {
        toast(errText(err), false, 2600);
      }).then(function () {
        btn.disabled = Player.status !== 'playing';
      });
    }
  };

  /* Caller mode */

  var Caller = {
    code: '', token: '', round: -1, position: 0, status: '', called: [],
    count: -1, players: [], shownPos: 0, winRound: 0, poll: null, busy: false, sig: '',

    start: function () {
      document.body.className = 'mode-caller';
      var hash = new URLSearchParams(location.hash.replace(/^#/, ''));
      var saved = readJSON(session, 'loteria.caller');
      var code = normCode(params.get('room') || '');
      var token = hash.get('k') || '';
      if ((!code || !token) && saved) {
        code = saved.code;
        token = saved.token;
      }
      if (code && token) {
        Caller.code = code;
        Caller.token = token;
        Caller.remember();
        Caller.enter();
      } else {
        show('screenHost');
      }
    },

    remember: function () {
      session.set('loteria.caller', JSON.stringify({ code: Caller.code, token: Caller.token }));
      history.replaceState(null, '', '?mode=caller&room=' + encodeURIComponent(Caller.code) + '#k=' + Caller.token);
    },

    create: function () {
      var btn = $('createBtn');
      btn.disabled = true;
      btn.textContent = t('creating');
      $('hostError').hidden = true;
      api('create_room', {}).then(function (r) {
        Caller.code = r.code;
        Caller.token = r.caller_token;
        Caller.remember();
        Caller.enter();
      }, function (err) {
        $('hostError').textContent = errText(err);
        $('hostError').hidden = false;
      }).then(function () {
        btn.disabled = false;
        btn.textContent = t('create_room');
      });
    },

    enter: function () {
      $('roomTag').textContent = Caller.code;
      $('roomTag').hidden = false;
      Caller.round = -1;
      Caller.drawQR();
      keepAwake();
      if (Caller.poll) { Caller.poll.stop(); }
      Caller.poll = poller(Caller.sync, Caller.onPollError);
    },

    onPollError: function (err) {
      if (err.code === 'room_not_found' || err.code === 'not_caller') {
        if (Caller.poll) { Caller.poll.stop(); Caller.poll = null; }
        session.del('loteria.caller');
        history.replaceState(null, '', '?mode=caller');
        show('screenHost');
        $('roomTag').hidden = true;
        $('hostError').textContent = errText(err);
        $('hostError').hidden = false;
      }
    },

    playerURL: function () {
      return location.origin + location.pathname + '?room=' + encodeURIComponent(Caller.code);
    },

    drawQR: function () {
      var box = $('qrBox');
      box.innerHTML = '';
      $('lobbyCode').textContent = Caller.code;
      $('lobbyUrl').textContent = Caller.playerURL().replace(/^https?:\/\//, '');
      if (typeof window.QRCode !== 'function') {
        setTimeout(Caller.drawQR, 400);
        return;
      }
      new window.QRCode(box, {
        text: Caller.playerURL(),
        width: 512,
        height: 512,
        colorDark: '#2B1B5A',
        colorLight: '#FFFFFF',
        correctLevel: window.QRCode.CorrectLevel.M
      });
    },

    sync: function () {
      var code = Caller.code;
      return api('state', {
        code: code,
        caller_token: Caller.token,
        since: Caller.position,
        round: Caller.round,
        pc: Caller.count
      }).then(function (r) {
        if (code === Caller.code) { Caller.apply(r); }
      });
    },

    apply: function (r) {
      var fresh = Caller.round === -1;
      if (r.round !== Caller.round) {
        Caller.round = r.round;
        Caller.called = [];
        Caller.position = 0;
        Caller.shownPos = 0;
        $('winOverlay').hidden = true;
      }
      Caller.called = Caller.called.slice(0, r.from).concat(r.called);
      Caller.position = r.position;
      Caller.status = r.status;
      Caller.count = r.count;
      if (r.players) { Caller.players = r.players; }

      var isNew = Caller.position > Caller.shownPos;
      Caller.shownPos = Caller.position;
      var newest = Caller.called[Caller.called.length - 1];
      var sig = [r.round, r.position, r.status, r.count].join('|');
      if (sig !== Caller.sig) {
        Caller.sig = sig;
        Caller.render(isNew && !fresh ? newest : null);
      }
      if (isNew && !fresh && newest) { sayCard(newest); }

      if (r.status === 'finished' && r.claims && r.claims.length && Caller.winRound !== r.round) {
        Caller.winRound = r.round;
        showWinners(r.claims, { called: Caller.called });
      }
    },

    render: function (freshId) {
      if (!Caller.code) { return; }
      var inLobby = Caller.status === 'lobby' && Caller.position === 0;
      if (Caller.status) { show(inLobby ? 'screenLobby' : 'screenCall'); }

      var list = $('lobbyPlayers');
      var have = list.children.length;
      if (have > Caller.players.length) { list.innerHTML = ''; have = 0; }
      Caller.players.slice(have).forEach(function (name) {
        var li = document.createElement('li');
        li.textContent = name;
        list.appendChild(li);
      });
      $('lobbyCount').textContent = String(Caller.count < 0 ? 0 : Caller.count);
      $('lobbyEmpty').hidden = Caller.count > 0;
      $('callPlayers').textContent = Caller.count === 1 ? t('player_1').replace('· ', '') : t('players_n', { n: Math.max(Caller.count, 0) }).replace('· ', '');
      $('callRoom').textContent = Caller.code;

      var newest = Caller.called[Caller.called.length - 1];
      if (newest) {
        var c = cardText(newest);
        $('callName').textContent = c.name;
        $('callVerse').textContent = c.verse;
      } else {
        $('callName').textContent = t('ready_title');
        $('callVerse').textContent = t('ready_verse');
      }
      flipTo($('callerFlip'), newest || 0, !!freshId);
      $('callCounter').textContent = t('count_of', { n: Caller.position, t: 24 });

      var strip = $('strip');
      strip.innerHTML = Caller.called.map(svg).join('');
      strip.scrollLeft = strip.scrollWidth;

      var done = Caller.position >= 24;
      $('nextBtn').disabled = Caller.busy || Caller.status === 'finished' || done;
      $('nextBtn').textContent = done ? t('deck_done') : t('next_card');
      $('newRoomBtn').hidden = !(Caller.status === 'finished' || done);
    },

    next: function () {
      if (Caller.busy || Caller.status === 'finished' || Caller.position >= 24) { return; }
      Caller.busy = true;
      $('nextBtn').disabled = true;
      $('startBtn').disabled = true;
      api('draw', { code: Caller.code, caller_token: Caller.token }).then(function (r) {
        if (r.round === Caller.round && r.position === Caller.position + 1) {
          Caller.called.push(r.card);
          Caller.position = r.position;
          Caller.shownPos = r.position;
          Caller.status = r.status;
          Caller.sig = [Caller.round, Caller.position, Caller.status, Caller.count].join('|');
          Caller.render(r.card);
          sayCard(r.card);
        } else if (Caller.poll) {
          Caller.poll.now();
        }
      }, function (err) {
        toast(errText(err), false, 2600);
        if (Caller.poll) { Caller.poll.now(); }
      }).then(function () {
        setTimeout(function () {
          Caller.busy = false;
          $('startBtn').disabled = false;
          $('nextBtn').disabled = Caller.status === 'finished' || Caller.position >= 24;
        }, 1200);
      });
    },

    /* Same room and players, new boards. Asks first unless chosen from the winner screen. */
    newGame: function (e) {
      var fromWin = e && e.currentTarget && e.currentTarget.id === 'winNewGame';
      if (!fromWin && !window.confirm(t('confirm_new'))) { return; }
      api('new_game', { code: Caller.code, caller_token: Caller.token }).then(function () {
        $('winOverlay').hidden = true;
        if (Caller.poll) { Caller.poll.now(); }
      }, function (err) {
        toast(errText(err), false, 2600);
      });
    },

    /* A brand new room with a new code; players scan the new QR code to join. */
    newRoom: function (e) {
      if (!window.confirm(t('confirm_room'))) { return; }
      var btn = e && e.currentTarget;
      if (btn) { btn.disabled = true; }
      api('create_room', {}).then(function (r) {
        if (Caller.poll) { Caller.poll.stop(); Caller.poll = null; }
        Caller.code = r.code;
        Caller.token = r.caller_token;
        Caller.position = 0;
        Caller.status = '';
        Caller.called = [];
        Caller.count = -1;
        Caller.players = [];
        Caller.shownPos = 0;
        Caller.winRound = 0;
        Caller.sig = '';
        $('lobbyPlayers').innerHTML = '';
        $('lobbyCount').textContent = '0';
        $('lobbyEmpty').hidden = false;
        $('winOverlay').hidden = true;
        Caller.remember();
        Caller.enter();
        show('screenLobby');
      }, function (err) {
        toast(errText(err), false, 2600);
      }).then(function () {
        if (btn) { btn.disabled = false; }
      });
    }
  };

  /* Utilities */

  function normCode(raw) {
    var s = String(raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    var m = s.match(/^([A-Z]{2,12})([0-9]{2,3})$/);
    return m ? m[1] + '-' + m[2] : '';
  }

  function isIOS() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  }

  /* PWA: service worker and install button */

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* offline install is optional */ });
    });
  }

  var installEvent = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    installEvent = e;
    $('installBtn').hidden = false;
  });
  $('installBtn').addEventListener('click', function () {
    if (!installEvent) { return; }
    installEvent.prompt();
    installEvent.userChoice.finally(function () {
      installEvent = null;
      $('installBtn').hidden = true;
    });
  });
  window.addEventListener('appinstalled', function () { $('installBtn').hidden = true; });
  $('iosHintClose').addEventListener('click', function () {
    $('iosHint').hidden = true;
    local.set('loteria.iosHint', 'no');
  });

  /* Wire up */

  $('joinForm').addEventListener('submit', Player.join);
  $('joinCode').addEventListener('blur', function () {
    var c = normCode(this.value);
    if (c) { this.value = c; }
  });
  $('board').addEventListener('click', Player.tapCell);
  $('claimBtn').addEventListener('click', Player.claim);
  $('leaveBtn').addEventListener('click', Player.leave);

  $('createBtn').addEventListener('click', Caller.create);
  $('startBtn').addEventListener('click', Caller.next);
  $('nextBtn').addEventListener('click', Caller.next);
  $('newGameBtn').addEventListener('click', Caller.newGame);
  $('winNewGame').addEventListener('click', Caller.newGame);
  $('winNewRoom').addEventListener('click', Caller.newRoom);
  $('newRoomBtn').addEventListener('click', Caller.newRoom);

  document.addEventListener('keydown', function (e) {
    if (MODE !== 'caller' || !Caller.code || !$('winOverlay').hidden || !$('rulesOverlay').hidden) { return; }
    if (e.target && /input|textarea/i.test(e.target.tagName)) { return; }
    if (e.target && e.target.tagName === 'BUTTON' && (e.key === ' ' || e.key === 'Enter')) { return; }
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      Caller.next();
    }
  });

  applyMute();
  applyLang();
  if (MODE === 'caller') { Caller.start(); } else { Player.start(); }
})();
