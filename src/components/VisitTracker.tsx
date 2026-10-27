import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { recordPageView } from "@/lib/visit-statistics.functions";
import { trackedPath } from "@/lib/visit-statistics";

export function VisitTracker() {
  const { pathname } = useLocation();
  const record = useServerFn(recordPageView);
  const qc = useQueryClient();
  useEffect(() => {
    const path = trackedPath(pathname);
    if (!path) return;
    const timer = window.setTimeout(async () => {
      try {
        let sessionId = sessionStorage.getItem("dikunova-visit-session");
        if (!sessionId) {
          sessionId = crypto.randomUUID();
          sessionStorage.setItem("dikunova-visit-session", sessionId);
        }
        let visitorId = localStorage.getItem("dikunova-visitor");
        if (!visitorId) {
          visitorId = crypto.randomUUID();
          localStorage.setItem("dikunova-visitor", visitorId);
        }
        const result = await record({ data: { sessionId, visitorId, path } });
        if (result.ok) await qc.invalidateQueries({ queryKey: ["blog-views"] });
      } catch { /* Statistics must never interrupt reading the site. */ }
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [pathname, record, qc]);
  return null;
}