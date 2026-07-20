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

| Environment | URL                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------- |
| Production  | `https://ai-portfolio-project1.vercel.app/remoteEntry.js`                                   |
| Dev         | `https://ai-portfolio-project1-git-dev-kilians-projects-7425dee2.vercel.app/remoteEntry.js` |

> ✅ **Confirmed 2026-07-20.** The dev slug is the Vercel team scope
> `kilians-projects-7425dee2` (not the personal `kilianmc` handle). The
> `-git-dev-` alias is **stable** across dev builds, so the shell's
> `VITE_FUND_REMOTE_URL` Preview scope can point at it permanently.

> ⚠️ **Deployment Protection must stay OFF for previews.** Vercel Authentication
> (Settings → Deployment Protection) gates non-production deploys behind an SSO
> login by default (`ssoProtection: all_except_custom_domains`). That returns a
> `302 → vercel.com/sso-api` for `remoteEntry.js`, so the shell can never load
> the dev remote cross-origin. It was set to **Disabled** on 2026-07-20; keep it
> off or the dev (and any preview) remote will silently fail to mount.
