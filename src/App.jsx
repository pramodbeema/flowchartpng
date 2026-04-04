import { useState, useRef, useEffect, useCallback } from 'react';
import mermaid from 'mermaid';
import './App.css';

const DEFAULT_CODE = `flowchart TD
A[Start]-->B[Process]
B-->C{Decision?}
C-->|Yes|D[Action 1]
C-->|No|E[Action 2]
D-->F[End]
E-->F`;

export default function App() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [watermark, setWatermark] = useState(false);
  const [error, setError] = useState('');
  const [rendering, setRendering] = useState(false);
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem('theme') === 'dark';
    } catch {
      return false;
    }
  });
  const flowchartRef = useRef(null);
  const graphIdRef = useRef(0);

  const theme = dark ? 'dark' : 'night';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    const metaThemeColor = document.getElementById('theme-color-meta');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', dark ? '#0a0a0c' : '#f0f4f8');
    }
    try {
      localStorage.setItem('theme', theme);
    } catch {}
  }, [theme, dark]);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'loose',
      theme: dark ? 'dark' : 'neutral',
      themeVariables: dark
        ? {
            primaryColor: '#2c2c2e',
            primaryBorderColor: '#636366',
            primaryTextColor: '#f5f5f7',
            secondaryColor: '#2c2c2e',
            tertiaryColor: '#2c2c2e',
            lineColor: '#8e8e93',
            fontFamily: 'Inter, -apple-system, sans-serif',
          }
        : {
            primaryColor: '#f5f5f7',
            primaryBorderColor: 'rgba(0,0,0,0.12)',
            primaryTextColor: '#1d1d1f',
            secondaryColor: '#f5f5f7',
            tertiaryColor: '#f5f5f7',
            lineColor: '#86868b',
            fontFamily: 'Inter, -apple-system, sans-serif',
          },
    });
    renderChart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'loose',
      theme: dark ? 'dark' : 'neutral',
      themeVariables: dark
        ? {
            primaryColor: '#2c2c2e',
            primaryBorderColor: '#636366',
            primaryTextColor: '#f5f5f7',
            secondaryColor: '#2c2c2e',
            tertiaryColor: '#2c2c2e',
            lineColor: '#8e8e93',
            fontFamily: 'Inter, -apple-system, sans-serif',
          }
        : {
            primaryColor: '#f5f5f7',
            primaryBorderColor: 'rgba(0,0,0,0.12)',
            primaryTextColor: '#1d1d1f',
            secondaryColor: '#f5f5f7',
            tertiaryColor: '#f5f5f7',
            lineColor: '#86868b',
            fontFamily: 'Inter, -apple-system, sans-serif',
          },
    });
  }, [dark]);

  const renderChart = useCallback(async () => {
    setError('');
    setRendering(true);
    try {
      graphIdRef.current += 1;
      const { svg } = await mermaid.render(
        `graph-${graphIdRef.current}`,
        code
      );
      flowchartRef.current.innerHTML = svg;
    } catch (err) {
      console.error('Rendering failed:', err);
      setError('Invalid syntax — check your Mermaid diagram and try again.');
      flowchartRef.current.innerHTML = '';
    } finally {
      setRendering(false);
    }
  }, [code]);

  const downloadChart = useCallback(async () => {
    const flowchartDiv = flowchartRef.current;
    const svg = flowchartDiv.querySelector('svg');

    if (!svg) {
      alert('Please render a flowchart first!');
      return;
    }

    // Preload the Alegreya font
    const font = new FontFace('Alegreya Sans SC Thin', 'url(/AlegreyaSansSC-Thin.ttf)', { weight: '100' });
    const loadedFont = await font.load();
    document.fonts.add(loadedFont);

    const svgClone = svg.cloneNode(true);
    const bbox = svg.getBBox();
    svgClone.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
    svgClone.setAttribute('width', bbox.width);
    svgClone.setAttribute('height', bbox.height);

    const DPR = 2;
    const diagW = bbox.width * DPR;
    const diagH = bbox.height * DPR;

    // Step 1: White canvas = exactly diagram size (100% fit)
    const whiteW = diagW;
    const whiteH = diagH;

    // Step 2: Export canvas so white canvas = 95% fit, centered
    const exportW = Math.ceil(whiteW / 0.95);
    const exportH = Math.ceil(whiteH / 0.95);
    const wX = Math.round((exportW - whiteW) / 2);
    const wY = Math.round((exportH - whiteH) / 2);

    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = exportW;
    srcCanvas.height = exportH;
    const srcCtx = srcCanvas.getContext('2d');

    const svgData = new XMLSerializer().serializeToString(svgClone);
    const img = new Image();
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    await new Promise((resolve) => { img.onload = resolve; });

    // Transparent canvas
    srcCtx.clearRect(0, 0, exportW, exportH);

    // White area: 95% fit of export, centered
    srcCtx.fillStyle = dark ? '#1c1c1e' : '#ffffff';
    srcCtx.fillRect(wX, wY, whiteW, whiteH);

    // Diagram: 100% fit inside white area
    srcCtx.drawImage(img, wX, wY, diagW, diagH);

    // Watermark on white area: 75% fit of white width, centered
    if (watermark) {
      const text = "Beema's Fincon";
      // Set a reasonable font size first, then measure to compute scale
      srcCtx.font = `100 ${Math.round(whiteW * 0.1)}px "Alegreya Sans SC Thin", -apple-system, sans-serif`;
      const measuredW = srcCtx.measureText(text).width;
      const fitScale = (whiteW * 0.75) / measuredW;
      const wmSize = Math.round(whiteW * 0.1 * fitScale);
      srcCtx.font = `100 ${wmSize}px "Alegreya Sans SC Thin", -apple-system, sans-serif`;
      srcCtx.textAlign = 'center';
      srcCtx.textBaseline = 'middle';
      srcCtx.fillStyle = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
      srcCtx.fillText(text, wX + whiteW / 2, wY + whiteH / 2);
    }

    // Downsample to final export size (1x)
    const dstW = Math.round(exportW / 2);
    const dstH = Math.round(exportH / 2);
    const dstCanvas = document.createElement('canvas');
    dstCanvas.width = dstW;
    dstCanvas.height = dstH;
    const dstCtx = dstCanvas.getContext('2d');
    dstCtx.imageSmoothingEnabled = true;
    dstCtx.imageSmoothingQuality = 'high';
    dstCtx.drawImage(srcCanvas, 0, 0, dstW, dstH);

    const now = new Date();
    const ts = now.getFullYear().toString()
      + String(now.getMonth() + 1).padStart(2, '0')
      + String(now.getDate()).padStart(2, '0') + '-'
      + String(now.getHours()).padStart(2, '0')
      + String(now.getMinutes()).padStart(2, '0')
      + String(now.getSeconds()).padStart(2, '0');
    const link = document.createElement('a');
    link.download = `flowchart-${ts}.png`;
    link.href = dstCanvas.toDataURL('image/png', 1.0);
    link.click();
  }, [watermark, dark]);

  return (
    <div className="app">
      <div className="bg-blur orb-1" />
      <div className="bg-blur orb-2" />

      <header className="header">
        <div className="header-logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
            <path d="M10 6.5h4a2 2 0 0 1 2 2" />
            <path d="M6.5 10v4a2 2 0 0 0 2 2" />
          </svg>
        </div>
        <div className="header-text">
          <h1 className="title-text">Flowchart Creator</h1>
          <p className="subtitle-text">Write Mermaid syntax · Preview · Export to PNG</p>
          <span className="author-tag">Made with care by Pramod Beema</span>
        </div>
        <div style={{ flex: 1 }} />
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={dark}
            onChange={(e) => setDark(e.target.checked)}
            className="hidden-checkbox"
          />
          <span className="toggle-track">
            <span className="toggle-thumb">
              {dark ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0071e3" strokeWidth="2.5" strokeLinecap="round" className="theme-icon">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#636366" strokeWidth="2.5" strokeLinecap="round" className="theme-icon">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
            </span>
          </span>
          <span className="toggle-text">Dark mode</span>
        </label>
      </header>

      <main className="main-grid">
        <div className="glass-card editor-card">
          <div className="card-header">
            <div className="card-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              <span>Input</span>
            </div>
            <button
              className="btn btn-primary"
              onClick={renderChart}
              disabled={rendering}
            >
              {rendering ? (
                <span className="btn-spinner" />
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
              {rendering ? 'Rendering…' : 'Render'}
            </button>
          </div>
          <textarea
            className="code-textarea"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter Mermaid diagram syntax..."
            spellCheck={false}
          />
          {error && (
            <div className="error-banner">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}
        </div>

        <div className="glass-card preview-card">
          <div className="card-header">
            <div className="card-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              <span>Preview</span>
            </div>
            <div className="preview-actions">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={watermark}
                  onChange={(e) => setWatermark(e.target.checked)}
                  className="hidden-checkbox"
                />
                <span className="toggle-track">
                  <span className="toggle-thumb" />
                </span>
                <span className="toggle-text">Watermark</span>
              </label>
              <button
                className="btn btn-secondary"
                onClick={downloadChart}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export
              </button>
            </div>
          </div>
          <div ref={flowchartRef} className="flowchart" />
        </div>
      </main>
    </div>
  );
}
