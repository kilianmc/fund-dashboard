# CLAUDE.md

Agent-facing conventions for the **Fund Portfolio Dashboard** (`fundDashboard`).
Read this before making changes. Keep changes focused and never break the
Module Federation contract below.

## Project overview & stack

A responsive fund portfolio dashboard.

- **React 18** + **Vite 8** (`@vitejs/plugin-react`).
- **Pure JavaScript / JSX — NO TypeScript.** There is no `tsconfig.json`; do not
  add TS, `.ts`/`.tsx` files, or type-gen.
- **SCSS** (`sass`, `modern-compiler` API) with design tokens exposed as CSS
  custom properties.
- **Chart.js 4** via `react-chartjs-2` for the performance (line) and
  allocation (donut) charts.
- Runtime **light/dark theme** via a React context (`ThemeContext`), persisted
  to `localStorage`, defaulting to OS `prefers-color-scheme`.
- Deployed via **Vercel** Git integration.

## Project structure

```
src/
  data/portfolio.js         # fund data, performance series, formatting helpers
  components/               # TopBar, PerformanceCard, OverviewCard, HoldingsCard, AllocationCard
    *.jsx / *.scss          # each component paired with its own stylesheet
  styles/
    _variables.scss         # SCSS tokens
    _mixins.scss            # flex, breakpoints, uppercase-label, inset-panel
  theme/
    ThemeContext.jsx        # ThemeProvider + useTheme() hook
  chartSetup.js             # registers Chart.js components
  App.jsx                   # composes the dashboard
  main.jsx                  # standalone entry; renders <RemoteApp /> (StrictMode)
  RemoteApp.jsx             # MF entry; imports index.scss + chartSetup, wraps App in <ThemeProvider>
  index.scss                # tokens (:root + [data-theme='dark']), reset, .app/.grid/.card
```

## Module Federation contract (do not break)

This app is a Module Federation **remote** named `fundDashboard`, consumed at
runtime by the `portfolio-shell` host. When editing `vite.config.js` or the
entry files, you MUST preserve:

- **Exposed module `./App`** mapped to `src/RemoteApp.jsx` — the shell imports
  it as `import('fundDashboard/App')`. Do not rename, remove, or repoint it.
- **`RemoteApp.jsx` stays self-contained** — it bundles Chart.js registration,
  global styles, and the `ThemeProvider` so the dashboard works both standalone
  and when mounted in the host.
- **React & react-dom are shared singletons** (`singleton: true`,
  `requiredVersion: '^18.2.0'`). Do not upgrade React across a major, and do not
  remove the `shared` config.
- **Build target `chrome89`** — required because Module Federation uses
  top-level await. Do not lower it.
- `remoteEntry.js` is the remote entry filename; `dts: false` (JS project).

If a change would alter any of the above, call it out explicitly in the PR.

## Coding conventions

- **Pure JS/JSX only** — no TypeScript, no PropTypes-heavy ceremony; keep
  components simple functional components.
- **Component + co-located `.scss`**: each component in `src/components/` pairs a
  `Name.jsx` with a `Name.scss` imported by that component.
- **SCSS**: use tokens from `styles/_variables.scss` and mixins from
  `styles/_mixins.scss`. Theme-sensitive values come from CSS custom properties
  defined in `index.scss` (`:root` and `[data-theme='dark']`) — never hardcode
  colors that differ between themes.
- **Theme-awareness**: read the active theme via `useTheme()` when JS needs it
  (e.g. Chart.js gridline/border colors); otherwise let CSS custom properties do
  the work.
- Keep chart registration centralized in `chartSetup.js`.

## Commands

```bash
npm install
npm run dev           # start the dev server (standalone)
npm run build         # production build to dist/
npm run preview       # preview the production build
npm run lint          # ESLint over the project
npm run lint:fix      # ESLint with autofix
npm run format        # Prettier — write formatting
npm run format:check  # Prettier — verify formatting (used in CI)
npm test              # Vitest in watch mode
npm run test:run      # Vitest single run (used in CI)
```

- `npm run build:remote` / `npm run serve:remote` build/serve the remote for
  host integration testing.
- **Lint** (`lint` / `lint:fix`), **format** (`format` / `format:check`), and
  **test** (`test` / `test:run`) all exist — CI runs `lint`, `format:check`,
  `test:run`, and `build` on every PR.
- **Testing stack**: **Vitest** + **React Testing Library** + **jsdom** (config
  lives in the `test` block of `vite.config.js`; `src/test/setup.js` wires
  `@testing-library/jest-dom`). Chart.js needs a real `<canvas>`, so component
  tests that render charts mock `react-chartjs-2`. The MF (`federation`) plugin
  is skipped under Vitest (`process.env.VITEST`) — builds/dev keep it, so the
  contract is unchanged.

**Node version — source of truth:** `package.json` `engines` (`>=20.19.0`) is
the supported **floor**; `.nvmrc` (`23.10.0`) is the **pinned** version used
locally (`nvm use`) and in CI (`setup-node` reads `.nvmrc`). Any Node ≥ 20.19
works; use `nvm use` to match CI exactly.

## Git conventions

- **Conventional Commits**: `type: subject` (e.g. `feat:`, `fix:`, `chore:`,
  `test:`, `docs:`). Reference the issue in the body with `Closes #N`.
- **Branch names** by type: `feat/…`, `fix/…`, `chore/…`, `test/…`, `docs/…`.
- **Feature PRs target `dev`**, not `main`. `main` receives only `dev`→`main`
  promotion PRs. See **Deployment (dev→prod)** below.

## Deployment (dev→prod)

This repo follows a two-branch dev→prod flow. It is a Module Federation
**remote**, so its deploys produce the `remoteEntry.js` URLs the
`portfolio-shell` host consumes via `VITE_FUND_REMOTE_URL`.

- **Branch model**: two long-lived branches — `dev` (integration) and `main`
  (production). Feature PRs target `dev`. `main` receives **only** `dev`→`main`
  promotion PRs; never push features straight to `main`.
- **Vercel deploys** (Git integration): the `dev` branch auto-deploys to a
  stable dev URL; `main` deploys to production.
- **Promotion / approval**: Kilian manually tests the dev URL, then merges a
  `dev`→`main` promotion PR to ship to production. Merging is Kilian's gate.
- **Gate / ruleset**: every PR (into `dev` and into `main`) requires the
  `lint-build` CI job to pass — it runs `npm run lint`, `npm run format:check`,
  `npm run test:run`, and `npm run build`.

### Versioning convention

- Baseline production = **1.0.0**. Production releases are whole majors.
- Each dev iteration bumps the **minor** (`1.1.0` → `1.2.0` …) via
  `npm run version:dev` (`npm version minor --no-git-tag-version`).
- Each production release bumps the **major** and resets the minor
  (→ `2.0.0`) via `npm run version:release`
  (`npm version major --no-git-tag-version`).

### remoteEntry URLs (for the shell's `VITE_FUND_REMOTE_URL`)

- **Production**: `https://ai-portfolio-project1.vercel.app/remoteEntry.js`
- **Dev** (stable Vercel git-branch alias, confirmed 2026-07-20):
  `https://ai-portfolio-project1-git-dev-kilians-projects-7425dee2.vercel.app/remoteEntry.js`
  — the slug uses the team scope `kilians-projects-7425dee2`. Note: Vercel
  Deployment Protection must stay **off** for previews, or the dev remote is
  SSO-gated and won't load cross-origin (see `docs/DEPLOYMENT.md`).

The `Access-Control-Allow-Origin: *` header in `vercel.json` is what lets the
shell load `remoteEntry.js` cross-origin — keep it. See `docs/DEPLOYMENT.md`
for the Vercel dashboard checklist.

## PR expectations

- Link the issue (`Closes #N`).
- Include the Vercel **preview URL** (and screenshots for UI changes).
- Keep diffs **focused** — one concern per PR; do not bundle unrelated changes.
- Confirm `npm run build` passes and the **Module Federation contract is
  unaffected** (or explain the change).
