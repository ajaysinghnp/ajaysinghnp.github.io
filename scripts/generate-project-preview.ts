import { mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { type Browser, chromium } from "playwright";

import { githubUsername } from "@/lib/github-config";

import { PROJECT_REPOSITORY_SETTINGS } from "../data/repos";
import { socialMedia } from "../data/social";
import { getProjectPreviewFileName, PROJECT_PREVIEW_MANIFEST_PATH } from "../lib/project-preview";

interface GitHubRepository {
  name: string;
  html_url: string;
  homepage?: string | null;
  private: boolean;
  updated_at: string;
  stargazers_count?: number;
  forks?: number;
  forks_count?: number;
}

const outputDirectory = path.join(process.cwd(), "public", "generated-project-previews");

const githubHeaders = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

async function fetchRepositories(): Promise<GitHubRepository[]> {
  const repositories: GitHubRepository[] = [];
  let nextUrl: string | null =
    `https://api.github.com/users/${githubUsername}/repos?per_page=100&type=owner&sort=updated`;

  while (nextUrl) {
    const response: Response = await fetch(nextUrl, {
      headers: githubHeaders,
      signal: AbortSignal.timeout(20_000),
    });

    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status} ${response.statusText}`);
    }

    const page = (await response.json()) as GitHubRepository[];
    repositories.push(...page);
    const links: string[] = (response.headers.get("link") ?? "")
      .split(",")
      .map((link: string) => link.trim());
    const nextLink: string | undefined = links.find((link: string) => /;\s*rel="next"/.test(link));
    nextUrl = nextLink?.match(/<([^>]+)>/)?.[1] ?? null;
  }

  return repositories
    .filter(
      (repository) =>
        !repository.private &&
        !PROJECT_REPOSITORY_SETTINGS.excludedFromProjectList.includes(repository.name),
    )
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
}

function getPreviewTarget(repository: GitHubRepository): string {
  const homepage = repository.homepage?.trim();

  if (homepage) {
    try {
      const url = new URL(homepage);
      if (url.protocol === "https:" || url.protocol === "http:") {
        return url.toString();
      }
    } catch {
      console.warn(`Ignoring invalid homepage URL for ${repository.name}: ${homepage}`);
    }
  }

  return repository.html_url;
}

async function capturePreview(
  repository: GitHubRepository,
  localDevelopmentUrl?: string,
): Promise<void> {
  const targetUrl =
    localDevelopmentUrl && repository.name === socialMedia.github.domain
      ? localDevelopmentUrl
      : getPreviewTarget(repository);
  let browser: Browser | undefined;

  try {
    browser = await chromium.launch({
      headless: true,
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    });
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
      reducedMotion: "reduce",
    });

    await page.goto(targetUrl, {
      waitUntil: "networkidle",
      timeout: 45_000,
    });
    await page.evaluate(() => document.fonts.ready);
    const portrait = page.locator(".photo-panel img");
    if (await portrait.count()) {
      try {
        await page.waitForFunction(
          () => {
            const image = document.querySelector<HTMLImageElement>(".photo-panel img");
            return image?.complete && image.naturalWidth > 0;
          },
          undefined,
          { timeout: 30_000 },
        );
        await portrait.evaluate(async (image) => {
          if (image instanceof HTMLImageElement) await image.decode();
        });
      } catch (error) {
        throw new Error(
          "The hero portrait failed to load; refusing to capture an incomplete preview.",
          {
            cause: error,
          },
        );
      }
    }
    if (localDevelopmentUrl && targetUrl === localDevelopmentUrl) {
      await page.waitForTimeout(2_000);
      await page.evaluate(() => {
        document.querySelectorAll<HTMLElement>("main [style]").forEach((element) => {
          const style = getComputedStyle(element);
          if (style.opacity === "0" && style.visibility === "visible") {
            element.style.opacity = "1";
            element.style.transform = "none";
          }
        });
      });
    }
    await mkdir(outputDirectory, { recursive: true });
    for (const theme of ["light", "dark"] as const) {
      await page.evaluate((selectedTheme) => {
        document.documentElement.classList.toggle("dark", selectedTheme === "dark");
        document.documentElement.style.colorScheme = selectedTheme;
      }, theme);
      await page.waitForTimeout(100);
      const image = await page.screenshot({
        type: "webp",
        quality: 82,
        animations: "disabled",
      });
      const outputPath = path.join(
        outputDirectory,
        getProjectPreviewFileName(repository.name, theme),
      );
      const temporaryPath = `${outputPath}.tmp`;
      await writeFile(temporaryPath, image);
      await rename(temporaryPath, outputPath);
      console.info(
        `Generated ${theme}-theme featured preview for ${repository.name} from ${targetUrl}`,
      );
    }
    const manifestPath = path.join(outputDirectory, path.basename(PROJECT_PREVIEW_MANIFEST_PATH));
    const manifestTemporaryPath = `${manifestPath}.tmp`;
    await writeFile(
      manifestTemporaryPath,
      JSON.stringify({
        repository: repository.name,
        generatedAt: new Date().toISOString(),
      }),
    );
    await rename(manifestTemporaryPath, manifestPath);
  } finally {
    await browser?.close();
  }
}

async function main(): Promise<void> {
  try {
    const repositories = await fetchRepositories();
    const featuredRepository =
      repositories.find(
        (repository) => repository.name === PROJECT_REPOSITORY_SETTINGS.featuredRepositoryName,
      ) ?? repositories[0];

    if (!featuredRepository) {
      console.warn("No public repositories are available; skipping featured preview.");
      return;
    }

    const devUrlArgumentIndex = process.argv.indexOf("--dev-url");
    const localDevelopmentUrl =
      devUrlArgumentIndex >= 0 ? process.argv[devUrlArgumentIndex + 1] : undefined;
    await capturePreview(featuredRepository, localDevelopmentUrl);
  } catch (error) {
    console.warn(
      "Could not generate the featured-project preview; continuing without updating it.",
      error,
    );
  }
}

void main().catch((error: unknown) => {
  console.error("Unexpected error while generating the featured preview.", error);
  process.exitCode = 1;
});
