import { describe, it, expect } from 'vitest';
import {
  fmtEur,
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
} from './portfolio';

describe('formatting helpers', () => {
  it('fmtEur rounds and adds a thousands-separated euro amount', () => {
    expect(fmtEur(425800)).toBe('€425,800');
    expect(fmtEur(1234.56)).toBe('€1,235');
    expect(fmtEur(0)).toBe('€0');
    expect(fmtEur(999)).toBe('€999');
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
    expect(fmtEur(YTD_GAIN)).toBe('€54,894');
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
    expect(fmtEur(EST_ANNUAL_INCOME)).toBe('€27,417');
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
