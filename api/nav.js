// Vercel serverless function: NAV-by-ISIN proxy.
//
// The dashboard is a Module Federation remote that executes on the *shell's*
// origin, and every NAV data source that covers these Irish EUR mutual funds is
// CORS-blocked from the browser. This function fetches NAV server-side (no CORS
// limit, no key leaked to the client) and returns CORS-clean JSON.
//
// GET /api/nav?isin=IE0032620787,IE0007987690
//   -> { quotes: { [ISIN]: { price, currency, name, asOf } }, errors: [ISIN...] }
//
// Provider: keyless Yahoo Finance (two calls per ISIN — symbol search, then the
// chart endpoint whose meta carries the latest NAV). The provider lives in the
// isolated `fetchQuote` adapter so a keyed source can replace it without
// touching the response shape or the frontend.

const YAHOO_SEARCH = 'https://query1.finance.yahoo.com/v1/finance/search';
const YAHOO_CHART = 'https://query1.finance.yahoo.com/v8/finance/chart';
// Yahoo rejects requests without a browser-like User-Agent.
const UPSTREAM_HEADERS = { 'User-Agent': 'Mozilla/5.0' };

// Provider adapter — resolve one ISIN to a quote. Throws on any miss so the
// caller can route the ISIN into `errors`. Swap this function to change source.
async function fetchQuote(isin) {
  // 1. Resolve the ISIN to a tradable Yahoo symbol.
  const searchRes = await fetch(
    `${YAHOO_SEARCH}?q=${encodeURIComponent(isin)}`,
    { headers: UPSTREAM_HEADERS },
  );
  if (!searchRes.ok) throw new Error(`search failed (${searchRes.status})`);
  const searchJson = await searchRes.json();
  const candidates = Array.isArray(searchJson?.quotes) ? searchJson.quotes : [];
  if (candidates.length === 0) throw new Error('no symbol for ISIN');
  // Prefer a fund/ETF quote; fall back to the first result.
  const match =
    candidates.find((q) => ['MUTUALFUND', 'ETF'].includes(q.quoteType)) ||
    candidates[0];
  const symbol = match.symbol;
  const nameFallback = match.longname || match.shortname || null;
  if (!symbol) throw new Error('no symbol for ISIN');

  // 2. Read the latest NAV from the chart endpoint's meta block.
  const chartRes = await fetch(
    `${YAHOO_CHART}/${encodeURIComponent(symbol)}?range=5d&interval=1d`,
    { headers: UPSTREAM_HEADERS },
  );
  if (!chartRes.ok) throw new Error(`chart failed (${chartRes.status})`);
  const chartJson = await chartRes.json();
  const meta = chartJson?.chart?.result?.[0]?.meta;
  const price = meta?.regularMarketPrice;
  if (typeof price !== 'number' || !Number.isFinite(price)) {
    throw new Error('no price in chart meta');
  }

  return {
    price,
    currency: meta.currency || null,
    name: meta.longName || nameFallback || null,
    asOf: meta.regularMarketTime ? meta.regularMarketTime * 1000 : null,
  };
}

function parseIsins(req) {
  let raw = req?.query?.isin;
  if (raw == null && req?.url) {
    raw = new URL(req.url, 'http://localhost').searchParams.get('isin');
  }
  if (Array.isArray(raw)) raw = raw.join(',');
  return [
    ...new Set(
      String(raw || '')
        .split(',')
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean),
    ),
  ];
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Content-Type', 'application/json');
  // Once-daily NAV: an hour of CDN caching (with SWR) is ample and keeps us far
  // inside upstream rate limits without a database.
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const isins = parseIsins(req);
  if (isins.length === 0) {
    res.statusCode = 400;
    res.end(
      JSON.stringify({
        quotes: {},
        errors: [],
        message: 'Provide ?isin=ISIN[,ISIN,...]',
      }),
    );
    return;
  }

  // Tolerant batch: one bad ISIN lands in `errors`, the rest still return.
  const settled = await Promise.allSettled(
    isins.map((isin) => fetchQuote(isin)),
  );
  const quotes = {};
  const errors = [];
  settled.forEach((result, i) => {
    if (result.status === 'fulfilled' && result.value) {
      quotes[isins[i]] = result.value;
    } else {
      errors.push(isins[i]);
    }
  });

  res.statusCode = 200;
  res.end(JSON.stringify({ quotes, errors }));
}

// Exported for unit testing the provider adapter in isolation.
export { fetchQuote };
