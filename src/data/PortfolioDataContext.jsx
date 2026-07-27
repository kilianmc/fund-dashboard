// Portfolio data provider. Holds the active dataset (default or imported) and
// exposes derived funds/totals plus the import/reset/retry actions. Mirrors the
// ThemeContext pattern (provider + hook). The default dataset renders instantly
// with no network call; only imports hit the live NAV proxy.
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  DEFAULT_HOLDINGS,
  deriveMetrics,
  enrichFunds,
  perfData,
  perfRanges,
} from './portfolio';
import { FUND_CATALOG } from './fundCatalog';
import { parseHoldingsFile } from '../utils/parseHoldingsFile';
import { fetchNav } from '../services/navService';

const PortfolioDataContext = createContext(null);

// Build the default dataset: run the mock holdings through the same enrich +
// derive math imported data uses (empty quotes → each fund keeps its own price).
function buildDefault() {
  const funds = enrichFunds(DEFAULT_HOLDINGS, new Map(), FUND_CATALOG);
  const totals = deriveMetrics(funds);
  return { funds, totals };
}

export function PortfolioDataProvider({ children }) {
  const initial = useMemo(buildDefault, []);
  const [state, setState] = useState(() => ({
    status: 'idle', // 'idle' | 'loading' | 'error'
    source: 'default', // 'default' | 'imported'
    error: null,
    warning: null,
    funds: initial.funds,
    totals: initial.totals,
    fileName: null,
  }));

  // Ignore stale async responses (a newer import/reset supersedes older ones).
  const reqId = useRef(0);
  const lastFileRef = useRef(null);

  const importFile = useCallback(async (file) => {
    const id = ++reqId.current;
    lastFileRef.current = file;
    // Keep previous funds/totals/fileName visible while loading.
    setState((s) => ({ ...s, status: 'loading', error: null, warning: null }));

    let rows;
    try {
      rows = await parseHoldingsFile(file);
    } catch (err) {
      if (id !== reqId.current) return;
      // Malformed file: surface the error, keep the previous dataset.
      setState((s) => ({
        ...s,
        status: 'error',
        error: err?.message || 'Could not read the file.',
      }));
      return;
    }

    // NAV problems are NON-FATAL: a total network failure or a partial result
    // (some ISINs missing) still renders the table. Only file parse/validation
    // failures above set status:'error'. Unpriced funds become per-line errors
    // (priceError) and are excluded from totals downstream.
    let quotes = new Map();
    try {
      quotes = await fetchNav(rows.map((r) => r.id));
    } catch {
      // Total failure: proceed with no quotes → every imported fund errors.
      quotes = new Map();
    }
    if (id !== reqId.current) return;

    // Nothing priced at all == the proxy never answered usefully (wrong origin,
    // network down, provider outage). Say that, rather than implying the file's
    // ISINs were individually unresolvable.
    const missing = rows.filter((r) => !quotes.has(r.id));
    let warning = null;
    if (missing.length === rows.length) {
      warning = `Couldn't reach the pricing service — none of the ${rows.length} fund(s) could be priced, so they're excluded from totals.`;
    } else if (missing.length > 0) {
      warning = `${missing.length} of ${rows.length} fund(s) couldn't be priced — excluded from totals.`;
    }

    const funds = enrichFunds(rows, quotes, FUND_CATALOG);
    const totals = deriveMetrics(funds);
    setState({
      status: 'idle',
      source: 'imported',
      error: null,
      warning,
      funds,
      totals,
      fileName: file?.name ?? null,
    });
  }, []);

  const resetToDefault = useCallback(() => {
    reqId.current += 1; // cancel any in-flight import
    lastFileRef.current = null;
    const { funds, totals } = buildDefault();
    setState({
      status: 'idle',
      source: 'default',
      error: null,
      warning: null,
      funds,
      totals,
      fileName: null,
    });
  }, []);

  const retry = useCallback(() => {
    if (lastFileRef.current) importFile(lastFileRef.current);
  }, [importFile]);

  const value = useMemo(
    () => ({
      status: state.status,
      source: state.source,
      error: state.error,
      warning: state.warning,
      funds: state.funds,
      totals: state.totals,
      perf: perfData,
      perfRanges,
      fileName: state.fileName,
      actions: { importFile, resetToDefault, retry },
    }),
    [state, importFile, resetToDefault, retry],
  );

  return (
    <PortfolioDataContext.Provider value={value}>
      {children}
    </PortfolioDataContext.Provider>
  );
}

export function usePortfolioData() {
  const ctx = useContext(PortfolioDataContext);
  if (!ctx) {
    throw new Error(
      'usePortfolioData must be used within a PortfolioDataProvider',
    );
  }
  return ctx;
}
