import { isValidElement } from "react";
import Image from "next/image";

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
    <h1 {...props} className={cn("site-nav-active", className)}>
      {children}
    </h1>
  ),
  h2: ({ className, children, ...props }: ComponentPropsWithoutRef<"h2">) => (
    <h2 {...props} className={cn("site-nav-active", className)}>
      {children}
    </h2>
  ),
  h3: ({ className, children, ...props }: ComponentPropsWithoutRef<"h3">) => (
    <h3 {...props} className={cn("site-nav-active", className)}>
      {children}
    </h3>
  ),
  h4: ({ className, children, ...props }: ComponentPropsWithoutRef<"h4">) => (
    <h4 {...props} className={cn("site-nav-active", className)}>
      {children}
    </h4>
  ),
  p: ({ className, children, ...props }: ComponentPropsWithoutRef<"p">) => {
    const hasImage =
      isValidElement(children) && (children.type === "img" || children.type === Image);

    return (
      <p
        {...props}
        className={cn("max-w-full text-(--site-muted)", hasImage && "text-center", className)}
      >
        {children}
      </p>
    );
  },
  a: ({ className, children, ...props }: ComponentPropsWithoutRef<"a">) => (
    <a {...props} className={cn("site-nav-active no-underline hover:underline", className)}>
      {children}
    </a>
  ),
  img: ({ className, ...props }: ComponentPropsWithoutRef<"img">) => {
    const width = Number(props.width);
    const height = Number(props.height);
    const hasDimensions = width > 0 && height > 0;

    return (
      <span
        className={cn("relative my-4 flex w-full justify-center", !hasDimensions && "min-h-24")}
      >
        {hasDimensions ? (
          <Image
            {...props}
            alt={props.alt ?? "Image"}
            src={String(props.src ?? "")}
            width={width}
            height={height}
            className={cn("h-auto max-w-full", className)}
          />
        ) : (
          <Image
            {...props}
            alt={props.alt ?? "Image"}
            src={String(props.src ?? "")}
            width={1200}
            height={800}
            sizes="(max-width: 768px) 100vw, 768px"
            className={cn("h-auto max-w-full object-contain", className)}
          />
        )}
      </span>
    );
  },
  li: ({ className, children, ...props }: ComponentPropsWithoutRef<"li">) => (
    <li {...props} className={cn("text-(--site-muted)", className)}>
      {children}
    </li>
  ),
  strong: ({ className, children, ...props }: ComponentPropsWithoutRef<"strong">) => (
    <strong {...props} className={cn("font-bold site-nav-active", className)}>
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
