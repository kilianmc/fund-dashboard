import { fmtEur, fmtEurSigned, fmtSigned, signClass } from '../data/portfolio';
import { usePortfolioData } from '../data/PortfolioDataContext';
import './OverviewCard.scss';

export default function OverviewCard() {
  const { totals, perf } = usePortfolioData();
  const best = totals.BEST_PERFORMER;

  // 12M outperformance vs. benchmark, in index points (mock performance series).
  const { port, bench } = perf['12m'];
  const benchDelta = port[port.length - 1] - bench[bench.length - 1];

  const gainClass = signClass(totals.TOTAL_GAIN) === 'pos' ? 'up' : 'down';
  const bestChip =
    best && best.ytd != null
      ? `+${best.ytd}%`
      : fmtSigned(best?.gainPct ?? 0, 1);

  return (
    <section className="card">
      <div className="card-head">
        <div>
          <div className="card-title">Overview</div>
          <div className="card-sub">Last updated · Today 10:42</div>
        </div>
      </div>
      <div className="kpis">
        <div className="kpi">
          <div className="label">Total Portfolio Value</div>
          <div className="value">{fmtEur(totals.TOTAL_VALUE)}</div>
          <div className={`chip ${gainClass}`}>
            {gainClass === 'up' ? '▲' : '▼'} {fmtEur(totals.TOTAL_GAIN)} ·{' '}
            {fmtSigned(totals.TOTAL_GAIN_PCT, 1)} total
          </div>
        </div>
        <div className="kpi">
          <div className="label">Today&apos;s Return</div>
          <div className="value sm">{fmtEurSigned(1240)}</div>
          <div className="chip up">▲ +0.29%</div>
        </div>
        <div className="kpi">
          <div className="label">Annualized Return</div>
          <div className="value">+10.7%</div>
        </div>
        <div className="kpi">
          <div className="label">Best Performer</div>
          <div className="value sm">
            {best ? best.name.replace('Vanguard ', '') : '—'}
          </div>
          <div className="chip up">▲ {bestChip}</div>
        </div>
        <div className="kpi">
          <div className="label">vs. Benchmark (12M)</div>
          <div className="value">+{benchDelta.toFixed(1)} pts</div>
        </div>
        <div className="kpi">
          <div className="label">Est. Annual Income</div>
          <div className="value">{fmtEur(totals.EST_ANNUAL_INCOME)}</div>
        </div>
      </div>
    </section>
  );
}
