import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Chart.js needs a real <canvas> (getContext), which jsdom lacks. Mock the
// react-chartjs-2 chart components so the dashboard renders deterministically.
vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="chart-line" />,
  Doughnut: () => <div data-testid="chart-doughnut" />,
}));

import App from './App';
import { ThemeProvider } from './theme/ThemeContext';

function renderApp() {
  return render(
    <ThemeProvider>
      <App />
    </ThemeProvider>,
  );
}

describe('<App /> smoke render', () => {
  it('renders the four dashboard cards', () => {
    const { container } = renderApp();
    const titles = [...container.querySelectorAll('.card-title')].map((el) =>
      el.textContent.trim(),
    );
    expect(titles).toEqual([
      'Performance',
      'Overview',
      'Holdings',
      'Allocation',
    ]);
  });

  it('renders the top bar heading and a holdings row per fund', () => {
    renderApp();
    expect(
      screen.getByRole('heading', { name: 'Asset Management' }),
    ).toBeInTheDocument();
    // Each fund name appears in the Holdings table and the Allocation legend.
    expect(screen.getAllByText('Vanguard EuroStocks').length).toBeGreaterThan(
      0,
    );
    expect(
      screen.getAllByText('Vanguard Information Technology').length,
    ).toBeGreaterThan(0);
  });

  it('renders both mocked charts', () => {
    renderApp();
    expect(screen.getByTestId('chart-line')).toBeInTheDocument();
    expect(screen.getByTestId('chart-doughnut')).toBeInTheDocument();
  });

  it('shows the formatted total portfolio value from the data module', () => {
    renderApp();
    // fmtEur(TOTAL_VALUE) === '€425,800'; appears in Overview and Holdings foot.
    expect(screen.getAllByText('€425,800').length).toBeGreaterThan(0);
  });
});
