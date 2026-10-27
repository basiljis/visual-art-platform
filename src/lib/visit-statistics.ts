export function trackedPath(pathname: string): string | null {
  const path = pathname.replace(/\/$/, "") || "/";
  return path === "/" || path === "/blog" || /^\/blog\/[^/]+$/.test(path) ? path : null;
}

export type VisitStatistics = {
  visitors: number;
  visits: number;
  pageViews: number;
  blogViews: number;
  startedAt: string | null;
  daily: { day: string; views: number; visits: number; visitors: number }[];
  posts: { slug: string; title: string; views: number }[];
};