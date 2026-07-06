# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static marketing website for Teak Pro, a teak furniture restoration business in Birmingham, AL. No build tooling, no framework, no package.json — plain HTML/CSS/JS served as-is.

## Commands

There is no build/lint/test pipeline. To preview locally, just open the HTML files in a browser, or serve the directory:

```
python -m http.server 8000
```

## Architecture

- **Pages**: `index.html`, `services.html`, `gallery.html`, `about.html`, `contact.html` — each a full standalone HTML document sharing the same header/nav and footer markup (copy-pasted per page, not templated). `contact.html` is intentionally minimal (phone/email only, no form) since this is a static site with no backend to receive submissions. There is no Reviews page (removed).
- **`css/style.css`**: single stylesheet for the whole site. Design tokens (colors, fonts, spacing, shadows) are defined as CSS custom properties in `:root`. Class naming loosely follows BEM (`.compare__before`, `.btn--primary`, `.card--gold`). Dark-background components (`.section--deep`, `.cta-band`) explicitly override heading/eyebrow text color since the global `h1-h4`/`.eyebrow` rules default to dark text meant for light backgrounds — when adding a new dark section, follow that pattern rather than relying on the global text colors.
- **`js/main.js`**: single shared script, feature-detects each component by querying for its root class (`.nav`, `.compare`, `.filter-bar`, `.form-tabs`, `.file-drop`) so it's safe to include on every page even when a given page doesn't have that component.
- **Before/after compare sliders** (`.compare`): draggable-handle image comparison widget, currently used only on the index page hero. Logic lives in `main.js`; markup is duplicated per instance (`compare__before`, `compare__after`, `compare__handle`). The gallery page instead uses a simpler static side-by-side layout (`.before-after`), not the drag slider.
- **Images** (`images/`): organized by section — `hero/`, `gallery/`, `about/`, `partners/`. Before/after pairs follow the naming convention `{subject}-before.jpg` / `{subject}-after.jpg`. Missing images degrade gracefully: `main.js` listens for `<img>` `error` events on `.photo-slot img` and adds `.is-empty` to show a styled placeholder instead of a broken image icon — several image slots (e.g. `images/about/`, `images/partners/`) are currently empty placeholders by design.
