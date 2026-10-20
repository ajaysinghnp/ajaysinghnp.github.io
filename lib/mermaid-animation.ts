export type MermaidAnimationOptions = {
  duration?: number;
};

export type MermaidAnimationController = {
  play: () => void;
  pause: () => void;
  cancel: () => void;
};

export function animateMermaidSvg(
  svg: SVGSVGElement,
  options: MermaidAnimationOptions = {},
): MermaidAnimationController {
  const { duration = 2400 } = options;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const edges = Array.from(
    svg.querySelectorAll<SVGElement>(
      [
        "g.edgePath path",
        "path.flowchart-link",
        "path.messageLine0",
        "path.messageLine1",
        "path.relation",
        "path.transition",
      ].join(", "),
    ),
  );

  const originalClasses = new Map<SVGElement, boolean>();

  edges.forEach((edge) => {
    originalClasses.set(edge, edge.classList.contains("mermaid-flow-edge"));

    edge.classList.add("mermaid-flow-edge");
    edge.style.setProperty("--mermaid-flow-duration", `${duration}ms`);
  });

  let cancelled = false;

  const play = () => {
    if (cancelled || reducedMotion) return;

    edges.forEach((edge) => {
      edge.style.animationPlayState = "running";
    });
  };

  const pause = () => {
    if (cancelled) return;

    edges.forEach((edge) => {
      edge.style.animationPlayState = "paused";
    });
  };

  const cancel = () => {
    if (cancelled) return;
    cancelled = true;

    edges.forEach((edge) => {
      if (!originalClasses.get(edge)) {
        edge.classList.remove("mermaid-flow-edge");
      }

      edge.style.removeProperty("--mermaid-flow-duration");
      edge.style.removeProperty("animation-play-state");
    });
  };

  if (reducedMotion) {
    edges.forEach((edge) => {
      edge.classList.remove("mermaid-flow-edge");
    });
  }

  return { play, pause, cancel };
}
