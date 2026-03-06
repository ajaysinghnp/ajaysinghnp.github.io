# Ajay Singh Portfolio

Personal portfolio and blog built with Next.js, MDX, and Tailwind CSS, and deployed as a static site with GitHub Pages.

## Features

- Personal portfolio pages (`about`, `projects`, `resume`, `contact`)
- Blog support with MDX and Contentlayer
- Project showcase powered by GitHub API
- Syntax-highlighted markdown content
- Theme support (light/dark/system)
- Static export for GitHub Pages hosting

## Tech Stack

- Next.js 16 (App Router)
- React + TypeScript
- Tailwind CSS
- Contentlayer + MDX
- SWR + Axios
- Lucide icons

## Project Structure

```text
app/            Routes and pages
components/     Reusable UI and page components
data/           Static content/configuration
lib/            API/data helpers and utilities
providers/      Context providers (theme, etc.)
public/         Static assets
types/          TypeScript types
```

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Start development server

```bash
npm run dev
```

Open `http://localhost:3000`.

### 3. Build for production

```bash
npm run build
```

## Environment Variables

Create a `.env.local` file for optional authenticated GitHub requests:

```bash
GITHUB_TOKEN=your_github_personal_access_token
```

Why this helps:

- Improves GitHub API rate limits
- Makes project/readme fetching more reliable

## Content and Blog

- Blog content is MDX-driven and processed with Contentlayer.
- GitHub project data is fetched from the GitHub REST API.
- Project README content is fetched via `/repos/{owner}/{repo}/readme` endpoint for better compatibility.

## Deployment

This repository is configured for static export:

- `next.config.mjs` uses `output: "export"`
- Output directory is `build/`

Deploy the generated static files to GitHub Pages from your chosen branch/workflow.

## Scripts

- `npm run dev` - Start local development server
- `npm run build` - Create production build/export
- `npm run start` - Start Next.js server mode (not typically used for static pages)
- `npm run lint` - Run lint checks

## License

Licensed under the [MIT License](LICENSE).
