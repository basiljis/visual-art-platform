import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Node, mergeAttributes } from "@tiptap/core";
import { useRef, useState } from "react";
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Quote, Link2, ImagePlus, Film, Undo2, Redo2, Minus } from "lucide-react";
import { uploadMedia } from "@/lib/admin-media";
import { mediaUrl } from "@/lib/media";

const Video = Node.create({
  name: "video",
  group: "block",
  atom: true,
  addAttributes() { return { src: { default: null } }; },
  parseHTML() { return [{ tag: "video" }]; },
  renderHTML({ HTMLAttributes }) { return ["video", mergeAttributes(HTMLAttributes, { controls: "true", playsinline: "true", preload: "metadata" })]; },
});

export function RichEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const [busy, setBusy] = useState(false);
  const imgInput = useRef<HTMLInputElement>(null);
  const vidInput = useRef<HTMLInputElement>(null);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, Image, Video, Link.configure({ openOnClick: false, HTMLAttributes: { target: "_blank", rel: "noreferrer" } }), Placeholder.configure({ placeholder: "Текст записи…" })],
    content: value,
    editorProps: { attributes: { class: "post-body min-h-[360px] px-5 py-5 outline-none" } },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });
  if (!editor) return <div className="min-h-[400px] border border-border" />;

  const upload = async (file: File, kind: "image" | "video") => {
    setBusy(true);
    try {
      const ref = await uploadMedia(file);
      const src = mediaUrl(ref);
      if (kind === "image") editor.chain().focus().setImage({ src }).run();
      else editor.chain().focus().insertContent({ type: "video", attrs: { src } }).run();
    } catch (e) { alert(e instanceof Error ? e.message : "Ошибка загрузки"); }
    finally { setBusy(false); }
  };
  const btn = (active: boolean) => `grid size-8 place-items-center transition-colors hover:text-red-accent ${active ? "bg-foreground text-background hover:text-background" : ""}`;
  const tools: [string, React.ReactNode, () => void, boolean][] = [
    ["Жирный", <Bold className="size-4" />, () => editor.chain().focus().toggleBold().run(), editor.isActive("bold")],
    ["Курсив", <Italic className="size-4" />, () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic")],
    ["Заголовок", <Heading2 className="size-4" />, () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive("heading", { level: 2 })],
    ["Подзаголовок", <Heading3 className="size-4" />, () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive("heading", { level: 3 })],
    ["Список", <List className="size-4" />, () => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList")],
    ["Нумерованный список", <ListOrdered className="size-4" />, () => editor.chain().focus().toggleOrderedList().run(), editor.isActive("orderedList")],
    ["Цитата", <Quote className="size-4" />, () => editor.chain().focus().toggleBlockquote().run(), editor.isActive("blockquote")],
    ["Разделитель", <Minus className="size-4" />, () => editor.chain().focus().setHorizontalRule().run(), false],
    ["Ссылка", <Link2 className="size-4" />, () => { const url = window.prompt("Адрес ссылки", editor.getAttributes("link")["href"] ?? "https://"); if (url === null) return; if (!url) editor.chain().focus().unsetLink().run(); else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run(); }, editor.isActive("link")],
    ["Фото", <ImagePlus className="size-4" />, () => imgInput.current?.click(), false],
    ["Видео", <Film className="size-4" />, () => vidInput.current?.click(), false],
    ["Отменить", <Undo2 className="size-4" />, () => editor.chain().focus().undo().run(), false],
    ["Повторить", <Redo2 className="size-4" />, () => editor.chain().focus().redo().run(), false],
  ];
  return (
    <div className="border border-border bg-background">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-border bg-background p-1.5">
        {tools.map(([label, icon, fn, active]) => <button key={label} type="button" onClick={fn} aria-label={label} title={label} className={btn(active)}>{icon}</button>)}
        {busy && <span className="ml-2 text-[10px] uppercase tracking-[.18em] text-red-accent">Загрузка…</span>}
      </div>
      <EditorContent editor={editor} />
      <input ref={imgInput} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f, "image"); e.target.value = ""; }} />
      <input ref={vidInput} type="file" accept="video/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f, "video"); e.target.value = ""; }} />
    </div>
  );
}
