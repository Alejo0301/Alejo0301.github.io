(function () {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var VB_W = 1980; // 1600 del skyline original + 380 para abrir hueco central al puente
  var VB_H = 320;
  var HORIZON = 290;

  // Zona reservada al puente (con margen) — los edificios medios la evitan.
  var BRIDGE_ZONE = [660, 1120];

  /* Single continuous roofline: arch · observation tower · setback tower
     + antenna · stepped crown + spire · irregular shard · tower with
     platform · dome · flat-top tower cluster. */
  var SKYLINE_D =
    'M0,290 ' +
    'L20,290 L20,220 C20,170 50,150 85,150 C120,150 150,170 150,220 L150,290 ' +
    'L200,290 L212,160 L204,160 L220,75 L236,160 L228,160 L240,290 ' +
    'L270,290 L270,245 L292,245 L292,205 L308,205 L308,165 L320,165 L320,100 L320,165 L332,165 L332,205 L348,205 L348,245 L370,245 L370,290 ' +
    'L400,290 L400,250 L420,250 L420,210 L436,210 L436,170 L452,170 L462,90 L472,170 L488,170 L488,210 L504,210 L504,250 L524,250 L524,290 ' +
    'L560,290 L560,230 L580,210 L578,160 L600,130 L612,170 L630,105 L648,150 L660,190 L660,230 L680,230 L680,290 ' +
    // ── hueco central reservado al puente (x 680-1100) ──
    'L1100,290 L1104,140 L1085,140 L1085,124 L1125,124 L1125,140 L1110,140 L1110,75 L1114,75 L1114,140 L1125,140 L1125,290 ' +
    'L1180,290 L1180,190 C1195,120 1265,120 1280,190 L1280,290 ' +
    'L1320,290 L1320,200 L1355,200 L1355,290 ' +
    'L1385,290 L1385,150 L1430,150 L1430,290 ' +
    'L1455,290 L1455,230 L1490,230 L1490,290 ' +
    'L1520,290 L1520,180 L1555,180 L1555,290 ' +
    'L1580,290 L1580,240 L1610,240 L1610,290 ' +
    'L1635,290 L1635,160 L1670,160 L1670,290 ' +
    'L1695,290 L1695,210 L1725,210 L1725,290 ' +
    'L1750,290 L1750,190 L1785,190 L1785,290 ' +
    'L1810,290 L1810,250 L1840,250 L1840,290 ' +
    'L1865,290 L1865,170 L1895,170 L1895,290 ' +
    'L1920,290 L1920,220 L1950,220 L1950,290 ' +
    'L1980,290';

  var SPEED = 60;          // svg units / s along the path
  var DWELL_MIN = 900;      // ms
  var DWELL_MAX = 2600;     // ms

  var svgEl = null;
  var pathEl = null;
  var pointEl = null;
  var pointHaloEl = null;
  var gradientEl = null;
  var totalLength = 0;
  var currentLen = 0;
  var targetLen = 0;
  var state = 'dwelling'; // 'moving' | 'dwelling'
  var dwellUntil = 0;
  var lastTime = 0;
  var rafId = null;
  var bridgeLines = [];

  function svgNode(tag, attrs) {
    var node = document.createElementNS(SVG_NS, tag);
    for (var key in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, key)) {
        node.setAttribute(key, attrs[key]);
      }
    }
    return node;
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function buildDefs() {
    var defs = svgNode('defs', {});

    var pattern = svgNode('pattern', {
      id: 'skylineWindows',
      width: '7',
      height: '9',
      patternUnits: 'userSpaceOnUse'
    });
    pattern.appendChild(svgNode('rect', {
      x: '1.5', y: '2', width: '2', height: '2.5',
      fill: 'var(--text-tertiary)', opacity: '0.5'
    }));
    defs.appendChild(pattern);

    var glowFilter = svgNode('filter', {
      id: 'skylineGlow', x: '-50%', y: '-50%', width: '200%', height: '200%'
    });
    glowFilter.appendChild(svgNode('feGaussianBlur', { stdDeviation: '4' }));
    defs.appendChild(glowFilter);

    var pointFilter = svgNode('filter', {
      id: 'skylinePointGlow', x: '-200%', y: '-200%', width: '500%', height: '500%'
    });
    pointFilter.appendChild(svgNode('feGaussianBlur', { stdDeviation: '3' }));
    defs.appendChild(pointFilter);

    gradientEl = svgNode('radialGradient', {
      id: 'skylineLineGlow',
      gradientUnits: 'userSpaceOnUse',
      cx: '800', cy: '200', r: '240'
    });
    gradientEl.appendChild(svgNode('stop', { offset: '0%', 'stop-color': 'var(--accent)', 'stop-opacity': '0.95' }));
    gradientEl.appendChild(svgNode('stop', { offset: '35%', 'stop-color': 'var(--accent)', 'stop-opacity': '0.35' }));
    gradientEl.appendChild(svgNode('stop', { offset: '100%', 'stop-color': 'var(--accent)', 'stop-opacity': '0' }));
    defs.appendChild(gradientEl);

    return defs;
  }

  function buildFarLayer() {
    var group = svgNode('g', { opacity: '0.85' });
    var count = 37; // densidad proporcional al VB_W ampliado (era 30 sobre 1600)
    var slot = VB_W / count;
    for (var i = 0; i < count; i++) {
      var width = slot * rand(0.55, 0.85);
      var height = rand(15, 70);
      var x = i * slot + rand(-3, 3);
      group.appendChild(svgNode('rect', {
        x: x.toFixed(1),
        y: (HORIZON - height).toFixed(1),
        width: width.toFixed(1),
        height: height.toFixed(1),
        fill: 'var(--border-strong)',
        opacity: rand(0.1, 0.22).toFixed(2)
      }));
    }
    return group;
  }

  function buildMidLayer() {
    var group = svgNode('g', {});
    var count = 20; // densidad proporcional al VB_W ampliado (era 16 sobre 1600)
    var slot = VB_W / count;
    for (var i = 0; i < count; i++) {
      var width = rand(34, 56);
      var height = rand(70, 190);
      var x = i * slot + (slot - width) / 2 + rand(-8, 8);
      var y = HORIZON - height;

      // deja el hueco libre para que el puente no compita con edificios medios
      if (x + width > BRIDGE_ZONE[0] && x < BRIDGE_ZONE[1]) continue;

      group.appendChild(svgNode('rect', {
        x: x.toFixed(1), y: y.toFixed(1),
        width: width.toFixed(1), height: height.toFixed(1),
        fill: 'var(--border-default)', opacity: '0.28',
        stroke: 'var(--border-strong)', 'stroke-width': '1', 'stroke-opacity': '0.3'
      }));
      group.appendChild(svgNode('rect', {
        x: x.toFixed(1), y: y.toFixed(1),
        width: width.toFixed(1), height: height.toFixed(1),
        fill: 'url(#skylineWindows)'
      }));

      var roofDetail = i % 3;
      if (roofDetail === 0) {
        var cx = x + width / 2;
        group.appendChild(svgNode('line', {
          x1: cx.toFixed(1), y1: y.toFixed(1),
          x2: cx.toFixed(1), y2: (y - rand(14, 26)).toFixed(1),
          stroke: 'var(--border-strong)', 'stroke-width': '1', opacity: '0.4'
        }));
      } else if (roofDetail === 1) {
        var tankW = 6, tankH = rand(6, 11);
        group.appendChild(svgNode('rect', {
          x: (x + width - tankW - 2).toFixed(1),
          y: (y - tankH).toFixed(1),
          width: tankW, height: tankH.toFixed(1),
          fill: 'var(--border-strong)', opacity: '0.3'
        }));
      }
    }
    return group;
  }

  function buildFrontLayer() {
    var group = svgNode('g', {});

    group.appendChild(svgNode('path', {
      d: SKYLINE_D,
      fill: 'none',
      stroke: 'var(--border-strong)',
      'stroke-width': '1.5',
      'stroke-linejoin': 'round',
      opacity: '0.45'
    }));

    group.appendChild(svgNode('path', {
      d: SKYLINE_D,
      fill: 'none',
      stroke: 'url(#skylineLineGlow)',
      'stroke-width': '6',
      'stroke-linejoin': 'round',
      filter: 'url(#skylineGlow)',
      'data-skyline-light': ''
    }));

    pathEl = svgNode('path', {
      d: SKYLINE_D,
      fill: 'none',
      stroke: 'url(#skylineLineGlow)',
      'stroke-width': '1.4',
      'stroke-linejoin': 'round',
      'data-skyline-light': ''
    });
    group.appendChild(pathEl);

    pointHaloEl = svgNode('circle', {
      r: '9', fill: 'var(--accent)', opacity: '0.35',
      filter: 'url(#skylinePointGlow)', 'data-skyline-light': ''
    });
    group.appendChild(pointHaloEl);

    pointEl = svgNode('circle', {
      r: '3.2', fill: 'var(--accent)', 'data-skyline-light': ''
    });
    group.appendChild(pointEl);

    return group;
  }

  /* Puente atirantado — centrado en el hueco abierto en SKYLINE_D
     (x 680-1100), entre el "shard" y la torre con plataforma.
     Geometría nativa de referencia: viewBox 1920x304, ground y=300,
     puente x=530-1250 (centro x=890). Se reescala con bx()/by() para
     encajar en el hueco de nuestro horizonte (HORIZON=290) sin tocar
     ninguna coordenada de los edificios existentes. Colores en
     --bim (acero) y --accent (oro) — ambos tokens ya usados en el
     resto del fondo, sin azul neón. */
  function buildBridgeLayer() {
    var BR_SCALE = 0.5;
    var BR_TX = 445;   // centra el puente (x=890 nativo) en x=890 del hueco
    var BR_TY = 140;   // alinea el ground nativo (y=300) con HORIZON (290)

    function bx(nx) { return nx * BR_SCALE + BR_TX; }
    function by(ny) { return ny * BR_SCALE + BR_TY; }

    var group = svgNode('g', { class: 'bridge-group' });
    var lines = [];

    var TOWER_A = 780, TOWER_B = 1000, DECK_Y = 250;

    // Tablero — barra continua entre los dos extremos (x nativos 520-1260)
    var deckLine = svgNode('line', {
      x1: bx(520), y1: by(DECK_Y), x2: bx(1260), y2: by(DECK_Y),
      stroke: 'var(--bim)', 'stroke-width': '5', 'stroke-linecap': 'round',
      opacity: '0.8', class: 'bridge-deck'
    });
    group.appendChild(deckLine);
    lines.push(deckLine);

    // Torres — llegan hasta el horizonte, hacen de pilar y mástil a la vez
    [TOWER_A, TOWER_B].forEach(function (tx) {
      var tower = svgNode('line', {
        x1: bx(tx), y1: by(40), x2: bx(tx), y2: by(300),
        stroke: 'var(--bim)', 'stroke-width': '6', 'stroke-linecap': 'round',
        opacity: '0.85', class: 'bridge-pylon'
      });
      group.appendChild(tower);
      lines.push(tower);
    });

    // Cables — patrón abanico/arpa combinado (14 por torre)
    var CABLES = [
      [TOWER_A, 71.5, 690], [TOWER_A, 71.5, 810], [TOWER_A, 71.5, 663.3], [TOWER_A, 90.8, 841.7],
      [TOWER_A, 71.5, 636.7], [TOWER_A, 110.0, 873.3], [TOWER_A, 71.5, 610.0], [TOWER_A, 129.3, 905.0],
      [TOWER_A, 71.5, 583.3], [TOWER_A, 148.5, 936.7], [TOWER_A, 71.5, 556.7], [TOWER_A, 167.8, 968.3],
      [TOWER_A, 71.5, 530.0], [TOWER_A, 187.0, 1000.0],
      [TOWER_B, 71.5, 1090], [TOWER_B, 71.5, 970], [TOWER_B, 71.5, 1116.7], [TOWER_B, 90.8, 938.3],
      [TOWER_B, 71.5, 1143.3], [TOWER_B, 110.0, 906.7], [TOWER_B, 71.5, 1170.0], [TOWER_B, 129.3, 875.0],
      [TOWER_B, 71.5, 1196.7], [TOWER_B, 148.5, 843.3], [TOWER_B, 71.5, 1223.3], [TOWER_B, 167.8, 811.7],
      [TOWER_B, 71.5, 1250.0], [TOWER_B, 187.0, 780.0]
    ];
    CABLES.forEach(function (c) {
      var cable = svgNode('line', {
        x1: bx(c[0]), y1: by(c[1]), x2: bx(c[2]), y2: by(DECK_Y),
        stroke: 'var(--bim)', 'stroke-width': '0.8', opacity: '0.5',
        class: 'bridge-cable'
      });
      group.appendChild(cable);
      lines.push(cable);
    });

    // Nodos estructurales — juntas clave, con pulso propio en --accent
    var NODES = [
      [780, 250], [1000, 250], [780, 60], [1000, 60],
      [540, 250], [1240, 250], [890, 250]
    ];
    NODES.forEach(function (n, i) {
      var node = svgNode('circle', {
        cx: bx(n[0]), cy: by(n[1]), r: '2.6',
        fill: 'var(--accent)', class: 'bridge-node'
      });
      node.style.animationDelay = (i * 0.3) + 's';
      group.appendChild(node);
    });

    return { group: group, lines: lines };
  }

  function buildSVG() {
    var svg = svgNode('svg', {
      class: 'bg-grid__skyline',
      viewBox: '0 0 ' + VB_W + ' ' + VB_H,
      preserveAspectRatio: 'none',
      'aria-hidden': 'true'
    });
    svg.appendChild(buildDefs());
    svg.appendChild(buildFarLayer());
    svg.appendChild(buildMidLayer());
    svg.appendChild(buildFrontLayer());

    var bridge = buildBridgeLayer();
    svg.appendChild(bridge.group);
    bridgeLines = bridge.lines;

    return svg;
  }

  function animateBridgeDraw() {
    bridgeLines.forEach(function (line) {
      var x1 = parseFloat(line.getAttribute('x1'));
      var y1 = parseFloat(line.getAttribute('y1'));
      var x2 = parseFloat(line.getAttribute('x2'));
      var y2 = parseFloat(line.getAttribute('y2'));
      var len = Math.hypot(x2 - x1, y2 - y1) || 0.01;
      line.style.strokeDasharray = len;
      line.style.strokeDashoffset = len;
    });
    // Doble rAF: fuerza al navegador a pintar el estado oculto
    // antes de arrancar la animación de trazado.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        bridgeLines.forEach(function (line, i) {
          line.style.animation = 'bridgeDraw 1.4s ease-out ' + (i * 35) + 'ms forwards';
        });
      });
    });
  }

  function updatePoint(len) {
    var pt = pathEl.getPointAtLength(len);
    pointEl.setAttribute('cx', pt.x);
    pointEl.setAttribute('cy', pt.y);
    pointHaloEl.setAttribute('cx', pt.x);
    pointHaloEl.setAttribute('cy', pt.y);
    gradientEl.setAttribute('cx', pt.x);
    gradientEl.setAttribute('cy', pt.y);
  }

  function pickTarget() {
    targetLen = Math.random() * totalLength;
    state = 'moving';
  }

  function tick(now) {
    if (!lastTime) lastTime = now;
    var dt = (now - lastTime) / 1000;
    lastTime = now;

    if (state === 'moving') {
      var diff = targetLen - currentLen;
      var dist = Math.abs(diff);
      var step = SPEED * dt;
      if (step >= dist) {
        currentLen = targetLen;
        state = 'dwelling';
        dwellUntil = now + rand(DWELL_MIN, DWELL_MAX);
      } else {
        currentLen += (diff < 0 ? -1 : 1) * step;
      }
      updatePoint(currentLen);
    } else if (now >= dwellUntil) {
      pickTarget();
    }

    rafId = requestAnimationFrame(tick);
  }

  function startAnimation() {
    totalLength = pathEl.getTotalLength();
    currentLen = totalLength / 2;
    updatePoint(currentLen);
    dwellUntil = performance.now() + rand(DWELL_MIN, DWELL_MAX);
    state = 'dwelling';
    rafId = requestAnimationFrame(tick);
  }

  function init() {
    if (window.matchMedia('(max-width: 768px)').matches) return;

    var host = document.querySelector('.bg-grid');
    if (!host) return;

    host.innerHTML = '';
    svgEl = buildSVG();
    host.appendChild(svgEl);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    animateBridgeDraw();
    startAnimation();
  }

  document.addEventListener('visibilitychange', function () {
    if (!pathEl) return;
    if (document.hidden) {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    } else if (!rafId) {
      lastTime = 0;
      rafId = requestAnimationFrame(tick);
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
