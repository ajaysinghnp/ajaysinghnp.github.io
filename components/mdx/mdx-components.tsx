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
  img: ({ className, alt, src, width, height, ...rest }: ComponentPropsWithoutRef<"img">) => {
    const isFirst = (rest as Record<string, unknown>)["data-priority"] === "true";
    const imageSrc = String(src ?? "");
    const isGif = imageSrc.toLowerCase().split("?")[0].endsWith(".gif");

    const w = Number(width);
    const h = Number(height);
    const hasDimensions = w > 0 && h > 0;

    return (
      <span className="my-4 flex w-full justify-center">
        <Image
          src={imageSrc}
          alt={alt ?? "Image"}
          width={hasDimensions ? w : 0}
          height={hasDimensions ? h : 0}
          sizes="(min-width: 768px) 80vw, 100vw"
          unoptimized={isGif}
          loading={isFirst ? "eager" : "lazy"}
          style={hasDimensions ? { maxWidth: w } : undefined}
          className={cn("h-auto w-full rounded-md md:w-4/5", className)}
        />
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

    const isMermaid = child?.props["data-language"] === "mermaid";

    const code = raw ?? getTextContent(children).replace(/\n$/, "");

    if (isMermaid) {
      return <MermaidDiagram chart={code} />;
    }

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
