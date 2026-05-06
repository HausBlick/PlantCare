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

  // ── FAB icon: speech bubble + leaf SVG ─────────────────
  var FAB_ICON =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M12 3C7.03 3 3 6.58 3 11C3 13.6 4.28 15.94 6.36 17.48V21.5L10.42 19.44C10.93 19.52 11.46 19.56 12 19.56C16.97 19.56 21 15.98 21 11C21 6.58 16.97 3 12 3Z" fill="white"/>' +
      '<path d="M12 16C12 16 11.4 11.6 8.5 10C10.2 10 13.4 11.1 13 13.8C14.6 11.6 16.2 10.6 16.2 10.6C14.6 13.4 12 16 12 16Z" fill="#ff385c"/>' +
    '</svg>';

  // ── CSS ─────────────────────────────────────────────────
  var FONT = "'-apple-system','BlinkMacSystemFont','Circular','Helvetica Neue',sans-serif";
  var css = [
    '.planty-fab{position:fixed;bottom:24px;right:24px;z-index:1000;width:56px;height:56px;border-radius:9999px;background:#ff385c;border:none;cursor:pointer;box-shadow:rgba(0,0,0,0.02) 0 0 0 1px,rgba(0,0,0,0.04) 0 2px 6px,rgba(0,0,0,0.12) 0 6px 20px;display:flex;align-items:center;justify-content:center;transition:transform .2s,box-shadow .2s;color:#fff;font-family:inherit}',
    '.planty-fab:hover{transform:scale(1.06);box-shadow:rgba(0,0,0,0.02) 0 0 0 1px,rgba(0,0,0,0.06) 0 4px 10px,rgba(0,0,0,0.16) 0 8px 28px}',
    '.planty-tooltip{position:fixed;bottom:92px;right:24px;z-index:999;background:#fff;border-radius:16px;padding:12px 36px 12px 14px;box-shadow:rgba(0,0,0,0.02) 0 0 0 1px,rgba(0,0,0,0.06) 0 4px 12px,rgba(0,0,0,0.1) 0 8px 24px;max-width:220px;font-size:13px;line-height:1.45;color:#222;opacity:0;transform:translateY(8px) scale(.95);transition:opacity .3s ease,transform .3s ease;pointer-events:none;font-family:' + FONT + '}',
    '.planty-tooltip.visible{opacity:1;transform:translateY(0) scale(1);pointer-events:auto}',
    '.planty-tooltip::after{content:"";position:absolute;bottom:-7px;right:22px;width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:8px solid #fff}',
    '.planty-tooltip-close{position:absolute;top:8px;right:8px;background:none;border:none;cursor:pointer;color:#929292;line-height:1;font-size:14px;padding:2px 4px;transition:color .15s}',
    '.planty-tooltip-close:hover{color:#222}',
    '.planty-window{position:fixed;bottom:92px;right:24px;z-index:1000;width:370px;height:520px;background:#fff;border-radius:20px;box-shadow:rgba(0,0,0,0.02) 0 0 0 1px,rgba(0,0,0,0.04) 0 2px 6px,rgba(0,0,0,0.12) 0 8px 32px;display:flex;flex-direction:column;overflow:hidden;transform:scale(.95) translateY(12px);opacity:0;pointer-events:none;transition:transform .22s ease,opacity .22s ease}',
    '.planty-window.open{transform:scale(1) translateY(0);opacity:1;pointer-events:auto}',
    '.planty-header{background:#ff385c;color:#fff;padding:14px 16px;display:flex;align-items:center;gap:12px;flex-shrink:0}',
    '.planty-avatar{width:38px;height:38px;background:rgba(255,255,255,.2);border-radius:9999px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}',
    '.planty-header-text{flex:1}',
    '.planty-header-name{font-size:15px;font-weight:600;line-height:1.25;letter-spacing:0}',
    '.planty-header-sub{font-size:12px;opacity:.85;margin-top:2px;font-weight:400}',
    '.planty-close{background:none;border:none;color:#fff;cursor:pointer;padding:0;line-height:1;opacity:.7;flex-shrink:0;border-radius:9999px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;transition:opacity .15s,background .15s;font-size:18px}',
    '.planty-close:hover{opacity:1;background:rgba(255,255,255,.18)}',
    '.planty-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;background:#fff}',
    '.planty-bubble{max-width:82%;padding:10px 14px;font-size:14px;line-height:1.43;word-break:break-word}',
    '.planty-bubble.user{background:#ff385c;color:#fff;align-self:flex-end;border-radius:20px 20px 4px 20px}',
    '.planty-bubble.assistant{background:#f7f7f7;color:#222;align-self:flex-start;border-radius:20px 20px 20px 4px;border:1px solid #ebebeb}',
    '.planty-bubble.loading{background:#f7f7f7;color:#6a6a6a;align-self:flex-start;border-radius:20px 20px 20px 4px;border:1px solid #ebebeb;font-style:italic}',
    '.planty-footer{border-top:1px solid #dddddd;padding:12px;display:flex;align-items:flex-end;gap:8px;flex-shrink:0;background:#fff}',
    '.planty-input{flex:1;border:1px solid #dddddd;border-radius:20px;padding:10px 14px;font-size:14px;font-family:inherit;outline:none;resize:none;line-height:1.43;max-height:90px;overflow-y:auto;color:#222;background:#fff;transition:border .15s}',
    '.planty-input:focus{border-color:#222;border-width:2px;padding:9px 13px}',
    '.planty-input::placeholder{color:#929292}',
    '.planty-send{width:38px;height:38px;border-radius:9999px;background:#ff385c;border:none;color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .15s}',
    '.planty-send:hover{background:#e00b41}',
    '.planty-send:disabled{background:#ffd1da;cursor:not-allowed}',
    '@media(max-width:500px){.planty-window{bottom:0;right:0;left:0;width:100%;height:75vh;border-radius:20px 20px 0 0}.planty-fab{bottom:20px;right:20px}}'
  ].join('');
  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ── DOM aufbauen ────────────────────────────────────────
  var fab = document.createElement('button');
  fab.className = 'planty-fab';
  fab.innerHTML = FAB_ICON;
  fab.title = 'Planty — Dein Assistent';
  fab.setAttribute('aria-label', 'Planty Chat öffnen');

  var win = document.createElement('div');
  win.className = 'planty-window';
  win.setAttribute('role', 'dialog');
  win.setAttribute('aria-label', 'Planty – Assistent');
  win.innerHTML =
    '<div class="planty-header">' +
      '<div class="planty-avatar">&#x1FAB4;</div>' +
      '<div class="planty-header-text">' +
        '<div class="planty-header-name">Planty</div>' +
        '<div class="planty-header-sub">Dein Assistent für ' + PLANT_LABEL + '</div>' +
      '</div>' +
      '<button class="planty-close" aria-label="Schließen">&#x2715;</button>' +
    '</div>' +
    '<div class="planty-messages" id="planty-msgs"></div>' +
    '<div class="planty-footer">' +
      '<textarea class="planty-input" id="planty-input" placeholder="Stell eine Frage …" rows="1" aria-label="Nachricht eingeben"></textarea>' +
      '<button class="planty-send" id="planty-send" disabled aria-label="Senden">&#x2191;</button>' +
    '</div>';

  // ── Tooltip-Sprechblase ──────────────────────────────────
  var tooltip = document.createElement('div');
  tooltip.className = 'planty-tooltip';
  tooltip.innerHTML =
    '<button class="planty-tooltip-close" aria-label="Schließen">&#x2715;</button>' +
    'Hi, ich bin Planty! &#x1FAB4; Ich helfe dir gerne bei Fragen zu ' + PLANT_LABEL + '.';

  document.body.appendChild(fab);
  document.body.appendChild(win);
  document.body.appendChild(tooltip);

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

  // ── Tooltip-Logik ───────────────────────────────────────
  var tooltipTimer;
  function hideTooltip() {
    clearTimeout(tooltipTimer);
    tooltip.classList.remove('visible');
  }
  if (!localStorage.getItem('planty_opened')) {
    tooltipTimer = setTimeout(function () {
      tooltip.classList.add('visible');
      tooltipTimer = setTimeout(hideTooltip, 7000);
    }, 2000);
  }
  tooltip.querySelector('.planty-tooltip-close').addEventListener('click', function (e) {
    e.stopPropagation();
    hideTooltip();
  });

  // ── Toggle ──────────────────────────────────────────────
  function toggle() {
    isOpen = !isOpen;
    win.classList.toggle('open', isOpen);
    if (isOpen) {
      hideTooltip();
      localStorage.setItem('planty_opened', '1');
      loadHistory();
      setTimeout(function () { inputEl.focus(); }, 200);
    }
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
        addBubble('assistant', 'Hallo! Ich bin Planty 🪴 Ich bin dein Assistent für ' + PLANT_LABEL + '. Frag mich alles, was du wissen möchtest!');
      } else {
        rows.forEach(function (r) { addBubble(r.role, r.content); });
      }
    })
    .catch(function () {
      addBubble('assistant', 'Hallo! Ich bin Planty 🪴 Was möchtest du wissen?');
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
