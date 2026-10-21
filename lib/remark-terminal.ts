interface MdastNode {
  type: string;
  lang?: string | null;
  meta?: string | null;
  value?: string;
  children?: MdastNode[];
  data?: { hName?: string; hProperties?: Record<string, unknown> };
}

const VARIANTS = new Set([
  "term",
  "terminal",
  "output",
  "text",
  "powershell",
  "pwsh",
  "bat",
  "cmd",
]);

/** Turns terminal-like fenced code blocks (see VARIANTS) into terminal windows. */
export function remarkTerminal() {
  return (tree: MdastNode) => {
    const visit = (node: MdastNode) => {
      const children = node.children;
      if (!children) return;

      children.forEach((child, index) => {
        if (child.type === "code" && child.lang && VARIANTS.has(child.lang.toLowerCase())) {
          children[index] = toTerminal(child);
        } else {
          visit(child);
        }
      });
    };

    visit(tree);
  };
}

function toTerminal(code: MdastNode): MdastNode {
  const title = /title="([^"]*)"/.exec(code.meta ?? "")?.[1];

  return {
    type: "terminal",
    data: { hName: "terminal", hProperties: { lang: code.lang, ...(title && { title }) } },
    children: [{ type: "text", value: code.value ?? "" }],
  };
}
