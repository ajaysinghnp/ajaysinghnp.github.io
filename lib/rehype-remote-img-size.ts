// lib/rehype-remote-img-size.ts
import type { Element, Root } from "hast";
import probe from "probe-image-size";
import { visit } from "unist-util-visit";

type Size = { width: number; height: number } | null;

// Caches the promise, so the same URL is only probed once per process
const cache = new Map<string, Promise<Size>>();

function getSize(src: string): Promise<Size> {
  let pending = cache.get(src);
  if (!pending) {
    pending = probe(src, { timeout: 5000 })
      .then(({ width, height }) => ({ width, height }))
      .catch(() => null);
    cache.set(src, pending);
  }
  return pending;
}

export default function rehypeRemoteImgSize() {
  return async (tree: Root) => {
    const tasks: Promise<void>[] = [];
    let isFirst = true;

    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "img") return;

      if (isFirst) {
        node.properties["data-priority"] = "true";
        isFirst = false;
      }

      const src = node.properties?.src;
      if (typeof src !== "string" || !/^https?:\/\//.test(src)) return;
      if (node.properties.width && node.properties.height) return;

      tasks.push(
        getSize(src).then((size) => {
          if (!size) return;
          node.properties.width = size.width;
          node.properties.height = size.height;
        }),
      );
    });

    await Promise.all(tasks);
  };
}
