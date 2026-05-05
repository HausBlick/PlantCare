/* Planty — shared chat widget. Include once per guide page.
   Configure via <head> meta tags:
     <meta name="planty-context" content="einem Basilikum-Pflänzchen im Keramiktopf">
     <meta name="planty-label"   content="Basilikum">
*/
(function () {
  var SUPABASE_URL = 'https://frjmvszuncgbmqgfjcgz.supabase.co';
  var ANON_KEY     = 'sb_publishable_htYoshV2Tb54M3q4XpLn7g_1Ih4Z9QJ';
  var PAGE         = location.pathname.split('/').pop() || 'index.html';

  function meta(name) {
    var el = document.querySelector('meta[name="' + name + '"]');
    return el ? el.getAttribute('content') : '';
  }
  var PLANT_CONTEXT = meta('planty-context');
  var PLANT_LABEL   = meta('planty-label') || 'deiner Pflanze';

  // ── CSS injizieren ──────────────────────────────────────
  var css = [
    '.planty-fab{position:fixed;bottom:20px;right:20px;z-index:1000;width:56px;height:56px;border-radius:50%;background:#16a34a;border:none;cursor:pointer;box-shadow:0 4px 16px rgba(22,163,74,.45);display:flex;align-items:center;justify-content:center;font-size:26px;transition:transform .2s,box-shadow .2s;color:#fff;font-family:inherit}',
    '.planty-fab:hover{transform:scale(1.08);box-shadow:0 6px 20px rgba(22,163,74,.55)}',
    '.planty-window{position:fixed;bottom:88px;right:20px;z-index:1000;width:360px;height:500px;background:#fff;border-radius:18px;box-shadow:0 8px 40px rgba(0,0,0,.18);display:flex;flex-direction:column;overflow:hidden;transform:scale(.94) translateY(10px);opacity:0;pointer-events:none;transition:transform .22s ease,opacity .22s ease}',
    '.planty-window.open{transform:scale(1) translateY(0);opacity:1;pointer-events:auto}',
    '.planty-header{background:#16a34a;color:#fff;padding:14px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0}',
    '.planty-avatar{width:36px;height:36px;background:rgba(255,255,255,.2);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}',
    '.planty-header-text{flex:1}',
    '.planty-header-name{font-size:15px;font-weight:700;line-height:1.2}',
    '.planty-header-sub{font-size:11px;opacity:.82;margin-top:1px}',
    '.planty-close{background:none;border:none;color:#fff;font-size:22px;cursor:pointer;padding:0;line-height:1;opacity:.75;flex-shrink:0}',
    '.planty-close:hover{opacity:1}',
    '.planty-messages{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:8px}',
    '.planty-bubble{max-width:84%;padding:10px 13px;border-radius:14px;font-size:14px;line-height:1.5;word-break:break-word}',
    '.planty-bubble.user{background:#ff385c;color:#fff;align-self:flex-end;border-bottom-right-radius:4px}',
    '.planty-bubble.assistant{background:#f0fdf4;color:#1a1a1a;align-self:flex-start;border-bottom-left-radius:4px;border:1px solid #bbf7d0}',
    '.planty-bubble.loading{background:#f0fdf4;color:#6a6a6a;align-self:flex-start;border-bottom-left-radius:4px;border:1px solid #bbf7d0;font-style:italic}',
    '.planty-footer{border-top:1px solid #eee;padding:10px 12px;display:flex;align-items:flex-end;gap:8px;flex-shrink:0}',
    '.planty-input{flex:1;border:1px solid #ddd;border-radius:12px;padding:10px 13px;font-size:14px;font-family:inherit;outline:none;resize:none;line-height:1.45;max-height:90px;overflow-y:auto}',
    '.planty-input:focus{border-color:#16a34a}',
    '.planty-send{width:38px;height:38px;border-radius:10px;background:#16a34a;border:none;color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .15s}',
    '.planty-send:hover{background:#15803d}',
    '.planty-send:disabled{background:#86efac;cursor:not-allowed}',
    '@media(max-width:500px){.planty-window{bottom:0;right:0;left:0;width:100%;height:72vh;border-radius:18px 18px 0 0}.planty-fab{bottom:16px;right:16px}}'
  ].join('');
  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ── DOM aufbauen ────────────────────────────────────────
  var fab = document.createElement('button');
  fab.className = 'planty-fab';
  fab.innerHTML = '&#x1F331;';
  fab.title = 'Planty — Dein Pflanzen-Assistent';
  fab.setAttribute('aria-label', 'Planty Chat öffnen');

  var win = document.createElement('div');
  win.className = 'planty-window';
  win.setAttribute('role', 'dialog');
  win.setAttribute('aria-label', 'Planty – Pflanzen-Assistent');
  win.innerHTML =
    '<div class="planty-header">' +
      '<div class="planty-avatar">&#x1F331;</div>' +
      '<div class="planty-header-text">' +
        '<div class="planty-header-name">Planty</div>' +
        '<div class="planty-header-sub">Dein Assistent für ' + PLANT_LABEL + '</div>' +
      '</div>' +
      '<button class="planty-close" aria-label="Schließen">&#x2715;</button>' +
    '</div>' +
    '<div class="planty-messages" id="planty-msgs"></div>' +
    '<div class="planty-footer">' +
      '<textarea class="planty-input" id="planty-input" placeholder="Stelle eine Frage …" rows="1" aria-label="Nachricht eingeben"></textarea>' +
      '<button class="planty-send" id="planty-send" disabled aria-label="Senden">&#x2191;</button>' +
    '</div>';

  document.body.appendChild(fab);
  document.body.appendChild(win);

  var msgsEl     = document.getElementById('planty-msgs');
  var inputEl    = document.getElementById('planty-input');
  var sendEl     = document.getElementById('planty-send');
  var isOpen     = false;
  var isLoading  = false;
  var histLoaded = false;

  // ── Visitor-ID ──────────────────────────────────────────
  function getVid() {
    var v = localStorage.getItem('plantcare_vid');
    if (!v) {
      v = 'v' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
      localStorage.setItem('plantcare_vid', v);
    }
    return v;
  }

  // ── Toggle ──────────────────────────────────────────────
  function toggle() {
    isOpen = !isOpen;
    win.classList.toggle('open', isOpen);
    if (isOpen) { loadHistory(); setTimeout(function () { inputEl.focus(); }, 200); }
  }
  fab.addEventListener('click', toggle);
  win.querySelector('.planty-close').addEventListener('click', toggle);

  // ── Bubble ──────────────────────────────────────────────
  function addBubble(role, text) {
    var d = document.createElement('div');
    d.className = 'planty-bubble ' + role;
    d.textContent = text;
    msgsEl.appendChild(d);
    msgsEl.scrollTop = msgsEl.scrollHeight;
    return d;
  }

  // ── Verlauf laden ────────────────────────────────────────
  function loadHistory() {
    if (histLoaded) return;
    histLoaded = true;
    var vid = getVid();
    fetch(
      SUPABASE_URL + '/rest/v1/plantcare_chats' +
      '?visitor_id=eq.' + encodeURIComponent(vid) +
      '&page=eq.' + encodeURIComponent(PAGE) +
      '&order=created_at.asc&limit=60',
      { headers: { 'apikey': ANON_KEY, 'Authorization': 'Bearer ' + ANON_KEY } }
    )
    .then(function (r) { return r.json(); })
    .then(function (rows) {
      if (!rows.length) {
        addBubble('assistant', 'Hallo! Ich bin Planty 🌱 Ich helfe dir bei allen Fragen rund um ' + PLANT_LABEL + '. Was möchtest du wissen?');
      } else {
        rows.forEach(function (r) { addBubble(r.role, r.content); });
      }
    })
    .catch(function () {
      addBubble('assistant', 'Hallo! Ich bin Planty 🌱 Was möchtest du wissen?');
    });
  }

  // ── Senden ───────────────────────────────────────────────
  function send() {
    var msg = inputEl.value.trim();
    if (!msg || isLoading) return;
    isLoading = true;
    sendEl.disabled = true;
    inputEl.value = '';
    inputEl.style.height = '';
    addBubble('user', msg);
    var loading = addBubble('loading', 'Planty tippt …');
    fetch(SUPABASE_URL + '/functions/v1/plantcare-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + ANON_KEY,
        'apikey': ANON_KEY
      },
      body: JSON.stringify({
        visitor_id:   getVid(),
        page:         PAGE,
        message:      msg,
        plantContext: PLANT_CONTEXT
      })
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      loading.remove();
      addBubble('assistant', data.reply || 'Keine Antwort erhalten.');
    })
    .catch(function () {
      loading.remove();
      addBubble('assistant', 'Leider gab es einen Fehler. Bitte versuche es erneut.');
    })
    .finally(function () {
      isLoading = false;
      sendEl.disabled = inputEl.value.trim().length === 0;
    });
  }

  inputEl.addEventListener('input', function () {
    sendEl.disabled = this.value.trim().length === 0;
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 90) + 'px';
  });
  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });
  sendEl.addEventListener('click', send);
})();
