import type { Metadata } from "next";

import { SectionTag, tagMetadata } from "@/components/content/section-pages";
import { cheatsheetSection } from "@/data/cheatsheet";

export const dynamicParams = true;

type Props = { params: Promise<{ tag: string }> };

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  return tagMetadata(cheatsheetSection, tag);
}

export default async function CheatsheetTagPage({ params }: Props) {
  const { tag } = await params;
  return <SectionTag section={cheatsheetSection} tag={tag} />;
}
