import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { CopyButton } from "./copy-btn";
import { InlineCodeCopy } from "./inline-code-copy";
import { MermaidDiagram } from "./mermaid-diagram";

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
  h1: (props: any) => <h1 {...props} className={cn("text-[var(--site-text)]", props.className)}>{props.children}</h1>,
  h2: (props: any) => <h2 {...props} className={cn("text-[var(--site-text)]", props.className)}>{props.children}</h2>,
  h3: (props: any) => <h3 {...props} className={cn("text-[var(--site-text)]", props.className)}>{props.children}</h3>,
  h4: (props: any) => <h4 {...props} className={cn("text-[var(--site-text)]", props.className)}>{props.children}</h4>,
  p: (props: any) => <p {...props} className={cn("text-[var(--site-muted)]", props.className)}>{props.children}</p>,
  a: (props: any) => <a {...props} className={cn("text-[var(--site-accent)] no-underline hover:underline", props.className)}>{props.children}</a>,
  li: (props: any) => <li {...props} className={cn("text-[var(--site-muted)]", props.className)}>{props.children}</li>,
  strong: (props: any) => <strong {...props} className={cn("font-bold text-[var(--site-text)]", props.className)}>{props.children}</strong>,
  code: (props: any) => {
    if (props["data-inline-code"] !== "true") {
      return <code {...props}>{props.children}</code>;
    }

    const text = getTextContent(props.children);
    return (
      <InlineCodeCopy text={text}>
        <code {...props}>{props.children}</code>
      </InlineCodeCopy>
    );
  },
  pre: (props: any) => {
    const codeProps = props.children?.props;
    if (codeProps?.["data-language"] === "mermaid") {
      return <MermaidDiagram chart={props.raw ?? ""} />;
    }

    const code = props.raw ?? getTextContent(props.children).replace(/\n$/, "");

    return (
      <div className="code-block-wrapper">
        <pre {...props} className={cn(props.className)}>{props.children}</pre>
        <CopyButton text={code} />
      </div>
    );
  },
};
