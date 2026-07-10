import { Doughnut } from 'react-chartjs-2';
import { funds, fmtEur, TOTAL_VALUE, EQUITY_PCT, INCOME_PCT } from '../data/portfolio';
import { useTheme } from '../theme/ThemeContext';
import './AllocationCard.scss';

function makeData(theme) {
  return {
    labels: funds.map((f) => f.name),
    datasets: [
      {
        data: funds.map((f) => f.alloc),
        backgroundColor: funds.map((f) => f.color),
        borderColor: theme === 'dark' ? '#161b26' : '#fff',
        borderWidth: 4, hoverOffset: 8, borderRadius: 6, spacing: 2,
      },
    ],
  };
}

// Draws each segment's allocation % centered on its arc
const arcLabels = {
  id: 'arcLabels',
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);
    ctx.save();
    ctx.font = '700 12px Inter';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    meta.data.forEach((arc, i) => {
      const value = chart.data.datasets[0].data[i];
      if (value < 5) return; // hide labels on slices under 5%
      const { x, y } = arc.getCenterPoint();
      ctx.fillText(value + '%', x, y);
    });
    ctx.restore();
  },
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '72%',
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#000000', padding: 11, cornerRadius: 10, displayColors: true, boxPadding: 5,
      bodyFont: { family: 'Inter', size: 13, weight: '600' },
      callbacks: { label: (c) => '  ' + c.label },
    },
  },
};

export default function AllocationCard() {
  const { theme } = useTheme();
  return (
    <section className="card">
      <div className="card-head">
        <div>
          <div className="card-title">Allocation</div>
          <div className="card-sub">By market value</div>
        </div>
      </div>
      <div className="donut-layout">
        <div className="donut-wrap">
          <Doughnut data={makeData(theme)} options={options} plugins={[arcLabels]} />
          <div className="donut-center">
            <div className="dc-val">{fmtEur(TOTAL_VALUE)}</div>
            <div className="dc-lab">Total Portfolio</div>
          </div>
        </div>
        <div className="legend-wrap">
          <div className="donut-legend">
            {funds.map((f) => (
              <div className="dl-item" key={f.name}>
                <span className="dl-dot" style={{ background: f.color }}></span>
                <div className="dl-text">
                  <div className="dl-name">{f.name}</div>
                  <div className="dl-sub">{fmtEur(f.value)}</div>
                </div>
                <span className={`dl-type ${f.type}`} title={f.type === 'income' ? 'Income' : 'Equity'}></span>
                <div className="dl-pct">{f.alloc}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="asset-split">
        <div className="split-head">
          <div className="label">Asset Mix</div>
          <div className="split-legend">
            <span className="sl-item equity">Equity {EQUITY_PCT}%</span>
            <span className="sl-item income">Income {INCOME_PCT}%</span>
          </div>
        </div>
        <div className="split-bar">
          <div className="split-fill equity" style={{ width: `${EQUITY_PCT}%` }}></div>
          <div className="split-fill income" style={{ width: `${INCOME_PCT}%` }}></div>
        </div>
      </div>
    </section>
  );
}
