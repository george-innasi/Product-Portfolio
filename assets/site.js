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

/* "Leave me your thoughts" form.
   With a Web3Forms access key the note is emailed to George from the
   visitor's browser; without one it falls back to opening their mail app. */
(function () {
  var WEB3FORMS_KEY = '10794bf7-de2e-4d1d-a3d2-cf8e8f299af9'; // Web3Forms public access key (georgeinnasi@gmail.com)
  var INBOX = 'georgeinnasi@gmail.com';
  document.addEventListener('DOMContentLoaded', function () {
    var f = document.getElementById('tform');
    if (!f) return;
    var ta = f.querySelector('textarea[name="message"]');
    var emailEl = f.querySelector('input[name="email"]');
    var status = document.getElementById('tstatus');
    var count = document.getElementById('tcount');
    var btn = f.querySelector('button[type="submit"]');

    if (ta && count) {
      var sync = function () { count.textContent = ta.value.length; };
      ta.addEventListener('input', sync); sync();
    }
    function set(msg, kind) { if (status) { status.textContent = msg; status.className = 'tform-status' + (kind ? ' ' + kind : ''); } }

    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = (ta ? ta.value : '').trim();
      var email = emailEl ? emailEl.value.trim() : '';
      if (!msg) { set('Please add a short note first.', 'err'); if (ta) ta.focus(); return; }

      if (WEB3FORMS_KEY) {
        set('Sending...', ''); if (btn) btn.disabled = true;
        fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: WEB3FORMS_KEY,
            subject: 'New message from your portfolio',
            from_name: 'Portfolio contact',
            botcheck: '',
            message: msg,
            reply_email: email || 'not provided'
          })
        }).then(function (r) { return r.json(); }).then(function (d) {
          if (d && d.success) { f.reset(); if (count) count.textContent = '0'; set('Thanks, your note is on its way.', 'ok'); }
          else { set('Something went wrong. You can email me directly instead.', 'err'); }
        }).catch(function () {
          set('Something went wrong. You can email me directly instead.', 'err');
        }).then(function () { if (btn) btn.disabled = false; });
      } else {
        var body = msg + (email ? '\n\nReply to: ' + email : '');
        window.location.href = 'mailto:' + INBOX + '?subject=' + encodeURIComponent('Message from your portfolio') + '&body=' + encodeURIComponent(body);
        set('Opening your email app to send the note...', 'ok');
      }
    });
  });
})();
