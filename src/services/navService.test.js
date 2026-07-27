import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchNav } from './navService';

function jsonResponse(obj, ok = true) {
  return { ok, status: ok ? 200 : 500, json: async () => obj };
}

beforeEach(() => {
  globalThis.fetch = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('fetchNav', () => {
  it('calls /api/nav with a deduped, comma-joined isin query', async () => {
    globalThis.fetch.mockResolvedValue(jsonResponse({ quotes: {} }));
    await fetchNav(['IE0032620787', 'ie0032620787', 'IE0007987690']);

    const url = globalThis.fetch.mock.calls[0][0];
    expect(url).toContain('/api/nav?isin=');
    expect(url).toContain('IE0032620787');
    expect(url).toContain('IE0007987690');
    // Deduped: the repeated ISIN appears once.
    expect(url.match(/IE0032620787/g)).toHaveLength(1);
  });

  it('maps the response quotes into a Map keyed by ISIN', async () => {
    globalThis.fetch.mockResolvedValue(
      jsonResponse({
        quotes: {
          IE0032620787: {
            price: 77.88,
            name: 'Vanguard U.S. 500',
            currency: 'EUR',
            asOf: 1700000000000,
          },
        },
      }),
    );

    const map = await fetchNav(['IE0032620787']);
    expect(map).toBeInstanceOf(Map);
    expect(map.get('IE0032620787')).toEqual({
      price: 77.88,
      name: 'Vanguard U.S. 500',
      currency: 'EUR',
      asOf: 1700000000000,
    });
  });

  it('tolerates partial failure (missing ISINs are simply absent)', async () => {
    globalThis.fetch.mockResolvedValue(
      jsonResponse({
        quotes: { IE0032620787: { price: 77.88 } },
        errors: ['IE0007987690'],
      }),
    );

    const map = await fetchNav(['IE0032620787', 'IE0007987690']);
    expect(map.size).toBe(1);
    expect(map.has('IE0032620787')).toBe(true);
    expect(map.has('IE0007987690')).toBe(false);
  });

  it('returns an empty Map on total failure (rejected fetch)', async () => {
    globalThis.fetch.mockRejectedValue(new Error('network down'));
    const map = await fetchNav(['IE0032620787']);
    expect(map.size).toBe(0);
  });

  it('returns an empty Map on a non-ok response', async () => {
    globalThis.fetch.mockResolvedValue(jsonResponse({}, false));
    const map = await fetchNav(['IE0032620787']);
    expect(map.size).toBe(0);
  });

  // Regression: federated into the shell, a relative `/api/nav` hits the shell's
  // SPA rewrite, which answers `200 text/html`. That must be treated as a failed
  // lookup, not parsed.
  it('returns an empty Map when the response is HTML rather than JSON', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const json = vi.fn(async () => ({
      quotes: { IE0032620787: { price: 1 } },
    }));
    globalThis.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'text/html; charset=utf-8' },
      json,
    });

    const map = await fetchNav(['IE0032620787']);
    expect(map.size).toBe(0);
    expect(json).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalled();
  });

  it('parses a response that declares a JSON content-type', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json; charset=utf-8' },
      json: async () => ({ quotes: { IE0032620787: { price: 77.88 } } }),
    });

    const map = await fetchNav(['IE0032620787']);
    expect(map.get('IE0032620787')?.price).toBe(77.88);
  });

  it('short-circuits without a fetch when given no ISINs', async () => {
    const map = await fetchNav([]);
    expect(map.size).toBe(0);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});
