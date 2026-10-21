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
  command: boolean;
  /** Prompt glyph; empty for continuation lines, null when the block has no prompts. */
  prompt?: string | null;
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

// Prompts per shell. `$` is only a prompt in generic shells, and only when followed by
// a space: in PowerShell it starts variables such as `$profiles = ...`.
const PROMPTS: Record<Flavor, RegExp> = {
  generic: /^(PS [^>\n]*>|PS>|[A-Za-z]:\\[^>\n]*>|\$(?=\s|$)|%(?=\s)|>(?=\s))\s?/,
  powershell: /^(PS [^>\n]*>|PS>|>(?=\s))\s?/,
  cmd: /^([A-Za-z]:\\[^>\n]*>|>(?=\s))\s?/,
};

const CONTINUATION: Record<Flavor, string> = { generic: "\\", powershell: "`", cmd: "^" };

const COMMENT: Record<Flavor, RegExp> = {
  generic: /^\s*#/,
  powershell: /^\s*#/,
  cmd: /^\s*(REM\b|::)/i,
};

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

interface ShellState {
  depth: number;
  quote: string | null;
  heredoc: string | null;
}

const BLOCK_OPEN = new Set(["for", "while", "until", "if", "case", "select"]);
const BLOCK_CLOSE = new Set(["done", "fi", "esac"]);
const BLOCK_PREFIX = new Set(["then", "do", "else", "elif", "!"]);

/** Updates open quotes and block depth so later lines of a multi-line command stay commands. */
function scanCommand(text: string, state: ShellState, keywords: boolean) {
  let word = "";
  let atStart = true;

  const endWord = () => {
    if (!word) return;
    if (keywords && atStart && BLOCK_OPEN.has(word)) state.depth++;
    else if (keywords && atStart && BLOCK_CLOSE.has(word))
      state.depth = Math.max(0, state.depth - 1);
    atStart = BLOCK_PREFIX.has(word);
    word = "";
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (state.quote) {
      if (ch === "\\" && state.quote === '"') i++;
      else if (ch === state.quote) state.quote = null;
      continue;
    }

    if (/\w/.test(ch)) {
      word += ch;
      continue;
    }

    endWord();
    if (ch === "'" || ch === '"') state.quote = ch;
    else if (ch === "#" && (i === 0 || /\s/.test(text[i - 1]))) break;
    else if (ch === "{" || ch === "(") state.depth++;
    else if (ch === "}" || ch === ")") state.depth = Math.max(0, state.depth - 1);
    else if (";&|".includes(ch)) atStart = true;
  }

  endWord();
}

function parseLines(source: string, { output, flavor }: Variant): TerminalLine[] {
  const lines = source.replace(/\n$/, "").split("\n");
  if (output) return lines.map((text) => ({ text, command: false }));

  const prompts = PROMPTS[flavor];
  // Without any prompt (a script, or docs that omit `$`), every line is a command.
  const bare = !lines.some((line) => prompts.test(line));
  const state: ShellState = { depth: 0, quote: null, heredoc: null };
  let continued = false;

  return lines.map((line) => {
    const match = prompts.exec(line);
    const comment = !match && !continued && COMMENT[flavor].test(line);
    if (!bare && !match && !continued && !comment) return { text: line, command: false };

    const text = match ? line.slice(match[0].length) : line;
    if (comment) return { text, command: true, prompt: bare ? null : "" };

    if (state.heredoc) {
      if (text.trim() === state.heredoc) state.heredoc = null;
      continued = state.heredoc !== null;
    } else {
      scanCommand(text, state, flavor === "generic");
      if (flavor === "generic") {
        const heredoc = /<<-?\s*["']?([\w.-]+)["']?/.exec(text);
        if (heredoc) state.heredoc = heredoc[1];
      }
      continued =
        state.heredoc !== null ||
        state.depth > 0 ||
        state.quote !== null ||
        text.trimEnd().endsWith(CONTINUATION[flavor]) ||
        /(\|\||&&|\|)\s*$/.test(text);
    }

    const prompt = match ? match[1] : "";
    return { text, command: true, prompt: bare ? null : prompt };
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
        .filter((line) => line.command)
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
            {!line.command ? (
              <span className="terminal-out">{line.text}</span>
            ) : (
              <>
                {line.prompt !== null && (
                  <span className="terminal-prompt" aria-hidden="true">
                    {line.prompt || " "}
                  </span>
                )}
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
