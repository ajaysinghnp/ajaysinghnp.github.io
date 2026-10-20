export interface RepoOwner {
  login: string;
  avatar_url: string;
  gravatar_id: string;
  html_url: string;
}

export interface Repo {
  open_issues: number | undefined;
  visibility: string;
  default_branch: string;
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  html_url: string;
  homepage?: string | null;
  description: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  private: boolean;
  size: number;
  owner: RepoOwner;
  stargazers_count?: number;
  watchers_count?: number;
  fork: boolean;
  forks?: number;
  forks_count?: number;
  subscribers_count?: number;
}

export interface Project {
  id: number;
  name: string;
  title: string;
  url: string;
  homepage?: string | null;
  description: string;
  repository?: string;
  default_branch: string;
  watchers_count?: number;
  stargazers_count?: number;
  forks?: number;
  visibility: string;
  open_issues?: number;
  subscribers_count?: number;
  date: string;
  updated_at: string;
  pushed_at: string;
  private: boolean;
  published: boolean;
}

export interface ProjectReadme {
  content: string;
  repository: string;
  branch: string;
  path: string;
}
