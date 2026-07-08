# AI Portfolio Project 1 — Fund Portfolio Dashboard

A responsive portfolio dashboard built with **React + Vite** and **Chart.js**
(via `react-chartjs-2`). Ported from a single-file HTML prototype into a
component-based React app.

## Features

- **Portfolio Performance** — indexed line chart vs. S&P 500 benchmark, with a
  12M / 3Y / 5Y / All time-range toggle.
- **Portfolio Overview** — headline KPIs (total value, today's return, YTD,
  annualized).
- **Holdings** — sortable-ready table of all 10 funds with a sticky header and
  vertical/horizontal scroll so nothing is clipped on small screens.
- **Allocation** — donut chart with a scrollable legend.
- Fully responsive across three breakpoints (desktop ≥1025px, tablet
  641–1024px, mobile ≤640px).

## Project structure

```
src/
  data/portfolio.js      # fund data, performance series, formatting helpers
  components/            # TopBar, PerformanceCard, OverviewCard, HoldingsCard, AllocationCard
  chartSetup.js          # registers Chart.js components
  App.jsx                # composes the dashboard
  main.jsx               # entry point
  index.css              # design system + layout
```

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build to dist/
npm run preview  # preview the production build
```

> Requires Node 16+. Dependencies are pinned to Vite 4 for Node 16
> compatibility; on Node 18+ you can upgrade to the latest Vite.
