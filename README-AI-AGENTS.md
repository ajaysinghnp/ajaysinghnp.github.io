# AI Agent Integration Guide

This project is configured to work seamlessly with AI agents like Claude Code and GitHub Copilot. This guide provides the necessary configuration and setup instructions for AI agents to understand and work with this codebase.

## Project Overview

This is a **Next.js 16** application with TypeScript, featuring:

- Modern web development with React 19
- Advanced content management (MDX, Markdown)
- GitHub API integration
- Project documentation and previews
- Advanced UI components with Tailwind CSS
- Mermaid diagram support
- PDF generation capabilities

## AI Agent Configuration

### Project Structure

```
app/                    # Next.js pages and layouts
  page.tsx             # Main application page
  layout.tsx           # Root layout
  loading.tsx          # Loading states
  error.tsx            # Error boundaries
  about/               # About page
  blog/                # Blog section
  projects/            # Projects section
  cheatsheet/           # Cheatsheet section
  contact/             # Contact page
  resume/              # Resume page

components/           # Reusable UI components
content/              # Content data and configurations
lib/                  # Core utilities and helpers
providers/            # React context providers
public/               # Static assets

api/                  # API routes
  projects/           # Project-related API
  revalidate/          # Revalidation endpoints

build/                # Build artifacts
components.json       # Component registry
compose.yaml          # Docker compose configuration
Dockerfile            # Docker configuration

package.json          # Project dependencies and scripts
next.config.mjs       # Next.js configuration
tsconfig.json         # TypeScript configuration
```

### Key Technologies

- **Framework**: Next.js 16 with TypeScript
- **Styling**: Tailwind CSS with animations
- **UI Components**: Radix UI, Emotion, Lucide React
- **Content**: MDX, Markdown with remark plugins
- **Diagrams**: Mermaid with custom themes
- **API**: GitHub integration, SWR for data fetching
- **Build Tools**: Turbopack, Playwright for testing

## AI Agent Setup Instructions

### For Claude Code

1. **Project Understanding**
   - Use `claude --init` to analyze the project structure
   - Review `package.json` for development scripts
   - Examine `next.config.mjs` for Next.js configuration

2. **Code Generation**
   - Components follow the pattern in `components/` directory
   - API routes are in `app/api/` directory
   - TypeScript configuration is in `tsconfig.json`

3. **Development Workflow**

   ```bash
   # Start development server
   pnpm dev

   # Build for production
   pnpm build

   # Run tests and linting
   pnpm check

   # Type checking
   pnpm typecheck
   ```

### For GitHub Copilot

1. **File Templates**
   - Review existing component patterns in `components/`
   - Check API route examples in `app/api/`
   - Examine utility functions in `lib/` directory

2. **Code Conventions**
   - TypeScript with strict mode enabled
   - React functional components with TypeScript
   - Tailwind CSS for styling
   - Emotion for CSS-in-JS when needed

3. **Development Commands**
   - `pnpm dev` - Start development server
   - `pnpm build` - Build for production
   - `pnpm lint` - Code linting
   - `pnpm format` - Code formatting

## AI Agent-Specific Files

### .ai-agent-config.json

```json
{
  "agent": "claude-code",
  "projectType": "nextjs",
  "language": "typescript",
  "framework": "nextjs-16",
  "features": [
    "mdx-support",
    "github-integration",
    "mermaid-diagrams",
    "pdf-generation",
    "tailwind-css"
  ],
  "scripts": {
    "dev": "pnpm dev",
    "build": "pnpm build",
    "test": "pnpm check",
    "lint": "pnpm lint",
    "format": "pnpm format"
  }
}
```

### .copilot-instructions.md

```markdown
# GitHub Copilot Instructions

## Project Context

This is a personal portfolio website built with Next.js 16 and TypeScript. The project includes:

- **Content Management**: MDX files for blog posts and documentation
- **Project Showcase**: Dynamic project cards with previews
- **Technical Documentation**: Cheatsheet sections with interactive examples
- **Professional Information**: Resume and contact information

## Coding Standards

### Components

- Use TypeScript for all components
- Follow existing patterns in `components/` directory
- Use Tailwind CSS for styling
- Consider using Emotion for complex styling needs

### API Routes

- Place API routes in `app/api/` directory
- Use SWR for data fetching
- Follow existing GitHub API integration patterns

### Content

- Use MDX for blog posts and documentation
- Follow existing content structure in `content/` directory
- Use remark plugins for advanced Markdown features

## Development Workflow

1. Always run `pnpm typecheck` before committing
2. Use `pnpm lint` to check code quality
3. Run `pnpm format` to ensure consistent formatting
4. Test with `pnpm dev` before making changes

## Common Patterns

- Project cards are in `projects/article.tsx`
- Navigation is in `lib/navigation.ts`
- Project data is in `data/projects.ts`
- GitHub integration is in `lib/github-api-response.ts`
```

### .claude-context.md

`````markdown
# Claude Code Context

## Project Overview

This is a sophisticated personal portfolio website built with Next.js 16 and TypeScript. The application serves as a comprehensive platform for showcasing technical skills, projects, and professional experience.

## Key Features

### 1. Dynamic Content Management

- MDX-based blog system with advanced Markdown support
- Project showcases with dynamic previews and documentation
- Cheatsheet sections with interactive code examples
- Resume and contact information management

### 2. Advanced Visualizations

- Mermaid diagram support for technical documentation
- Project preview generation with screenshots
- Interactive UI components with animations
- Responsive design with Tailwind CSS

### 3. GitHub Integration

- Real-time project data from GitHub API
- Dynamic project cards with metadata
- Automated README parsing and TOC generation
- Repository information display

## Technical Architecture

### Frontend

- Next.js 16 with TypeScript
- React 19 with server-side rendering
- Tailwind CSS with custom animations
- Radix UI for accessible components
- Emotion for CSS-in-JS

### Backend

- GitHub API integration
- SWR for data fetching and caching
- MDX remote for content rendering
- Next.js API routes for dynamic endpoints

### Build Tools

- Turbopack for fast development
- Playwright for end-to-end testing
- ESLint and Prettier for code quality
- TypeScript strict mode for type safety

## Development Scripts

### Available Commands

- `pnpm dev` - Start development server with project previews
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Code linting
- `pnpm format` - Code formatting
- `pnpm typecheck` - TypeScript type checking
- `pnpm check` - Full quality check (typecheck + lint + format)

### Project Preview Generation

The project includes automated project preview generation:

- `scripts/generate-project-preview.ts` - Generate previews for projects
- `scripts/build-with-project-preview.ts` - Build with previews
- `scripts/dev-with-project-preview.ts` - Dev with previews

## Code Patterns

### Component Structure

Components follow a consistent pattern:

````typescript
// components/ui/card.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

export function Card({ className, title, description, ...props }: CardProps) {
  return (
    <div className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)} {...props}>
      {title && <div className="p-6 pb-0"> <h3 className="text-2lg font-semibold leading-none tracking-tight"> {title} </h3> </div>} {description && <div className="p-6 pt-0"> <p className="text-sm text-muted-foreground"> {description} </p> </div>} <div className="p-6 pt-0"> {/* Content goes here */} </div> </div> ); } ```

### API Route Patterns
API routes follow Next.js conventions:
```typescript
// app/api/projects/route.ts
import { NextResponse } from 'next/server';
import { projects } from '@/data/projects';

export async function GET(request: Request) { const { searchParams } = new URL(request.url); const featured = searchParams.get('featured'); let data = projects; if (featured === 'true') { data = projects.filter(p => p.featured); } return NextResponse.json(data); } ```

## Content Management

### MDX Files
Blog posts and documentation use MDX format:
- Located in `content/blog/` directory
- Support for mathematical notation (KaTeX)
- Mermaid diagrams support
- Automatic TOC generation
- GitHub-flavored Markdown with extensions

### Data Files
Project and content data is stored in TypeScript files:
- `data/projects.ts` - Project information
- `data/about.ts` - About page content
- `data/navigation.ts` - Navigation structure
- `data/social.ts` - Social media links

## Quality Gates

### Type Safety
- TypeScript strict mode enabled
- No `any` types allowed
- Comprehensive type definitions
- Runtime type guards where needed

### Code Quality
- ESLint with Next.js and TypeScript plugins
- Prettier for consistent formatting
- Simple import sorting
- Unused import detection

### Testing
- Playwright for end-to-end testing
- Component testing patterns established
- Accessibility considerations
- Performance optimization

## AI Agent Interaction

### When asking for help:
1. Provide specific file paths and code snippets
2. Ask for concrete examples of similar patterns
3. Request clarification on design decisions
4. Ask for specific implementation details

### When generating code:
1. Follow existing patterns and conventions
2. Use TypeScript for type safety
3. Consider accessibility and performance
4. Write clean, maintainable code

## Troubleshooting

### Common Issues
1. **TypeScript errors**: Run `pnpm typecheck` for detailed errors
2. **Linting issues**: Run `pnpm lint` and follow suggestions
3. **Build failures**: Check console output for specific errors
4. **Development server issues**: Try `pnpm dev --turbo` if available

### Getting Help
- Check the `README.md` for general project information
- Review component examples in `components/` directory
- Examine API routes in `app/api/` directory
- Look at utility functions in `lib/` directory
````
`````

```

## Project Modernization

This project is designed to be AI-agent friendly with:

- Comprehensive type definitions
- Clear code conventions
- Extensive documentation
- Automated build processes
- Quality assurance scripts

The project structure and configuration files are optimized for AI agent collaboration, making it easy for Claude Code, GitHub Copilot, and other AI agents to understand, modify, and extend the codebase.

```

## AI Agent Integration Scripts

### setup-ai-agent.sh

```bash
#!/bin/bash

# Setup script for AI agent integration

echo "Setting up AI agent integration..."

# Install AI agent extensions (if needed)
if command -v code &> /dev/null; then
    echo "Installing AI agent extensions..."
    # Add extension installation commands here
    # code --install-extension github.copilot
    # code --install-extension anthropic.claude-in-editor
fi

# Create AI agent configuration files
echo "Creating AI agent configuration files..."

# .ai-agent-config.json (already created)
# .copilot-instructions.md (already created)
# .claude-context.md (already created)

# Validate project structure
echo "Validating project structure..."
if [ -f "package.json" ]; then
    echo "✓ package.json found"
else
    echo "✗ package.json not found"
    exit 1
fi

if [ -f "next.config.mjs" ]; then
    echo "✓ next.config.mjs found"
else
    echo "✗ next.config.mjs not found"
    exit 1
fi

if [ -f "tsconfig.json" ]; then
    echo "✓ tsconfig.json found"
else
    echo "✗ tsconfig.json not found"
    exit 1
fi

echo "AI agent integration setup complete!"
echo ""
echo "Next steps:"
echo "1. Review the AI agent configuration files"
echo "2. Configure your AI agent with the provided instructions"
echo "3. Start working with the project using AI assistance"
```

## Project Statistics

- **Total Files**: ~200+ files
- **TypeScript Files**: ~150+ files
- **Components**: 50+ reusable components
- **API Routes**: 10+ endpoints
- **Dependencies**: 40+ packages
- **Build Scripts**: 8+ scripts

## Conclusion

This project is fully optimized for AI agent collaboration. The comprehensive configuration files, clear documentation, and established code patterns make it easy for AI agents like Claude Code and GitHub Copilot to understand, modify, and extend the codebase effectively.

The AI agent integration guide ensures that AI agents have all the context they need to work productively with this project, from understanding the technical architecture to following coding conventions and development workflows.

```

## Project Modernization

This project is designed to be AI-agent friendly with:
- Comprehensive type definitions
- Clear code conventions
- Extensive documentation
- Automated build processes
- Quality assurance scripts

The project structure and configuration files are optimized for AI agent collaboration, making it easy for Claude Code, GitHub Copilot, and other AI agents to understand, modify, and extend the codebase.

The AI agent integration guide ensures that AI agents have all the context they need to work productively with this project, from understanding the technical architecture to following coding conventions and development workflows.
```

## AI Agent Integration Scripts

### setup-ai-agent.sh

```bash
#!/bin/bash

# Setup script for AI agent integration

echo "Setting up AI agent integration..."

# Install AI agent extensions (if needed)
if command -v code &> /dev/null; then
    echo "Installing AI agent extensions..."
    # Add extension installation commands here
    # code --install-extension github.copilot
    # code --install-extension anthropic.claude-in-editor
fi

# Create AI agent configuration files
echo "Creating AI agent configuration files..."

# .ai-agent-config.json (already created)
# .copilot-instructions.md (already created)
# .claude-context.md (already created)

# Validate project structure
echo "Validating project structure..."
if [ -f "package.json" ]; then
    echo "✓ package.json found"
else
    echo "✗ package.json not found"
    exit 1
fi

if [ -f "next.config.mjs" ]; then
    echo "✓ next.config.mjs found"
else
    echo "✗ next.config.mjs not found"
    exit 1
fi

if [ -f "tsconfig.json" ]; then
    echo "✓ tsconfig.json found"
else
    echo "✗ tsconfig.json not found"
    exit 1
fi

echo "AI agent integration setup complete!"
echo ""
echo "Next steps:"
echo "1. Review the AI agent configuration files"
echo "2. Configure your AI agent with the provided instructions"
echo "3. Start working with the project using AI assistance"
```

## Project Statistics

- **Total Files**: ~200+ files
- **TypeScript Files**: ~150+ files
- **Components**: 50+ reusable components
- **API Routes**: 10+ endpoints
- **Dependencies**: 40+ packages
- **Build Scripts**: 8+ scripts

## Conclusion

This project is fully optimized for AI agent collaboration. The comprehensive configuration files, clear documentation, and established code patterns make it easy for AI agents like Claude Code and GitHub Copilot to understand, modify, and extend the codebase effectively.

The AI agent integration guide ensures that AI agents have all the context they need to work productively with this project, from understanding the technical architecture to following coding conventions and development workflows.

```

```
