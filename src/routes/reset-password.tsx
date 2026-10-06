import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Новый пароль — Наталья Дикунова" },
    { name: "description", content: "Установка нового пароля администратора." },
    { property: "og:title", content: "Новый пароль — Наталья Дикунова" },
    { property: "og:description", content: "Установка нового пароля администратора." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ]}),
  component: ResetPassword,
});

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const nav = useNavigate();
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setMsg(error.message); else nav({ to: "/admin" });
  };
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 text-foreground">
      <form onSubmit={submit} className="w-full max-w-sm space-y-6">
        <h1 className="font-display text-4xl">Новый пароль</h1>
        <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border-b border-border bg-transparent py-2 text-sm outline-none focus:border-red-accent" placeholder="Минимум 8 символов" />
        {msg && <p className="text-sm text-red-accent">{msg}</p>}
        <button className="bg-foreground px-5 py-3 text-xs uppercase tracking-[.18em] text-background">Сохранить</button>
      </form>
    </main>
  );
}
