# Ajay Singh Portfolio

Personal portfolio and blog built with Next.js, MDX, and Tailwind CSS, designed to run behind Docker on an Oracle VPS or similar hosting environment such as Dockploy.

## Features

- Personal portfolio pages (`about`, `projects`, `resume`, `contact`)
- Blog support with MDX and Contentlayer
- Project showcase powered by GitHub API
- Automatically generated featured-project previews
- Global search across site pages, project READMEs, blog posts, and cheatsheets, with source, category, and tag filters
- Feedback form (`Ctrl/⌘+F` on any page, or the contact page button) with live validation, a Markdown editor, and delivery to an n8n webhook
- Syntax-highlighted markdown content
- Shared post detail page with a sticky table of contents that follows the active heading, a gradient reading-progress bar, and floating go-to-top/bottom buttons
- Callouts (GitHub-style alerts) and step timelines in markdown content
- Responsive layout: wider content area on small screens, and the table of contents collapses when the content area gets narrow
- Theme support (light/dark/system)
- Production-ready Docker deployment for a VPS

## Tech Stack

- Next.js 16 (App Router)
- Playwright Chromium for build-time project previews
- React + TypeScript
- Tailwind CSS
- Contentlayer + MDX
- SWR + Axios
- Lucide icons
- pnpm package manager

## Project Structure

```text
app/            Routes and pages
components/     Reusable UI and page components
data/           Static content/configuration
lib/            API/data helpers and utilities
providers/      Context providers (theme, etc.)
public/         Static assets
types/          TypeScript types
Dockerfile      Container build for VPS/Dockploy deployment
```

## Local Development

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start development server

```bash
pnpm run dev
```

The first run installs Playwright Chromium if needed, starts the local site, and captures separate light- and dark-theme previews of the local development homepage when the selected featured repository is this portfolio. The preview browser bar continues to show the repository's public homepage URL. Production builds capture the public homepage when configured, otherwise the GitHub repository page. Generated images and their version manifest are stored in the ignored `public/generated-project-previews/` directory.

Open `http://localhost:3000`.

## Global Search

Open search with the magnifying-glass button beside GitHub and the theme switcher in the navigation, or press `⌘K` on macOS and `Ctrl+K` on Windows/Linux. The shortcut works from anywhere on the site. Search covers the home, about, resume, and contact pages; public projects and their READMEs; published blog posts; and cheatsheets. Results include a matching excerpt; up to 12 results are shown.

Type ordinary words to search across the whole site:

```text
nextjs deployment
```

Use `type:` to limit a search to one content type:

```text
type:blog docker
type:project automation
type:cheatsheet git
type:page resume
```

Supported type values are `page` (`pages`, `site`), `project` (`projects`), `blog` (`blogs`, `post`, `posts`), and `cheatsheet` (`cheatsheets`). A type can be used alone, such as `type:blog`, to browse only that source.

Use a source prefix with `@` for categories and `#` for tags. Add words after the filter to search within the matching category or tag:

```text
blog:@development docker
blog:#windows netsh
cheatsheet:@smart-home switch
cheatsheet:#git workflows
pages:@about
pages:#automation
projects:@open-source
projects:#calendar
```

Category values match a category segment or path prefix, so `blog:@development` also includes nested categories such as `development/nextjs`. Tags match case-insensitively against a whole tag. Blog and cheatsheet categories and tags come from their content metadata; project tags are individual words from repository names (for example, `projects:#calendar` matches calendar repositories); and pages use their route categories and assigned keywords. Use quotes to keep a multiword phrase together, for example `type:blog "production image"`.

While the palette is open, use the up/down arrow keys to move through results and press `Enter` to open the selected result. The active result stays visible as the list scrolls; navigation stops at the first and last result. Press `Escape` to close the palette. Search data is built server-side and cached; content webhook updates refresh the index.

### 3. Build for production

```bash
pnpm run build
```

### 4. Run production server

```bash
pnpm run start
```

## Environment Variables

Create a `.env.local` file for authenticated server-side GitHub API requests:

```bash
GITHUB_TOKEN=your_read_only_github_token
N8N_FEEDBACK_WEBHOOK_URL=https://your-n8n-host/webhook/your-feedback-path
N8N_FEEDBACK_WEBHOOK_SECRET=your_shared_secret
PORT=3000
```

Why this helps:

- Raises the GitHub REST API rate limit for repository and README requests.
- Keep the token server-only. Do not rename it to `NEXT_PUBLIC_GITHUB_TOKEN` or commit a populated `.env.local` file.
- Use a token with only the read access needed for public repository metadata and contents.
- `N8N_FEEDBACK_WEBHOOK_URL` is required for the feedback form; without it `/api/feedback` returns `500 Not configured`. `N8N_FEEDBACK_WEBHOOK_SECRET` is optional and, when set, is sent as the `x-webhook-secret` header so n8n can reject other callers. Both are server-only. Restart the server after changing env vars.

## Feedback Form

Open the feedback form with `Ctrl+F` / `⌘F` on any page (this replaces the browser's find while on the site) or with the **Share feedback** button on the contact page. The shortcut is ignored while another dialog, such as search, is open.

The form collects an optional name, an optional email, and a required message (3 to 4000 characters) written in Markdown. Fields validate live and show a checklist of rules as you type. The editor toolbar offers normal text, H1/H2, bold, italic, strikethrough, code, link, image, quote, lists, and tables, plus a Write/Preview toggle. Previews render GitHub-flavoured Markdown, never raw HTML, and only `https://` images.

### Draft saving

While you type, the draft is saved in the browser's local storage on that device only (keys `feedback-draft:v1` and `feedback-draft-pref:v1`). It is restored on the next visit and deleted after a successful send or when the visitor discards it. A checkbox in the form turns saving off and deletes any stored draft. The form tells visitors this and that sent feedback is forwarded to a private automation workflow. Review the wording against your privacy policy and local consent rules before relying on it.

### Submission flow

```text
Browser form  ->  POST /api/feedback  ->  n8n webhook  ->  Discord alert + stored for nightly email digest
```

`app/api/feedback/route.ts` runs on the server, so the n8n URL is never exposed to the browser. It:

- Rejects bodies over 8 KB (`413`) and invalid JSON (`400`).
- Silently accepts submissions that fill the hidden honeypot field without forwarding them.
- Limits each IP to 3 submissions per 10 minutes (`429`). The limiter is in-memory per server instance, so it is best-effort only.
- Validates the message length and email format (`400`). Keep the email rules in `components/sections/feedback-dialog.tsx` and the route's regex in sync.
- Forwards `{ message, name, email, submittedAt, source: "contact-page" }` to n8n with a 10 second timeout, returning `502` if n8n is unreachable or answers with a non-2xx status.

The `message` is raw Markdown and all fields are untrusted. The n8n workflow should respond `2xx` quickly, post an immediate Discord alert (with mentions disabled), store the item, and send a nightly email digest through Resend, deleting stored items only after the email succeeds. Test the endpoint locally with:

```bash
curl -X POST http://localhost:3000/api/feedback \
  -H 'Content-Type: application/json' \
  -d '{"message":"Test feedback","name":"Tester","email":""}'
```

### Reusable pieces

- `components/sections/feedback-dialog.tsx`: the global dialog, mounted in the navigation.
- `components/sections/feedback-trigger.tsx`: a button that opens the dialog from any page.
- `components/ui/validated-field.tsx`: input with rule checklist and valid/invalid states.
- `components/ui/markdown-toolbar.tsx` and `components/ui/markdown-preview.tsx`: Markdown editing and preview.
- `.mac-dot` classes in `app/globals.css`: the glass macOS window controls, also used by terminal blocks.

## Content and Blog

- Blog content is MDX-driven and processed with Contentlayer.
- GitHub project data is fetched from the GitHub REST API.
- Project README content is fetched via `/repos/{owner}/{repo}/readme` endpoint for better compatibility.

### Writing content

Blog, cheatsheet, and project content share one detail page. Besides standard GitHub-flavored markdown, math, Mermaid diagrams, and highlighted code blocks, the following are supported.

#### Callouts

Use GitHub-style alerts. Supported types are `NOTE`, `TIP`, `IMPORTANT`, `WARNING`, and `CAUTION` (case-insensitive):

```md
> [!WARNING]
> This action cannot be undone.
```

The marker must be the first line of the blockquote. A regular blockquote without a marker renders as before. Each type has its own colour and an icon shown before the title (Note: info, Tip: lightbulb, Important: message, Warning: triangle, Caution: octagon). The rendering lives in `lib/remark-callouts.ts` and its styles and icons in `app/globals.css` (`.callout-*`).

#### Steps

A top-level numbered list with two or more items renders as a step timeline:

```md
1. Install dependencies
2. Start the dev server
3. Open the site
```

Nested numbered lists and the generated table of contents are not affected. See `lib/remark-steps.ts`.

#### Terminal blocks

Fenced code blocks tagged `term`, `terminal`, `output`, `text`, `powershell` (`pwsh`), or `bat` (`cmd`) render as a terminal window (title bar, prompt styling, copy button) instead of a syntax-highlighted block. Colours come from the site theme, so it follows light and dark mode:

````md
```terminal title="zsh"
$ pnpm install
Done in 1.2s
```

```powershell
PS C:\> Get-ChildItem
```

```output
Compiled successfully
```
````

| Fence                | Look                                              | Treated as        |
| -------------------- | ------------------------------------------------- | ----------------- |
| `term`, `terminal`   | Generic window (traffic-light dots)               | Commands + output |
| `output`, `text`     | Generic window                                    | Output only       |
| `powershell`, `pwsh` | Windows-style window (`PS` icon, window controls) | Commands + output |
| `bat`, `cmd`         | Windows-style window (`>_` icon, window controls) | Commands + output |

- In command blocks, lines starting with `$`, `%`, `>`, `PS>`, `PS C:\path>`, or `C:\path>` are commands (shown with a prompt). `$` and `%` only count as prompts in generic shells and when followed by a space, so PowerShell scripts with `$variables` render as plain highlighted scripts. Lines after a command continue it when it ends with the continuation character (`\` generic, `` ` `` PowerShell, `^` cmd) or a pipe/`&&`/`||`, or while quotes, brackets, shell blocks (`for`/`if`/`case` ... `done`/`fi`/`esac`) or heredocs are still open. Comment lines (`#`, `REM`, `::`) are commands too. If a block has no prompts at all, every line is treated as a command and highlighted. Every other line is dimmed output. Indentation is preserved exactly as written. Commands are syntax-highlighted with Shiki (`bash`, `powershell`, or `bat` grammar depending on the fence) using the same light/dark themes as regular code blocks; output stays plain.
- Every terminal has a **Copy** button that copies the whole block as written (useful for reports). Command blocks that also contain output get a **Commands** button that copies only the commands, without prompts.
- The title bar shows `title="..."` when given, otherwise the fence language as written (for example `powershell`).

Other fence languages (for example `bash`) keep the regular highlighted code block, now with a VS Code-style editor tab header showing the fence language (hidden when no language is given). See `lib/remark-terminal.ts` and `components/mdx/terminal.tsx`.

#### Tables

Standard GFM tables render inside a themed card: accent header row, zebra rows with a hover highlight, column alignment (`:---`, `:---:`, `---:`) respected, and horizontal scrolling inside the card when a table is wider than the content area. See `components/mdx/mdx-components.tsx` and the `.table-wrapper` styles in `app/globals.css`.

#### Layout behavior

- The table of contents sidebar keeps the active heading in view while scrolling, and collapses into an "On this page" dropdown when the content area is narrower than 56rem.
- Code blocks wrap long lines on screens 768px wide or narrower.
- Page width is controlled by the `site-width` utility in `app/globals.css` (80% by default, up to 95% on tablets, 100% on the smallest screens).

## Deployment

This repository is configured for container-based deployment on a VPS such as Oracle Cloud, and is intended for use with Dockploy.

- `next.config.mjs` uses `output: "standalone"`
- The app is served via a Node.js runtime in Docker
- The Docker image can be deployed directly through Dockploy

## Scripts

- `pnpm run dev` - Start local development server
- `pnpm run build` - Create production build
- `pnpm run start` - Start the production Next.js server
- `pnpm run lint` - Run lint checks

## License

Licensed under the [MIT License](LICENSE).
