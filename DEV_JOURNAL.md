# Developer Journal — AI Portfolio Dashboard

A chronological, indexed log of the styling refactor and dark-mode work done on the
React + Vite fund portfolio dashboard.

---

## Session — 2026-07-09

### Task 1 — Split CSS into per-component files

The project started with a single monolithic `src/index.css` (185 lines) holding every
rule for every component. Goal: move each block of CSS into a file next to the component
it styles.

#### Step 1.1 — Survey the codebase
- Listed `src/` and read `index.css`, `main.jsx`, `App.jsx`, and all five components
  (`TopBar`, `OverviewCard`, `PerformanceCard`, `HoldingsCard`, `AllocationCard`).
- Mapped each CSS class to the component that consumes it.

#### Step 1.2 — Decide what stays global vs. per-component
- **Global (kept in `index.css`):** design tokens (`:root`), reset, `html/body`, `.app`,
  `.grid`, and the shared `.card` shell (`.card`, `.card-head`, `.card-title`, `.card-sub`).
- **Per-component:** everything specific to one card.
- Responsive `@media` rules were distributed to the component they target; global layout
  breakpoints (`.app`, `.grid`, `.card`) stayed in `index.css`.

#### Step 1.3 — Create component CSS files
Created:
- `src/components/TopBar.css`
- `src/components/PerformanceCard.css`
- `src/components/OverviewCard.css`
- `src/components/HoldingsCard.css`
- `src/components/AllocationCard.css`

#### Step 1.4 — Wire up imports
- Trimmed `index.css` down to global/shared styles only.
- Added `import './<Component>.css'` to each component `.jsx`.
---

### Task 2 — Adopt SCSS with reusable variables & mixins

Goal: convert the stylesheets to SCSS and centralize shared values/patterns.

#### Step 2.1 — Install tooling
- `npm install -D sass`.

#### Step 2.2 — Create shared partials
- `src/styles/_variables.scss` — design tokens as SCSS variables (colors, radii, shadows,
  breakpoints, font stack).
- `src/styles/_mixins.scss` — reusable mixins:
  - `flex($align, $justify, $gap)` — the repeated flexbox pattern.
  - `mobile` / `tablet` / `desktop` — responsive breakpoint wrappers.
  - `uppercase-label($color)` — shared by KPI labels and table headers.
  - `inset-panel` — soft KPI tile background.

#### Step 2.3 — Convert every stylesheet to SCSS
- `index.css` → `index.scss` (global reset, `.app`, `.grid`, `.card` shell).
- Each component `.css` → `.scss`, using `@use` on the shared partials, nested rules,
  and the breakpoint mixins (media queries co-located with their component).

#### Step 2.4 — Update imports & clean up
- Switched all `import './x.css'` → `import './x.scss'` (incl. `main.jsx`).
- Deleted the six old `.css` files.

#### Step 2.5 — Verify & polish
- `npm run build` succeeded; output CSS identical in intent.
- Added `css.preprocessorOptions.scss.api = 'modern-compiler'` to `vite.config.js`
  (forward-compatible; only takes effect on Vite 5+).
---

### Task 3 — Dark mode + topbar toggle

Goal: add a dark theme and a button in the topbar to switch between light and dark.

#### Step 3.1 — Rework tokens for runtime theming
- Realized compile-time SCSS variables can't switch at runtime, so:
  - `_variables.scss`: themed tokens now point at CSS custom properties
    (`$ink: var(--ink)`, etc.); static tokens (radii, breakpoints, font) stay literal.
  - `index.scss`: light palette defined in `:root`, dark palette in `[data-theme='dark']`.
  - All existing component SCSS kept working unchanged.

#### Step 3.2 — Themeable surfaces
- Converted the last hardcoded light backgrounds to tokens: `$seg-bg`, `$seg-active-bg`
  (segmented control), `$track` (allocation bar), `$panel` (KPI tiles via `inset-panel`).
- Added smooth color transitions on `body` and `.card`.

#### Step 3.3 — Theme state
- Created `src/theme/ThemeContext.jsx`: `ThemeProvider` + `useTheme()` hook.
  - Initializes from `localStorage`, falls back to OS `prefers-color-scheme`.
  - Persists choice and sets `data-theme` on `<html>`.
- Wrapped `<App>` in `<ThemeProvider>` in `main.jsx`.

#### Step 3.4 — Toggle button
- Added a 🌙/☀️ toggle in the topbar (`TopBar.jsx`), with accessible labels.
- Styled `.theme-toggle` in `TopBar.scss` (circular button, hover lift).

#### Step 3.5 — Theme-aware charts
- `PerformanceCard.jsx`: gridline color now varies by theme via `makeOptions(theme)`.
- `AllocationCard.jsx`: donut segment borders match the card background via `makeData(theme)`.
- Brand accent colors (blue/green/red) brightened slightly in dark mode for contrast.

#### Step 3.6 — Verify
- `npm run build` succeeded (49 modules).
- Dev server booted cleanly on Vite 4.
- **Known cosmetic issue:** Sass `legacy-js-api` deprecation warnings still print because
  Vite 4 uses Sass's legacy JS API; the `modern-compiler` option only applies on Vite 5+.
  Build output is correct.

---

## Project structure after this session

```
src/
├── App.jsx
├── main.jsx                      # wraps App in <ThemeProvider>, imports index.scss
├── index.scss                    # tokens (:root + [data-theme='dark']), reset, .app/.grid/.card
├── chartSetup.js
├── data/portfolio.js
├── styles/
│   ├── _variables.scss           # SCSS tokens → CSS custom properties
│   └── _mixins.scss              # flex, breakpoints, uppercase-label, inset-panel
├── theme/
│   └── ThemeContext.jsx          # ThemeProvider + useTheme()
└── components/
    ├── TopBar.jsx / .scss        # + theme toggle
    ├── PerformanceCard.jsx / .scss
    ├── OverviewCard.jsx / .scss
    ├── HoldingsCard.jsx / .scss
    └── AllocationCard.jsx / .scss
```

### Task 4

Updated node to v23 , updated vite & the pluguin for react.

The Sass legacy-js-api warning flood is gone (Vite 8 now honors api: 'modern-compiler'), and the build is faster and smaller.

### Task 5

switch hover of darkmode button to show border instead of moving it.