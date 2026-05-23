(function () {
  'use strict';

  var CELL  = 64;   // px — matches --space-2xl spacing token
  var SPEED = 50;   // px/s — one cell (~1.28s), three cells (~3.84s)
  var DWELL = 700;  // ms pause at each intersection before next move
  var MARGIN = 2;   // grid cells to keep away from viewport edges

  var col = 0;
  var row = 0;
  var point = null;
  var walkTimer = null;

  function cols()  { return Math.floor(window.innerWidth  / CELL); }
  function rows()  { return Math.floor(window.innerHeight / CELL); }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }

  function moveTo(nc, nr) {
    var cellsMoved = Math.abs(nc - col) + Math.abs(nr - row);
    var duration   = (cellsMoved * CELL) / SPEED;
    col = nc;
    row = nr;
    point.style.transitionDuration = duration + 's';
    point.style.transform = 'translate(' + (col * CELL) + 'px,' + (row * CELL) + 'px)';
    walkTimer = setTimeout(walk, duration * 1000 + DWELL);
  }

  function walk() {
    var minC = MARGIN;
    var maxC = cols() - 1 - MARGIN;
    var minR = MARGIN;
    var maxR = rows() - 1 - MARGIN;

    var dirs = shuffle([[1, 0], [-1, 0], [0, 1], [0, -1]]);

    for (var i = 0; i < dirs.length; i++) {
      var dc    = dirs[i][0];
      var dr    = dirs[i][1];
      var steps = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3 cells
      var nc    = clamp(col + dc * steps, minC, maxC);
      var nr    = clamp(row + dr * steps, minR, maxR);
      if (nc !== col || nr !== row) {
        moveTo(nc, nr);
        return;
      }
    }

    // Fallback: can't move in any direction — recentre
    moveTo(Math.round(cols() / 2), Math.round(rows() / 2));
  }

  function init() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(max-width: 768px)').matches) return;

    point = document.querySelector('.bg-grid__point');
    if (!point) return;

    // Place at viewport centre without triggering a transition
    col = Math.round(cols() / 2);
    row = Math.round(rows() / 2);
    point.style.transition = 'none';
    point.style.transform  = 'translate(' + (col * CELL) + 'px,' + (row * CELL) + 'px)';
    point.getBoundingClientRect(); // force reflow before re-enabling transition
    point.style.transition = '';

    walkTimer = setTimeout(walk, DWELL);
  }

  // Pause when tab is not visible
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      clearTimeout(walkTimer);
    } else if (point) {
      walkTimer = setTimeout(walk, DWELL);
    }
  });

  // Re-clamp point on resize (debounced)
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (!point) return;
      clearTimeout(walkTimer);
      col = clamp(col, MARGIN, cols() - 1 - MARGIN);
      row = clamp(row, MARGIN, rows() - 1 - MARGIN);
      point.style.transitionDuration = '0s';
      point.style.transform = 'translate(' + (col * CELL) + 'px,' + (row * CELL) + 'px)';
      walkTimer = setTimeout(walk, DWELL);
    }, 300);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
