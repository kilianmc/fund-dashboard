import { describe, it, expect } from 'vitest';
import {
  fmtEur,
  fmtEurSigned,
  fmtCompact,
  signClass,
  fmtSigned,
  TOTAL_VALUE,
  YTD_RETURN_PCT,
  YTD_RETURN,
  YTD_GAIN,
  funds,
  EQUITY_PCT,
  INCOME_PCT,
  BEST_PERFORMER,
  EST_ANNUAL_INCOME,
  perfData,
  perfRanges,
  DEFAULT_HOLDINGS,
  enrichFunds,
  deriveMetrics,
} from './portfolio';

describe('formatting helpers', () => {
  it('fmtEur formats compact European euros (K/M, comma decimals, € suffix)', () => {
    expect(fmtEur(1000)).toBe('1K €');
    expect(fmtEur(1500)).toBe('1,5K €');
    expect(fmtEur(42500)).toBe('42,5K €');
    expect(fmtEur(425800)).toBe('425,8K €');
    expect(fmtEur(1234567)).toBe('1,23M €');
    expect(fmtEur(12000)).toBe('12K €');
    expect(fmtEur(7500)).toBe('7,5K €');
    expect(fmtEur(9345.6)).toBe('9,35K €');
    expect(fmtEur(1845.6)).toBe('1,85K €');
    expect(fmtEur(-1845.6)).toBe('-1,85K €');
    expect(fmtEur(123.12)).toBe('123,12 €');
    expect(fmtEur(0)).toBe('0 €');
  });

  it('fmtEurSigned prepends + for non-negatives (fmtEur owns the minus)', () => {
    expect(fmtEurSigned(1240)).toBe('+1,24K €');
    expect(fmtEurSigned(0)).toBe('+0 €');
    expect(fmtEurSigned(-1845.6)).toBe('-1,85K €');
  });

  it('fmtCompact renders whole compact numbers with no € symbol', () => {
    expect(fmtCompact(62.5)).toBe('63');
    expect(fmtCompact(37.5)).toBe('38');
    expect(fmtCompact(23.83)).toBe('24');
    expect(fmtCompact(180)).toBe('180');
    expect(fmtCompact(7500)).toBe('8K');
    expect(fmtCompact(12000)).toBe('12K');
    expect(fmtCompact(9345.6)).toBe('9K');
    expect(fmtCompact(49765)).toBe('50K');
    expect(fmtCompact(306.19)).toBe('306');
  });

  it('signClass returns "pos" for >= 0 and "neg" for negatives', () => {
    expect(signClass(0.41)).toBe('pos');
    expect(signClass(0)).toBe('pos');
    expect(signClass(-0.08)).toBe('neg');
  });

  it('fmtSigned prefixes a + for non-negatives and fixes the decimals', () => {
    expect(fmtSigned(14.8, 1)).toBe('+14.8%');
    expect(fmtSigned(-0.08, 2)).toBe('-0.08%');
    expect(fmtSigned(0, 1)).toBe('+0.0%');
    expect(fmtSigned(22.6, 1)).toBe('+22.6%');
  });
});

describe('headline figures', () => {
  it('exposes the expected total value and YTD return', () => {
    expect(TOTAL_VALUE).toBe(425800);
    expect(YTD_RETURN_PCT).toBe(14.8);
    expect(YTD_RETURN).toBe('+14.8%');
  });

  it('derives the YTD euro gain from the return and its start-of-year base', () => {
    // 425800 - 425800 / 1.148 ≈ 54894.08
    expect(YTD_GAIN).toBeCloseTo(54894.08, 2);
    expect(fmtEur(YTD_GAIN)).toBe('54,89K €');
  });
});

describe('fund data integrity', () => {
  it('has ten funds', () => {
    expect(funds).toHaveLength(10);
  });

  it('allocations sum to exactly 100%', () => {
    const total = funds.reduce((s, f) => s + f.alloc, 0);
    expect(total).toBe(100);
  });

  it('fund values sum to the headline total value', () => {
    const total = funds.reduce((s, f) => s + f.value, 0);
    expect(total).toBe(TOTAL_VALUE);
  });

  it('every fund is either equity or income', () => {
    for (const f of funds) {
      expect(['equity', 'income']).toContain(f.type);
    }
  });
});

describe('asset-type split', () => {
  it('splits equity vs income by allocation, summing to 100', () => {
    expect(EQUITY_PCT).toBe(79);
    expect(INCOME_PCT).toBe(21);
    expect(EQUITY_PCT + INCOME_PCT).toBe(100);
  });
});

describe('derived KPIs', () => {
  it('selects the highest-YTD fund as best performer', () => {
    expect(BEST_PERFORMER.name).toBe('Vanguard Information Technology');
    expect(BEST_PERFORMER.ytd).toBe(22.6);
    // No other fund beats it.
    const maxYtd = Math.max(...funds.map((f) => f.ytd));
    expect(BEST_PERFORMER.ytd).toBe(maxYtd);
  });

  it('estimates annual income as the sum of value * yield', () => {
    // Σ (value * yield / 100) across all ten holdings.
    expect(EST_ANNUAL_INCOME).toBeCloseTo(27417.26, 2);
    expect(fmtEur(EST_ANNUAL_INCOME)).toBe('27,42K €');
  });
});

describe('performance series', () => {
  it('exposes the four selectable ranges', () => {
    expect(perfRanges.map((r) => r.key)).toEqual(['12m', '3y', '5y', 'all']);
  });

  it('every range is indexed to 100 at the start', () => {
    for (const key of Object.keys(perfData)) {
      expect(perfData[key].port[0]).toBe(100);
      expect(perfData[key].bench[0]).toBe(100);
    }
  });

  it('the 12M series has 12 labels and aligned port/bench arrays', () => {
    const { labels, port, bench } = perfData['12m'];
    expect(labels).toHaveLength(12);
    expect(port).toHaveLength(12);
    expect(bench).toHaveLength(12);
    // Portfolio ends above benchmark (outperformance).
    expect(port[port.length - 1]).toBeGreaterThan(bench[bench.length - 1]);
  });
});

describe('enrichFunds', () => {
  it('normalizes the default holdings using their own price (no quotes)', () => {
    const funds = enrichFunds(DEFAULT_HOLDINGS, new Map());
    expect(funds).toHaveLength(10);
    const f = funds[0];
    expect(f.id).toBe('IE00B945VV12');
    expect(f.name).toBe('Vanguard EuroStocks');
    // shares * price / costBasis math
    expect(f.value).toBeCloseTo(400 * 212.9, 5);
    expect(f.cost).toBeCloseTo(400 * 188.0, 5);
    expect(f.gain).toBeCloseTo(400 * (212.9 - 188.0), 5);
    expect(f.gainPct).toBeCloseTo(((212.9 - 188.0) / 188.0) * 100, 5);
    expect(f.priceError).toBe(false);
    // Default catalog funds carry ytd/yield.
    expect(f.ytd).toBe(12.4);
    expect(f.yield).toBe(7.2);
  });

  it('uses live NAV when a quote is present (imported, real ISIN)', () => {
    const quotes = new Map([
      ['IE0032620787', { price: 77.88, currency: 'EUR', asOf: 123 }],
    ]);
    const [f] = enrichFunds(
      [{ id: 'IE0032620787', shares: 100, price: 62.5 }],
      quotes,
    );
    expect(f.price).toBe(77.88);
    expect(f.costBasis).toBe(62.5);
    expect(f.value).toBeCloseTo(7788, 5);
    expect(f.cost).toBeCloseTo(6250, 5);
    expect(f.gain).toBeCloseTo(1538, 5);
    expect(f.priceError).toBe(false);
    // Real ISINs carry no ytd/yield -> null for imported funds.
    expect(f.ytd).toBeNull();
    expect(f.yield).toBeNull();
  });

  it('flags an imported fund with no quote as a per-line priceError', () => {
    const [f] = enrichFunds(
      [{ id: 'IE0032620787', shares: 100, price: 62.5 }],
      new Map(),
    );
    expect(f.priceError).toBe(true);
    // No fabricated market value: price/value/gain are null; cost is still known.
    expect(f.price).toBeNull();
    expect(f.value).toBeNull();
    expect(f.gain).toBeNull();
    expect(f.gainPct).toBeNull();
    expect(f.costBasis).toBe(62.5);
    expect(f.cost).toBeCloseTo(6250, 5);
  });

  it('provides a fallback name/tag/color for an unknown ISIN', () => {
    const [f] = enrichFunds(
      [{ id: 'XX0000000000', shares: 10, price: 100 }],
      new Map(),
    );
    expect(f.name).toBe('XX0000000000');
    expect(f.tag).toBe('—');
    expect(f.type).toBe('equity');
    expect(f.color).toBe('#2563eb'); // PALETTE[0]
    expect(f.priceError).toBe(true);
  });

  it('assigns each fund a distinct palette colour by array position', () => {
    const funds = enrichFunds(
      [
        { id: 'IE0032620787', shares: 10, price: 5 },
        { id: 'XX0000000000', shares: 10, price: 5 },
      ],
      new Map(),
    );
    // Known + unknown ISIN in the same list must not collide: both are keyed by
    // position, so they get PALETTE[0] and PALETTE[1].
    expect(funds[0].color).toBe('#2563eb'); // PALETTE[0]
    expect(funds[1].color).toBe('#10b981'); // PALETTE[1]
    expect(funds[0].color).not.toBe(funds[1].color);
  });

  it('lets a file-provided type override the catalog type', () => {
    // IE0032620787 is 'equity' in the catalog; the imported file says 'income'.
    const [f] = enrichFunds(
      [{ id: 'IE0032620787', shares: 10, price: 5, type: 'income' }],
      new Map(),
    );
    expect(f.type).toBe('income');
  });

  it('falls back to the catalog type when the file omits it', () => {
    const [f] = enrichFunds(
      [{ id: 'IE0032620787', shares: 10, price: 5 }],
      new Map(),
    );
    expect(f.type).toBe('equity');
  });
});

describe('deriveMetrics', () => {
  it('derives totals and per-fund allocation from the default dataset', () => {
    const funds = enrichFunds(DEFAULT_HOLDINGS, new Map());
    const m = deriveMetrics(funds);

    expect(m.TOTAL_VALUE).toBeCloseTo(425800, 0);
    expect(m.TOTAL_GAIN).toBeCloseTo(m.TOTAL_VALUE - m.TOTAL_COST, 5);

    const allocSum = funds.reduce((s, f) => s + f.alloc, 0);
    expect(allocSum).toBeCloseTo(100, 5);

    expect(m.EQUITY_PCT + m.INCOME_PCT).toBe(100);
  });

  it('picks the highest-YTD fund as best performer when YTD is present', () => {
    const funds = enrichFunds(DEFAULT_HOLDINGS, new Map());
    const m = deriveMetrics(funds);
    expect(m.BEST_PERFORMER.name).toBe('Vanguard Information Technology');
    expect(m.BEST_PERFORMER.ytd).toBe(22.6);
  });

  it('reflects a mixed equity/income set in EQUITY_PCT/INCOME_PCT', () => {
    const funds = enrichFunds(
      [
        { id: 'IE0032620787', shares: 30, price: 100 }, // catalog equity
        { id: 'IE00B18GC888', shares: 10, price: 100 }, // catalog income
      ],
      new Map([
        ['IE0032620787', { price: 100 }], // value 3000
        ['IE00B18GC888', { price: 100 }], // value 1000
      ]),
    );
    const m = deriveMetrics(funds);
    expect(m.EQUITY_PCT).toBe(75);
    expect(m.INCOME_PCT).toBe(25);
    expect(m.EQUITY_PCT + m.INCOME_PCT).toBe(100);
  });

  it('excludes priceError funds from totals, allocation, and asset split', () => {
    const funds = enrichFunds(
      [
        { id: 'IE0032620787', shares: 10, price: 100 }, // priced equity
        { id: 'IE00B18GC888', shares: 10, price: 100 }, // priced income
        { id: 'XX0000000000', shares: 5, price: 100 }, // no quote -> priceError
      ],
      new Map([
        ['IE0032620787', { price: 300 }], // value 3000
        ['IE00B18GC888', { price: 100 }], // value 1000
      ]),
    );
    const m = deriveMetrics(funds);

    // Totals cover only the two priced funds (value 3000 + 1000).
    expect(m.TOTAL_VALUE).toBeCloseTo(4000, 5);
    // Errored fund's cost is NOT dragged into TOTAL_COST.
    expect(m.TOTAL_COST).toBeCloseTo(10 * 100 + 10 * 100, 5);
    // Allocation is assigned only to priced funds; errored fund keeps alloc 0.
    expect(funds[2].priceError).toBe(true);
    expect(funds[2].alloc).toBe(0);
    const allocSum = funds.reduce((s, f) => s + f.alloc, 0);
    expect(allocSum).toBeCloseTo(100, 5);
    // Asset split reflects only priced funds (3000 equity / 1000 income).
    expect(m.EQUITY_PCT).toBe(75);
    expect(m.INCOME_PCT).toBe(25);
  });

  it('falls back to max gain % for best performer when all YTD are null', () => {
    const funds = enrichFunds(
      [
        { id: 'IE0032620787', shares: 10, price: 50 },
        { id: 'IE0007987690', shares: 10, price: 50 },
      ],
      new Map([
        ['IE0032620787', { price: 60 }], // +20%
        ['IE0007987690', { price: 100 }], // +100%
      ]),
    );
    const m = deriveMetrics(funds);
    expect(m.BEST_PERFORMER.id).toBe('IE0007987690');
  });
});
