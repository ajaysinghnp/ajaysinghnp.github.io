import type { MetadataRoute } from "next";

const siteUrl = "https://ajaysingh.com.np";

const routes = ["", "/resume", "/about", "/projects", "/contact", "/blog", "/cheatsheet"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}
