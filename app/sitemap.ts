import type { MetadataRoute } from "next";
import {
  canonicalUrl,
  isoDate,
  loadSitemapData,
} from "@/lib/share-metadata";

// Built from the backend on request (cached for an hour), so new posts,
// profiles and referrals appear without a redeploy. The backend only returns
// content that is safe to index.
export const dynamic = "force-dynamic";

const pages: [path: string, priority: number][] = [
  ["/", 1],
  ["/explore", 0.7],
  ["/referrals", 0.8],
  ["/insights", 0.6],
  ["/about", 0.5],
  ["/community-guidelines", 0.3],
  ["/privacy", 0.3],
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await loadSitemapData();
  const entry = (
    path: string,
    updatedAt?: string,
    priority?: number,
  ): MetadataRoute.Sitemap[number] => ({
    url: canonicalUrl(path),
    lastModified: updatedAt ? isoDate(updatedAt) : undefined,
    priority,
  });
  return [
    ...pages.map(([path, priority]) => entry(path, undefined, priority)),
    ...data.referrals.map((item) =>
      entry(`/referrals/${item.id}`, item.updatedAt, 0.8),
    ),
    ...data.profiles.map((item) =>
      entry(`/users/${item.slug}`, item.updatedAt, 0.6),
    ),
    ...data.posts.map((item) =>
      entry(`/posts/${item.id}`, item.updatedAt, 0.5),
    ),
  ];
}
