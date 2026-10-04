import { isValidElement } from "react";

import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { CopyButton } from "@/components/mdx/copy-btn";
import { InlineCodeCopy } from "@/components/mdx/inline-code-copy";
import { MermaidDiagram } from "@/components/mdx/mermaid-diagram";
import { cn } from "@/lib/utils";

type CodeProps = ComponentPropsWithoutRef<"code"> & { "data-inline-code"?: string };
type PreProps = ComponentPropsWithoutRef<"pre"> & { raw?: string };

function getTextContent(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(getTextContent).join("");
  }

  if (node && typeof node === "object" && "props" in node) {
    return getTextContent((node.props as { children?: ReactNode }).children);
  }

  return "";
}

export const components = {
  h1: ({ className, children, ...props }: ComponentPropsWithoutRef<"h1">) => (
    <h1 {...props} className={cn("text-(--site-text)", className)}>
      {children}
    </h1>
  ),
  h2: ({ className, children, ...props }: ComponentPropsWithoutRef<"h2">) => (
    <h2 {...props} className={cn("text-(--site-text)", className)}>
      {children}
    </h2>
  ),
  h3: ({ className, children, ...props }: ComponentPropsWithoutRef<"h3">) => (
    <h3 {...props} className={cn("text-(--site-text)", className)}>
      {children}
    </h3>
  ),
  h4: ({ className, children, ...props }: ComponentPropsWithoutRef<"h4">) => (
    <h4 {...props} className={cn("text-(--site-text)", className)}>
      {children}
    </h4>
  ),
  p: ({ className, children, ...props }: ComponentPropsWithoutRef<"p">) => (
    <p {...props} className={cn("text-(--site-muted)", className)}>
      {children}
    </p>
  ),
  a: ({ className, children, ...props }: ComponentPropsWithoutRef<"a">) => (
    <a {...props} className={cn("site-nav-active no-underline hover:underline", className)}>
      {children}
    </a>
  ),
  li: ({ className, children, ...props }: ComponentPropsWithoutRef<"li">) => (
    <li {...props} className={cn("text-(--site-muted)", className)}>
      {children}
    </li>
  ),
  strong: ({ className, children, ...props }: ComponentPropsWithoutRef<"strong">) => (
    <strong {...props} className={cn("font-bold text-(--site-text)", className)}>
      {children}
    </strong>
  ),
  code: ({ children, ...props }: CodeProps) => {
    if (props["data-inline-code"] !== "true") {
      return <code {...props}>{children}</code>;
    }

    return (
      <InlineCodeCopy text={getTextContent(children)}>
        <code {...props}>{children}</code>
      </InlineCodeCopy>
    );
  },
  pre: ({ raw, className, children, ...props }: PreProps) => {
    const child = isValidElement<{ "data-language"?: string }>(children) ? children : null;

    if (child?.props["data-language"] === "mermaid") {
      return <MermaidDiagram chart={raw ?? ""} />;
    }

    const code = raw ?? getTextContent(children).replace(/\n$/, "");

    return (
      <div className="code-block-wrapper">
        <pre {...props} className={cn(className)}>
          {children}
        </pre>
        <CopyButton text={code} />
      </div>
    );
  },
};
