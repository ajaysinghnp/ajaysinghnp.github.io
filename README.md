# Ajay Singh Portfolio

Personal portfolio and blog built with Next.js, MDX, and Tailwind CSS, designed to run behind Docker on an Oracle VPS or similar hosting environment such as Dockploy.

## Features

- Personal portfolio pages (`about`, `projects`, `resume`, `contact`)
- Blog support with MDX and Contentlayer
- Project showcase powered by GitHub API
- Automatically generated featured-project previews
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
PORT=3000
```

Why this helps:

- Raises the GitHub REST API rate limit for repository and README requests.
- Keep the token server-only. Do not rename it to `NEXT_PUBLIC_GITHUB_TOKEN` or commit a populated `.env.local` file.
- Use a token with only the read access needed for public repository metadata and contents.

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

- In command blocks, lines starting with `$`, `%`, `>`, `PS>`, `PS C:\path>`, or `C:\path>` are commands (shown with a prompt). Lines after a command ending in the continuation character (`\` generic, `` ` `` PowerShell, `^` cmd) continue it. Every other line is dimmed output. Indentation is preserved exactly as written. Commands are syntax-highlighted with Shiki (`bash`, `powershell`, or `bat` grammar depending on the fence) using the same light/dark themes as regular code blocks; output stays plain.
- Every terminal has a **Copy** button that copies the whole block as written (useful for reports). Command blocks that also contain output get a **Commands** button that copies only the commands, without prompts.
- The title bar shows `title="..."` when given, otherwise the fence language as written (for example `powershell`).

Other fence languages (for example `bash`) keep the regular highlighted code block. See `lib/remark-terminal.ts` and `components/mdx/terminal.tsx`.

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
