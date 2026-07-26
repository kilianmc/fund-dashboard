import {
  FUND_CATALOG,
  PALETTE,
  getMetadata,
  normalizeType,
} from './fundCatalog';

// ---- Formatting helpers ----
// European, always-compact euro formatter: K/M suffixes, € after the number
// with a space, decimal comma (de-DE), up to 2 decimals with trailing zeros
// dropped, minus before the number. Global — used everywhere euros are shown.
export const fmtEur = (v) => {
  const n = Number(v) || 0;
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  let num = abs;
  let suffix = '';
  if (abs >= 1_000_000) {
    num = abs / 1_000_000;
    suffix = 'M';
  } else if (abs >= 1_000) {
    num = abs / 1_000;
    suffix = 'K';
  }
  const digits = num.toLocaleString('de-DE', { maximumFractionDigits: 2 });
  return `${sign}${digits}${suffix} €`;
};
// Signed euro for KPI copy: fmtEur already emits the minus for negatives, so
// only prepend '+' for non-negative values.
export const fmtEurSigned = (v) =>
  ((Number(v) || 0) >= 0 ? '+' : '') + fmtEur(v);
// Compact number (no € symbol, whole numbers): K/M suffixes, European digits,
// minus before the number. Used for the Holdings Cost/Actual/Value columns.
export const fmtCompact = (v) => {
  const n = Number(v) || 0;
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  let num = abs;
  let suffix = '';
  if (abs >= 1_000_000) {
    num = abs / 1_000_000;
    suffix = 'M';
  } else if (abs >= 1_000) {
    num = abs / 1_000;
    suffix = 'K';
  }
  return sign + Math.round(num).toLocaleString('de-DE') + suffix;
};
export const signClass = (v) => (v >= 0 ? 'pos' : 'neg');
export const fmtSigned = (v, d) => (v >= 0 ? '+' : '') + v.toFixed(d) + '%';

// ---- Headline figures ----
export const TOTAL_VALUE = 425800;
export const YTD_RETURN_PCT = 14.8;
export const YTD_RETURN = fmtSigned(YTD_RETURN_PCT, 1);
// Euro gain implied by the YTD return (value grown from its start-of-year base)
export const YTD_GAIN = TOTAL_VALUE - TOTAL_VALUE / (1 + YTD_RETURN_PCT / 100);

// ---- Fund data (allocations sum to 100%, values sum to €425,800) ----
// type: 'equity' | 'income'  (income = fixed income / bonds)
// yield: est. annual distribution yield (%), used for income projection
export const funds = [
  {
    name: 'Vanguard EuroStocks',
    tag: 'Developed Europe Eq.',
    type: 'equity',
    color: '#2563eb',
    alloc: 20,
    value: 85160,
    daily: 0.41,
    ytd: 12.4,
    yield: 7.2,
  },
  {
    name: 'Vanguard S&P 500',
    tag: 'US Large Cap Eq.',
    type: 'equity',
    color: '#10b981',
    alloc: 18,
    value: 76644,
    daily: 0.63,
    ytd: 18.2,
    yield: 6.5,
  },
  {
    name: 'Vanguard Emerging Markets',
    tag: 'EM Equity',
    type: 'equity',
    color: '#7c6cf0',
    alloc: 12,
    value: 51096,
    daily: 1.12,
    ytd: 10.1,
    yield: 8.4,
  },
  {
    name: 'Vanguard FTSE All-World',
    tag: 'Global Equity',
    type: 'equity',
    color: '#f59e0b',
    alloc: 10,
    value: 42580,
    daily: 0.34,
    ytd: 11.7,
    yield: 6.9,
  },
  {
    name: 'Vanguard Global Bond',
    tag: 'Global Fixed Income',
    type: 'income',
    color: '#ef4444',
    alloc: 9,
    value: 38322,
    daily: -0.08,
    ytd: 3.2,
    yield: 3.4,
  },
  {
    name: 'Vanguard Total Intl Stock',
    tag: 'Intl Developed Eq.',
    type: 'equity',
    color: '#06b6d4',
    alloc: 8,
    value: 34064,
    daily: 0.52,
    ytd: 9.4,
    yield: 7.7,
  },
  {
    name: 'Vanguard Real Estate',
    tag: 'Global REIT',
    type: 'income',
    color: '#ec4899',
    alloc: 7,
    value: 29806,
    daily: -0.21,
    ytd: 5.6,
    yield: 3.6,
  },
  {
    name: 'Vanguard Small-Cap',
    tag: 'US Small Cap Eq.',
    type: 'equity',
    color: '#84cc16',
    alloc: 6,
    value: 25548,
    daily: 0.88,
    ytd: 14.9,
    yield: 6.2,
  },
  {
    name: 'Vanguard Dividend Appreciation',
    tag: 'US Dividend',
    type: 'income',
    color: '#6366f1',
    alloc: 5,
    value: 21290,
    daily: 0.19,
    ytd: 8.3,
    yield: 2.7,
  },
  {
    name: 'Vanguard Information Technology',
    tag: 'US Tech Sector',
    type: 'equity',
    color: '#f97316',
    alloc: 5,
    value: 21290,
    daily: 1.47,
    ytd: 22.6,
    yield: 9.0,
  },
];

// ---- Asset-type split (equity vs income), by allocation % ----
export const EQUITY_PCT = funds
  .filter((f) => f.type === 'equity')
  .reduce((s, f) => s + f.alloc, 0);
export const INCOME_PCT = funds
  .filter((f) => f.type === 'income')
  .reduce((s, f) => s + f.alloc, 0);

// ---- Derived KPIs ----
// Best performer by YTD return
export const BEST_PERFORMER = funds.reduce(
  (best, f) => (f.ytd > best.ytd ? f : best),
  funds[0],
);
// Estimated annual income across all holdings (Σ value × yield)
export const EST_ANNUAL_INCOME = funds.reduce(
  (s, f) => s + (f.value * f.yield) / 100,
  0,
);

// ---- Performance data (indexed to 100 at start) ----
export const perfData = {
  '12m': {
    labels: [
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
    ],
    port: [
      100, 101.8, 100.9, 103.4, 105.1, 104.2, 106.8, 108.9, 107.6, 110.9, 112.8,
      114.8,
    ],
    bench: [
      100, 101.1, 100.2, 102.0, 103.6, 102.9, 104.7, 106.2, 105.1, 107.4, 108.9,
      110.3,
    ],
  },
  '3y': {
    labels: ['2023', '', '', '2024', '', '', '2025', '', '', '2026', ''],
    port: [100, 104, 101, 108, 113, 110, 118, 126, 122, 131, 138.5],
    bench: [100, 103, 100.5, 106, 110, 107.5, 113, 119, 116, 123, 128],
  },
  '5y': {
    labels: [
      '2021',
      '',
      '2022',
      '',
      '2023',
      '',
      '2024',
      '',
      '2025',
      '',
      '2026',
    ],
    port: [100, 109, 97, 104, 112, 120, 131, 140, 152, 161, 172],
    bench: [100, 111, 95, 101, 108, 115, 124, 132, 142, 150, 159],
  },
  all: {
    labels: [
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
      '2025',
      '2026',
    ],
    port: [100, 114, 110, 132, 140, 168, 150, 178, 205, 231, 258],
    bench: [100, 118, 112, 138, 150, 182, 158, 186, 214, 238, 262],
  },
};

export const perfRanges = [
  { key: '12m', label: '12M' },
  { key: '3y', label: '3Y' },
  { key: '5y', label: '5Y' },
  { key: 'all', label: 'All' },
];

// ============================================================================
// Holdings model: default dataset + pure derivation helpers
// ----------------------------------------------------------------------------
// The dashboard state is driven by "raw holdings" (id/shares + a price) that are
// enriched with catalog metadata and (for imports) live NAV, then reduced to a
// set of derived metrics. Both the default dataset and imported files run this
// same math via `enrichFunds` + `deriveMetrics`, so the two paths stay identical.
// ============================================================================

// Default holdings. Each carries its own mock `price` (current NAV) and a
// `costBasis` below it so gains render realistically; shares × price reproduce
// the original per-fund values and sum to the ~€425,800 headline total. Keys map
// to the default entries in FUND_CATALOG (plausible ISINs; not live-fetched).
export const DEFAULT_HOLDINGS = [
  { id: 'IE00B945VV12', shares: 400, costBasis: 188.0, price: 212.9 }, // EuroStocks
  { id: 'IE00B3XXRP09', shares: 300, costBasis: 210.0, price: 255.48 }, // S&P 500
  { id: 'IE00B3VVMM84', shares: 300, costBasis: 152.0, price: 170.32 }, // Emerging Mkts
  { id: 'IE00B3RBWM25', shares: 200, costBasis: 189.0, price: 212.9 }, // FTSE All-World
  { id: 'IE00B18GC888', shares: 400, costBasis: 92.5, price: 95.81 }, // Global Bond
  { id: 'IE00B3S5XW04', shares: 200, costBasis: 154.0, price: 170.32 }, // Total Intl Stock
  { id: 'IE00B5BMR087', shares: 200, costBasis: 141.0, price: 149.03 }, // Real Estate
  { id: 'IE00BF4RFH31', shares: 200, costBasis: 110.0, price: 127.74 }, // Small-Cap
  { id: 'IE00B8GKDB10', shares: 200, costBasis: 98.0, price: 106.45 }, // Dividend Appr.
  { id: 'IE00BGV5VN51', shares: 100, costBasis: 172.0, price: 212.88 }, // Info Technology
];

// Read a quote for an ISIN out of either a Map (from navService) or a plain
// object (`{ [isin]: quote }`), so callers/tests can pass whichever is handy.
function readQuote(quotesMap, isin) {
  if (!quotesMap) return undefined;
  if (quotesMap instanceof Map) return quotesMap.get(isin);
  return quotesMap[isin];
}

// Merge raw holdings + live NAV quotes + catalog/fallback metadata into fully
// normalized fund objects. Pure: no I/O, returns fresh objects.
//   - `price` = live NAV when available; otherwise the holding's own mock price
//     (default dataset). An imported fund with no quote CANNOT be priced: it is
//     flagged `priceError` with null price/value/gain — we never fabricate a
//     market value from the cost basis.
//   - `costBasis`/`cost` are always known from the file (purchase price × shares)
//     and render even for a `priceError` fund.
//   - `ytd`/`yield` come from catalog metadata (default funds) and are null for
//     imported funds, whose metadata carries neither.
export function enrichFunds(rawHoldings, quotesMap, catalog = FUND_CATALOG) {
  return rawHoldings.map((h, index) => {
    const id = String(h.id).trim().toUpperCase();
    const quote = readQuote(quotesMap, id);
    const meta = catalog[id] || getMetadata(id, quote?.name);

    // Type precedence: file-provided normalized type → catalog type → 'equity'.
    const type = normalizeType(h.type) ?? meta.type ?? 'equity';

    const hasCostBasis = h.costBasis != null;
    const costBasis = hasCostBasis ? h.costBasis : h.price;
    const shares = h.shares;
    const cost = shares * costBasis;

    const navPrice = quote?.price;
    let price;
    let priceError;
    if (typeof navPrice === 'number' && Number.isFinite(navPrice)) {
      price = navPrice;
      priceError = false;
    } else if (hasCostBasis) {
      // Default dataset: trust its own mock price (no live NAV expected).
      price = h.price;
      priceError = false;
    } else {
      // Imported holding with no live NAV: it can't be priced. Surface a
      // per-line error instead of inventing a value from the cost basis.
      price = null;
      priceError = true;
    }

    const base = {
      id,
      name: meta.name,
      tag: meta.tag,
      type,
      // Colour by array position so every fund (known or unknown) gets a
      // distinct palette colour with no catalog/index collisions.
      color: PALETTE[index % PALETTE.length],
      shares,
      costBasis,
      cost,
      ytd: meta.ytd ?? null,
      yield: meta.yield ?? null,
      currency: quote?.currency ?? 'EUR',
      asOf: quote?.asOf ?? null,
      alloc: 0,
    };

    if (priceError) {
      return {
        ...base,
        price: null,
        value: null,
        gain: null,
        gainPct: null,
        priceError: true,
      };
    }

    const value = shares * price;
    const gain = value - cost;
    const gainPct = cost ? (gain / cost) * 100 : 0;
    return { ...base, price, value, gain, gainPct, priceError: false };
  });
}

// Reduce normalized funds to derived portfolio metrics, and assign each fund its
// derived `alloc` (value share, %). All value-based metrics are computed over
// only the PRICED funds — funds flagged `priceError` (imported, no live NAV)
// have no market value, so they are excluded from totals/allocation/donut math
// while still appearing in the Holdings table. Best performer prefers YTD,
// falling back to gain % when YTD is unavailable (e.g. imported funds).
export function deriveMetrics(funds) {
  const priced = funds.filter((f) => !f.priceError && f.value != null);

  const TOTAL_VALUE = priced.reduce((s, f) => s + f.value, 0);
  const TOTAL_COST = priced.reduce((s, f) => s + f.cost, 0);
  const TOTAL_GAIN = TOTAL_VALUE - TOTAL_COST;
  const TOTAL_GAIN_PCT = TOTAL_COST ? (TOTAL_GAIN / TOTAL_COST) * 100 : 0;

  funds.forEach((f) => {
    f.alloc =
      !f.priceError && f.value != null && TOTAL_VALUE
        ? (f.value / TOTAL_VALUE) * 100
        : 0;
  });

  const equityValue = priced
    .filter((f) => f.type === 'equity')
    .reduce((s, f) => s + f.value, 0);
  const EQUITY_PCT = TOTAL_VALUE
    ? Math.round((equityValue / TOTAL_VALUE) * 100)
    : 0;
  const INCOME_PCT = TOTAL_VALUE ? 100 - EQUITY_PCT : 0;

  const hasYtd = priced.some((f) => f.ytd != null);
  const BEST_PERFORMER = priced.reduce((best, f) => {
    if (!best) return f;
    if (hasYtd) {
      return (f.ytd ?? -Infinity) > (best.ytd ?? -Infinity) ? f : best;
    }
    return f.gainPct > best.gainPct ? f : best;
  }, null);

  const EST_ANNUAL_INCOME = priced.reduce(
    (s, f) => s + (f.value * (f.yield ?? 0)) / 100,
    0,
  );

  return {
    TOTAL_VALUE,
    TOTAL_COST,
    TOTAL_GAIN,
    TOTAL_GAIN_PCT,
    EQUITY_PCT,
    INCOME_PCT,
    BEST_PERFORMER,
    EST_ANNUAL_INCOME,
  };
}
