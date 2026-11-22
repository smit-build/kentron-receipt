# Kentron Receipt — Project Instructions

## What this is

Front-end clone of **Receipt**, Kentron's agent-governance console. Kentron is an
AI-agent governance platform (LLM Gateway, MCP Gateway, Agent Harness, Agent
Governance — Guard / Catalog / Core). Receipt is the product surface: an "AI
coworker" where every agent action is cryptographically logged and replayable.

This repo builds **one screen**: the MCP Gateway → Workspace → Overview page
(sidebar + topbar + Connect-an-MCP-client card + Integrations tab), cloned from
`Receipt - Individual MCP Workspace.html` and the product screenshot supplied
at kickoff.

## Scope & role

- **Frontend only.** No backend, no real auth, no live MCP connections. All
  data is static/mock (`src/lib/integrations.ts`).
- Built for a product designer working solo on the frontend — optimize for
  fast iteration on layout/visual details, not for wiring real APIs.
- One screen today (Overview / Integrations tab). Other tabs (LLM keys,
  Dashboard, Live activity, Settings) are stubbed as empty panes — do not
  flesh them out unless asked.

## Tech stack

- **Vite + React 19 + TypeScript**, SPA (no router — single screen).
- **Tailwind CSS v4** (`@tailwindcss/vite` plugin, CSS-first config, no
  `tailwind.config.js`).
- **shadcn/ui** (`radix` base, `nova` style, neutral/grayscale theme) — see
  `components.json`. Components live in `src/components/ui/`, are generated
  via the CLI, and should be re-added/updated via `npx shadcn@latest add` /
  `--diff`, not hand-edited unless customizing intentionally.
- **hugeicons-react** for icons (`iconLibrary: hugeicons` in `components.json`).
- Path alias `@/*` → `src/*`.

## Commands

```bash
npm run dev       # start dev server (localhost:5173)
npm run build     # tsc -b && vite build
npx tsc -b --noEmit   # type-check only
npx shadcn@latest add <component>   # add a new shadcn component
```

Node 20.18 on this machine sits one patch below shadcn's stated minimum
(20.18.1) — it still works, just ignore the `EBADENGINE` warnings from npm.
Vite is pinned to **v6** (not the v8/rolldown default from `create-vite`) —
the rolldown native binding is broken on this Windows/Node combo. Don't
upgrade vite past v6 without confirming the rolldown binding issue is fixed.

## Design rules

Full visual spec lives in `DESIGN.md`. Headline rules:

- **Strict black & white.** No color accents anywhere except the semantic
  destructive (red) used only for "Disconnect" actions. Status is conveyed by
  weight, border, and fill tone — never hue.
- Compose from shadcn primitives first (`Button`, `Card`, `Tabs`, `Select`,
  `Sidebar`, `Switch`, `Badge`). Don't hand-roll a component shadcn already
  provides.
- Follow the shadcn skill's critical rules: `gap-*` not `space-x/y-*`,
  `size-*` for equal dimensions, `data-icon` on button icons, semantic color
  tokens (`bg-muted`, `text-muted-foreground`) never raw Tailwind colors.

## Source references

- `Receipt - Individual MCP Workspace.html` (not in this repo — original
  Figma-exported static clone, used as the structural blueprint).
- Kentron marketing site: https://kentron-website-alpha.vercel.app/

## Design System — Mandatory Instructions

@DESIGN.md

The design.md file is the single source of truth
for all UI and visual design decisions.

MANDATORY RULES:

1. Read and follow design.md before making UI changes.
2. Do not invent new design patterns when an
   existing documented pattern applies.
3. Do not use arbitrary spacing, colors, typography,
   radius, shadows or component styles.
4. All new components must follow the existing
   design system.
5. Reusable components must maintain visual
   consistency across the application.
6. If design.md lacks necessary guidance, identify
   the gap and improve the documentation.
7. Never sacrifice visual quality just to follow
   a weak or incomplete design rule.
8. When the design system conflicts with a
   professional UX requirement, evaluate the
   conflict and update the system appropriately.
9. Before completing UI work, verify that the
   rendered interface follows design.md.
10. Do not consider a UI task complete merely
    because the code compiles.

## Conversational AI — Mandatory Instructions

@CONVERSATIONAL_AI.md

The CONVERSATIONAL_AI.md file is the canonical behavioral specification
for all Receipt AI conversational features and demos.

MANDATORY RULES:

1. Every UI implementation of chat features must follow DESIGN.md.
2. Every conversational demo, mock response, or AI behavior must follow
   CONVERSATIONAL_AI.md — including demo state content in components.
3. New sample conversations or mock AI messages added to any component
   must follow the behavioral specification: no filler openers, no
   invented information, grounded source attribution, natural prose.
4. Any change to conversational behavior or demo content must be
   evaluated against the examples in docs/ai/CONVERSATION_EXAMPLES.md
   before shipping.
5. The examples library (CONVERSATION_EXAMPLES.md) is the reference for
   good vs. bad AI responses. When in doubt, compare against it.
6. Permissions and guardrails are enforced in trusted app code, not in
   UI mock data — demo states must accurately represent what a
   permission-aware agent would actually say.