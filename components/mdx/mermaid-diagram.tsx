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

interface MermaidDiagramProps {
  chart: string;
}

function getSiteColor(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;

  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  return value || fallback;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const { resolvedTheme } = useTheme();
  const id = useId().replace(/:/g, "");

  const containerRef = useRef<HTMLDivElement>(null);
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
        const isDark = resolvedTheme === "dark";

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "base",
          fontFamily: "inherit",
          themeVariables: {
            background: getSiteColor("--site-bg", "#eef4f6"),
            mainBkg: getSiteColor("--site-panel", "#fafdfe"),
            primaryColor: getSiteColor("--site-panel", "#fafdfe"),
            primaryTextColor: getSiteColor("--site-text", "#0b1f26"),
            primaryBorderColor: getSiteColor("--site-accent", "#0e7490"),
            secondaryColor: getSiteColor("--site-bg", "#eef4f6"),
            secondaryBorderColor: getSiteColor("--site-muted", "#498aa0"),
            secondaryTextColor: getSiteColor("--site-text", "#0b1f26"),
            tertiaryColor: getSiteColor("--site-panel", "#fafdfe"),
            tertiaryBorderColor: getSiteColor("--site-muted", "#498aa0"),
            tertiaryTextColor: getSiteColor("--site-text", "#0b1f26"),
            lineColor: getSiteColor("--site-accent", "#0e7490"),
            textColor: getSiteColor("--site-text", "#0b1f26"),
            mainContrastColor: getSiteColor("--site-text", "#0b1f26"),
            nodeBorder: getSiteColor("--site-accent", "#0e7490"),
            clusterBkg: getSiteColor("--site-bg", "#eef4f6"),
            clusterBorder: getSiteColor("--site-muted", "#498aa0"),
            titleColor: getSiteColor("--site-text", "#0b1f26"),
            edgeLabelBackground: getSiteColor("--site-panel", "#fafdfe"),
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

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const changeZoom = useCallback((amount: number) => {
    setZoom((current) => Math.min(3, Math.max(0.25, current + amount)));
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

    const blob = new Blob([svg], {
      type: "image/svg+xml;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `mermaid-diagram.svg`;
    link.click();

    URL.revokeObjectURL(url);
  }, [svg]);

  const copySource = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);

      window.setTimeout(() => setCopied(false), 1500);
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

  return (
    <div ref={containerRef} className="mermaid-diagram">
      <div ref={containerRef} className="mermaid-diagram relative">
        <div
          className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-(--site-radius) border border-(--site-muted) site-panel p-1 shadow-sm"
          role="toolbar"
          aria-label="Diagram controls"
        >
          <button
            type="button"
            title="Zoom out"
            aria-label="Zoom out"
            disabled={zoom <= 0.25}
            onClick={() => changeZoom(-0.25)}
            className="inline-flex size-8 items-center justify-center rounded-(--site-radius) text-(--site-muted) transition-colors hover:bg-(--site-bg) hover:site-nav-active disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ZoomOut className="size-4" />
          </button>

          <span className="min-w-10 text-center text-xs text-(--site-text) tabular-nums">
            {Math.round(zoom * 100)}%
          </span>

          <button
            type="button"
            title="Zoom in"
            aria-label="Zoom in"
            disabled={zoom >= 3}
            onClick={() => changeZoom(0.25)}
            className="inline-flex size-8 items-center justify-center rounded-(--site-radius) text-(--site-muted) transition-colors hover:bg-(--site-bg) hover:text-(--site-accent) disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ZoomIn className="size-4" />
          </button>

          <button
            type="button"
            title="Reset view"
            aria-label="Reset view"
            onClick={resetView}
            className="inline-flex size-8 items-center justify-center rounded-(--site-radius) text-(--site-muted) transition-colors hover:bg-(--site-bg) hover:site-nav-active"
          >
            <RotateCcw className="size-4" />
          </button>

          <button
            type="button"
            title={panMode ? "Disable pan mode" : "Enable pan mode"}
            aria-label={panMode ? "Disable pan mode" : "Enable pan mode"}
            aria-pressed={panMode}
            onClick={() => {
              setPanMode((current) => !current);
              dragRef.current = null;
            }}
            className={`inline-flex size-8 items-center justify-center rounded-(--site-radius) transition-colors ${
              panMode
                ? "bg-(--site-accent) text-(--site-accent-foreground)"
                : "text-(--site-muted) hover:bg-(--site-bg) hover:site-nav-active"
            }`}
          >
            <Hand className="size-4" />
          </button>

          <button
            type="button"
            title="Download SVG"
            aria-label="Download SVG"
            onClick={downloadSvg}
            disabled={!svg}
            className="inline-flex size-8 items-center justify-center rounded-(--site-radius) text-(--site-muted) transition-colors hover:bg-(--site-bg) hover:text-(--site-accent) disabled:opacity-40"
          >
            <Download className="size-4" />
          </button>

          <button
            type="button"
            title={copied ? "Source copied" : "Copy Mermaid source"}
            aria-label="Copy Mermaid source"
            onClick={copySource}
            className="inline-flex size-8 items-center justify-center rounded-(--site-radius) text-(--site-muted) transition-colors hover:bg-(--site-bg) hover:text-(--site-accent)"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </button>

          <button
            type="button"
            title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
            aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
            onClick={toggleFullscreen}
            className="inline-flex size-8 items-center justify-center rounded-(--site-radius) text-(--site-muted) transition-colors hover:bg-(--site-bg) hover:text-(--site-accent)"
          >
            {fullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
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
    </div>
  );
}
