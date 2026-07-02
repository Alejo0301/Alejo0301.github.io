# Handoff para Claude Code — Puente + Cinta de programas

Pega este mensaje completo (instrucciones + código) en Claude Code, apuntando al archivo donde está tu animación de fondo actual.

---

## Prompt para Claude Code

> En mi animación de fondo (skyline SVG), quiero agregar un puente atirantado (cable-stayed) centrado horizontalmente, entre los edificios que ya existen a los lados. No cambies ni reordenes los edificios actuales — solo inserta este grupo `<g class="bridge">` en el centro del SVG, alineado a la misma línea de base (ground/baseline) que usan los edificios. Ajusta el `translate` del grupo para que quede centrado en el ancho real de mi viewBox (ver instrucciones de escalado abajo). Usa exactamente este markup y estas animaciones CSS. También agrega la cinta horizontal (marquee) con los programas técnicos, tal cual el código de abajo, colocada como una franja horizontal fija (arriba o debajo del hero, con `overflow:hidden`).

---

## 1. Markup del puente (SVG, estático)

Geometría diseñada en un viewBox de referencia **1920 × 304**, con línea de base (ground) en `y = 300`. El puente ocupa el rango `x = 530` a `x = 1250` (centrado en `x = 890`).

```html
<g class="bridge">
  <!-- tablero / deck -->
  <rect class="bridge-part" style="animation-delay:0.6s" x="520" y="250" width="740" height="8"/>
  <!-- torres -->
  <rect class="bridge-part" style="animation-delay:0.3s" x="772" y="40" width="16" height="260"/>
  <rect class="bridge-part" style="animation-delay:0.3s" x="992" y="40" width="16" height="260"/>

  <!-- cables -->
  <g class="cables">
    <line class="cable" style="animation-delay:0.90s" x1="780.0" y1="71.5" x2="690.0" y2="250.0"/>
    <line class="cable" style="animation-delay:0.94s" x1="780.0" y1="71.5" x2="810.0" y2="250.0"/>
    <line class="cable" style="animation-delay:0.98s" x1="1000.0" y1="71.5" x2="1090.0" y2="250.0"/>
    <line class="cable" style="animation-delay:1.02s" x1="1000.0" y1="71.5" x2="970.0" y2="250.0"/>
    <line class="cable" style="animation-delay:1.06s" x1="780.0" y1="71.5" x2="663.3" y2="250.0"/>
    <line class="cable" style="animation-delay:1.10s" x1="780.0" y1="90.8" x2="841.7" y2="250.0"/>
    <line class="cable" style="animation-delay:1.14s" x1="1000.0" y1="71.5" x2="1116.7" y2="250.0"/>
    <line class="cable" style="animation-delay:1.18s" x1="1000.0" y1="90.8" x2="938.3" y2="250.0"/>
    <line class="cable" style="animation-delay:1.22s" x1="780.0" y1="71.5" x2="636.7" y2="250.0"/>
    <line class="cable" style="animation-delay:1.26s" x1="780.0" y1="110.0" x2="873.3" y2="250.0"/>
    <line class="cable" style="animation-delay:1.30s" x1="1000.0" y1="71.5" x2="1143.3" y2="250.0"/>
    <line class="cable" style="animation-delay:1.34s" x1="1000.0" y1="110.0" x2="906.7" y2="250.0"/>
    <line class="cable" style="animation-delay:1.38s" x1="780.0" y1="71.5" x2="610.0" y2="250.0"/>
    <line class="cable" style="animation-delay:1.42s" x1="780.0" y1="129.3" x2="905.0" y2="250.0"/>
    <line class="cable" style="animation-delay:1.46s" x1="1000.0" y1="71.5" x2="1170.0" y2="250.0"/>
    <line class="cable" style="animation-delay:1.50s" x1="1000.0" y1="129.3" x2="875.0" y2="250.0"/>
    <line class="cable" style="animation-delay:1.54s" x1="780.0" y1="71.5" x2="583.3" y2="250.0"/>
    <line class="cable" style="animation-delay:1.58s" x1="780.0" y1="148.5" x2="936.7" y2="250.0"/>
    <line class="cable" style="animation-delay:1.62s" x1="1000.0" y1="71.5" x2="1196.7" y2="250.0"/>
    <line class="cable" style="animation-delay:1.66s" x1="1000.0" y1="148.5" x2="843.3" y2="250.0"/>
    <line class="cable" style="animation-delay:1.70s" x1="780.0" y1="71.5" x2="556.7" y2="250.0"/>
    <line class="cable" style="animation-delay:1.74s" x1="780.0" y1="167.8" x2="968.3" y2="250.0"/>
    <line class="cable" style="animation-delay:1.78s" x1="1000.0" y1="71.5" x2="1223.3" y2="250.0"/>
    <line class="cable" style="animation-delay:1.82s" x1="1000.0" y1="167.8" x2="811.7" y2="250.0"/>
    <line class="cable" style="animation-delay:1.86s" x1="780.0" y1="71.5" x2="530.0" y2="250.0"/>
    <line class="cable" style="animation-delay:1.90s" x1="780.0" y1="187.0" x2="1000.0" y2="250.0"/>
    <line class="cable" style="animation-delay:1.94s" x1="1000.0" y1="71.5" x2="1250.0" y2="250.0"/>
    <line class="cable" style="animation-delay:1.98s" x1="1000.0" y1="187.0" x2="780.0" y2="250.0"/>
  </g>

  <!-- nodos estructurales (juntas, con pulso) -->
  <circle class="node" style="animation-delay:0s"    cx="780"  cy="250" r="3.4"/>
  <circle class="node" style="animation-delay:0.3s"  cx="1000" cy="250" r="3.4"/>
  <circle class="node" style="animation-delay:0.6s"  cx="780"  cy="60"  r="3.4"/>
  <circle class="node" style="animation-delay:0.9s"  cx="1000" cy="60"  r="3.4"/>
  <circle class="node" style="animation-delay:1.2s"  cx="540"  cy="250" r="3.4"/>
  <circle class="node" style="animation-delay:1.5s"  cx="1240" cy="250" r="3.4"/>
  <circle class="node" style="animation-delay:1.8s"  cx="890"  cy="250" r="3.4"/>
</g>
```

## 2. CSS necesario

```css
.bridge-part {
  fill: rgba(56,189,248,0.06);
  stroke: var(--accent, #38bdf8);
  stroke-width: 1.4;
  pathLength: 1;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: draw 1.4s ease forwards;
}
.cable {
  stroke: var(--accent, #38bdf8);
  stroke-width: 0.9;
  opacity: 0.55;
  pathLength: 1;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: draw 1s ease forwards;
}
.node {
  fill: var(--accent, #38bdf8);
  animation: pulse 2.6s ease-in-out infinite;
}
.cables {
  transform-origin: 890px 250px;
  animation: sway 6s ease-in-out infinite;
}

@keyframes draw { to { stroke-dashoffset: 0; } }
@keyframes pulse {
  0%, 100% { opacity: .35; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.6); }
}
@keyframes sway {
  0%, 100% { transform: skewX(0deg); }
  50% { transform: skewX(0.4deg); }
}
```

**Nota sobre `pathLength="1"`:** para que `stroke-dasharray:1` funcione igual en todas las formas sin calcular longitudes reales, añade el atributo SVG `pathLength="1"` a cada `<rect>` y `<line>` de arriba (no solo en el CSS). Ejemplo: `<rect class="bridge-part" pathLength="1" ...>`.

## 3. Cómo centrarlo en tu skyline existente

El puente fue diseñado para un viewBox de **1920px de ancho**. Si tu SVG actual tiene otro ancho de viewBox (`W`):

1. Envuelve todo el bloque de arriba en un `<g>` adicional:
   ```html
   <g transform="translate(TX, 0)">
     ...todo el markup del puente...
   </g>
   ```
2. Calcula `TX = (W / 2) - 890` (890 es el centro horizontal del puente en su geometría original).
3. Verifica que la línea base del puente (`y="250"` para el deck, `y="300"` como ground) coincida con la línea base (ground) que ya usan tus edificios. Si tu ground está en otro `y`, aplica también un `translate` vertical o ajusta los valores `y` proporcionalmente.
4. Deja tus edificios existentes sin tocar — el puente solo debe insertarse como grupo adicional en medio del SVG (después de los edificios izquierdos, antes de los derechos, en el orden del DOM).

---

## 4. Cinta horizontal de programas (marquee)

```html
<div class="tools-marquee">
  <div class="tools-track">
    <span>REVIT</span><span>ETABS</span><span>SAP2000</span><span>TEKLA</span>
    <span>NAVISWORKS</span><span>PYTHON</span><span>C#</span><span>AUTOCAD</span>
    <span>ROBOT STRUCTURAL</span><span>CIVIL 3D</span>
    <!-- el mismo set repetido para el loop continuo -->
    <span>REVIT</span><span>ETABS</span><span>SAP2000</span><span>TEKLA</span>
    <span>NAVISWORKS</span><span>PYTHON</span><span>C#</span><span>AUTOCAD</span>
    <span>ROBOT STRUCTURAL</span><span>CIVIL 3D</span>
  </div>
</div>
```

```css
.tools-marquee {
  border-top: 1px solid rgba(148,178,214,0.15);
  border-bottom: 1px solid rgba(148,178,214,0.15);
  background: rgba(10,15,26,0.6);
  overflow: hidden;
  padding: 16px 0;
}
.tools-track {
  display: flex;
  width: max-content;
  gap: 56px;
  animation: marquee 26s linear infinite;
}
.tools-track span {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  letter-spacing: 0.12em;
  color: #7d8fa6;
  white-space: nowrap;
}
@keyframes marquee {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
```

Como el contenido está duplicado una vez (20 spans en total, dos sets de 10), `translateX(-50%)` produce el loop continuo sin salto.
