// Fund metadata catalog: maps an ISIN to its display metadata. Two groups live
// here:
//   1. The three real Vanguard Irish EUR daily-NAV mutual funds that the live
//      `/api/nav` proxy can price by ISIN. These carry NO `ytd`/`yield` — those
//      are not derivable from an imported file + latest NAV, so imported funds
//      show "—" for YTD (see enrichFunds).
//   2. The ten default showcase funds. These carry `ytd`/`yield` so the default
//      dashboard renders as richly as before (best performer, est. income).
//
// Colours are the single source of truth for chart/legend colours: enrichFunds
// assigns each fund `PALETTE[index]` by position, so up to PALETTE.length funds
// get a distinct, colourblind-reasonable colour. The first 10 keep their
// original order (default dashboard is visually unchanged); 4 more give headroom
// for imports with >10 funds.
export const PALETTE = [
  '#2563eb',
  '#10b981',
  '#7c6cf0',
  '#f59e0b',
  '#ef4444',
  '#06b6d4',
  '#ec4899',
  '#84cc16',
  '#6366f1',
  '#f97316',
  '#14b8a6',
  '#a855f7',
  '#eab308',
  '#0ea5e9',
];

// Normalize a free-text asset class into 'equity' | 'income', or `undefined`
// when empty/missing/unrecognized. Lenient by design: callers fall back to a
// catalog type or a default rather than treating an unknown value as an error.
export function normalizeType(v) {
  if (v == null) return undefined;
  const s = String(v).trim().toLowerCase();
  if (!s) return undefined;
  const EQUITY = [
    'equity',
    'equities',
    'equity fund',
    'stock',
    'stocks',
    'shares',
    'eq',
  ];
  const INCOME = [
    'income',
    'fixed income',
    'fixed-income',
    'fixedincome',
    'bond',
    'bonds',
    'fixed',
    'fi',
    'debt',
    'fixed_income',
  ];
  if (EQUITY.includes(s)) return 'equity';
  if (INCOME.includes(s)) return 'income';
  return undefined;
}

export const FUND_CATALOG = {
  // --- Real, live-priceable funds (imported via file) ---
  IE0032620787: {
    name: 'Vanguard U.S. 500 Stock Index',
    tag: 'US Large Cap Eq.',
    type: 'equity',
  },
  IE0007987690: {
    name: 'Vanguard European Stock Index',
    tag: 'Developed Europe Eq.',
    type: 'equity',
  },
  IE0031786142: {
    name: 'Vanguard Emerging Markets Stock Index',
    tag: 'EM Equity',
    type: 'equity',
  },

  // --- Default showcase funds (mock data, no live fetch) ---
  IE00B945VV12: {
    name: 'Vanguard EuroStocks',
    tag: 'Developed Europe Eq.',
    type: 'equity',
    ytd: 12.4,
    yield: 7.2,
  },
  IE00B3XXRP09: {
    name: 'Vanguard S&P 500',
    tag: 'US Large Cap Eq.',
    type: 'equity',
    ytd: 18.2,
    yield: 6.5,
  },
  IE00B3VVMM84: {
    name: 'Vanguard Emerging Markets',
    tag: 'EM Equity',
    type: 'equity',
    ytd: 10.1,
    yield: 8.4,
  },
  IE00B3RBWM25: {
    name: 'Vanguard FTSE All-World',
    tag: 'Global Equity',
    type: 'equity',
    ytd: 11.7,
    yield: 6.9,
  },
  IE00B18GC888: {
    name: 'Vanguard Global Bond',
    tag: 'Global Fixed Income',
    type: 'income',
    ytd: 3.2,
    yield: 3.4,
  },
  IE00B3S5XW04: {
    name: 'Vanguard Total Intl Stock',
    tag: 'Intl Developed Eq.',
    type: 'equity',
    ytd: 9.4,
    yield: 7.7,
  },
  IE00B5BMR087: {
    name: 'Vanguard Real Estate',
    tag: 'Global REIT',
    type: 'income',
    ytd: 5.6,
    yield: 3.6,
  },
  IE00BF4RFH31: {
    name: 'Vanguard Small-Cap',
    tag: 'US Small Cap Eq.',
    type: 'equity',
    ytd: 14.9,
    yield: 6.2,
  },
  IE00B8GKDB10: {
    name: 'Vanguard Dividend Appreciation',
    tag: 'US Dividend',
    type: 'income',
    ytd: 8.3,
    yield: 2.7,
  },
  IE00BGV5VN51: {
    name: 'Vanguard Information Technology',
    tag: 'US Tech Sector',
    type: 'equity',
    ytd: 22.6,
    yield: 9.0,
  },
};

// Resolve display metadata (name/tag/type) for an ISIN. Known ISINs return their
// catalog entry; unknown ISINs get a graceful fallback (API-provided name or the
// ISIN itself, plus a neutral tag/type). Colour is NOT owned here — enrichFunds
// assigns it by array position from PALETTE.
export function getMetadata(isin, apiName) {
  const known = FUND_CATALOG[isin];
  if (known) return known;
  return {
    name: apiName || isin,
    tag: '—',
    type: 'equity',
  };
}
