export interface MermaidNodeColors {
  surface: string;
  border: string;
  text: string;
}

// Tailwind cyan values used by light-btn-hover-surface:
// hover:border-cyan-400/55  hover:bg-cyan-400/[0.14]  hover:text-cyan-600
const CYAN_400 = "rgb(34 211 238)";
const HOVER_BORDER = "rgb(34 211 238 / 0.55)";
const HOVER_TEXT = "#0891b2";

const SHAPES = ["rect", "circle", "ellipse", "polygon", "path"];
const LABELS = [".nodeLabel", ".nodeLabel p", ".label text"];

function nodeSelectors(targets: string[], state = ""): string {
  return targets.map((target) => `.node${state} ${target}`).join(", ");
}

/**
 * Static node styling for Mermaid's `themeCSS` option.
 * Every selector is rooted at `.node`, so connectors, edge labels, markers
 * and clusters can never match. No transitions or animations.
 */
export function buildMermaidNodeThemeCSS({ surface, border, text }: MermaidNodeColors): string {
  // SVG fills can't stack on a CSS background like the HTML utility does,
  // so blend the 14% cyan over the node surface to get the same look.
  const hoverSurface = `color-mix(in srgb, ${CYAN_400} 14%, ${surface})`;

  return `
    ${nodeSelectors(SHAPES)} {
      fill: ${surface};
      stroke: ${border};
    }
    ${nodeSelectors(LABELS)} {
      color: ${text};
      fill: ${text};
    }
    ${nodeSelectors(SHAPES, ":hover")} {
      fill: ${hoverSurface};
      stroke: ${HOVER_BORDER};
    }
    ${nodeSelectors(LABELS, ":hover")} {
      color: ${HOVER_TEXT};
      fill: ${HOVER_TEXT};
    }
  `;
}
