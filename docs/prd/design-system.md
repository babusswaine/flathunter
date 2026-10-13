# PRD: Flat Hunter design system

Status: approved by the owner · Written 2026-10-14
Related: roadmap #32 · filters #25 · platform logos #18 · `AGENTS.md` (read `node_modules/next/dist/docs/` before writing Next.js code)

## Problem

Every visual change to Flat Hunter today means hunting through hand-written class
strings in ten different files. There are no shared building blocks — every button,
dropdown, and card is styled on the spot — so the UI drifts (34 different hard-coded
colors, 5 corner radii, dark mode paired by hand), accessibility problems slip
through (the platform logos fail contrast, #18), and neither the owner nor an AI agent
working on the code can see what already exists before building something new.

The next roadmap items (#25 filters, #26 editing facts, #29 adding listings in the app)
all add new controls. Building them on the current setup adds more one-off styling.

## Where things stand (measured 2026-10-14)

- **10 components, all screen-specific** — no shared Button, Select, Input, Badge, or Card
- **8 raw controls** (`<button>`, `<select>`, `<textarea>`, `<input>`) styled ad hoc across 5 files
- **34 distinct hard-coded palette colors** (mostly `zinc-*`), each dark-mode pair written by hand with `dark:`
- **2 design tokens** in `src/app/globals.css` (`background`, `foreground`)
- **5 different corner radii** (`rounded-sm` … `rounded-full`)
- **Bug:** `layout.tsx` loads the Geist font into CSS variables, but `globals.css` sets `body { font-family: Arial }` and nothing applies `font-sans` — the whole app renders in Arial
- **No stories, no component tests** — UI is verified by clicking through the app
- Dark mode follows the system setting only (`prefers-color-scheme`) — changing to class-based, see Tokens; icons are `lucide-react`

## Goals

1. **One place to change how the app looks.** Changing the accent color, a radius, or a
   surface shade is a single token edit, not a search-and-replace.
2. **Every new control comes from a shared primitive.** #25 filters are built entirely
   from the new primitives — the system's first real user.
3. **A visible catalog.** Every reusable component can be browsed in Storybook, in light
   and dark mode, with its variants.
4. **Accessibility checked automatically.** Contrast and basic a11y problems are caught by
   tests, not by noticing them later.
5. **Agent parity.** Claude can read the component catalog (Storybook MCP) and reuse what
   exists instead of inventing new one-off styles.

## Non-goals

- **Figma as the source of truth** — code + Storybook is the truth; Figma may mirror it later.
- **Paid visual-regression services** (e.g. hosted screenshot diffing) — not worth the cost for a one-person tool.
- **Theming beyond light/dark** — no brand themes, no user-selectable palettes.
- **Publishing Storybook online** — local only for now.
- **Migrating every component in the first PR** — old components move over gradually, as roadmap work touches them.
- **A visual redesign** — this sets up the system; changing the look is follow-up work on top of it.

## User stories

**As the owner using the app**
- I want controls (filters, dropdowns, buttons) to look and behave the same everywhere so that the app feels coherent and predictable.
- I want text and logos to be readable in both light and dark mode so that I'm not squinting at low-contrast elements.

**As the owner learning development**
- I want to browse every reusable component in one place so that I know what exists before asking for something new.
- I want to change the app's look in one file so that design experiments are cheap.

**As an AI agent working on this repo**
- I want to query the component catalog before building UI so that I reuse existing primitives instead of duplicating them.
- I want a failing check when I hand-style a control or hard-code a color so that I can't silently drift from the system.

## Architecture

Three layers, each allowed to use only the layer below:

```
Tokens        src/app/globals.css            colors, radii, type, surfaces — light + dark
  ↓
Primitives    src/components/ui/             Button, Select, Input, Badge, Card, … (shadcn/ui, owned code)
  ↓
Domain        src/components/                ListingCard, CityCard, PlatformMark, … (primitives + tokens only)
  ↓
Pages         src/app/                       routes compose domain components
```

- **shadcn/ui** generates the primitives. It copies accessible components into the repo
  rather than installing a library, so the code is ours to read and change. It officially
  supports Tailwind v4 and React 19, and defines tokens the same way `globals.css` already
  starts to (CSS variables + `@theme inline`, OKLCH colors).
- **Domain components** never hard-code a palette color or style a raw control — they use
  tokens (`bg-surface`, `text-muted-foreground`) and primitives (`<Button>`, `<Select>`).

### Tokens

| Group | Tokens |
|---|---|
| Surfaces | `background`, `surface` (cards), `surface-raised` (one elevation step up — e.g. the logo tile in #18), `muted` |
| Text | `foreground`, `muted-foreground` |
| Lines | `border`, `input`, `ring` (focus) |
| Roles | `primary` / `primary-foreground`, `accent`, `destructive` (delete), `success` (e.g. balcony confirmed), `warning` (e.g. not confirmed) |
| Radius | one scale: `sm`, `md`, `lg`, `full` |
| Type | `font-sans` = Geist (fixes the Arial bug), `font-mono` = Geist Mono |
| Spacing | Tailwind's default scale — no custom spacing tokens |

Every color token has a light and a dark value.

**Dark mode** (decided 2026-10-14): class-based (`.dark` on `<html>`), defaulting to the
system setting, so a manual light/dark toggle becomes possible later. This is what shadcn
and Storybook's theme switcher both expect. Replaces today's `prefers-color-scheme`-only
approach; the app must look the same as now for anyone who never touches a toggle.

## Component inventory

| Existing component | What it is | Built from (after migration) | Gets a story? |
|---|---|---|---|
| `StatusSelect` | Status dropdown | `Select` | Yes |
| `FavoriteToggle` | Star button | `Toggle` (icon) | Yes |
| `PlatformMark` | Platform logo / name | `Card`-style tile on `surface-raised` (#18) | Yes — logo, no logo, light, dark |
| `CityCard` | City photo card with count | `Card`, `Badge` | Yes |
| `ListingCard` | Listing summary card | `Card`, `Badge`, `StatusSelect`, `FavoriteToggle` | Yes |
| `ListingFeatures` (`BedIcons`, `FeatureIcons`) | Icon rows | tokens only | Yes |
| `Field` | Label + value pair | tokens only (may become a primitive) | Yes |
| `NavBar` | App header | tokens | No — app shell |
| `ListingBrowser` | Home page: city cards, sort, grid | `Select`, `ToggleGroup`, `Button`, filters (#25) | No — page composition |
| `ListingDetail` | Listing page | `Textarea`, `Button`, `Field`, `Card` | No — page composition |

### Initial primitives (foundation PR — what #25 filters need)

`Button` · `Select` · `ToggleGroup` (balcony: any / confirmed / not confirmed / no) ·
`Input` (price range) · `Badge` (counts, status)

### Next primitives (as #26 and #29 need them)

`Textarea` · `Label` · `Checkbox` / `RadioGroup` (yes / no / unknown fields) · `Dialog` ·
`Tooltip` · `Card`

## Cataloguing rule

- **Every primitive** in `src/components/ui/` gets a story. No exceptions.
- **Every reused domain component** (used in more than one place, or with meaningful
  variants) gets a story.
- **Page compositions and app shell** (`ListingBrowser`, `ListingDetail`, `NavBar`) don't — they're
  what the stories are assembled into, not reusable pieces.
- Stories live next to their component (`Button.tsx` + `Button.stories.tsx`).
- **No separate hand-written component list** — the Storybook catalog *is* the list, so it
  can't fall out of date.

## Enforcement (CI)

The existing single CI job gains these checks:

1. **UI rules check** (`scripts/check-ui-rules.mjs`): fails if a file in `src/components/`
   outside `ui/` uses a raw palette class (`zinc-500`, `blue-600`, …) or a raw
   `<button>`/`<select>`/`<input>`/`<textarea>`. Escape hatch: a comment on the line
   explaining why.
2. **Story coverage check**: fails if a primitive in `src/components/ui/` has no story.
3. **Story tests**: every story renders, plus the a11y (axe) check — which would have
   caught the logo contrast problem in #18.

Checks 1 and 3 start as **warnings** (old components still break the rules) and become
**blocking** once migration is done.

## Tooling

| Tool | Purpose |
|---|---|
| shadcn/ui CLI (`components.json`) | Generates primitives into `src/components/ui/` |
| Storybook 10 + `@storybook/nextjs-vite` | Component catalog (the Vite-based setup Storybook recommends) |
| Storybook a11y addon | Contrast / accessibility checks on every story |
| Storybook Vitest integration | Runs stories as tests alongside the existing Vitest suite (verify in spike) |
| Storybook light/dark switch | Every story viewable in both modes |
| `@storybook/addon-mcp` (preview) | Lets Claude read the components catalog before building UI |

## Success metrics

| Metric | Now | Target |
|---|---|---|
| Raw palette colors outside `ui/` | 34 | 0 after migration |
| Raw controls outside `ui/` | 8 | 0 after migration |
| Primitives with a story | — | 100%, enforced by CI |
| Stories passing the a11y check | — | 100% |
| #25 filters built only from primitives | — | Yes |
| Change the accent color | many files | 1 token edit |

## Rollout

| Phase | What | When |
|---|---|---|
| 0. Spike | Prove shadcn + Storybook 10 work on Next.js 16 (throwaway branch) | Before anything else — half a day |
| 1. Foundation | Tokens, Geist fix, shadcn setup, Storybook, the 5 initial primitives + stories, CI checks as warnings | One small PR |
| 2. Filters | #25 built entirely from the primitives | Right after phase 1 — the flat-hunt priority |
| 3. Gradual migration | Move each existing component onto primitives as #26 / #27 touch it | Ongoing |
| 4. Logos | #18 built on `surface-raised` and the a11y check | After migration of `PlatformMark` |
| 5. Lock in | CI checks switch from warning to blocking | When migration is complete |

**Hard constraint:** move-in is the first week of November 2026. Phases 0–1 must stay
small (about 1–2 days) so the filters (#25) still land in the first week.

## Risks

- **Next.js 16 compatibility** — neither shadcn's nor Storybook's docs explicitly confirm
  Next.js 16 (Storybook lists "Next.js ≥ 14.1"). The spike exists to prove this first.
- **Server components in Storybook** are experimental — fine for now, since the components
  that would get stories are client components.
- **Storybook MCP is in preview** — useful, but its setup may change between versions.
- **Two build tools** — the app uses Turbopack, Storybook uses Vite. Usually fine; the spike checks that Tailwind v4 and the fonts look the same in both.
- **Keeping the app shippable** — migration happens component by component, never in one big rewrite.

## Open questions

| Question | Who | Blocking? |
|---|---|---|
| Does Storybook's Vitest integration coexist with the current `vitest.config.mts`? | Engineering | Decide in the spike |
| Price range control: a slider, or two number boxes? | Owner | No — decide in #25 |
| Accent color — keep neutral greys, or pick a brand color? | Owner | No |

## Tickets

Order and dependencies are tracked in the roadmap, #32.

1. #34 **Spike: shadcn/ui + Storybook 10 on Next.js 16** — throwaway branch, go/no-go; also answers the Vitest question above.
2. #35 **Design system foundation** — tokens, Geist fix, shadcn setup, Storybook with a11y + light/dark, primitives `Button` / `Select` / `ToggleGroup` / `Input` / `Badge` with stories, CI checks (warnings).
3. #25 **Filters** — built on the primitives.
4. #36 **Storybook MCP** — `@storybook/addon-mcp`, components manifest, and a `CLAUDE.md` rule: check the catalog before building UI.
5. #37 **Migrate existing components** — `StatusSelect`, `FavoriteToggle`, `CityCard`, `ListingCard`, `ListingFeatures`, `Field`, alongside #26 / #27 where they overlap.
6. #18 **Platform logos** — on the `surface-raised` tile and the a11y check.
7. #38 **Lock in** — UI rules and a11y checks become blocking.
