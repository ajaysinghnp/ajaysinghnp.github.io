"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownPreview({ source }: { source: string }) {
  return (
    <div className="prose prose-sm max-h-72 min-h-34 max-w-none overflow-auto rounded-sm border border-(--site-surface-border) py-2.5 pr-3 pl-9 break-words text-(--site-text) dark:prose-invert prose-a:text-(--site-accent) prose-code:rounded prose-code:bg-(--site-accent)/10 prose-code:px-1 prose-code:before:content-none prose-code:after:content-none">
      {source.trim() ? (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            img: ({ src, alt }) =>
              typeof src === "string" && src.startsWith("https://") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src}
                  alt={alt ?? ""}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="max-h-60 rounded-sm"
                />
              ) : null,
            a: ({ href, children }) => (
              <a href={href} target="_blank" rel="noopener noreferrer nofollow">
                {children}
              </a>
            ),
          }}
        >
          {source}
        </ReactMarkdown>
      ) : (
        <p className="resume-muted">Nothing to preview yet.</p>
      )}
    </div>
  );
}
