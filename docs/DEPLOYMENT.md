# Deployment checklist (Vercel) — `fund-dashboard` remote

This app is a Module Federation **remote** (`fundDashboard`) consumed by the
`portfolio-shell` host. Its Vercel deploys serve the `remoteEntry.js` the shell
loads via `VITE_FUND_REMOTE_URL`. See **Deployment (dev→prod)** in `CLAUDE.md`
for the branch/versioning model; this file is the concrete Vercel dashboard
checklist for Kilian.

## Branch → deploy model

- `dev` (integration) → stable dev URL. Feature PRs target `dev`.
- `main` (production) → production URL. `main` receives only `dev`→`main`
  promotion PRs, merged by Kilian after testing the dev URL.

## Vercel dashboard checklist

- [ ] **Production Branch = `main`** — Project → Settings → Git → Production
      Branch is set to `main`.
- [ ] **`dev` branch auto-deploys** — Vercel deploys all pushed branches by
      default (Settings → Git → confirm branch deployments are not restricted).
      After the first push to `dev`, confirm a deployment appears and note the
      resulting dev URL.
- [ ] **Dev deploy serves `/remoteEntry.js`** — open
      `<dev-url>/remoteEntry.js` and confirm it returns the module entry
      (HTTP 200, JS), not a 404.
- [ ] **CORS header present** — confirm the response for `/remoteEntry.js`
      includes `Access-Control-Allow-Origin: *` (comes from `vercel.json`).
      Without it the shell cannot load the remote cross-origin.
- [ ] **Record the remoteEntry URLs the shell consumes** (below) and set the
      shell's `VITE_FUND_REMOTE_URL` per environment.

## remoteEntry.js URLs (for the shell)

| Environment | URL                                                                        |
| ----------- | -------------------------------------------------------------------------- |
| Production  | `https://ai-portfolio-project1.vercel.app/remoteEntry.js`                  |
| Dev         | `https://ai-portfolio-project1-git-dev-kilianmc.vercel.app/remoteEntry.js` |

> ⚠️ **Confirm the dev slug.** The dev URL follows Vercel's
> `<project>-git-<branch>-<scope>.vercel.app` pattern, but the exact slug can
> vary. Verify it from the Vercel dashboard (Deployments → the `dev` branch
> deployment) after the first `dev` deploy, and update the shell's
> `VITE_FUND_REMOTE_URL` to match.
