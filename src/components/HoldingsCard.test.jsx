import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Stub the data hook so the table renders from controlled, deterministic data
// (one priced/gaining fund, one fund that couldn't be priced -> per-line error).
vi.mock('../data/PortfolioDataContext', () => ({
  usePortfolioData: () => ({
    source: 'imported',
    fileName: 'my-holdings.csv',
    funds: [
      {
        id: 'IE0032620787',
        name: 'Fund Alpha',
        tag: 'US Large Cap',
        color: '#10b981',
        shares: 120,
        costBasis: 62.5,
        price: 77.88,
        cost: 7500,
        value: 9345.6,
        gain: 1845.6,
        gainPct: 24.6,
        ytd: 12.5,
        priceError: false,
      },
      {
        id: 'IE0007987690',
        name: 'Fund Beta',
        tag: 'Europe Eq.',
        color: '#2563eb',
        shares: 300,
        costBasis: 40,
        price: null,
        cost: 12000,
        value: null,
        gain: null,
        gainPct: null,
        ytd: null,
        priceError: true,
      },
    ],
    totals: {
      TOTAL_VALUE: 9345.6,
      TOTAL_GAIN: 1845.6,
      TOTAL_GAIN_PCT: 24.6,
    },
  }),
}));

import HoldingsCard from './HoldingsCard';

describe('<HoldingsCard />', () => {
  it('renders exactly the new column headers (Cost/Actual/Value, no YTD)', () => {
    const { container } = render(<HoldingsCard />);
    const headers = [...container.querySelectorAll('thead th')].map((th) =>
      th.textContent.trim(),
    );
    expect(headers).toEqual([
      'Fund',
      'Shares',
      'Cost',
      'Actual',
      'Value',
      'Gain/Loss',
    ]);
    expect(headers).not.toContain('YTD');
    expect(headers).not.toContain('Type');
    expect(headers).not.toContain('Allocation');
  });

  it('renders the Cost and Actual columns as whole compact numbers (no €)', () => {
    const { container } = render(<HoldingsCard />);
    const rows = container.querySelectorAll('tbody tr');
    // Cost is the 3rd cell (index 2): fmtCompact(f.costBasis).
    expect(rows[0].children[2].textContent.trim()).toBe('63');
    // Actual is the 4th cell (index 3): fmtCompact(f.cost) — known even when
    // the fund can't be priced.
    expect(rows[0].children[3].textContent.trim()).toBe('8K');
    expect(rows[1].children[3].textContent.trim()).toBe('12K');
  });

  it('renders a priced fund with a whole-number Value and a stacked Gain/Loss', () => {
    const { container } = render(<HoldingsCard />);
    const row = container.querySelectorAll('tbody tr')[0];
    // Value (index 4): fmtCompact(f.value); Gain/Loss (index 5): unchanged.
    expect(row.children[4].textContent.trim()).toBe('9K');
    expect(row.children[5].className).toContain('pos');
    expect(row.children[4].querySelector('.unavailable')).toBeNull();
    // Gain/Loss is stacked: euros in .gain-eur, percent in .gain-pct.
    expect(row.children[5].querySelector('.gain-eur').textContent.trim()).toBe(
      '1,85K €',
    );
    expect(row.children[5].querySelector('.gain-pct').textContent.trim()).toBe(
      '+24.6%',
    );
  });

  it('renders an Unavailable error cell for an unpriceable fund (no fabricated value)', () => {
    const { container } = render(<HoldingsCard />);
    const row = container.querySelectorAll('tbody tr')[1];
    // Market Value (index 4) and Gain/Loss (index 5) both show the error state.
    expect(row.children[4].className).toContain('unavailable');
    expect(row.children[5].className).toContain('unavailable');
    expect(row.children[4].textContent).toMatch(/Unavailable/);
    expect(row.children[5].textContent).toMatch(/Unavailable/);
    // No euro value fabricated from the cost basis.
    expect(row.children[4].textContent).not.toMatch(/€/);
  });

  it('shows a header notice when one or more funds could not be priced', () => {
    render(<HoldingsCard />);
    expect(screen.getByText(/couldn't be priced/i)).toBeInTheDocument();
    expect(screen.getByText(/excluded from totals/i)).toBeInTheDocument();
    // The old "NAV delayed" badge is gone.
    expect(screen.queryByText('NAV delayed')).toBeNull();
  });

  it('shows the imported filename in the sub-header', () => {
    render(<HoldingsCard />);
    expect(screen.getByText(/my-holdings\.csv/)).toBeInTheDocument();
  });
});
