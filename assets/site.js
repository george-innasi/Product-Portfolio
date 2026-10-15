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
