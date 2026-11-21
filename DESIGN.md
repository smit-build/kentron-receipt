# Receipt — Design System & Guidelines

Design direction for the Kentron Receipt console. This is an internal
governance/admin tool for engineers, security, and ops teams managing AI
agent access — not a consumer product. The bar is **Linear/Notion/Plane-grade
restraint**: dense information, zero decoration, everything earns its pixel.

## 1. Palette — strict black & white

shadcn `radix-nova` style, `neutral` base color, **chroma 0 across every
token**. No brand color, no accent hue, anywhere.

| Token | Light value | Use |
|---|---|---|
| `background` | `oklch(1 0 0)` | page background |
| `foreground` | `oklch(0.145 0 0)` | primary text |
| `card` | `oklch(1 0 0)` | card surfaces |
| `muted` / `muted-foreground` | `oklch(0.97 0 0)` / `oklch(0.556 0 0)` | secondary surfaces, secondary text |
| `border` / `input` | `oklch(0.922 0 0)` | hairlines, field borders |
| `primary` | `oklch(0.205 0 0)` | the one true "solid black" surface (active pill, primary button) |
| `destructive` | `oklch(0.577 0.245 27.325)` | **the only allowed non-neutral hue** — reserved for destructive actions (Disconnect) and error states only |

Rules:
- Never introduce a new hue. If something needs emphasis, use weight
  (font-semibold), fill (foreground/5–15% tint), or border — not color.
- **Exception: third-party brand logos render in their real brand color**
  (`AppLogo` → Simple Icons via `react-icons/si`, colored with the official
  hex from the `simple-icons` package). This is a deliberate, explicit
  exception for recognizability in the Integrations list and Usage-by-app
  rows — it does not open the door to color anywhere else. Brands Simple
  Icons doesn't publish (Slack, AWS, Azure, Outlook, Adobe, OpenAI) fall back
  to the monochrome initials badge.
- "Connected" / active state = a subtle `foreground/[0.03]` tint + a slightly
  darker border (`border-foreground/15`), not a green badge.
- Active filter pills/tabs = solid `foreground` fill with `background` text
  (true black-on-white inversion), not a tinted color chip.
- Dark mode variables exist in `index.css` (shadcn default) but the single
  screen in this repo is not yet wired to a theme toggle — the sidebar's
  "Dark mode" row is currently decorative.

## 2. Typography

- System/default sans only (no custom webfont loaded) — this is a dense
  utility UI, not a marketing surface. Matches the Linear/Plane/Notion
  reference set: typography should be invisible, not a feature.
- Scale is intentionally small and tight, closer to the original HTML
  receipt export than default shadcn spacing:
  - Page title (`h1`): `text-xl font-semibold tracking-tight` (~20px)
  - Section/card title: `text-sm font-semibold`
  - Body copy / descriptions: `text-[12.5px]` to `text-[13px]`, muted-foreground
  - Micro labels (field labels, status text, pill text): `text-[10px]`–`text-[11px]`,
    often `font-semibold` with slight letter-spacing for labels
  - Nav items, card titles: `text-[12.5px] font-semibold`
- Line-height stays tight (`leading-tight`) in dense list/card contexts; only
  body paragraphs get normal leading.
- Never use a display/serif font or gradient text. No oversized hero numbers.

## 3. Spacing & layout

- Base rhythm is an **8px-ish grid**, but tuned down where the source HTML
  used tighter values (e.g. `p-2.5`, `gap-2.5`) — prioritize matching the
  reference density over a rigid 8px dogma.
- Sidebar is fixed `16rem` (shadcn default `--sidebar-width`), collapsible to
  icon rail. Main content is **left-aligned, not centered** — `px-6` with no
  `mx-auto`, so its left/right edges line up exactly with the topbar's
  breadcrumb and icon row above it. A generous `max-w-[1600px]` caps it only
  to stop stat/chart grids over-stretching on ultra-wide monitors; it has no
  effect at normal laptop/desktop widths.
- Integration grid: responsive `1 / 2 / 3` columns (mobile / sm / lg), `gap-2`.
  Cards never nest other cards. Connected cards are a single row (logo, name,
  two icon-only actions) — no inline text buttons once a logo makes the row
  self-explanatory.
- Filter bars (search, Filter/Sort, category/method pills) sit directly on
  the page, flush left with everything else — never wrapped in their own
  bordered/shaded box. Category and method pills are `rounded-full` (true
  pill shape), separated by a thin vertical rule, not boxed sub-sections.
- One primary call-to-action per section at most (e.g. "Copy commands").
  Everything else is `variant="outline"` or `ghost`. Never make every button
  primary.
- **Empty states never get a container border or corner radius.** The
  `Empty` component renders bare (icon, title, description, action) directly
  on the page background — no `border`, `border-dashed`, or `rounded-*` on
  the wrapper, ever. If a page needs a header above its empty state (title +
  description + a primary action button), that header sits above the empty
  content as plain page furniture, not inside a boxed card.

## 4. Components — shadcn composition map

| UI need | Component(s) |
|---|---|
| Sidebar nav | `Sidebar`, `SidebarContent`, `SidebarFooter` (profile row + collapse trigger live here now, bottom-most — not a header), `SidebarGroup(+Label)`, `SidebarMenu(Item/Button)`, `Collapsible` + `SidebarMenuSub(Item/Button)` for the one collapsible nesting level (Agents → Governance → Skills/Guardrails/Policies, chevron rotates on toggle, `defaultOpen`), `SidebarTrigger` (hover-reveals over the collapsed-rail avatar, sidebar-only — no duplicate trigger in the main topbar). Sidebar background is pure white (`--sidebar: oklch(1 0 0)`), matching the page, not the default off-white shadcn token. Top-to-bottom order: AI Chat/Slack, Workspace switcher, Agents (Org Brain, Governance, User Activity), Manage (Docs, Beetle runners), then the profile/collapse footer. |
| Workspace switcher | A "Workspace" `SidebarGroupLabel` (14px) with an always-visible "Create new" button (icon + label, no hover reveal, no chevron) + an inline `SidebarMenu` list of workspaces (name only, no per-row icon), all wrapped in a subtle `bg-sidebar-accent/60 rounded-lg` box that disappears in icon-collapsed mode. Clipped to 3 rows by default with a centered, content-width "View more" / "Hide" toggle button (`hover:bg-border` — one step darker than the box's own `sidebar-accent` tint — rounded) that expands/collapses the full list. |
| Topbar | plain flex header + breadcrumb + icon `Button`s + `Avatar` |
| Workspace head | title + neutral "Endpoint live" `Badge` + Invite/Connect-client `Button`s, shared above all three tabs |
| Workspace tabs | `Tabs` with `variant="line"`, sized to content (`w-fit`, not `w-full`) and left-aligned, sitting on a full-width `border-b` wrapper so the separator still spans the row |
| Finish-setup checklist | `Card` with hand-rolled step rows (shadcn has no checklist primitive) |
| Stat tiles | plain `Card` + `CardContent`, no chart inside — a stat tile is not a chart (dataviz skill) |
| Calls-per-day chart | shadcn `Chart` (wraps Recharts) — `ChartContainer`/`ChartTooltip`/`ChartTooltipContent`, `BarChart` with `accessibilityLayer`, `CardFooter` trend line with `TrendingUp`/`TrendingDown`, following the shadcn chart docs pattern directly |
| Usage-by-app list | `Card` + hand-rolled rows (logo, sparkline `<svg>`, call count, error `Badge`) — not a `Chart`, the sparkline is decorative-but-real trend data, not a Recharts instance |
| Search + filter bar | `Input` with inset `Search` icon, outline `Button`s for Filter/Sort — unboxed, flush left |
| Category / method filters | custom `rounded-full` pill `<button>`s (shadcn has no "filter pill" primitive) — active = solid foreground fill |
| Show-connected-only | `Switch`, inline at the end of the filter row (not a separate boxed footer) |
| Integration list | custom `IntegrationCard` — connected rows are icon-only `Button`s (`outline`/`icon-sm`) with `Tooltip` labels, not text buttons |
| Brand logo | `AppLogo` — Simple Icons (`react-icons/si`) in brand color, falls back to initials |
| Status / "Coming soon" | plain muted text + dot, not `Badge` — reserve `Badge` for error counts and the Settings empty-state stub |

## 5. Icons

`hugeicons-react` (stroke/duotone style, the package default), used
project-wide — both the app's own components and the vendored shadcn `ui/*`
primitives (dialog close, select carets, dropdown check/chevron, sidebar
trigger). One icon per nav item / action, no
decorative icon-in-a-rounded-square above headings (explicitly avoided per
frontend-design guidance). Icons inside `Button` always carry
`data-icon="inline-start"` per the shadcn styling rules — never manually
sized with `size-4` unless overriding a Button-less context. Third-party
brand logos (`AppLogo`, MCP client marks) stay on Simple Icons
(`react-icons/si`) — that's logo recognizability, not generic iconography,
and is out of scope for the Phosphor swap.

## 6. Interaction & states

- Hover: shadcn defaults (`hover:bg-muted` / `hover:bg-accent`) — no custom
  hover treatments.
- Active nav item: `data-active` on `SidebarMenuButton` → `font-medium` +
  `bg-sidebar-accent`. Never color-coded.
- Destructive action (Disconnect): icon-only `outline` button, `text-destructive`,
  beside the icon-only "Manage tools" button, both carrying a `Tooltip` label
  since neither has visible text.
- No modals in this screen. If a future screen needs a confirmation
  (e.g. disconnect confirm), prefer an inline state or `AlertDialog` over a
  generic `Dialog`.

## 7. Accessibility

- All icon-only buttons (`Search`, `Settings`, `Disconnect`) carry
  `aria-label`.
- Sidebar nav uses real `<button>` semantics via `SidebarMenuButton`, keyboard
  reachable, with `Tooltip` fallback when collapsed to icon rail.
- Color is never the sole signal — "Coming soon" integrations are additionally
  labeled with text, not just a muted dot; destructive action is labeled
  "Disconnect" in addition to being red.
- Target minimum contrast: body text `oklch(0.145 0 0)` on white easily clears
  WCAG AA; muted text (`oklch(0.556 0 0)` ≈ 4.6:1) stays at or above AA for
  normal-size text — don't go lighter than the default `muted-foreground`
  token for body copy.

## 9. Chat screen design rules

Derived from Gumloop, Emergent, Notion AI, Langdock, and Perplexity reference patterns.

### Welcome / empty state (State C)
- Heading must be `text-[22px] font-semibold tracking-tight` — large and personal. Never
  the generic `text-base` sizing.
- A one-line subtitle below (`text-muted-foreground`) showing connected apps or a nudge.
- Generous top padding (`py-12` or more) so the heading feels centered in the viewport.
- Prompt cards: `border-border/50` (lighter than default), hover lifts to `border-border
  bg-muted/30`. Never the full `border-border` weight on idle — that creates a "ChatGPT
  clone" grid.

### Message rendering
- **AI completed messages: no avatar.** The `AiAvatar` component renders only during
  active states (ThinkingRow and StreamingRow). Once streaming ends and the message
  is committed, it is plain left-aligned text with no avatar, no border, no container.
- **AI avatar offset (`ml-9`)**: Removed everywhere on completed messages. Receipt cards
  and other attachments sit directly under the message text with no indent offset.
- **Timestamps**: Not shown inline. They create visual noise on every turn. If timestamps
  are needed, surface them on hover only (future work).
- **User messages**: Always `bg-muted` pill. Never `bg-foreground` / inverted black.
  Consistency > visual variety — the gray bubble is enough to anchor the user side.
- **Message gap**: `gap-5` to `gap-6` between turns. AI and user messages within the same
  exchange share a tighter rhythm than cross-turn spacing.

### Special AI states (Blocked, Error, System)
- No bordered bubble containers. These are inline text messages, not cards.
- Status label sits as a small `text-[11px] font-semibold uppercase tracking-wide` header
  line — either `text-muted-foreground` (blocked/system) or `text-destructive` (error).
- Body text continues at `text-[13px] leading-relaxed` below the label — no wrapping card.
- Destructive (error) state: label text only gets the red, never a background tint.

### Action Required state (State 7)
- The `border-2 border-primary` outer container stays — this is the deliberate exception
  for high-stakes write actions that need approval. It is NOT a general "AI message" style.
- No avatar anchoring the card — the border itself provides sufficient visual weight.
- Header band: `bg-muted px-4 py-2`, label `text-[10.5px] font-semibold uppercase
  tracking-widest text-foreground/70`.

### Composer action bar
- Left: Connected-app logo hints (opacity-25, hover opacity-70, `title` tooltip) — no
  verbose "type @ to mention" text label next to them.
- If no apps connected: a minimal `↵ send` hint at `text-muted-foreground/25`.
- Right: Subtle model indicator (`text-[10.5px] text-muted-foreground/30`) + send button.
  The model label is non-interactive metadata, not a click target, unless a selector is built.
- The send button is `size-7 rounded-full`. Filled `bg-foreground text-background` when
  `canSend`; `bg-muted text-muted-foreground/30` when disabled.

## 8. What this is *not*

- Not maximalist, not playful, not colorful. If a change introduces a
  gradient, a shadow-heavy card, a colored status chip, or a mascot icon —
  it's off-brand for this screen.
- This is a desktop-first admin console (reference canvas was 1440px), but it
  still has to not break down to phone width: the `Sidebar` component already
  collapses to an off-canvas `Sheet` on mobile, and the integration grid
  already reflows `3 → 2 → 1` columns. Preserve that — don't hide nav items or
  actions on small screens, just let them reflow/stack.
