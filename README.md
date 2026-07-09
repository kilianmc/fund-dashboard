# AI Portfolio Project 1 — Fund Portfolio Dashboard

A responsive fund portfolio dashboard built with **React + Vite** and **Chart.js**
(via `react-chartjs-2`), styled with **SCSS** and a runtime-switchable
**light/dark theme**. Ported from a single-file HTML prototype into a
component-based React app.

This is Project 1 ("AI-as-Copilot") of a two-project portfolio pair — see
[DEV_JOURNAL.md](DEV_JOURNAL.md) for the full project brief and a chronological
log of the work.

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

```
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
