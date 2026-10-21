interface MdastNode {
  type: string;
  value?: string;
  children?: MdastNode[];
  data?: { hName?: string; hProperties?: Record<string, unknown> };
}

const CALLOUT_TITLES: Record<string, string> = {
  note: "Note",
  tip: "Tip",
  important: "Important",
  warning: "Warning",
  caution: "Caution",
};

const MARKER = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*\r?\n?/i;

/** Turns GitHub-style alert blockquotes (`> [!NOTE]`) into styled callout blocks. */
export function remarkCallouts() {
  return (tree: MdastNode) => {
    const visit = (node: MdastNode) => {
      if (node.type === "blockquote") convert(node);
      for (const child of node.children ?? []) visit(child);
    };

    visit(tree);
  };
}

function convert(blockquote: MdastNode) {
  const paragraph = blockquote.children?.[0];
  const text = paragraph?.type === "paragraph" ? paragraph.children?.[0] : undefined;
  if (!paragraph || text?.type !== "text" || !text.value) return;

  const match = MARKER.exec(text.value);
  if (!match) return;

  const kind = match[1].toLowerCase();
  text.value = text.value.slice(match[0].length);
  if (!text.value) paragraph.children?.shift();
  if (!paragraph.children?.length) blockquote.children?.shift();

  blockquote.data = {
    hName: "div",
    hProperties: { className: ["callout", `callout-${kind}`], role: "note" },
  };
  blockquote.children?.unshift({
    type: "paragraph",
    data: { hProperties: { className: ["callout-title"] } },
    children: [{ type: "text", value: CALLOUT_TITLES[kind] }],
  });
}
