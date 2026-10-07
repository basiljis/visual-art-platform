import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email().max(254),
  phone: z.string().trim().max(40).optional(),
  message: z.string().trim().min(1).max(2000),
  artwork: z.string().trim().max(200).optional(),
});

export const sendEnquiry = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const { publicDb } = await import("./public-db.server");
    const { error } = await publicDb().from("purchase_enquiries").insert({ ...data, phone: data.phone || null, artwork: data.artwork || null });
    if (error) {
      console.error("enquiry failed", error);
      return { ok: false as const };
    }
    return { ok: true as const };
  });
