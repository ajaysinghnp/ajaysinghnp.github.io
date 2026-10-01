# Ajay Singh Portfolio

Personal portfolio and blog built with Next.js, MDX, and Tailwind CSS, designed to run behind Docker on an Oracle VPS or similar hosting environment such as Dockploy.

## Features

- Personal portfolio pages (`about`, `projects`, `resume`, `contact`)
- Blog support with MDX and Contentlayer
- Project showcase powered by GitHub API
- Syntax-highlighted markdown content
- Theme support (light/dark/system)
- Production-ready Docker deployment for a VPS

## Tech Stack

- Next.js 16 (App Router)
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

Create a `.env.local` file for optional authenticated GitHub requests:

```bash
GITHUB_TOKEN=your_github_personal_access_token
PORT=3000
```

Why this helps:

- Improves GitHub API rate limits
- Makes project/readme fetching more reliable

## Content and Blog

- Blog content is MDX-driven and processed with Contentlayer.
- GitHub project data is fetched from the GitHub REST API.
- Project README content is fetched via `/repos/{owner}/{repo}/readme` endpoint for better compatibility.

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
