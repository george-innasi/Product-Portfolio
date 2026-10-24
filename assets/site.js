/* Theme toggle. Per-viewer convenience only, so every storage call is guarded. */
(function () {
  var root = document.documentElement;

  function stored() {
    try { return localStorage.getItem('gi-theme'); } catch (e) { return null; }
  }
  function remember(v) {
    try { localStorage.setItem('gi-theme', v); } catch (e) { /* private mode, ignore */ }
  }
  function systemDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  var saved = stored();
  if (saved === 'dark' || saved === 'light') root.setAttribute('data-theme', saved);

  function current() {
    var t = root.getAttribute('data-theme');
    if (t === 'dark' || t === 'light') return t;
    return systemDark() ? 'dark' : 'light';
  }

  /* The icon itself is swapped in CSS. This only keeps the label honest. */
  function paint(btn) {
    var dark = current() === 'dark';
    btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.querySelector('.theme-btn');
    if (!btn) return;
    paint(btn);
    btn.addEventListener('click', function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      remember(next);
      paint(btn);
    });
  });
})();

/* Home portrait: click or tap to cycle through the photos. */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var box = document.querySelector('[data-cycle]');
    if (!box) return;
    var imgs = box.querySelectorAll('img');
    var count = box.querySelector('.portrait-count');
    var i = 0;
    box.addEventListener('click', function () {
      imgs[i].classList.remove('on');
      i = (i + 1) % imgs.length;
      imgs[i].classList.add('on');
      if (count) count.textContent = (i + 1) + ' / ' + imgs.length;
    });
  });
})();

/* Email icon: on desktop, open a Gmail compose window addressed to George.
   The mailto link stays as the fallback, and phones keep using their mail app. */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var link = document.querySelector('a[data-gmail]');
    if (!link) return;
    link.addEventListener('click', function (e) {
      var touch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
      if (touch || e.ctrlKey || e.metaKey || e.shiftKey || e.button) return;
      e.preventDefault();
      var url = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(link.getAttribute('data-gmail'));
      var w = window.open(url, '_blank', 'noopener');
      if (!w) window.location.href = link.getAttribute('href');
    });
  });
})();

/* Lightbox: images with data-lightbox open in a full-screen overlay. */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = '<button class="lightbox-close" aria-label="Close">&times;</button><img src="" alt="">';
    document.body.appendChild(overlay);
    var lbImg = overlay.querySelector('img');
    var closeBtn = overlay.querySelector('.lightbox-close');

    function open(src, alt) {
      lbImg.src = src; lbImg.alt = alt || '';
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    document.querySelectorAll('[data-lightbox]').forEach(function (el) {
      el.style.cursor = 'zoom-in';
      el.addEventListener('click', function (e) {
        e.preventDefault();
        var img = el.tagName === 'IMG' ? el : el.querySelector('img');
        if (img) open(img.src, img.alt);
      });
    });

    closeBtn.addEventListener('click', close);
    lbImg.addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  });
})();

/* Copy-to-clipboard buttons (e.g. the contact email). */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-copy]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var text = btn.getAttribute('data-copy');
        var done = function () {
          btn.classList.add('copied');
          btn.setAttribute('aria-label', 'Copied');
          setTimeout(function () { btn.classList.remove('copied'); btn.setAttribute('aria-label', 'Copy email address'); }, 1600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(function () {});
        }
      });
    });
  });
})();

/* Copy-email button on the contact page. */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.querySelector('.ct-copy-email');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var email = btn.getAttribute('data-email');
      var label = btn.querySelector('.ct-copy-label');
      if (!email) return;
      var done = function () {
        btn.classList.add('copied');
        if (label) label.textContent = 'Copied!';
        setTimeout(function () {
          btn.classList.remove('copied');
          if (label) label.textContent = 'Copy Email';
        }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done).catch(function () {
          /* fallback: select from a temporary input */
          var inp = document.createElement('input');
          inp.value = email; document.body.appendChild(inp);
          inp.select(); document.execCommand('copy'); document.body.removeChild(inp);
          done();
        });
      } else {
        var inp = document.createElement('input');
        inp.value = email; document.body.appendChild(inp);
        inp.select(); document.execCommand('copy'); document.body.removeChild(inp);
        done();
      }
    });
  });
})();

/* Phase panel switching (HelloFresh 3-phase layout). */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var cards = document.querySelectorAll('.phase-card');
    var panels = document.querySelectorAll('.phase-panel');
    if (!cards.length) return;
    cards.forEach(function (card) {
      card.addEventListener('click', function () {
        var phase = card.getAttribute('data-phase');
        cards.forEach(function (c) {
          c.classList.remove('active');
          c.setAttribute('aria-selected', 'false');
        });
        card.classList.add('active');
        card.setAttribute('aria-selected', 'true');
        panels.forEach(function (p) {
          p.hidden = p.getAttribute('data-panel') !== phase;
        });
        var panel = document.querySelector('[data-panel="' + phase + '"]');
        if (panel) { panel.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      });
    });
  });
})();

/* "Send a message" form with intent tags.
   Web3Forms sends the note to George. Without a key it falls back to mailto. */
(function () {
  var WEB3FORMS_KEY = '10794bf7-de2e-4d1d-a3d2-cf8e8f299af9';
  var INBOX = 'georgeinnasi@gmail.com';

  var PLACEHOLDERS = {
    '': 'Let\'s connect. Tell me about the role or idea, and how you see me fitting in.',
    role: 'Tell me about the team, product stage, or role scope...',
    startup: 'What\'s the idea? Where are you in the journey? How can I help?',
    advisory: 'What challenge are you facing? What kind of input would be most useful?',
    network: 'No agenda needed. Tell me a bit about yourself or what you\'re working on.'
  };

  var INTENT_LABELS = {
    role: 'AI/PM Role',
    startup: 'Startup Collaboration / Kittii',
    advisory: 'Advisory',
    network: 'Networking'
  };

  document.addEventListener('DOMContentLoaded', function () {
    var f = document.getElementById('tform');
    if (!f) return;
    var ta = f.querySelector('textarea[name="message"]');
    var emailEl = f.querySelector('input[name="email"]');
    var status = document.getElementById('tstatus');
    var count = document.getElementById('tcount');
    var btn = f.querySelector('button[type="submit"]');
    var intentInput = document.getElementById('ct-intent-val');
    var intents = f.querySelectorAll('.ct-intent');
    var toast = document.getElementById('ct-toast');

    /* character counter */
    if (ta && count) {
      var sync = function () { count.textContent = ta.value.length; };
      ta.addEventListener('input', sync); sync();
    }

    /* intent tag selection */
    intents.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-intent');
        var wasActive = btn.getAttribute('aria-pressed') === 'true';
        intents.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
        if (!wasActive) {
          btn.setAttribute('aria-pressed', 'true');
          if (intentInput) intentInput.value = key;
          if (ta) ta.setAttribute('placeholder', PLACEHOLDERS[key] || PLACEHOLDERS['']);
        } else {
          if (intentInput) intentInput.value = '';
          if (ta) ta.setAttribute('placeholder', PLACEHOLDERS['']);
        }
      });
    });

    function set(msg, kind) { if (status) { status.textContent = msg; status.className = 'tform-status' + (kind ? ' ' + kind : ''); } }

    function showToast() {
      if (!toast) return;
      toast.classList.add('show');
      setTimeout(function () { toast.classList.remove('show'); }, 5000);
    }

    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = (ta ? ta.value : '').trim();
      var email = emailEl ? emailEl.value.trim() : '';
      var intent = intentInput ? intentInput.value : '';
      if (!msg) { set('Please add a short note first.', 'err'); if (ta) ta.focus(); return; }

      var intentLabel = intent ? INTENT_LABELS[intent] || intent : 'Not specified';
      var subject = intent ? 'Portfolio: ' + intentLabel : 'New message from your portfolio';

      if (WEB3FORMS_KEY) {
        set('Sending...', ''); if (btn) btn.disabled = true;
        fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: WEB3FORMS_KEY,
            subject: subject,
            from_name: 'Portfolio contact',
            botcheck: '',
            intent: intentLabel,
            message: msg,
            reply_email: email || 'not provided'
          })
        }).then(function (r) { return r.json(); }).then(function (d) {
          if (d && d.success) {
            f.reset(); if (count) count.textContent = '0';
            intents.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
            if (intentInput) intentInput.value = '';
            if (ta) ta.setAttribute('placeholder', PLACEHOLDERS['']);
            set('', '');
            showToast();
          } else { set('Something went wrong. You can email me directly instead.', 'err'); }
        }).catch(function () {
          set('Something went wrong. You can email me directly instead.', 'err');
        }).then(function () { if (btn) btn.disabled = false; });
      } else {
        var body = (intent ? 'Intent: ' + intentLabel + '\n\n' : '') + msg + (email ? '\n\nReply to: ' + email : '');
        window.location.href = 'mailto:' + INBOX + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
        set('Opening your email app to send the note...', 'ok');
      }
    });
  });
})();
