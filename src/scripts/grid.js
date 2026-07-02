(function () {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var VB_W = 1600;
  var VB_H = 320;
  var HORIZON = 290;

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
    'L720,290 L724,140 L705,140 L705,124 L745,124 L745,140 L730,140 L730,75 L734,75 L734,140 L745,140 L745,290 ' +
    'L800,290 L800,190 C815,120 885,120 900,190 L900,290 ' +
    'L940,290 L940,200 L975,200 L975,290 ' +
    'L1005,290 L1005,150 L1050,150 L1050,290 ' +
    'L1075,290 L1075,230 L1110,230 L1110,290 ' +
    'L1140,290 L1140,180 L1175,180 L1175,290 ' +
    'L1200,290 L1200,240 L1230,240 L1230,290 ' +
    'L1255,290 L1255,160 L1290,160 L1290,290 ' +
    'L1315,290 L1315,210 L1345,210 L1345,290 ' +
    'L1370,290 L1370,190 L1405,190 L1405,290 ' +
    'L1430,290 L1430,250 L1460,250 L1460,290 ' +
    'L1485,290 L1485,170 L1515,170 L1515,290 ' +
    'L1540,290 L1540,220 L1570,220 L1570,290 ' +
    'L1600,290';

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
    var count = 30;
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
    var count = 16;
    var slot = VB_W / count;
    for (var i = 0; i < count; i++) {
      var width = rand(34, 56);
      var height = rand(70, 190);
      var x = i * slot + (slot - width) / 2 + rand(-8, 8);
      var y = HORIZON - height;

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
    return svg;
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
