"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import {
  Check,
  Copy,
  Download,
  Hand,
  Maximize2,
  Minimize2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useTheme } from "next-themes";

import { normalizeMermaidChart } from "@/lib/mermaid";
import { buildMermaidNodeThemeCSS } from "@/lib/mermaid-node-theme";

interface MermaidDiagramProps {
  chart: string;
}

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

function getSiteColor(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;

  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  return value || fallback;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const { resolvedTheme } = useTheme();
  const id = useId().replace(/:/g, "");

  const containerRef = useRef<HTMLDivElement>(null);
  const copyTimerRef = useRef<number | null>(null);
  const dragRef = useRef<{
    x: number;
    y: number;
    panX: number;
    panY: number;
  } | null>(null);

  const [svg, setSvg] = useState("");
  const [renderError, setRenderError] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [panMode, setPanMode] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  const source = normalizeMermaidChart(chart);

  useEffect(() => {
    let active = true;

    async function renderDiagram() {
      setSvg("");
      setRenderError(false);

      if (!source) {
        setRenderError(true);
        return;
      }

      try {
        const { default: mermaid } = await import("mermaid");

        const siteText = getSiteColor("--site-text", "#0b1f26");
        const sitePanel = getSiteColor("--site-panel", "#fafdfe");
        const siteBg = getSiteColor("--site-bg", "#eef4f6");
        const siteMuted = getSiteColor("--site-muted", "#498aa0");
        const siteAccent = getSiteColor("--site-accent", "#0e7490");

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "base",
          fontFamily: "inherit",
          // Static node surface + hover (no animation). Injected into the
          // SVG's own scoped <style>, so it never touches connectors.
          themeCSS: buildMermaidNodeThemeCSS({
            surface: sitePanel,
            border: getSiteColor("--site-surface-border", siteMuted),
            text: siteText,
          }),
          themeVariables: {
            background: siteBg,
            mainBkg: sitePanel,
            primaryColor: sitePanel,
            primaryTextColor: siteText,
            primaryBorderColor: siteAccent,
            secondaryColor: siteBg,
            secondaryBorderColor: siteMuted,
            secondaryTextColor: siteText,
            tertiaryColor: sitePanel,
            tertiaryBorderColor: siteMuted,
            tertiaryTextColor: siteText,
            lineColor: siteAccent,
            textColor: siteText,
            mainContrastColor: siteText,
            nodeBorder: siteAccent,
            clusterBkg: siteBg,
            clusterBorder: siteMuted,
            titleColor: siteText,
            edgeLabelBackground: sitePanel,
            fontFamily: "inherit",
          },
        });

        const result = await mermaid.render(`mermaid-${id}`, source);

        if (active) {
          setSvg(result.svg);
          setRenderError(false);
          setZoom(1);
          setPan({ x: 0, y: 0 });
        }
      } catch (error) {
        console.error("[Mermaid] Rendering failed:", error);

        if (active) {
          setSvg("");
          setRenderError(true);
        }
      }
    }

    void renderDiagram();

    return () => {
      active = false;
    };
  }, [source, id, resolvedTheme]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(document.fullscreenElement === containerRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const changeZoom = useCallback((amount: number) => {
    setZoom((current) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, current + amount)));
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (document.fullscreenElement === container) {
        await document.exitFullscreen();
      } else {
        await container.requestFullscreen();
      }
    } catch (error) {
      console.error("[Mermaid] Fullscreen failed:", error);
    }
  }, []);

  const downloadSvg = useCallback(() => {
    if (!svg) return;

    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "mermaid-diagram.svg";
    link.click();

    URL.revokeObjectURL(url);
  }, [svg]);

  const copySource = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);

      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = window.setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("[Mermaid] Copy failed:", error);
    }
  }, [source]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!panMode || event.button !== 0) return;

    event.currentTarget.setPointerCapture(event.pointerId);

    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || !panMode) return;

    setPan({
      x: drag.panX + event.clientX - drag.x,
      y: drag.panY + event.clientY - drag.y,
    });
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  if (renderError) {
    return (
      <details className="mermaid-error">
        <summary>Diagram could not be rendered. Show source</summary>
        <div className="code-block-wrapper">
          <pre>
            <code>{source}</code>
          </pre>
        </div>
      </details>
    );
  }

  const panLabel = panMode ? "Disable pan mode" : "Enable pan mode";
  const fullscreenLabel = fullscreen ? "Exit fullscreen" : "Fullscreen";

  // Toolbar and button styling lives in globals.css (".mermaid-diagram [role=toolbar]").
  return (
    <div ref={containerRef} className="mermaid-diagram">
      <div role="toolbar" aria-label="Diagram controls">
        <button
          type="button"
          title="Zoom out"
          aria-label="Zoom out"
          disabled={zoom <= MIN_ZOOM}
          onClick={() => changeZoom(-ZOOM_STEP)}
        >
          <ZoomOut />
        </button>

        <span>{Math.round(zoom * 100)}%</span>

        <button
          type="button"
          title="Zoom in"
          aria-label="Zoom in"
          disabled={zoom >= MAX_ZOOM}
          onClick={() => changeZoom(ZOOM_STEP)}
        >
          <ZoomIn />
        </button>

        <button type="button" title="Reset view" aria-label="Reset view" onClick={resetView}>
          <RotateCcw />
        </button>

        <button
          type="button"
          title={panLabel}
          aria-label={panLabel}
          aria-pressed={panMode}
          className={panMode ? "is-active" : undefined}
          onClick={() => {
            setPanMode((current) => !current);
            dragRef.current = null;
          }}
        >
          <Hand />
        </button>

        <button
          type="button"
          title="Download SVG"
          aria-label="Download SVG"
          disabled={!svg}
          onClick={downloadSvg}
        >
          <Download />
        </button>

        <button
          type="button"
          title={copied ? "Source copied" : "Copy Mermaid source"}
          aria-label="Copy Mermaid source"
          onClick={copySource}
        >
          {copied ? <Check /> : <Copy />}
        </button>

        <button
          type="button"
          title={fullscreenLabel}
          aria-label={fullscreenLabel}
          onClick={toggleFullscreen}
        >
          {fullscreen ? <Minimize2 /> : <Maximize2 />}
        </button>
      </div>

      <div
        className={`mermaid-viewport ${panMode ? "pan-enabled" : ""}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onLostPointerCapture={handlePointerUp}
      >
        <div
          className="mermaid-canvas"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
    </div>
  );
}
