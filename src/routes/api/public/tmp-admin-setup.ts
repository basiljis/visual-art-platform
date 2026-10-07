import { createFileRoute } from "@tanstack/react-router";

// TEMPORARY one-time setup endpoint — removed right after use.
const TOKEN = "k9Qz7-one-time-3f81a2c6";
export const Route = createFileRoute("/api/public/tmp-admin-setup")({
  server: { handlers: { POST: async ({ request }) => {
    const body = (await request.json()) as { token?: string; email?: string; password?: string };
    if (body.token !== TOKEN || !body.email || !body.password) return new Response("no", { status: 403 });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const list = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    const existing = list.data?.users.find((u) => u.email?.toLowerCase() === body.email!.toLowerCase());
    let id = existing?.id;
    if (existing) {
      const r = await supabaseAdmin.auth.admin.updateUserById(existing.id, { password: body.password, email_confirm: true });
      if (r.error) return new Response(r.error.message, { status: 500 });
    } else {
      const r = await supabaseAdmin.auth.admin.createUser({ email: body.email, password: body.password, email_confirm: true });
      if (r.error) return new Response(r.error.message, { status: 500 });
      id = r.data.user.id;
    }
    const role = await supabaseAdmin.from("user_roles").upsert({ user_id: id!, role: "admin" }, { onConflict: "user_id,role", ignoreDuplicates: true });
    if (role.error) return new Response(role.error.message, { status: 500 });
    return new Response(JSON.stringify({ ok: true, existed: !!existing }));
  } } },
});
