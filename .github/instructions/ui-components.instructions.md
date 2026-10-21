---
description: "Use when creating or editing React components, pages, or layouts."
applyTo: "{components,app}/**/*.tsx"
---

# UI component rules

- Use TypeScript props types, Tailwind classes merged with `cn` from `@/lib/utils`, and existing `components/ui/` primitives.
- Keep components server components unless they need state, effects, or browser APIs; then add `"use client"`.
- Preserve accessibility (semantic elements, labels, focus states) and responsive behavior.
- Follow the nearest sibling component for structure and naming before introducing new patterns.
