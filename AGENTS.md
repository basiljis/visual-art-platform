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
- Blog-type news selects published blog posts in the admin editor and stores their relative path in the existing news link field; manual links remain supported to avoid a separate relationship or duplicate navigation source.
- Media refs: bundled assets are stored as "site/…", "projects/…" or "asset:blog/…", uploads as "media:<path>" in the private media bucket served by /api/public/media/*; always resolve via src/lib/media.ts — workspace blocks public buckets.
- Imported blog media uses CDN pointer files resolved by the shared media helper; MP4 videos have WebM playback fallbacks, and the original-source manifest verifies complete photo coverage.
- Admin role is granted only by claim_admin() to the confirmed owner email — no client-side role checks.
- Blog subscriptions are inserted by a server function with the admin client; blog_subscribers has RLS on and no public policies.
- Purchase enquiries are saved by a server function (admin client) into purchase_enquiries (RLS on, no public policies); emailing them needs a mail connection.
- Self-hosted build (Timeweb): Dockerfile builds with NITRO_PRESET=node-server; Compose publishes edge 8082→8080 and pins app to 0.0.0.0:8080, matching nginx upstream — keep one documented port chain; server code must not depend on the service role key, which isn't available off-platform.
- Site typography is stored in site_content under typography, publicly loaded at the root and applied through scoped CSS tokens and block attributes; admin edits use existing admin-only RLS so choices persist for all visitors without changing admin fonts.
- Public SEO URLs and structured data use src/lib/seo.ts, not request origins; sitemap reads paginate with public access and fail explicitly to avoid proxy-host URLs and incomplete successful responses.
- Crawlable series and artwork pages supplement, not replace, the editorial homepage; artwork slugs include the stable database ID to avoid collisions, and only leaf routes emit canonicals.
- CV downloads are generated on demand in the browser from the current localized database biography with lazily loaded PDF fonts, so admin biography changes appear in subsequent downloads.
- Homepage design is selected in gallery_layout: portrait preserves the static self-portrait composition, while HomeCarousel owns the signature/introduction and uncropped Embla artwork composition; both headers use the editable header typography block and both designs open original works in the viewer.
- Mount SitePreloader once in the public root shell, without session flags, so full reloads replay it while internal navigation does not.
- Use shared artwork-availability rules for gallery and viewer purchase controls and sold markers, so unavailable works cannot expose an enquiry action on one surface only.
- Interior scenes define calibrated free-wall rectangles in the shared interior-layout module; fit artwork with original image proportions inside these rectangles and label reduced-scale previews so furniture is never overlapped.
- Legal document copy is shared in src/lib/legal.ts and displayed through an accessible Radix modal; keep legal text separate from gallery layout and never substitute a document for required consent collection.
- Admin drag ordering uses shared sortable handles and scope-slot reordering with explicit save to existing sort columns; this preserves other sections' positions and keeps database RLS authoritative.
- Visitor language is shared through LanguageProvider with browser persistence; translated database fields are editable in the existing admin panels, so navigation and content use one locale without changing admin language.
- Admin hover/focus hints are delegated through AdminHints around the admin shell; portal rendering keeps hints visible outside clipped editors and lists.
- Blog article HTML is rendered through BlogArticleBody: consecutive photo blocks become galleries with a shared article-wide lightbox, preserving prose, captions, media resolution and videos without rewriting stored content.
- The blog calendar filters loaded public posts client-side by local calendar day via blog-dates, combined with text search; no database date conversion is required.
- Visit statistics use a session-only random browser ID and an idempotent database RPC per content path, without IP addresses or service keys; only aggregate blog counts are public, and admin reports enforce has_role in the database.
- Gallery menu placement lives in site_content as gallery_layout, read through a public publishable-client function and saved in the settings admin panel under existing admin-only RLS; one navigation component serves both layouts, with the side layout stacking above artworks on narrow screens.
- SettingsPanel composes the existing layout, typography and statistics panels in accessible inner tabs under one admin tab; preserve editor drafts across inner-tab switches and keep persistence and access controls unchanged so moving controls does not alter site data.
- Scope admin typography through admin-typography and dedicated CSS tokens, with lower-specificity font rules than site previews; this isolates admin fonts while preserving editable visitor font samples.
- Futura PT font files are self-hosted in public/fonts and preloaded from the root head, so they load on every host (Lovable and Timeweb) without the asset proxy.
