import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* ============================================================
   GIONNY A. GUTIÉRREZ — project-model-viewer.js
   Ruta: src/scripts/project-model-viewer.js
   Visor 3D real (Three.js + GLTFLoader + OrbitControls) para
   modelos de proyecto. Un núcleo compartido (createViewer) se
   reutiliza en dos modos:
     - Modal: botones [data-model-src] abren #modelViewerModal.
     - Inline: contenedores [data-inline-model-src] embeben el
       visor directamente en la página, con carga perezosa vía
       IntersectionObserver.
   ============================================================ */

(function () {
  'use strict';

  /* ── NÚCLEO COMPARTIDO ────────────────────────────────────
     Crea una instancia Three.js independiente dentro de
     `container`. No hay estado compartido entre instancias —
     el modal y cada visor inline tienen la suya propia. */
  function createViewer(container, opts) {
    opts = opts || {};
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var renderer = null;
    var scene = null;
    var camera = null;
    var controls = null;
    var rafId = null;
    var resizeObserver = null;
    var currentModelRoot = null;
    var defaultCameraPos = new THREE.Vector3();
    var defaultTarget = new THREE.Vector3();

    function size() {
      var rect = container.getBoundingClientRect();
      return { width: rect.width || 800, height: rect.height || 480 };
    }

    function onResize() {
      if (!renderer || !camera) return;
      var s = size();
      camera.aspect = s.width / s.height;
      camera.updateProjectionMatrix();
      renderer.setSize(s.width, s.height);
    }

    function animate() {
      rafId = requestAnimationFrame(animate);
      if (controls) controls.update();
      if (renderer && scene && camera) renderer.render(scene, camera);
    }

    function build() {
      scene = new THREE.Scene();

      var s = size();
      camera = new THREE.PerspectiveCamera(45, s.width / s.height, 0.1, 5000);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(s.width, s.height);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      container.appendChild(renderer.domElement);

      /* Iluminación sobria: ambiental + hemisférica + direccional */
      scene.add(new THREE.AmbientLight(0xffffff, 0.45));
      scene.add(new THREE.HemisphereLight(0xf4f1eb, 0x3a352c, 0.55));

      var keyLight = new THREE.DirectionalLight(0xffffff, 1.15);
      keyLight.position.set(5, 10, 7.5);
      scene.add(keyLight);

      var fillLight = new THREE.DirectionalLight(0xffffff, 0.35);
      fillLight.position.set(-6, 4, -6);
      scene.add(fillLight);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.minDistance = 0.01;
      controls.maxDistance = 5000;
      controls.autoRotate = !reducedMotion;
      controls.autoRotateSpeed = 0.6;
      controls.addEventListener('start', function () {
        controls.autoRotate = false;
      });

      window.addEventListener('resize', onResize);
      if ('ResizeObserver' in window) {
        resizeObserver = new ResizeObserver(onResize);
        resizeObserver.observe(container);
      }

      animate();
    }

    function load(src) {
      var loader = new GLTFLoader();
      loader.load(
        src,
        function (gltf) {
          if (!scene) return; // el visor pudo destruirse mientras cargaba
          var root = gltf.scene || gltf.scenes[0];
          scene.add(root);
          currentModelRoot = root;
          frame(root);
          if (opts.onLoaded) opts.onLoaded();
        },
        function (xhr) {
          if (xhr.lengthComputable && opts.onProgress) {
            opts.onProgress(Math.round((xhr.loaded / xhr.total) * 100));
          }
        },
        function (err) {
          console.error('project-model-viewer: error cargando el modelo 3D', err);
          if (opts.onError) opts.onError();
        }
      );
    }

    function frame(root) {
      var box = new THREE.Box3().setFromObject(root);
      var s = box.getSize(new THREE.Vector3());
      var center = box.getCenter(new THREE.Vector3());

      root.position.x -= center.x;
      root.position.y -= center.y;
      root.position.z -= center.z;

      var maxDim = Math.max(s.x, s.y, s.z) || 1;
      var fitDistance = (maxDim / 2) / Math.tan((Math.PI * camera.fov) / 360);
      var distance = fitDistance * 1.7;

      camera.near = maxDim / 100;
      camera.far = maxDim * 100;
      camera.position.set(distance * 0.6, distance * 0.45, distance * 0.75);
      camera.updateProjectionMatrix();

      controls.target.set(0, 0, 0);
      controls.update();

      defaultCameraPos.copy(camera.position);
      defaultTarget.copy(controls.target);
    }

    function reset() {
      if (!camera || !controls) return;
      camera.position.copy(defaultCameraPos);
      controls.target.copy(defaultTarget);
      controls.update();
    }

    function disposeMaterial(material) {
      if (!material) return;
      Object.keys(material).forEach(function (key) {
        var value = material[key];
        if (value && typeof value.dispose === 'function') value.dispose();
      });
      material.dispose();
    }

    function destroy() {
      window.removeEventListener('resize', onResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }

      if (currentModelRoot) {
        currentModelRoot.traverse(function (obj) {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach(disposeMaterial);
            else disposeMaterial(obj.material);
          }
        });
        currentModelRoot = null;
      }

      if (controls) {
        controls.dispose();
        controls = null;
      }

      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
        renderer = null;
      }

      scene = null;
      camera = null;
    }

    return { build: build, load: load, reset: reset, destroy: destroy };
  }

  function statusMarkup(kind, text) {
    if (kind === 'error') {
      return '<span class="model-viewer-error-icon" aria-hidden="true">!</span><span>' + text + '</span>';
    }
    return '<span class="model-viewer-spinner" aria-hidden="true"></span><span>' + text + '</span>';
  }

  /* ── MODO MODAL — botones [data-model-src] ───────────────── */
  function initModal() {
    var modal = document.getElementById('modelViewerModal');
    if (!modal) return;

    var stage = document.getElementById('modelViewerStage');
    var statusEl = document.getElementById('modelViewerStatus');
    var titleEl = document.getElementById('modelViewerTitle');
    var closeBtn = document.getElementById('modelViewerClose');
    var resetBtn = document.getElementById('modelViewerReset');
    var lastTrigger = null;
    var viewer = null;

    function setStatus(html) {
      if (!statusEl) return;
      statusEl.style.display = 'flex';
      statusEl.innerHTML = html;
    }

    function hideStatus() {
      if (statusEl) statusEl.style.display = 'none';
    }

    function open(src, title) {
      if (!src) return;

      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (titleEl) titleEl.textContent = title;

      setStatus(statusMarkup('loading', 'Cargando modelo…'));

      viewer = createViewer(stage, {
        onLoaded: hideStatus,
        onProgress: function (pct) {
          setStatus(statusMarkup('loading', 'Cargando modelo… ' + pct + '%'));
        },
        onError: function () {
          setStatus(statusMarkup('error', 'No se pudo cargar el modelo 3D. Intenta de nuevo más tarde.'));
        }
      });
      viewer.build();
      viewer.load(src);

      if (closeBtn) closeBtn.focus();
    }

    function close() {
      if (!modal.classList.contains('is-open')) return;

      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';

      if (viewer) {
        viewer.destroy();
        viewer = null;
      }

      if (lastTrigger) {
        lastTrigger.focus();
        lastTrigger = null;
      }
    }

    document.querySelectorAll('[data-model-src]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        lastTrigger = btn;
        open(btn.getAttribute('data-model-src'), btn.getAttribute('data-model-title') || 'Modelo 3D');
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', close);
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        if (viewer) viewer.reset();
      });
    }

    modal.addEventListener('click', function (e) {
      if (e.target === modal) close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
    });
  }

  /* ── MODO INLINE — contenedores [data-inline-model-src] ──────
     Se embebe directo en la página, sin click previo. Carga
     perezosa: solo construye la escena cuando el contenedor está
     por entrar al viewport (IntersectionObserver, rootMargin
     amplio para que esté listo al llegar el usuario). */
  function initInline() {
    var containers = document.querySelectorAll('[data-inline-model-src]');
    if (!containers.length) return;

    containers.forEach(function (container) {
      var section = container.closest('.project-inline-model');
      var resetBtn = section ? section.querySelector('[data-inline-reset]') : null;
      var statusEl = container.querySelector('.inline-model-status');
      var started = false;
      var viewer = null;

      function setStatus(html) {
        if (!statusEl) return;
        statusEl.style.display = 'flex';
        statusEl.innerHTML = html;
      }

      function hideStatus() {
        if (statusEl) statusEl.style.display = 'none';
      }

      function start() {
        if (started) return;
        started = true;

        var src = container.getAttribute('data-inline-model-src');

        viewer = createViewer(container, {
          onLoaded: hideStatus,
          onProgress: function (pct) {
            setStatus(statusMarkup('loading', 'Cargando modelo… ' + pct + '%'));
          },
          onError: function () {
            setStatus(statusMarkup('error', 'No se pudo cargar el modelo 3D. Intenta de nuevo más tarde.'));
          }
        });
        viewer.build();
        viewer.load(src);

        if (resetBtn) {
          resetBtn.addEventListener('click', function () {
            if (viewer) viewer.reset();
          });
        }
      }

      if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              start();
              observer.unobserve(container);
            }
          });
        }, { rootMargin: '200px 0px' });
        observer.observe(container);
      } else {
        start();
      }
    });
  }

  function init() {
    initModal();
    initInline();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
