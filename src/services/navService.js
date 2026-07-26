// Frontend NAV lookup. Calls the dashboard's own `/api/nav` serverless proxy
// (see api/nav.js) and returns whatever resolved as a Map. Tolerant of partial
// and total failure: missing/failed ISINs are simply absent from the Map, so
// callers can fall back to cost basis.
//
// Base URL: `VITE_NAV_API_URL` (the dashboard's own origin) when the remote runs
// on a different origin (e.g. inside the shell); empty string means same-origin.

const BASE_URL = import.meta.env.VITE_NAV_API_URL || '';

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
