import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// Mock the NAV service so the provider never hits the network.
vi.mock('../services/navService', () => ({ fetchNav: vi.fn() }));

import { fetchNav } from '../services/navService';
import {
  PortfolioDataProvider,
  usePortfolioData,
} from './PortfolioDataContext';

const wrapper = ({ children }) => (
  <PortfolioDataProvider>{children}</PortfolioDataProvider>
);

// Lightweight File stand-in (parseHoldingsFile reads only .name / .text()).
const makeFile = (name, content) => ({ name, text: async () => content });

const validJson = JSON.stringify([
  { id: 'IE0032620787', shares: 120, price: 62.5 },
  { id: 'IE0007987690', shares: 300, price: 34 },
  { id: 'IE0031786142', shares: 40, price: 250 },
]);

beforeEach(() => {
  fetchNav.mockReset();
});

describe('PortfolioDataProvider', () => {
  it('mounts idle with the derived default dataset and no fetch', () => {
    const { result } = renderHook(() => usePortfolioData(), { wrapper });
    expect(result.current.status).toBe('idle');
    expect(result.current.source).toBe('default');
    expect(result.current.funds).toHaveLength(10);
    expect(result.current.totals.TOTAL_VALUE).toBeCloseTo(425800, 0);
    expect(fetchNav).not.toHaveBeenCalled();
  });

  it('importFile happy path flips source to imported and recomputes', async () => {
    fetchNav.mockResolvedValue(
      new Map([
        ['IE0032620787', { price: 77.88, currency: 'EUR' }],
        ['IE0007987690', { price: 41.18, currency: 'EUR' }],
        ['IE0031786142', { price: 306.19, currency: 'EUR' }],
      ]),
    );
    const { result } = renderHook(() => usePortfolioData(), { wrapper });

    await act(async () => {
      await result.current.actions.importFile(makeFile('h.json', validJson));
    });

    await waitFor(() => expect(result.current.source).toBe('imported'));
    expect(result.current.funds).toHaveLength(3);
    expect(result.current.fileName).toBe('h.json');
    expect(result.current.funds.every((f) => !f.priceError)).toBe(true);
    // 120 * 77.88 etc.
    const total = result.current.funds.reduce((s, f) => s + f.value, 0);
    expect(result.current.totals.TOTAL_VALUE).toBeCloseTo(total, 5);
  });

  it('keeps the previous dataset and reports error on a malformed file', async () => {
    const { result } = renderHook(() => usePortfolioData(), { wrapper });

    await act(async () => {
      await result.current.actions.importFile(makeFile('bad.json', '{ oops'));
    });

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toMatch(/JSON/i);
    // Previous (default) data retained.
    expect(result.current.source).toBe('default');
    expect(result.current.funds).toHaveLength(10);
    expect(fetchNav).not.toHaveBeenCalled();
  });

  it('partial NAV failure: keeps status imported; only the missing ISIN errors', async () => {
    // Two of three ISINs resolve; IE0031786142 is missing from the Map.
    fetchNav.mockResolvedValue(
      new Map([
        ['IE0032620787', { price: 77.88, currency: 'EUR' }],
        ['IE0007987690', { price: 41.18, currency: 'EUR' }],
      ]),
    );
    const { result } = renderHook(() => usePortfolioData(), { wrapper });

    await act(async () => {
      await result.current.actions.importFile(makeFile('h.json', validJson));
    });

    await waitFor(() => expect(result.current.source).toBe('imported'));
    // NAV problems are non-fatal: never status 'error'.
    expect(result.current.status).not.toBe('error');
    expect(result.current.funds).toHaveLength(3);
    const errored = result.current.funds.filter((f) => f.priceError);
    expect(errored).toHaveLength(1);
    expect(errored[0].id).toBe('IE0031786142');
    // The two priced funds are unaffected.
    expect(
      result.current.funds
        .filter((f) => !f.priceError)
        .every((f) => f.value > 0),
    ).toBe(true);
    // Totals reflect only the priced funds.
    const priced = result.current.funds.filter((f) => !f.priceError);
    const total = priced.reduce((s, f) => s + f.value, 0);
    expect(result.current.totals.TOTAL_VALUE).toBeCloseTo(total, 5);
    expect(result.current.warning).toBeTruthy();
  });

  it('total NAV failure: still renders (not error); every imported fund errors', async () => {
    fetchNav.mockRejectedValue(new Error('network down'));
    const { result } = renderHook(() => usePortfolioData(), { wrapper });

    await act(async () => {
      await result.current.actions.importFile(makeFile('h.json', validJson));
    });

    await waitFor(() => expect(result.current.source).toBe('imported'));
    expect(result.current.status).not.toBe('error');
    expect(result.current.funds).toHaveLength(3);
    expect(result.current.funds.every((f) => f.priceError)).toBe(true);
    expect(result.current.totals.TOTAL_VALUE).toBe(0);
    expect(result.current.warning).toBeTruthy();
  });

  it('resetToDefault restores the default dataset', async () => {
    fetchNav.mockResolvedValue(new Map([['IE0032620787', { price: 77.88 }]]));
    const { result } = renderHook(() => usePortfolioData(), { wrapper });

    await act(async () => {
      await result.current.actions.importFile(
        makeFile(
          'h.json',
          JSON.stringify([{ id: 'IE0032620787', shares: 1, price: 1 }]),
        ),
      );
    });
    await waitFor(() => expect(result.current.source).toBe('imported'));

    act(() => result.current.actions.resetToDefault());
    expect(result.current.source).toBe('default');
    expect(result.current.funds).toHaveLength(10);
    expect(result.current.fileName).toBeNull();
  });
});
