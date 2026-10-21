interface MdastNode {
  type: string;
  ordered?: boolean | null;
  children?: MdastNode[];
  data?: { hProperties?: Record<string, unknown> };
}

/** Marks top-level numbered lists as steps; must run before remark-toc adds its own list. */
export function remarkSteps() {
  return (tree: MdastNode) => {
    for (const node of tree.children ?? []) {
      if (node.type !== "list" || !node.ordered || (node.children?.length ?? 0) < 2) continue;

      node.data = { hProperties: { ...node.data?.hProperties, className: ["steps"] } };
    }
  };
}
