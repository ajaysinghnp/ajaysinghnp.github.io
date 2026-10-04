export function getProjectPreviewFileName(projectName: string, theme: "light" | "dark"): string {
  return `${projectName.replace(/[^a-zA-Z0-9._-]/g, "-")}.${theme}.webp`;
}

export function getProjectPreviewSrc(projectName: string, theme: "light" | "dark"): string {
  return `/generated-project-previews/${getProjectPreviewFileName(projectName, theme)}`;
}

export const PROJECT_PREVIEW_MANIFEST_PATH = "/generated-project-previews/featured.json";
