<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the artist portfolio as a single editorial gallery experience; language and theme preferences remain browser-persisted because no backend is required.

- Gallery (categories, works) and blog posts live in the database, read through public server functions in src/lib/content.functions.ts and edited at /admin via the browser client under admin-only RLS (has_role) — keeps content editable without code changes.
- Media refs: bundled assets are stored as "site/…", "projects/…" or "asset:blog/…", uploads as "media:<path>" in the private media bucket served by /api/public/media/*; always resolve via src/lib/media.ts — workspace blocks public buckets.
- Imported blog media uses CDN pointer files resolved by the shared media helper; MP4 videos have WebM playback fallbacks, and the original-source manifest verifies complete photo coverage.
- Admin role is granted only by claim_admin() to the confirmed owner email — no client-side role checks.
- Blog subscriptions are inserted by a server function with the admin client; blog_subscribers has RLS on and no public policies.
- Purchase enquiries are saved by a server function (admin client) into purchase_enquiries (RLS on, no public policies); emailing them needs a mail connection.
- Self-hosted build (Timeweb): Dockerfile builds with NITRO_PRESET=node-server; edge/nginx proxies site + api.dikunova.art — server code must not depend on the service role key, which isn't available off-platform.
- Site typography is stored in site_content under typography, publicly loaded at the root and applied through scoped CSS tokens and block attributes; admin edits use existing admin-only RLS so choices persist for all visitors without changing admin fonts.
- Public SEO URLs and structured data use src/lib/seo.ts, not request origins; sitemap reads paginate with public access and fail explicitly to avoid proxy-host URLs and incomplete successful responses.
- The introductory artwork uses a static gallery self-portrait selected through the shared media resolver rather than an independent carousel, keeping the first-screen composition stable and the full work available in the viewer.
- Interior scenes define calibrated free-wall rectangles in the shared interior-layout module; fit artwork with original image proportions inside these rectangles and label reduced-scale previews so furniture is never overlapped.
- Legal document copy is shared in src/lib/legal.ts and displayed through an accessible Radix modal; keep legal text separate from gallery layout and never substitute a document for required consent collection.
