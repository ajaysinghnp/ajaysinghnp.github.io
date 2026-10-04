import type { Project } from "@/types/github";

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Project request failed (${response.status}).`);
  }

  return response.json() as Promise<T>;
};

export const fetchProjectsFromApi = (): Promise<Project[]> => fetchJson<Project[]>("/api/projects");

export const fetchProjectFromApi = async (slug: string): Promise<Project | null> => {
  const response = await fetch(`/api/projects/${encodeURIComponent(slug)}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Project request failed (${response.status}).`);
  }

  return response.json() as Promise<Project>;
};
