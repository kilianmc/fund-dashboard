import { fmtCompact, fmtEur, fmtSigned, signClass } from '../data/portfolio';
import { usePortfolioData } from '../data/PortfolioDataContext';
import './HoldingsCard.scss';

export default function HoldingsCard() {
  const { funds, totals, source, fileName } = usePortfolioData();
  const unpriced = funds.filter((f) => f.priceError).length;

  return (
    <section className="card">
      <div className="card-head">
        <div>
          <div className="card-title">Holdings</div>
          <div className="card-sub">
            {funds.length} funds ·{' '}
            {source === 'imported' ? fileName : 'Vanguard'}
          </div>
        </div>
        {unpriced > 0 && (
          <span
            className="price-error-notice"
            title="These funds have no live NAV and are excluded from totals"
          >
            {unpriced} fund{unpriced === 1 ? '' : 's'} couldn&apos;t be priced —
            excluded from totals.
          </span>
        )}
      </div>
      <div className="table-wrap">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Fund</th>
                <th>Shares</th>
                <th>Cost</th>
                <th>Actual</th>
                <th>Value</th>
                <th>Gain/Loss</th>
              </tr>
            </thead>
            <tbody>
              {funds.map((f) => (
                <tr key={f.id}>
                  <td>
                    <div className="fund-cell">
                      <span
                        className="dot"
                        style={{ background: f.color }}
                      ></span>
                      <div className="fund-meta">
                        <div className="fund-name">{f.name}</div>
                        <div className="fund-tag">{f.tag}</div>
                      </div>
                    </div>
                  </td>
                  <td>{f.shares.toLocaleString('en-US')}</td>
                  <td>{fmtCompact(f.costBasis)}</td>
                  <td>{fmtCompact(f.cost)}</td>
                  {f.priceError ? (
                    <>
                      <td className="unavailable">
                        <span title="Live NAV unavailable for this fund">
                          Unavailable
                        </span>
                      </td>
                      <td className="unavailable">
                        <span title="Live NAV unavailable for this fund">
                          Unavailable
                        </span>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{fmtCompact(f.value)}</td>
                      <td className={signClass(f.gain)}>
                        <div className="gain-cell">
                          <span className="gain-eur">{fmtEur(f.gain)}</span>
                          <span className="gain-pct">
                            {fmtSigned(f.gainPct, 1)}
                          </span>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="foot-strip">
        <div className="foot-block">
          <div className="fl">Total Portfolio Value</div>
          <div className="fv">{fmtEur(totals.TOTAL_VALUE)}</div>
        </div>
        <div className="foot-block" style={{ textAlign: 'right' }}>
          <div className="fl">Total Gain/Loss</div>
          <div className={`fv ${signClass(totals.TOTAL_GAIN)}`}>
            <div className="gain-cell">
              <span className="gain-eur">{fmtEur(totals.TOTAL_GAIN)}</span>
              <span className="gain-pct">
                {fmtSigned(totals.TOTAL_GAIN_PCT, 1)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
