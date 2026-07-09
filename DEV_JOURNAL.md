# Developer Journal — AI Portfolio Dashboard

A chronological, indexed log of the development of the project.

---

## Project Brief — Two AI Collaboration Portfolio Projects

> Imported from `Two AI Collaboration Portfolio Projects .md` — the original plan,
> recommendations, and dashboard spec that this project implements.

### STEP 1

#### Section 1 — Project Overview
These two React projects form a complementary portfolio pair designed to demonstrate fluency across the modern spectrum of AI-assisted software development. Project 1 ("AI-as-Copilot") positions you as the driver: you architect the application, make every meaningful design decision, and use AI prompts as an accelerant for boilerplate, refactoring, debugging, and learning unfamiliar APIs. Project 2 ("AI-as-Agent") inverts the dynamic: you act as a technical lead and reviewer, writing clear specifications and acceptance criteria while autonomous coding agents produce the implementation, open pull requests, and generate tests that you critically review, accept, or reject.

The value of this pairing for a portfolio is that it shows judgment, not just output. Employers and clients increasingly care less about whether you can write a useState hook and more about whether you can effectively orchestrate AI tooling while retaining ownership of quality and architecture. Project 1 proves you can collaborate with AI without surrendering control or accumulating "vibe-coded" tech debt. Project 2 proves you can operate at the higher altitude that the industry is trending toward — specification, delegation, and rigorous review of machine-generated code.

Together they tell a coherent story: you understand when to keep your hands on the keyboard and when to delegate, and you can articulate the trade-offs. To maximize portfolio impact, keep both projects in the same product domain (e.g., a task tracker, a recipe manager, or a small analytics dashboard) so the difference the reader perceives is purely the collaboration model, not the problem difficulty. Document your process visibly — commit history, prompt logs, and PR reviews become first-class artifacts, not afterthoughts.

#### Section 2 — Implementation Steps
Define a shared product concept. Pick one modest, well-scoped app idea (5–8 core features) that both projects will implement. This makes the comparison honest and halves your design overhead.
Write a specification document. Draft user stories, a feature list, data model, and acceptance criteria. This doc becomes your prompt source for Project 1 and your agent brief for Project 2.
Set up the local environment and repositories. Create two separate Git repos (or a monorepo with two packages). Establish linting, formatting, and testing conventions up front so both projects are judged on the same bar. (See Section 3.)
Build Project 1 (AI-as-Copilot).
You scaffold the app and own the architecture.
Use AI prompts for component generation, debugging, and refactors — but review and adapt every suggestion.
Keep a "prompt journal": log notable prompts, what you accepted/rejected, and why. This is a portfolio differentiator.
Build Project 2 (AI-as-Agent).
Convert your spec into agent-ready task tickets (clear, testable, atomic).
Have the agent implement features branch-by-branch and open PRs.
Review each PR: read the diff, run the tests, request changes, and only merge what meets your bar. Record your review comments as artifacts.
Establish testing for both. Unit tests (Vitest + React Testing Library), a few end-to-end tests (Playwright). In Project 2, treat agent-written tests skeptically — verify they actually assert meaningful behavior, not just pass.
Hit key milestones: MVP feature-complete → tests green → accessibility & responsive pass → deployment → README/case-study written.
Deploy both projects. (See Section 4.) Use CI to auto-deploy on merge to main.
Write comparative documentation. Each README should include a short "How AI was used" case study. Consider a third landing page that links both and summarizes what you learned about each collaboration model — this ties the portfolio together.

#### Section 3 — Local Environment Setup
Core runtime & package management

Node.js 22 LTS (use a version manager — nvm, fnm, or volta — and commit an .nvmrc).
pnpm as the package manager (fast, disk-efficient, great for a monorepo). npm is a fine fallback.
Vite as the build tool with the React + TypeScript template — the current default for new React SPAs; fast HMR and simple config. (Choose Next.js instead only if you want SSR/routing/server actions.)
TypeScript throughout — signals professionalism and gives AI tools richer context to work against.
IDE & extensions

VS Code (which you're already in). Recommended extensions: ESLint, Prettier, Error Lens, GitLens, Vitest, Playwright Test, and the Tailwind IntelliSense extension if you use Tailwind.
Enable format-on-save with Prettier and lint with ESLint (flat config).
AI tooling

For Project 1 (prompt-based copilot): Claude Code (this CLI, also available as a VS Code extension), GitHub Copilot, or Cursor. Use them inline for generation and Q&A while you retain edit control. Keep a running prompt journal file in the repo.
For Project 2 (autonomous agents): Use an agent workflow such as Claude Code with subagents / background tasks, GitHub's coding agent, or a Cursor/agent runner that can open PRs. Wire the agent to a GitHub repo so it produces real branches and pull requests you review. Configure a CLAUDE.md (or equivalent context file) with your conventions so the agent stays on-spec.
Consider a .claude/ or agent-rules file capturing coding standards, folder structure, and test expectations — this dramatically improves autonomous output quality.
Version control

Git + GitHub. Protect main with a branch-protection rule requiring passing CI and (for Project 2) at least one review — you're the reviewer, which reinforces the project's narrative.
Use Conventional Commits and meaningful PR descriptions; the commit history is a visible artifact.
Additional tooling

Vitest + React Testing Library for unit/component tests; Playwright for E2E.
GitHub Actions for CI (lint, type-check, test on every PR).
Husky + lint-staged for pre-commit checks.
Storybook (optional) if the app is component-heavy — great portfolio candy.

#### Section 4 — Hosting Recommendations
Primary recommendation: Vercel or Netlify

Both offer generous free tiers, Git-connected auto-deploys, instant preview deployments per pull request, and near-zero configuration for Vite/Next.js apps. Preview deployments are especially valuable for Project 2 — every agent-generated PR gets a live URL, so you can review the running app, not just the diff. That's a genuine workflow win for the agent-based project.
Vercel is the smoothest choice if you use Next.js; Netlify is equally strong for a plain Vite SPA. Either is a defensible, industry-standard pick.
Alternatives worth knowing

Cloudflare Pages — excellent performance via edge CDN, very generous free tier, good if you want edge functions cheaply.
GitHub Pages — free and simple for a static SPA, but no preview deploys or serverless functions; fine as a fallback, weaker for the AI-review workflow.
Cost, performance, ease of use

All the above cost $0 for portfolio-scale traffic. You only pay if you add serverless compute at scale or want team features.
Global CDN delivery means fast load times everywhere with no tuning.
Git-based deploys mean "merge to main = live," which pairs perfectly with your CI setup.
AI-integration considerations

If either app calls an LLM API at runtime (e.g., a chat feature), never expose API keys in the client — proxy calls through a serverless function (Vercel/Netlify Functions or Cloudflare Workers) and store keys as encrypted environment variables in the host dashboard.
Set spending limits on any AI API account to avoid surprise bills from a runaway request loop.
Domain & SSL

Buy one domain (Namecheap, Cloudflare Registrar, or Porkbun; ~$10–15/yr) and use subdomains — e.g., copilot.yourname.dev and agent.yourname.dev, with a root landing page linking both.
SSL is automatic and free (Let's Encrypt) on all recommended hosts — no manual certificate management needed.

### STEP 2

Create a modern financial dashboard UI mockup for a fund portfolio on a single-page web application.

Style: Minimalist, professional, premium asset management dashboard inspired by Bloomberg, Morningstar, BlackRock Aladdin, and modern fintech dashboards. Light theme with white cards, subtle shadows, rounded corners (16px), Inter font.

The page is divided into four equal sections (2×2 grid).

**Top Left – Performance Chart**

Large interactive line chart.
Compare Portfolio Performance (blue line) against S&P 500 Benchmark (gray dashed line).
Time range: 4 options( Last 12 Months, 3 years, 5 years, all history)
Include legend.
Smooth curves with subtle grid lines.
Hover tooltip style visible.

**Top Right – Portfolio Overview**
Display KPI cards:

Total Portfolio Value: €425,800
Today's Return: +€1,240 (+0.29%)
YTD Return: +14.8%
Annualized Return: +10.7%
Risk Level: Moderate
Volatility: 12.6%
Dividend Yield: 1.9%
Last Updated: Today 10:42

Under the KPIs, show two compact cards:

Best Performing Fund: Vanguard S&P 500 (+18.2%)
Largest Holding: Vanguard EuroStocks (45%)

**Bottom Left – Holdings Table**

Three rows:

| Fund | Allocation | Market Value | Daily | YTD |
| --- | --- | --- | --- | --- |
| Vanguard EuroStocks | 45% | €191,600 | +0.41% | +12.4% |
| Vanguard S&P 500 | 35% | €148,900 | +0.63% | +18.2% |
| Vanguard Emerging Markets | 20% | €85,300 | +1.12% | +10.1% |

Footer:

Total Portfolio Value
Overall Return

**Bottom Right – Portfolio Allocation**
Large modern donut chart.

Allocation:

Vanguard EuroStocks — 45%
Vanguard S&P 500 — 35%
Vanguard Emerging Markets — 20%

Center of donut:
€425,800
Total Portfolio

Include a clean legend with matching colors.

Overall appearance:

Spacious layout
Premium institutional investment dashboard
Clean typography
Responsive web application mockup
High-fidelity UI/UX design
Realistic dashboard with polished charts, subtle gradients, and elegant financial data visualization.

Done. I've created a high-fidelity, interactive mockup at fund-portfolio-dashboard.html on your Desktop.

Here's what I built against your spec:

Layout — 2×2 equal grid, spacious, with a slim branded top bar (logo, "Live · 10:42" pulse pill, avatar). Light theme, white cards, 16px radius, subtle shadows, Inter font throughout.

Top Left — Performance Chart

Real interactive Chart.js line chart: Portfolio (blue, gradient fill, smooth tension curves) vs S&P 500 (gray dashed).
Segmented time-range toggle: 12M / 3Y / 5Y / All — each swaps in its own dataset live.
Legend, subtle grid lines, and a dark hover tooltip (index mode — hovering shows both series at that point).
Top Right — Portfolio Overview

8 KPI tiles: Total Value €425,800 · Today +€1,240 (+0.29%) · YTD +14.8% · Annualized +10.7% · Risk Level Moderate (with a little bar-gauge) · Volatility 12.6% · Dividend Yield 1.9% (+ a Sharpe tile to fill the 4×2 grid cleanly).
Two gradient mini-cards: Best Performing Fund (Vanguard S&P 500 +18.2%) and Largest Holding (Vanguard EuroStocks 45%).
Bottom Left — Holdings Table

Three fund rows with color dots (matching the donut), allocation micro-bars, market value, daily and YTD (green positives).
Footer strip: Total Portfolio Value €425,800 and Overall Return +14.8%.
Bottom Right — Allocation Donut

Animated donut (72% cutout, rounded segments, hover offset) with €425,800 / Total Portfolio centered, plus a clean legend with matching colors and € values.
Colors are consistent across table, donut, and legend (EuroStocks = blue, S&P 500 = emerald, EM = violet), and it's responsive — under ~1080px the grid stacks to one column.

![Fund portfolio dashboard mockup](../../image.png)

---

## Session — 2026-07-08
Manual changes on the mockup to adjust it a bit with what i want.

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