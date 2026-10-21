"use client";

import { type ReactNode, useRef } from "react";

import { CopyButton } from "@/components/mdx/copy-btn";

interface TableWrapperProps {
  children: ReactNode;
}

export function TableWrapper({ children }: TableWrapperProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const getTableText = () => {
    const table = wrapperRef.current?.querySelector("table");
    if (!table) return "";

    return Array.from(table.rows)
      .map((row) =>
        Array.from(row.cells)
          .map((cell) => cell.innerText.replace(/\s+/g, " ").trim())
          .join("\t"),
      )
      .join("\n");
  };

  return (
    <div ref={wrapperRef} className="table-wrapper">
      <CopyButton text={getTableText} label="Copy table" />
      <div className="table-scroll">{children}</div>
    </div>
  );
}
