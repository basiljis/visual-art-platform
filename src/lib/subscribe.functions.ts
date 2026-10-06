import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const subscribeToBlog = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ email: z.string().trim().toLowerCase().email().max(254) }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("blog_subscribers").upsert({ email: data.email }, { onConflict: "email", ignoreDuplicates: true });
    if (error) {
      console.error("subscribe failed", error);
      return { ok: false as const };
    }
    return { ok: true as const };
  });
