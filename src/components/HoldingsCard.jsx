import { funds, fmtEur, fmtSigned, signClass, TOTAL_VALUE, YTD_RETURN } from '../data/portfolio';
import './HoldingsCard.scss';

export default function HoldingsCard() {
  return (
    <section className="card">
      <div className="card-head">
        <div>
          <div className="card-title">Holdings</div>
          <div className="card-sub">{funds.length} funds · Vanguard</div>
        </div>
      </div>
      <div className="table-wrap">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Fund</th><th>Type</th><th>Allocation</th><th>Value</th><th>Daily</th><th>YTD</th>
            </tr>
          </thead>
          <tbody>
            {funds.map((f) => (
              <tr key={f.name}>
                <td>
                  <div className="fund-cell">
                    <span className="dot" style={{ background: f.color }}></span>
                    <div>
                      <div className="fund-name">{f.name}</div>
                      <div className="fund-tag">{f.tag}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`type-badge ${f.type}`}>{f.type === 'income' ? 'Income' : 'Equity'}</span>
                </td>
                <td>{f.alloc}%</td>
                <td>{fmtEur(f.value)}</td>
                <td className={signClass(f.daily)}>{fmtSigned(f.daily, 2)}</td>
                <td className={signClass(f.ytd)}>{fmtSigned(f.ytd, 1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
      <div className="foot-strip">
        <div className="foot-block">
          <div className="fl">Total Portfolio Value</div>
          <div className="fv">{fmtEur(TOTAL_VALUE)}</div>
        </div>
        <div className="foot-block" style={{ textAlign: 'right' }}>
          <div className="fl">Overall Return (YTD)</div>
          <div className="fv green">{YTD_RETURN}</div>
        </div>
      </div>
    </section>
  );
}
