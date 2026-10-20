import "server-only";

import { PROJECT_REPOSITORY_SETTINGS } from "@/data/repos";
import type { Project, ProjectReadme, Repo } from "@/types/github";

import { githubToken, githubUsername } from "./github-config";

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
  const token = githubToken;

  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": GITHUB_API_VERSION,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Every GitHub call goes through here so it shares the 6-hour cache.
async function githubFetch(url: string, tags: string[], accept?: string): Promise<Response> {
  const res = await fetch(url, {
    headers: {
      ...getGitHubApiHeaders(),
      ...(accept ? { Accept: accept } : {}),
    },
    next: {
      revalidate: PROJECTS_REVALIDATE_SECONDS,
      tags,
    },
  });

  if (!res.ok) {
    throw new GitHubHttpError(res.status, url);
  }

  return res;
}

const getNextPageUrl = (linkHeader: string): string | null => {
  const nextMatch = linkHeader
    .split(",")
    .map((part) => part.trim())
    .find((part) => part.endsWith('rel="next"'));

  if (!nextMatch) {
    return null;
  }

  const urlMatch = nextMatch.match(/<([^>]+)>/);

  return urlMatch?.[1] ?? null;
};

export const fetchProjects = async (): Promise<Project[]> => {
  const allRepos: Repo[] = [];

  let nextPageUrl: string | null =
    `${GITHUB_API}/users/${githubUsername}/repos?per_page=100&type=owner&sort=updated`;

  while (nextPageUrl) {
    const res = await githubFetch(nextPageUrl, ["projects"]);
    allRepos.push(...((await res.json()) as Repo[]));
    nextPageUrl = getNextPageUrl(res.headers.get("link") ?? "");
  }

  return allRepos
    .filter((repo: Repo) => {
      const isExcluded = PROJECT_REPOSITORY_SETTINGS.excludedFromProjectList.some(
        (excludedName) => excludedName.toLowerCase() === repo.name.toLowerCase(),
      );

      const isOwnedByUser = repo.owner?.login?.toLowerCase() === githubUsername.toLowerCase();

      return !repo.private && !repo.fork && isOwnedByUser && !isExcluded;
    })
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
      default_branch: repo.default_branch,
    }));
};

export const fetchProject = async (slug: string): Promise<Project | null> => {
  try {
    const res = await githubFetch(
      `${GITHUB_API}/repos/${githubUsername}/${encodeURIComponent(slug)}`,
      ["projects", `project:${slug}`],
    );

    const repo = (await res.json()) as Repo;

    if (repo.private) {
      return null;
    }

    return {
      id: repo.id,
      name: repo.name,
      title: repo.name,
      url: repo.html_url,
      homepage: repo.homepage,
      description: repo.description,
      watchers_count: repo.watchers_count,
      stargazers_count: repo.stargazers_count,
      forks: repo.forks ?? repo.forks_count,
      visibility: repo.visibility,
      open_issues: repo.open_issues,
      subscribers_count: repo.subscribers_count,
      date: repo.created_at,
      updated_at: repo.updated_at,
      pushed_at: repo.pushed_at,
      private: repo.private,
      published: true,

      // Required for README assets in repositories using "master".
      default_branch: repo.default_branch,
    };
  } catch (error) {
    if (error instanceof GitHubHttpError && error.status === 404) {
      return null;
    }

    throw error;
  }
};

export const fetchProjectReadme = async (project: string): Promise<ProjectReadme> => {
  const repoName = project.replace(/-readme/g, "");

  try {
    const meta = await fetchProject(repoName);

    if (!meta) {
      return {
        content: "# Project unavailable\n\nThis repository is not public.",
        repository: repoName,
        branch: "main",
        path: "README.md",
      };
    }

    const res = await githubFetch(
      `${GITHUB_API}/repos/${githubUsername}/${encodeURIComponent(repoName)}/readme`,
      ["projects", `project:${repoName}`],
      "application/vnd.github.raw+json",
    );

    return {
      content: await res.text(),
      repository: repoName,
      branch: meta.default_branch,
      path: "README.md",
    };
  } catch (error) {
    if (error instanceof GitHubHttpError && error.status === 404) {
      return {
        content: "# README unavailable\n\nThis project doesn't have a README yet.",
        repository: repoName,
        branch: "main",
        path: "README.md",
      };
    }

    console.warn(`Unable to fetch README for ${repoName}.`);
    throw error;
  }
};
