import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { ArrowLeft, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { NewsPanel } from "@/components/admin/NewsPanel";
import { CategoriesPanel, WorksPanel, BlogPanel, EnquiriesPanel, SubscribersPanel, AboutPanel, field, label, primaryBtn } from "@/components/admin/Panels";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Администрирование — Наталья Дикунова" },
    { name: "description", content: "Управление направлениями, работами и блогом." },
    { property: "og:title", content: "Администрирование — Наталья Дикунова" },
    { property: "og:description", content: "Управление направлениями, работами и блогом." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ]}),
  component: AdminPage,
});


function Shell({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur md:px-8">
        <Link to="/" className="flex items-center gap-2 text-xs uppercase tracking-[.18em] hover:text-red-accent"><ArrowLeft className="size-4" />Сайт</Link>
        <p className="font-display text-sm tracking-[.16em] sm:text-base">ДИКУНОВА <span className="font-sans text-red-accent">/</span> <span className="font-sans text-xs tracking-[.2em] text-muted-foreground">admin</span></p>
        <div className="flex min-w-16 justify-end">{right}</div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">{children}</div>
    </main>
  );
}

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState<"categories" | "works" | "blog" | "about" | "news" | "enquiries" | "subscribers">("works");
  const qc = useQueryClient();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    return () => sub.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!session) { setIsAdmin(null); return; }
    supabase.rpc("claim_admin").then(({ data }) => setIsAdmin(!!data));
  }, [session?.user.id]);

  const signOut = async () => { await supabase.auth.signOut(); qc.clear(); };

  if (loading) return <Shell><p className="text-sm text-muted-foreground">Загрузка…</p></Shell>;
  if (!session) return <Shell><Login /></Shell>;
  const out = <button onClick={signOut} aria-label="Выйти" title="Выйти" className="hover:text-red-accent"><LogOut className="size-4" /></button>;
  if (isAdmin === null) return <Shell right={out}><p className="text-sm text-muted-foreground">Проверка доступа…</p></Shell>;
  if (!isAdmin) return <Shell right={out}><p className="max-w-md text-sm">У этой учётной записи ({session.user.email}) нет доступа к панели.</p></Shell>;

  const tabs = [["works", "Работы"], ["categories", "Направления"], ["blog", "Блог"], ["about", "Об авторе"], ["news", "Новости"], ["enquiries", "Заявки"], ["subscribers", "Подписки"]] as const;
  return (
    <Shell right={out}>
      <nav className="mb-10 flex flex-wrap gap-x-6 gap-y-1 border-b border-border">
        {tabs.map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={`-mb-px border-b pb-2 font-display text-lg transition-opacity md:text-2xl ${tab === k ? "border-red-accent opacity-100" : "border-transparent opacity-40 hover:opacity-100"}`}>{l}</button>)}
      </nav>
      {tab === "categories" && <CategoriesPanel />}
      {tab === "works" && <WorksPanel />}
      {tab === "blog" && <BlogPanel />}
      {tab === "about" && <AboutPanel />}
      {tab === "news" && <NewsPanel />}
      {tab === "enquiries" && <EnquiriesPanel />}
      {tab === "subscribers" && <SubscribersPanel />}
    </Shell>
  );
}

function Login() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setMsg(null);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message === "Invalid login credentials" ? "Неверный email или пароль." : error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } });
      setMsg(error ? error.message : "Письмо с подтверждением отправлено. Перейдите по ссылке и войдите.");
    }
    setBusy(false);
  };
  const reset = async () => {
    if (!email) { setMsg("Введите email."); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    setMsg(error ? error.message : "Ссылка для смены пароля отправлена на почту.");
  };
  return (
    <form onSubmit={submit} className="mx-auto mt-10 max-w-sm space-y-6">
      <h1 className="font-display text-4xl">{mode === "in" ? "Вход" : "Регистрация"}</h1>
      <div><label className={label}>Email</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={field} autoComplete="email" /></div>
      <div><label className={label}>Пароль</label><input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={field} autoComplete={mode === "in" ? "current-password" : "new-password"} /></div>
      {msg && <p className="text-sm text-red-accent">{msg}</p>}
      <button disabled={busy} className={primaryBtn}>{mode === "in" ? "Войти" : "Создать аккаунт"}</button>
      <div className="flex justify-between text-xs text-muted-foreground">
        <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="underline underline-offset-4 hover:text-foreground">{mode === "in" ? "Первый вход — регистрация" : "Уже есть аккаунт"}</button>
        {mode === "in" && <button type="button" onClick={reset} className="underline underline-offset-4 hover:text-foreground">Забыли пароль?</button>}
      </div>
    </form>
  );
}
