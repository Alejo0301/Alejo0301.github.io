(function () {
  'use strict';

  /* Secuencia del hero: boceto -> modelo ETABS -> obra construida.
     Sin JS o con prefers-reduced-motion, .hps-layer--boceto queda
     visible de forma estática (ver reglas base en index.css).
     Cada cambio de etapa "entra" con un barrido diagonal (clip-path)
     en vez de un fade, más un pulso de línea de escaneo. El z-index
     se reordena por JS para que la capa activa siempre quede arriba. */
  var STAGES = [
    { layer: 'boceto', num: '01', text: 'Boceto estructural' },
    { layer: 'etabs', num: '02', text: 'Modelo analítico ETABS' },
    { layer: 'construccion', num: '03', text: 'Obra en ejecución' }
  ];

  var HOLD = 2200; // ms que cada etapa permanece visible

  var root, layers, scanEl, numEl, textEl, ticks;
  var index = 0;
  var timer = null;
  var zCounter = 10;

  function pulseScan() {
    if (!scanEl) return;
    scanEl.classList.remove('is-scanning');
    void scanEl.offsetWidth; // fuerza reflow para reiniciar la animación
    scanEl.classList.add('is-scanning');
  }

  function show(i) {
    STAGES.forEach(function (stage, si) {
      var layer = layers[stage.layer];
      if (!layer) return;
      if (si === i) {
        zCounter += 1;
        layer.style.zIndex = zCounter;
      }
      layer.classList.toggle('is-active', si === i);
    });
    ticks.forEach(function (tick, ti) {
      tick.classList.toggle('is-active', ti === i);
    });
    if (numEl) numEl.textContent = STAGES[i].num;
    if (textEl) textEl.textContent = STAGES[i].text;
    pulseScan();
  }

  function next() {
    index = (index + 1) % STAGES.length;
    show(index);
  }

  function start() {
    if (timer) return;
    timer = setInterval(next, HOLD);
  }

  function stop() {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
  }

  function init() {
    root = document.querySelector('.hero-project-sequence');
    if (!root) return;

    layers = {};
    STAGES.forEach(function (stage) {
      layers[stage.layer] = root.querySelector('.hps-layer--' + stage.layer);
    });
    scanEl = root.querySelector('.hps-scan');
    numEl = root.querySelector('.hps-label-num');
    textEl = root.querySelector('.hps-label-text');
    ticks = root.querySelectorAll('.hps-progress-tick');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    root.classList.add('is-sequenced');
    show(0);
    start();

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
