"use client";

import { useEffect, useId, useState } from "react";

import { useTheme } from "next-themes";

interface MermaidDiagramProps {
  chart: string;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const { resolvedTheme } = useTheme();
  const id = useId().replace(/:/g, "");
  const [svg, setSvg] = useState("");
  const [renderError, setRenderError] = useState(false);

  useEffect(() => {
    let active = true;

    async function renderDiagram() {
      try {
        const { default: mermaid } = await import("mermaid");
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: resolvedTheme === "dark" ? "dark" : "default",
        });
        const result = await mermaid.render(`mermaid-${id}`, chart);
        if (active) {
          setSvg(result.svg);
          setRenderError(false);
        }
      } catch {
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
  }, [chart, id, resolvedTheme]);

  if (renderError) {
    return (
      <details className="mermaid-error">
        <summary>Diagram could not be rendered. Show source</summary>
        <pre>
          <code>{chart}</code>
        </pre>
      </details>
    );
  }

  return (
    <div
      className="mermaid-diagram"
      role="img"
      aria-label="Mermaid diagram"
      aria-busy={!svg}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
