import { GIT_USERNAME, Project, Repo } from "@/types/github";
import axios from "axios";

const GITHUB_API_VERSION = "2022-11-28";

const getGitHubApiHeaders = (): Record<string, string> => {
  const token = process.env.GITHUB_TOKEN;

  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": GITHUB_API_VERSION,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const readmeCache = new Map<string, string>();

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
  const perPage = 100;
  const allRepos: Repo[] = [];
  let nextPageUrl: string | null =
    `https://api.github.com/users/${GIT_USERNAME}/repos`;

  try {
    while (nextPageUrl) {
      const isFirstRequest = nextPageUrl.includes(
        `/users/${GIT_USERNAME}/repos`,
      );

      const { data, headers } = await axios.get<Repo[]>(nextPageUrl, {
        params: isFirstRequest
          ? {
              per_page: perPage,
              type: "owner",
              sort: "updated",
            }
          : undefined,
        headers: getGitHubApiHeaders(),
      });

      allRepos.push(...data);

      if (!headers.link) break;

      nextPageUrl = getNextPageUrl(headers.link);
    }

    return allRepos
      .filter((repo: Repo) => repo.name !== "iptv-channels")
      .map((repo: Repo) => ({
        id: repo.id,
        name: repo.name,
        title: repo.name,
        url: repo.html_url,
        description: repo.description,
        visibility: repo.private ? "private" : "public",
        date: repo.created_at,
        updated_at: repo.updated_at,
        pushed_at: repo.pushed_at,
        private: repo.private,
        published: true,
      }));
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
};

export const fetchProject = async (slug: string): Promise<Project | null> => {
  try {
    const { data: repo } = await axios.get(
      `https://api.github.com/repos/${GIT_USERNAME}/${slug}`,
      {
        headers: getGitHubApiHeaders(),
      },
    );

    return {
      id: repo.id,
      name: repo.name,
      title: repo.name,
      url: repo.html_url,
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
    console.error(`Error fetching project [${slug}]: ${error}`);
    return null;
  }
};

export const fetchProjectReadme = async (project: string): Promise<string> => {
  const repoName = project.replace(/-readme/g, "");

  if (readmeCache.has(repoName)) {
    return readmeCache.get(repoName)!;
  }

  try {
    const { data } = await axios.get<string>(
      `https://api.github.com/repos/${GIT_USERNAME}/${repoName}/readme`,
      {
        headers: {
          ...getGitHubApiHeaders(),
          // Return raw file body directly as text.
          Accept: "application/vnd.github.raw+json",
        },
      },
    );

    readmeCache.set(repoName, data);
    return data;
  } catch (error) {
    console.error(`Error fetching project readme [${repoName}]: ${error}`);
    return "Error fetching README.md";
  }
};
