import { fmtEur, TOTAL_VALUE, YTD_RETURN } from '../data/portfolio';
import './OverviewCard.scss';

export default function OverviewCard() {
  return (
    <section className="card">
      <div className="card-head">
        <div>
          <div className="card-title">Portfolio Overview</div>
          <div className="card-sub">Last updated · Today 10:42</div>
        </div>
      </div>
      <div className="kpis">
        <div className="kpi">
          <div className="label">Total Portfolio Value</div>
          <div className="value">{fmtEur(TOTAL_VALUE)}</div>
        </div>
        <div className="kpi">
          <div className="label">Today's Return</div>
          <div className="value sm">+€1,240</div>
          <div className="chip up">▲ +0.29%</div>
        </div>
        <div className="kpi">
          <div className="label">YTD Return</div>
          <div className="value">{YTD_RETURN}</div>
        </div>
        <div className="kpi">
          <div className="label">Annualized Return</div>
          <div className="value">+10.7%</div>
        </div>
      </div>
    </section>
  );
}
