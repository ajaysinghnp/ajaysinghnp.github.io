import { cn } from "@/lib/utils";
import { CopyButton } from "./copy-btn";

export const components = {
  h1: (props: any) => <h1 {...props} className={cn("text-[var(--site-text)]", props.className)}>{props.children}</h1>,
  h2: (props: any) => <h2 {...props} className={cn("text-[var(--site-text)]", props.className)}>{props.children}</h2>,
  h3: (props: any) => <h3 {...props} className={cn("text-[var(--site-text)]", props.className)}>{props.children}</h3>,
  h4: (props: any) => <h4 {...props} className={cn("text-[var(--site-text)]", props.className)}>{props.children}</h4>,
  p: (props: any) => <p {...props} className={cn("text-[var(--site-muted)]", props.className)}>{props.children}</p>,
  a: (props: any) => <a {...props} className={cn("text-[var(--site-accent)] no-underline hover:underline", props.className)}>{props.children}</a>,
  li: (props: any) => <li {...props} className={cn("text-[var(--site-muted)]", props.className)}>{props.children}</li>,
  strong: (props: any) => <strong {...props} className={cn("font-bold text-[var(--site-text)]", props.className)}>{props.children}</strong>,
  pre: (props: any) => (
    <div className="code-block-wrapper">
      <pre {...props} className={cn(props.className)}>{props.children}</pre>
      <CopyButton text={props.raw ?? ""} />
    </div>
  ),
};
