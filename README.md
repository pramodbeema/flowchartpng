# Beema's Fincon Flowchart Creator

A web-based flowchart creator built with React, Vite, Mermaid.js, and html2canvas. Write Mermaid syntax, preview live, and export to polished PNG images.

## Features

- **Mermaid diagram editor** — write flowchart syntax with real-time rendering
- **Live preview** — instant SVG preview of your diagram
- **PNG export** — high-quality export with optimized downsampling (2× render → 1× downsample)
- **Watermark** — optional "Beema's Fincon" watermark on exported images
- **Light & Dark themes** — Apple-inspired liquid-glass UI with toggle
- **Responsive** — works on desktop and mobile

## Getting Started

```bash
bun install
bun run dev      # start dev server with HMR
bun run build    # production build → dist/
bun run preview  # serve production build
```

## Tech Stack

- React 19 + Vite 8
- Mermaid.js for diagram rendering
- html2canvas for image export
- Tailwind CSS (via CDN)
- Liquid-glass UI inspired by Apple design language

## Project Structure

```
├── src/
│   ├── App.jsx       # main component (editor, preview, export)
│   ├── App.css       # liquid-glass styles + themes
│   ├── index.css     # base styles + fonts
│   └── main.jsx      # entry point
├── public/
│   ├── favicon.svg   # app icon
│   └── icons.svg     # icon sprites
├── index.html
└── package.json
```

## Export Details

Exported images use a two-step render pipeline:
1. Diagram rendered at 2× DPI for sharpness
2. Bilinear downsampling to 1× for smaller file size without quality loss
3. Diagram fills a white canvas at 95% fit, centered
4. Optional watermark at 75% width, center-aligned

Made with care by [Pramod Beema](https://github.com/pramodbeema)
