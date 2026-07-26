import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Controlled hook state, mutated per test before render.
let mockState;
vi.mock('../data/PortfolioDataContext', () => ({
  usePortfolioData: () => mockState,
}));

import ImportControl from './ImportControl';

const baseActions = () => ({
  importFile: vi.fn(),
  resetToDefault: vi.fn(),
  retry: vi.fn(),
});

beforeEach(() => {
  mockState = {
    status: 'idle',
    source: 'default',
    error: null,
    warning: null,
    fileName: null,
    actions: baseActions(),
  };
});

describe('<ImportControl />', () => {
  it('routes a selected file to actions.importFile', async () => {
    const { container } = render(<ImportControl />);
    const input = container.querySelector('input[type="file"]');
    const file = new File(['isin,shares,price\nIE0032620787,1,1'], 'h.csv', {
      type: 'text/csv',
    });
    await userEvent.upload(input, file);
    expect(mockState.actions.importFile).toHaveBeenCalledTimes(1);
    expect(mockState.actions.importFile.mock.calls[0][0].name).toBe('h.csv');
  });

  it('hides "Reset to default" for the default source', () => {
    render(<ImportControl />);
    expect(
      screen.queryByRole('button', { name: /reset to default/i }),
    ).not.toBeInTheDocument();
  });

  it('shows "Reset to default" when imported and wires it up', async () => {
    mockState.source = 'imported';
    mockState.fileName = 'h.csv';
    render(<ImportControl />);
    const btn = screen.getByRole('button', { name: /reset to default/i });
    await userEvent.click(btn);
    expect(mockState.actions.resetToDefault).toHaveBeenCalled();
  });

  it('shows an error pill + Retry on error, and retry is wired', async () => {
    mockState.status = 'error';
    mockState.error = 'Could not import holdings';
    render(<ImportControl />);
    expect(screen.getByText('Import failed')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(mockState.actions.retry).toHaveBeenCalled();
  });

  it('exposes a polite aria-live status region', () => {
    const { container } = render(<ImportControl />);
    const region = container.querySelector('[role="status"]');
    expect(region).toBeInTheDocument();
    expect(region).toHaveAttribute('aria-live', 'polite');
  });

  it('disables the import button and shows progress while loading', () => {
    mockState.status = 'loading';
    render(<ImportControl />);
    const btn = screen.getByRole('button', {
      name: /import holdings from a json or csv file/i,
    });
    expect(btn).toBeDisabled();
    expect(screen.getByText(/Fetching NAV/i)).toBeInTheDocument();
  });
});
