import { useRef } from 'react';
import { usePortfolioData } from '../data/PortfolioDataContext';
import './ImportControl.scss';

export default function ImportControl() {
  const { status, source, error, warning, fileName, actions } =
    usePortfolioData();
  const inputRef = useRef(null);

  const loading = status === 'loading';

  const openPicker = () => inputRef.current?.click();

  const onChange = (e) => {
    const file = e.target.files?.[0];
    if (file) actions.importFile(file);
    // Reset so re-selecting the same file fires change again.
    e.target.value = '';
  };

  return (
    <div className="import-control">
      <input
        ref={inputRef}
        type="file"
        accept=".json,.csv,application/json,text/csv"
        className="import-input"
        onChange={onChange}
        aria-hidden="true"
        tabIndex={-1}
      />
      <button
        type="button"
        className="import-btn"
        onClick={openPicker}
        disabled={loading}
        aria-label="Import holdings from a JSON or CSV file"
      >
        {loading ? 'Importing…' : 'Import'}
      </button>

      {source === 'imported' && (
        <button
          type="button"
          className="reset-btn"
          onClick={actions.resetToDefault}
        >
          Reset to default
        </button>
      )}

      <div className="import-status" role="status" aria-live="polite">
        {loading && (
          <span className="status-loading">
            <span className="spinner" aria-hidden="true"></span> Fetching NAV…
          </span>
        )}
        {!loading && status === 'error' && (
          <span className="status-error">
            <span className="err-pill" title={error || undefined}>
              Import failed
            </span>
            <button type="button" className="retry-btn" onClick={actions.retry}>
              Retry
            </button>
          </span>
        )}
        {!loading && status !== 'error' && source === 'imported' && (
          <span className="status-ok" title={warning || undefined}>
            Imported: {fileName}
            {warning && <span className="warn-mark"> ⚠</span>}
          </span>
        )}
      </div>
    </div>
  );
}
