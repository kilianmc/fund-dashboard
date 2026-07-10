import { fmtEur, TOTAL_VALUE, YTD_RETURN, YTD_GAIN, BEST_PERFORMER, EST_ANNUAL_INCOME, perfData } from '../data/portfolio';
import './OverviewCard.scss';

export default function OverviewCard() {
  // 12M outperformance vs. benchmark, in index points
  const { port, bench } = perfData['12m'];
  const benchDelta = port[port.length - 1] - bench[bench.length - 1];

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
          <div className="value">{fmtEur(TOTAL_VALUE)}</div>
          <div className="chip up">▲ +{fmtEur(YTD_GAIN)} · {YTD_RETURN} YTD</div>
        </div>
        <div className="kpi">
          <div className="label">Today's Return</div>
          <div className="value sm">+€1,240</div>
          <div className="chip up">▲ +0.29%</div>
        </div>
        <div className="kpi">
          <div className="label">Annualized Return</div>
          <div className="value">+10.7%</div>
        </div>
        <div className="kpi">
          <div className="label">Best Performer (YTD)</div>
          <div className="value sm">{BEST_PERFORMER.name.replace('Vanguard ', '')}</div>
          <div className="chip up">▲ +{BEST_PERFORMER.ytd}%</div>
        </div>
        <div className="kpi">
          <div className="label">vs. Benchmark (12M)</div>
          <div className="value">+{benchDelta.toFixed(1)} pts</div>
        </div>
        <div className="kpi">
          <div className="label">Est. Annual Income</div>
          <div className="value">{fmtEur(EST_ANNUAL_INCOME)}</div>
        </div>
      </div>
    </section>
  );
}
