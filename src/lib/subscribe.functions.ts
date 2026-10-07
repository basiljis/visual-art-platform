import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const subscribeToBlog = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ email: z.string().trim().toLowerCase().email().max(254) }).parse(data))
  .handler(async ({ data }) => {
    const { publicDb } = await import("./public-db.server");
    const { error } = await publicDb().from("blog_subscribers").insert({ email: data.email });
    if (error?.code === "23505") return { ok: true as const }; // already subscribed
    if (error) {
      console.error("subscribe failed", error);
      return { ok: false as const };
    }
    return { ok: true as const };
  });
