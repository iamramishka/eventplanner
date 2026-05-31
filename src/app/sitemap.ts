import type { MetadataRoute } from "next";
import { templateShowcases } from "@/data/mock-content";
import { siteConfig } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseRoutes = [
    "",
    "/features",
    "/templates",
    "/pricing",
    "/vendors",
    "/faq",
    "/about",
    "/contact",
  ].map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
  }));

  const demoRoutes = templateShowcases.map((template) => ({
    url: `${siteConfig.url}/demo/${template.slug}`,
    lastModified: new Date(),
  }));

  return [...baseRoutes, ...demoRoutes];
}
