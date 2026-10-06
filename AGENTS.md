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

- Blog posts live in src/lib/blog-posts.json with images in src/assets/blog/, rendered by /blog and /blog/$slug routes — static content, no backend needed.
- Blog subscriptions are inserted by a server function with the admin client; blog_subscribers has RLS on and no public policies.
- Purchase enquiries are saved by a server function (admin client) into purchase_enquiries (RLS on, no public policies); emailing them needs a mail connection.
