export function normalizeMermaidChart(chart: string): string {
  let source = chart.replace(/^\uFEFF/, "").trim();

  // Remove an opening Markdown fence:
  // ```mermaid
  // ```mermaid title="Example"
  // ```
  source = source.replace(/^```(?:mermaid\b[^\r\n]*|[ \t]*)\r?\n/i, "");

  // Remove the closing Markdown fence.
  source = source.replace(/\r?\n[ \t]*```[ \t]*$/, "");

  return source.trim();
}
