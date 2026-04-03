Build a standalone web app called "Beema's Fincon Flowchart Creator" — a React + Vite single-page app that lets users write Mermaid flowchart syntax, preview it live, and export it as PNG.

## Tech Stack
- React with Vite (no build system beyond Vite)
- Mermaid.js for rendering flowcharts
- Canvas API (no html2canvas) — manually render SVG to canvas for export
- Custom CSS only — NO Tailwind
- Tailwind loaded via CDN in HTML is also fine
- No test framework
- No package manager lock file conflicts — support bun.lock

## Features
1. **Mermaid Editor** — textarea for writing Mermaid flowchart syntax with monospace font
2. **Live Preview** — renders the flowchart below the editor using Mermaid's API
3. **Export to PNG** — high-quality 2x downscaled PNG export using canvas
4. **Dark/Light theme toggle** — liquid-glass style toggle switch, persisted in localStorage
5. **Watermark toggle** — optional watermark on exported PNGs
6. **Error handling** — shows a styled error banner when Mermaid syntax is invalid
7. **Mobile responsive** — works on phones and tablets

## Design System (Liquid-Glass iPhone Style)
- Background: subtle gradient (#f0f4f8 → #f5f5f7 → #e8edf2) in light mode, (#0a0a0c → #000 → #080810) in dark
- Blurred orbs: two large gradient blobs floating behind content (teal top-right, pink bottom-left)
- Glass cards: frosted-glass look using backdrop-filter: blur(60px) with semi-transparent white/gray gradients
- Buttons: pill-shaped (border-radius: 980px), liquid-glass style with gradient overlay
- Toggles: Apple-style iOS toggle switch with glass thumb
- Editor: rounded textarea with glass-like inset background
- Error banner: soft red background with red border
- Typography: -apple-system font stack (SF Pro Display/Text, Inter, Helvetica Neue)
- Custom font: Alegreya Sans SC Thin for watermark text (loaded via @font-face from /AlegreyaSansSC-Thin.ttf)
- Overall aesthetic: clean, minimal, Apple-inspired with subtle shadows and transitions

## File Structure
```
├── index.html          # Root HTML with CDN links (Inter font, Tailwind)
├── vite.config.js      # Simple Vite config
├── package.json        # Dependencies: react, react-dom, vite, @vitejs/
├── src/
│   │── main.jsx        # React entry
│   │── App.jsx         # Main component
│   │── App.css         # All component styles (liquid-glass system
│   │── index.css       # Global resets + font face
└── public/
    │── AlegreyaSansSC-Thin.ttf  # Custom font
    │── favicon.svg              # Favicon
    │── icons.svg                # Icons (if used)
```

## State Management
- All local state via useState hooks (no external state library)
- Dark mode preference stored in localStorage
- No routing (single page)

## Export Implementation Details
- Clone the flowchart SVG, get its bounding box
- Create a 2x DPI canvas
- Draw the SVG onto the canvas at 100% fit
- If watermark enabled, render "Beema's Fincon" text centered using the Alegreya font at 75% of diagram width
- Downsample to 1x quality using a second canvas
- Filename format: flowchart-YYYYMMDD-HHMMSS.png
