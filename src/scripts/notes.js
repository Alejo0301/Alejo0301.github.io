(function () {
  'use strict';

  /* ── FILTROS DE CATEGORÍA (notes/index.html) ─────────────── */
  function initFilters() {
    var filterBtns = document.querySelectorAll('.notes-filter-btn');
    if (!filterBtns.length) return;

    var cards = document.querySelectorAll('[data-note-cat]');

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');

        var filter = btn.getAttribute('data-filter');
        cards.forEach(function (card) {
          var cats = (card.getAttribute('data-note-cat') || '').split(' ');
          var show = filter === 'all' || cats.indexOf(filter) !== -1;
          card.style.display = show ? '' : 'none';
        });
      });
    });
  }

  /* ── ÍNDICE LATERAL CON SCROLL-SPY (páginas de detalle) ──── */
  function initToc() {
    var tocLinks = document.querySelectorAll('.note-toc-list a');
    if (!tocLinks.length) return;

    var targets = [];
    tocLinks.forEach(function (link) {
      var id = link.getAttribute('href').replace('#', '');
      var el = document.getElementById(id);
      if (el) targets.push({ link: link, el: el });
    });
    if (!targets.length) return;

    if (!('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var match = targets.filter(function (t) { return t.el === entry.target; })[0];
        if (!match) return;
        if (entry.isIntersecting) {
          tocLinks.forEach(function (l) { l.classList.remove('is-active'); });
          match.link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });

    targets.forEach(function (t) { observer.observe(t.el); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initFilters();
    initToc();
  });
}());
