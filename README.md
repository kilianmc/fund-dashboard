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

- **Portfolio Performance** — indexed line chart vs. S&P 500 benchmark, with a
  12M / 3Y / 5Y / All time-range toggle. Gridlines adapt to the active theme.
- **Portfolio Overview** — headline KPIs (total value, today's return, YTD,
  annualized, risk, volatility, dividend yield) plus best-performing-fund and
  largest-holding mini-cards.
- **Holdings** — table of funds with a sticky header and vertical/horizontal
  scroll so nothing is clipped on small screens.
- **Allocation** — donut chart with a scrollable legend; segment borders match
  the card background per theme.
- **Dark mode** — 🌙/☀️ toggle in the top bar, persisted to `localStorage` and
  defaulting to the OS `prefers-color-scheme`.
- Fully responsive across three breakpoints (desktop ≥1025px, tablet
  641–1024px, mobile ≤640px).

## Project structure

```text
src/
  data/portfolio.js         # fund data, performance series, formatting helpers
  components/               # TopBar, PerformanceCard, OverviewCard, HoldingsCard, AllocationCard
    *.jsx / *.scss          # each component paired with its own stylesheet
  styles/
    _variables.scss         # SCSS tokens → CSS custom properties
    _mixins.scss            # flex, breakpoints, uppercase-label, inset-panel
  theme/
    ThemeContext.jsx        # ThemeProvider + useTheme() hook
  chartSetup.js             # registers Chart.js components
  App.jsx                   # composes the dashboard
  main.jsx                  # entry point; wraps App in <ThemeProvider>
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

## Deployment (dev → prod)

Two long-lived branches: **`dev`** (integration) and **`main`** (production).
Feature PRs target `dev`; `main` only receives `dev`→`main` promotion PRs after
the dev deploy is tested. Vercel auto-deploys `dev` to a stable dev URL and
`main` to production — both serving `remoteEntry.js` for the shell to consume per
environment via `VITE_FUND_REMOTE_URL`. Production baseline is `1.0.0`; dev
bumps the minor (`npm run version:dev`), releases bump the major
(`npm run version:release`). Both branches gate on a green `lint-build` check.
