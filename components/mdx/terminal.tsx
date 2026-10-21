import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { CopyButton } from "@/components/mdx/copy-btn";
import { cn } from "@/lib/utils";

type TerminalProps = Omit<ComponentPropsWithoutRef<"div">, "title"> & {
  /** Fence language exactly as written, for example `powershell`. */
  lang?: string;
  title?: string;
};

interface TerminalLine {
  text: string;
  prompt?: string;
}

type Flavor = "generic" | "powershell" | "cmd";

interface Variant {
  output: boolean;
  flavor: Flavor;
}

const VARIANTS: Record<string, Variant> = {
  term: { output: false, flavor: "generic" },
  terminal: { output: false, flavor: "generic" },
  output: { output: true, flavor: "generic" },
  text: { output: true, flavor: "generic" },
  powershell: { output: false, flavor: "powershell" },
  pwsh: { output: false, flavor: "powershell" },
  bat: { output: false, flavor: "cmd" },
  cmd: { output: false, flavor: "cmd" },
};

// `$`/`%`/`>` shells, PowerShell (`PS C:\>`) and cmd (`C:\>`) prompts.
const PROMPT = /^(PS [^>\n]*>|PS>|[A-Za-z]:\\[^>\n]*>|\$|%|>)\s?/;

const CONTINUATION: Record<Flavor, string> = { generic: "\\", powershell: "`", cmd: "^" };

function toText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(toText).join("");
  return "";
}

function parseLines(source: string, { output, flavor }: Variant): TerminalLine[] {
  const lines = source.replace(/\n$/, "").split("\n");
  if (output) return lines.map((text) => ({ text }));

  let continued = false;

  return lines.map((line) => {
    const match = PROMPT.exec(line);
    if (match || continued) {
      const text = match ? line.slice(match[0].length) : line;
      continued = text.endsWith(CONTINUATION[flavor]);
      return { prompt: match ? match[1] : "", text };
    }

    return { text: line };
  });
}

export function Terminal({ lang = "terminal", title, children }: TerminalProps) {
  const variant = VARIANTS[lang.toLowerCase()] ?? VARIANTS.terminal;
  const isWindows = variant.flavor !== "generic";
  const source = toText(children);
  const lines = parseLines(source, variant);
  const label = title ?? lang;

  // Copy only the commands for shell blocks; output blocks copy as-is.
  const copyText = variant.output
    ? source.replace(/\n$/, "")
    : lines
        .filter((line) => line.prompt !== undefined)
        .map((line) => line.text)
        .join("\n");

  return (
    <div
      className={cn(
        "terminal",
        isWindows ? "terminal-win" : "terminal-generic",
        variant.flavor === "powershell" && "terminal-powershell",
        variant.flavor === "cmd" && "terminal-cmd-shell",
      )}
      role="group"
      aria-label={label}
    >
      <div className="terminal-bar">
        {isWindows ? (
          <span className="terminal-icon" aria-hidden="true">
            {variant.flavor === "powershell" ? "PS" : ">_"}
          </span>
        ) : (
          <span className="terminal-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        )}
        <span className="terminal-title">{label}</span>
        {isWindows && (
          <span className="terminal-controls" aria-hidden="true">
            <span>&#x2013;</span>
            <span>&#x25A1;</span>
            <span>&#x2715;</span>
          </span>
        )}
      </div>
      {copyText && <CopyButton text={copyText} />}
      <div className="terminal-body">
        {lines.map((line, index) => (
          // Static, never-reordered lines; text alone is not unique.
          // eslint-disable-next-line react/no-array-index-key
          <div key={index} className="terminal-line">
            {line.prompt === undefined ? (
              <span className="terminal-out">{line.text}</span>
            ) : (
              <>
                <span className="terminal-prompt" aria-hidden="true">
                  {line.prompt || " "}
                </span>
                <span className="terminal-cmd">{line.text}</span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
