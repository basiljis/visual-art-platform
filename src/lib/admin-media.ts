import { supabase } from "@/integrations/supabase/client";

/** Uploads a file to the media bucket (admin only) and returns its stored reference. */
export async function uploadMedia(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  return `media:${path}`;
}
