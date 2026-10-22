import { unstable_cache } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

import { about } from "@/data/about";
import { blogConfig, blogSource } from "@/data/blog";
import { cheatsheetConfig, cheatsheetSource } from "@/data/cheatsheet";
import { navigation } from "@/data/navigation";
import { PROJECT_REPOSITORY_SETTINGS } from "@/data/repos";
import { resume } from "@/data/resume";
import { entryHref } from "@/lib/content-format";
import { listEntries } from "@/lib/github-content";
import { fetchProjectReadme, fetchProjects } from "@/lib/projects";

interface SearchDocument {
  title: string;
  href: string;
  section: string;
  text: string;
}

const markdownText = (markdown: string) =>
  markdown
    .replace(/^```[^\n]*$/gm, " ")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/[\\*_`>#~|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function excerpt(text: string, terms: string[]) {
  const normalized = markdownText(text);
  const lower = normalized.toLowerCase();
  const positions = terms.map((term) => lower.indexOf(term)).filter((index) => index >= 0);
  const start = Math.max(0, (positions.length ? Math.min(...positions) : 0) - 55);
  const end = Math.min(normalized.length, start + 180);

  return `${start > 0 ? "..." : ""}${normalized.slice(start, end)}${end < normalized.length ? "..." : ""}`;
}

function rank(document: SearchDocument, terms: string[]) {
  const title = document.title.toLowerCase();
  const text = `${document.section} ${document.text}`.toLowerCase();
  if (!terms.every((term) => title.includes(term) || text.includes(term))) return -1;

  return terms.reduce(
    (score, term) => score + (title.includes(term) ? 8 : 0) + (text.includes(term) ? 1 : 0),
    title === terms.join(" ") ? 20 : 0,
  );
}

const getSearchDocuments = unstable_cache(
  async () => {
    const [blogEntries, cheatsheetEntries, projects] = await Promise.all([
      listEntries(blogSource),
      listEntries(cheatsheetSource),
      fetchProjects(),
    ]);

    const projectDocuments = await Promise.all(
      projects.map(async (project): Promise<SearchDocument> => {
        let readmeContent = "";
        try {
          readmeContent = markdownText((await fetchProjectReadme(project.name)).content);
        } catch {
          // A single unavailable README should not hide the rest of the site index.
        }

        return {
          title: project.title,
          href: `/projects/${encodeURIComponent(project.name)}`,
          section: "Project",
          text: `${project.description ?? ""} ${readmeContent}`,
        };
      }),
    );

    const entryDocuments = [
      ...blogEntries.map((entry): SearchDocument => ({
        title: entry.meta.title ?? entry.slug,
        href: entryHref("/blog", entry),
        section: `Blog ${entry.category.replaceAll("/", " ")} ${entry.meta.tags.join(" ")}`,
        text: `${entry.meta.description ?? ""} ${entry.content}`,
      })),
      ...cheatsheetEntries.map((entry): SearchDocument => ({
        title: entry.meta.title ?? entry.slug,
        href: entryHref("/cheatsheet", entry),
        section: `Cheatsheet ${entry.category.replaceAll("/", " ")} ${entry.meta.tags.join(" ")}`,
        text: `${entry.meta.description ?? ""} ${entry.content}`,
      })),
    ];

    const siteDocuments: SearchDocument[] = [
      {
        title: "Ajay Singh",
        href: "/",
        section: "Home",
        text: `${resume.quote} ${resume.profile} ${resume.jobtask} ${resume.skills.map((skill) => `${skill.label} ${skill.description}`).join(" ")}`,
      },
      ...navigation.map(({ name, href }) => ({
        title: name,
        href,
        section: "Page",
        text: `${name} Ajay Singh personal website portfolio`,
      })),
      {
        title: "Projects",
        href: "/projects",
        section: "Projects",
        text: PROJECT_REPOSITORY_SETTINGS.page.intro,
      },
      {
        title: "Blog",
        href: "/blog",
        section: "Blog",
        text: blogConfig.page.intro,
      },
      {
        title: "Cheatsheets",
        href: "/cheatsheet",
        section: "Cheatsheets",
        text: cheatsheetConfig.page.intro,
      },
      {
        title: "About Ajay Singh",
        href: "/about",
        section: "About",
        text: [
          about.title,
          about.quote,
          about.description,
          ...about.highlights.flatMap((highlight) => [highlight.label, highlight.description]),
          ...about.principles.flatMap((principle) => [principle.title, principle.description]),
        ].join(" "),
      },
      {
        title: "Resume",
        href: "/resume",
        section: "Resume",
        text: [
          resume.name,
          resume.quote,
          resume.profile,
          resume.jobtask,
          resume.passion,
          ...resume.workExperiences.flatMap((item) => [item.title, item.company, item.description]),
          ...resume.education.flatMap((item) => [item.degree, item.school, item.description]),
          ...resume.skills.flatMap((skill) => [skill.label, skill.description]),
        ].join(" "),
      },
      {
        title: "Contact Ajay Singh",
        href: "/contact",
        section: "Contact",
        text: "Contact get in touch email social links conversation",
      },
    ];

    return [...siteDocuments, ...projectDocuments, ...entryDocuments];
  },
  ["global-search-documents"],
  { revalidate: 21600, tags: ["projects", blogSource.tag, cheatsheetSource.tag] },
);

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (query.length > 100) {
    return NextResponse.json({ error: "Search query is too long." }, { status: 400 });
  }

  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.join("").length < 2) return NextResponse.json({ results: [] });

  try {
    const documents = await getSearchDocuments();
    const results = documents
      .map((document) => ({ document, score: rank(document, terms) }))
      .filter(({ score }) => score >= 0)
      .sort((a, b) => b.score - a.score || a.document.title.localeCompare(b.document.title))
      .slice(0, 12)
      .map(({ document }) => ({
        title: document.title,
        href: document.href,
        section: document.section.split(" ")[0],
        excerpt: excerpt(document.text, terms),
      }));

    return NextResponse.json({ results }, { headers: { "Cache-Control": "private, max-age=30" } });
  } catch {
    return NextResponse.json({ error: "Search is temporarily unavailable." }, { status: 503 });
  }
}
