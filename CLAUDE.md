# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal professional portfolio for a structural engineer/developer, deployed as a GitHub Pages static site at https://alejo0301.github.io. No build step, no package manager — pure HTML, CSS, and vanilla JavaScript.

## Running Locally

```bash
# Python 3 (preferred)
python -m http.server 8000

# Node fallback
npx http-server
```

Open `http://localhost:8000` in a browser. There is no build, compile, or watch step.

## Deployment

```bash
git push origin main
```

GitHub Pages auto-deploys on push to `main`. No CI pipeline.

## Architecture

### CSS Layer Order

Styles load in this order on every page:

1. `src/styles/tokens.css` — All CSS custom properties: colors, spacing scale, typography, shadows, transitions, light/dark mode variables. **Change design-wide values here only.**
2. `src/styles/main.css` — Reset, global layout, `.nav`, buttons, shared utility classes.
3. Page-specific CSS (`index.css`, `engineering.css`, `software.css`, `projects.css`, `project.css`, `pages.css`) — Overrides and page-unique components.

### JavaScript

- `src/scripts/global.js` — Loaded on every page. Handles: dark/light theme toggle with `localStorage`, nav link active state by URL matching, `.reveal` scroll animations via `IntersectionObserver`, and nav shadow on scroll.
- `src/scripts/main.js` — Minimal entry point, currently unused.
- Alpine.js v3 (CDN) — Used only in `software.html` for tab switching.

Dark mode is managed by toggling `data-theme="dark"` on `<html>`. All color variables in `tokens.css` are remapped under `[data-theme="dark"]`.

### Page Types

| Type | Files |
|---|---|
| Top-level pages | `index.html`, `engineering.html`, `software.html` |
| Project gallery + detail | `projects/index.html`, `projects/project_*.html` |
| Inner pages | `pages/about.html`, `pages/blog.html`, `pages/contact.html` |
| Interactive calculators | `tools/spectros-nsr10.html`, `tools/curvas-interaccion.html` |

When creating a new project page, copy `projects/_template-project.html` and fill in the marked sections.

### Design Tokens Reference

Key semantic color variables (defined in `tokens.css`):

- `--accent` — Golden tone (primary brand accent)
- `--struct` — Structural green (engineering content)
- `--bim` — Steel blue (BIM/Revit content)
- `--software` — Terracotta (software/Python content)

Typography: DM Sans (body) + DM Mono (code), both loaded from Google Fonts.

Spacing scale variables: `--space-xs` through `--space-3xl`.

## Design Direction

### Identity

This portfolio represents a structural engineer who also develops BIM/API/computational tools. The visual identity is **technical, architectural, premium, restrained, and personal** — not a SaaS product, not a dev agency, not a generic creative portfolio.

Framing: structural engineering first, software second.

### What to Avoid

- Generic SaaS/startup aesthetics
- Excessive gradients or color washes
- Glassmorphism (blur-heavy card stacking)
- Neon or cyberpunk color schemes
- Over-animated layouts that distract from content
- AI/vibe-coding visual clichés
- Unnecessary external dependencies

### Design Goals

- **Editorial architectural layout** — generous whitespace, deliberate column structure, nothing decorative without purpose
- **Engineering precision** — alignment, rhythm, and grids should feel measured, not approximate
- **Strong typographic hierarchy** — size contrast and weight do the heavy lifting; avoid relying on color alone
- **Subtle technical grids** — structural/blueprint grid motifs used sparingly as texture, never as decoration
- **Premium spacing** — more space rather than less; compression is a last resort
- **Restrained color palette** — the existing semantic tokens (`--accent`, `--struct`, `--bim`, `--software`) are intentional; do not add new hues without a functional reason

### Planned Visual Feature: Animated Blueprint Grid

A subtle animated background for the homepage hero (and possibly section breaks), evoking a technical drawing or structural blueprint:

- A fine orthogonal grid rendered on a `<canvas>` or via CSS
- A small light point that moves slowly along random grid paths (grid-snapped, not free-floating)
- Motion must be slow, continuous, and non-distracting — ambient, not interactive
- Vanishes or fades in reduced-motion mode (`prefers-reduced-motion`)
- Implemented in **vanilla CSS/JS only** — no canvas libraries, no animation frameworks
- Grid color derives from existing CSS variables so it adapts to light/dark mode automatically

When implementing this feature, keep it isolated to a single JS module and a single CSS block so it can be toggled without touching other code.

## Working Conventions

- **Always state which files will be modified before making any edits.**
- Work in small, focused phases — never redesign the entire site in one pass.
- Prefer editing one file at a time when changes are confined to that file.
- The project stays as static HTML/CSS/JS. No React, no build system, no npm dependencies.
- GitHub Pages compatibility must be preserved at all times (no server-side logic, no relative path assumptions that break on subdirectories).
