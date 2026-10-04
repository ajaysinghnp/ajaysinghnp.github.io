import "server-only";

import { PROJECT_REPOSITORY_SETTINGS } from "@/data/repos";
import type { Project, Repo } from "@/types/github";
import { GIT_USERNAME } from "@/types/github";

const GITHUB_API = "https://api.github.com";
const GITHUB_API_VERSION = "2022-11-28";
export const PROJECTS_REVALIDATE_SECONDS = 21600; // 6 hours

export class GitHubHttpError extends Error {
  status: number;

  constructor(status: number, url: string) {
    super(`GitHub API responded with ${status} for ${url}`);
    this.name = "GitHubHttpError";
    this.status = status;
  }
}

const getGitHubApiHeaders = (): Record<string, string> => {
  const token = process.env.GITHUB_TOKEN;

  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": GITHUB_API_VERSION,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Every GitHub call goes through here so it shares the 6-hour cache.
async function githubFetch(url: string, tags: string[], accept?: string): Promise<Response> {
  const res = await fetch(url, {
    headers: { ...getGitHubApiHeaders(), ...(accept ? { Accept: accept } : {}) },
    next: { revalidate: PROJECTS_REVALIDATE_SECONDS, tags },
  });

  if (!res.ok) throw new GitHubHttpError(res.status, url);
  return res;
}

const getNextPageUrl = (linkHeader: string): string | null => {
  const nextMatch = linkHeader
    .split(",")
    .map((part) => part.trim())
    .find((part) => part.endsWith('rel="next"'));

  if (!nextMatch) return null;

  const urlMatch = nextMatch.match(/<([^>]+)>/);
  return urlMatch?.[1] ?? null;
};

export const fetchProjects = async (): Promise<Project[]> => {
  const allRepos: Repo[] = [];
  let nextPageUrl: string | null =
    `${GITHUB_API}/users/${GIT_USERNAME}/repos?per_page=100&type=owner&sort=updated`;

  while (nextPageUrl) {
    const res = await githubFetch(nextPageUrl, ["projects"]);
    allRepos.push(...((await res.json()) as Repo[]));
    nextPageUrl = getNextPageUrl(res.headers.get("link") ?? "");
  }

  return allRepos
    .filter(
      (repo: Repo) =>
        !repo.private && !PROJECT_REPOSITORY_SETTINGS.excludedFromProjectList.includes(repo.name),
    )
    .map((repo: Repo) => ({
      id: repo.id,
      name: repo.name,
      title: repo.name,
      url: repo.html_url,
      homepage: repo.homepage,
      description: repo.description,
      stargazers_count: repo.stargazers_count,
      watchers_count: repo.watchers_count,
      forks: repo.forks ?? repo.forks_count,
      subscribers_count: repo.subscribers_count,
      visibility: repo.private ? "private" : "public",
      date: repo.created_at,
      updated_at: repo.updated_at,
      pushed_at: repo.pushed_at,
      private: repo.private,
      published: true,
    }));
};

export const fetchProject = async (slug: string): Promise<Project | null> => {
  try {
    const res = await githubFetch(
      `${GITHUB_API}/repos/${GIT_USERNAME}/${encodeURIComponent(slug)}`,
      ["projects", `project:${slug}`],
    );
    const repo = await res.json();

    if (repo.private) return null;

    return {
      id: repo.id,
      name: repo.name,
      title: repo.name,
      url: repo.html_url,
      homepage: repo.homepage,
      description: repo.description,
      watchers_count: repo.watchers_count,
      stargazers_count: repo.stargazers_count,
      forks: repo.forks,
      visibility: repo.visibility,
      open_issues: repo.open_issues,
      subscribers_count: repo.subscribers_count,
      date: repo.created_at,
      updated_at: repo.updated_at,
      pushed_at: repo.pushed_at,
      private: repo.private,
      published: true,
    };
  } catch (error) {
    if (error instanceof GitHubHttpError && error.status === 404) return null;
    throw error;
  }
};

export const fetchProjectReadme = async (project: string): Promise<string> => {
  const repoName = project.replace(/-readme/g, "");

  try {
    // Cached, so this adds no extra GitHub request
    const meta = await fetchProject(repoName);
    if (!meta) return "# Project unavailable\n\nThis repository is not public.";

    const res = await githubFetch(
      `${GITHUB_API}/repos/${GIT_USERNAME}/${encodeURIComponent(repoName)}/readme`,
      ["projects", `project:${repoName}`],
      "application/vnd.github.raw+json",
    );
    return await res.text();
  } catch (error) {
    // Repo exists but has no README
    if (error instanceof GitHubHttpError && error.status === 404) {
      return "# README unavailable\n\nThis project doesn't have a README yet.";
    }
    // Rate limits and outages: rethrow so ISR keeps serving the last good page
    console.warn(`Unable to fetch README for ${repoName}.`);
    throw error;
  }
};
