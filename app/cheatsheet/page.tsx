import type { Metadata } from "next";

import { SectionIndex } from "@/components/content/section-pages";
import { cheatsheetSection } from "@/data/cheatsheet";

export const metadata: Metadata = {
  title: cheatsheetSection.page.title,
  description: cheatsheetSection.page.description,
};

export default function CheatsheetPage() {
  return <SectionIndex section={cheatsheetSection} />;
}
