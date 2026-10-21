import type { ComponentPropsWithoutRef } from "react";
import { type BundledLanguage, codeToTokens } from "shiki";

import { CopyButton } from "@/components/mdx/copy-btn";
import { cn } from "@/lib/utils";

type TerminalProps = Omit<ComponentPropsWithoutRef<"div">, "title" | "children" | "code"> & {
  /** Fence language exactly as written, for example `powershell`. */
  lang?: string;
  title?: string;
  /** Raw block source, passed as a prop so indentation survives MDX. */
  code?: string;
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

const SHIKI_LANG: Record<Flavor, BundledLanguage> = {
  generic: "bash",
  powershell: "powershell",
  cmd: "bat",
};

type Token = { content: string; htmlStyle?: Record<string, string> };

// Same themes as the regular code blocks; colours switch through --shiki-light/--shiki-dark.
async function highlight(commands: string, flavor: Flavor): Promise<Token[][]> {
  try {
    const { tokens } = await codeToTokens(commands, {
      lang: SHIKI_LANG[flavor],
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
    });
    return tokens;
  } catch {
    return [];
  }
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

function renderCommand(text: string, tokens?: Token[]) {
  if (!tokens?.length) return text;

  return tokens.map((token, index) => (
    // Static token list; the same text can repeat within a line.
    // eslint-disable-next-line react/no-array-index-key
    <span key={index} style={token.htmlStyle}>
      {token.content}
    </span>
  ));
}

export async function Terminal({ lang = "terminal", title, code = "" }: TerminalProps) {
  const variant = VARIANTS[lang.toLowerCase()] ?? VARIANTS.terminal;
  const isWindows = variant.flavor !== "generic";
  const source = code.replace(/\n$/, "");
  const lines = parseLines(source, variant);
  const label = title ?? lang;

  const commands = variant.output
    ? ""
    : lines
        .filter((line) => line.prompt !== undefined)
        .map((line) => line.text)
        .join("\n");
  // Offer a commands-only copy only when it differs from copying everything.
  const showCommands = commands !== "" && commands !== source;
  const tokens = commands ? await highlight(commands, variant.flavor) : [];
  let commandIndex = 0;

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
      <div className="terminal-actions">
        {showCommands && <CopyButton inline label="Commands" text={commands} />}
        <CopyButton inline label="Copy" text={source} />
      </div>
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
                <span className="terminal-cmd">
                  {renderCommand(line.text, tokens[commandIndex++])}
                </span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
