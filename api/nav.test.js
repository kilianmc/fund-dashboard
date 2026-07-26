import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import handler from './nav';

function mockRes() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    ended: false,
    setHeader(key, value) {
      this.headers[key] = value;
    },
    end(body) {
      this.body = body;
      this.ended = true;
    },
    json() {
      return JSON.parse(this.body);
    },
  };
}

function jsonResponse(obj, ok = true, status = 200) {
  return { ok, status, json: async () => obj };
}

const CHART = {
  chart: {
    result: [
      {
        meta: {
          regularMarketPrice: 77.88,
          currency: 'EUR',
          longName: 'Vanguard U.S. 500 Stock Index Fund',
          regularMarketTime: 1700000000,
        },
      },
    ],
  },
};

beforeEach(() => {
  globalThis.fetch = vi.fn(async (url) => {
    const u = String(url);
    if (u.includes('/v1/finance/search')) {
      const q = new URL(u).searchParams.get('q');
      if (q === 'BADISIN') return jsonResponse({ quotes: [] });
      return jsonResponse({
        quotes: [
          {
            symbol: `SYM.${q}`,
            quoteType: 'MUTUALFUND',
            longname: `Fund ${q}`,
          },
        ],
      });
    }
    if (u.includes('/v8/finance/chart')) {
      return jsonResponse(CHART);
    }
    return jsonResponse({}, false, 404);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('api/nav handler', () => {
  it('maps a resolved ISIN to price/currency/name/asOf (ms)', async () => {
    const req = { method: 'GET', query: { isin: 'IE0032620787' } };
    const res = mockRes();
    await handler(req, res);

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.errors).toEqual([]);
    expect(body.quotes.IE0032620787).toEqual({
      price: 77.88,
      currency: 'EUR',
      name: 'Vanguard U.S. 500 Stock Index Fund',
      asOf: 1700000000 * 1000,
    });
  });

  it('is per-ISIN tolerant via allSettled (one bad ISIN -> errors, rest resolve)', async () => {
    const req = { method: 'GET', query: { isin: 'IE0032620787,BADISIN' } };
    const res = mockRes();
    await handler(req, res);

    const body = res.json();
    expect(Object.keys(body.quotes)).toEqual(['IE0032620787']);
    expect(body.errors).toEqual(['BADISIN']);
  });

  it('dedupes + uppercases + trims the isin list', async () => {
    const req = {
      method: 'GET',
      query: { isin: ' ie0032620787 , IE0032620787 ' },
    };
    const res = mockRes();
    await handler(req, res);

    const body = res.json();
    expect(Object.keys(body.quotes)).toEqual(['IE0032620787']);
    // search + chart called once for the single unique ISIN.
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  it('sets CORS and CDN cache headers', async () => {
    const req = { method: 'GET', query: { isin: 'IE0032620787' } };
    const res = mockRes();
    await handler(req, res);

    expect(res.headers['Access-Control-Allow-Origin']).toBe('*');
    expect(res.headers['Access-Control-Allow-Methods']).toBe('GET,OPTIONS');
    expect(res.headers['Cache-Control']).toBe(
      's-maxage=3600, stale-while-revalidate=86400',
    );
    expect(res.headers['Content-Type']).toBe('application/json');
  });

  it('handles an OPTIONS preflight with 204 and no upstream calls', async () => {
    const req = { method: 'OPTIONS', query: {} };
    const res = mockRes();
    await handler(req, res);

    expect(res.statusCode).toBe(204);
    expect(res.ended).toBe(true);
    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(res.headers['Access-Control-Allow-Origin']).toBe('*');
  });

  it('returns 400 when no isin is provided', async () => {
    const req = { method: 'GET', query: {} };
    const res = mockRes();
    await handler(req, res);

    expect(res.statusCode).toBe(400);
    const body = res.json();
    expect(body.quotes).toEqual({});
  });

  it('reads the isin from the raw URL when req.query is absent', async () => {
    const req = { method: 'GET', url: '/api/nav?isin=IE0032620787' };
    const res = mockRes();
    await handler(req, res);

    const body = res.json();
    expect(body.quotes.IE0032620787.price).toBe(77.88);
  });
});
