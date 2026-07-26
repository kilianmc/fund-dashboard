# AI Portfolio Project 1 — Fund Portfolio Dashboard

A responsive fund portfolio dashboard built with **React + Vite** and **Chart.js**
(via `react-chartjs-2`), styled with **SCSS** and a runtime-switchable
**light/dark theme**. Ported from a single-file HTML prototype into a
component-based React app. It ships as a **Module Federation remote**
(`fundDashboard`) consumed by the [portfolio-shell](https://github.com/kilianmc/portfolio-shell)
host at [kilianmc.com](https://kilianmc.com).

This is Project 1 ("AI-as-Copilot") of a two-project portfolio pair. The
developer journal — the full project brief and a chronological log of the work
across both projects — now lives in the portfolio shell: read it on the live
site at [kilianmc.com](https://kilianmc.com) under **Dev Journal**, or in the
source at
[`portfolio-shell/docs/DEV_JOURNAL.md`](https://github.com/kilianmc/portfolio-shell/blob/main/docs/DEV_JOURNAL.md).

> **This project intentionally stays plain JavaScript.** It is the fast/simple
> "AI-as-Copilot" half of the pair, kept deliberately lightweight (no
> TypeScript, no `tsconfig`). Its host — `portfolio-shell` — is the typed,
> strict-TypeScript "AI-as-Agent" counterpart. The contrast between the two repos
> is intentional and part of the portfolio's story.

## Demo

![Fund portfolio dashboard demo](src/data/demo.gif)

> The tour cycles the performance time-range toggle (12M / 3Y / 5Y / All) and
> switches between light and dark mode. Captured from the running dev server
> (`npm run dev`) with [`scripts/capture-demo.mjs`](scripts/capture-demo.mjs).

## Features

- **Load your own holdings** — import a portfolio from a **JSON or CSV** file
  (`fund ISIN, shares, cost-basis price, optional type`). The built-in data is
  the default until a file is loaded; "Reset to default" restores it. See
  [Importing holdings](#importing-holdings).
- **Live market value** — imported holdings are priced against **live fund NAV**
  via a small serverless proxy (`/api/nav`), so market value, cost, and
  **gain/loss** are computed from `shares × current NAV` vs your cost basis. A
  fund that can't be priced shows a per-line error and is excluded from totals —
  the rest still load.
- **Portfolio Performance** — indexed line chart vs. S&P 500 benchmark, with a
  12M / 3Y / 5Y / All time-range toggle. Gridlines adapt to the active theme.
- **Portfolio Overview** — headline KPIs (total value, gain/loss, best performer,
  est. income, …) that recompute from the loaded data.
- **Holdings** — table of funds (Fund · Shares · Cost · Actual · Value ·
  Gain/Loss) with a sticky header and scroll. Amounts use a compact European
  format (e.g. `42,5K €`).
- **Allocation** — donut chart with a scrollable legend and an equity/income
  asset mix; segment borders match the card background per theme.
- **Dark mode** — 🌙/☀️ toggle in the top bar, persisted to `localStorage` and
  defaulting to the OS `prefers-color-scheme`.
- Fully responsive across three breakpoints (desktop ≥1025px, tablet
  641–1024px, mobile ≤640px).

## Project structure

```text
api/
  nav.js                    # serverless NAV-by-ISIN proxy (Vercel function; keyless Yahoo)
src/
  data/
    portfolio.js            # default fund data + pure deriveMetrics/enrichFunds + formatters
    PortfolioDataContext.jsx# provider + usePortfolioData() — default vs imported state
    fundCatalog.js          # ISIN → metadata, colour palette, type normalisation
  services/navService.js    # fetchNav(isins) → calls /api/nav
  utils/parseHoldingsFile.js# parse + validate a JSON/CSV holdings file
  components/               # TopBar, PerformanceCard, OverviewCard, HoldingsCard, AllocationCard, ImportControl
    *.jsx / *.scss          # each component paired with its own stylesheet
  styles/
    _variables.scss         # SCSS tokens → CSS custom properties
    _mixins.scss            # flex, breakpoints, uppercase-label, inset-panel
  theme/
    ThemeContext.jsx        # ThemeProvider + useTheme() hook
  chartSetup.js             # registers Chart.js components
  App.jsx                   # composes the dashboard
  main.jsx                  # standalone entry
  RemoteApp.jsx             # MF entry; wraps App in <ThemeProvider> + <PortfolioDataProvider>
  index.scss                # tokens (:root + [data-theme='dark']), reset, .app/.grid/.card
```

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build to dist/
npm run preview  # preview the production build
```

> Requires **Node ≥ 20.19** (see `package.json` `engines`). The repo pins
> Node 23.10 via `.nvmrc` — run `nvm use` to match. Built on Vite 8 with
> `@vitejs/plugin-react` and `sass`.

## Importing holdings

Use **Import** in the top bar to load a `.json` or `.csv` file. Each record is a
fund **ISIN**, number of **shares**, **cost-basis** price per share, and an
optional **type** (`equity` / `income`):

```csv
isin,shares,price,type
IE0032620787,639,37.50,equity
```

```json
[{ "id": "IE0032620787", "shares": 639, "price": 37.5, "type": "equity" }]
```

Sample files live in [`public/`](public). The dashboard resolves the current NAV
per ISIN through the **`/api/nav`** serverless function (keyless, server-side —
these Irish EUR mutual funds have no free browser-CORS price source), then
computes market value and gain/loss vs your cost basis. Whole-dashboard figures
(Holdings, Allocation, Overview) recompute from the imported data; a fund that
can't be priced is flagged per-line and excluded from totals. The performance
chart keeps its indexed series (a file carries no history).

Point the client at the function origin with **`VITE_NAV_API_URL`** (see
[`.env.example`](.env.example)); left unset it calls the same origin, so use
`vercel dev` to run the app and the function together locally.

## Deployment (dev → prod)

Two long-lived branches: **`dev`** (integration) and **`main`** (production).
Feature PRs target `dev`; `main` only receives `dev`→`main` promotion PRs after
the dev deploy is tested. Vercel auto-deploys `dev` to a stable dev URL and
`main` to production — both serving `remoteEntry.js` for the shell to consume per
environment via `VITE_FUND_REMOTE_URL`. Production baseline is `1.0.0`; dev
bumps the minor (`npm run version:dev`), releases bump the major
(`npm run version:release`). Both branches gate on a green `lint-build` check.
