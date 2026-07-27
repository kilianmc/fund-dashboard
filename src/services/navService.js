// Frontend NAV lookup. Calls the dashboard's own `/api/nav` serverless proxy
// (see api/nav.js) and returns whatever resolved as a Map. Tolerant of partial
// and total failure: missing/failed ISINs are simply absent from the Map, so
// callers can fall back to cost basis.
//
// Base URL — the proxy lives on THIS app's origin, which is NOT the page origin
// when the remote is federated into the shell (kilianmc.com). A relative
// `/api/nav` would hit the shell, whose SPA rewrite answers every path with
// index.html — a 200 of HTML, not a 404 — so the failure is silent. We therefore
// resolve the base from this module's own URL and only fall back to same-origin.
//   1. `VITE_NAV_API_URL` — explicit override (local `npm run dev` against a
//      deployed proxy, or pinning a specific origin).
//   2. `import.meta.url`'s origin — the origin this chunk was served from, i.e.
//      the dashboard's own deployment. Correct standalone AND inside the shell,
//      for production and every preview URL, with no env config.
//   3. `''` — same-origin (non-http module URL, e.g. under Vitest).

function resolveBaseUrl() {
  const override = import.meta.env?.VITE_NAV_API_URL;
  if (override) return String(override).replace(/\/+$/, '');

  try {
    const { protocol, origin } = new URL(import.meta.url);
    if (protocol === 'http:' || protocol === 'https:') return origin;
  } catch {
    // Non-URL module id: fall through to same-origin.
  }

  return '';
}

const BASE_URL = resolveBaseUrl();

// A response is only usable if it is actually JSON. The shell's SPA rewrite
// returns `200 text/html`, which would otherwise blow up in `res.json()` and be
// swallowed as a generic network error. Absent header → attempt the parse.
function isJsonResponse(res) {
  const type = res.headers?.get?.('content-type');
  return type == null || type.includes('json');
}

export async function fetchNav(isins) {
  const unique = [
    ...new Set(
      (isins || []).map((s) => String(s).trim().toUpperCase()).filter(Boolean),
    ),
  ];

  const map = new Map();
  if (unique.length === 0) return map;

  try {
    const url = `${BASE_URL}/api/nav?isin=${encodeURIComponent(unique.join(','))}`;
    const res = await fetch(url);
    if (!res.ok) return map;
    if (!isJsonResponse(res)) {
      // Almost always a wrong-origin request answered by an SPA rewrite.
      console.warn(
        `[navService] ${url} did not return JSON — the NAV proxy is not on this origin. Set VITE_NAV_API_URL to the dashboard's own origin.`,
      );
      return map;
    }
    const data = await res.json();
    const quotes = data?.quotes || {};
    for (const [isin, quote] of Object.entries(quotes)) {
      if (quote && typeof quote.price === 'number') {
        map.set(isin.toUpperCase(), {
          price: quote.price,
          name: quote.name ?? null,
          currency: quote.currency ?? null,
          asOf: quote.asOf ?? null,
        });
      }
    }
  } catch {
    // Network/parse failure: return whatever we have (possibly empty).
    return map;
  }

  return map;
}
