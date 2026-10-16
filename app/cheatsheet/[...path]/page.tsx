import type { Metadata } from "next";

import { pathMetadata, SectionPath } from "@/components/content/section-pages";
import { cheatsheetSection } from "@/data/cheatsheet";

export const dynamicParams = true;

type Props = { params: Promise<{ path: string[] }> };

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path } = await params;
  return pathMetadata(cheatsheetSection, path);
}

export default async function CheatsheetPathPage({ params }: Props) {
  const { path } = await params;
  return <SectionPath section={cheatsheetSection} path={path} />;
}
