import { Doughnut } from 'react-chartjs-2';
import { funds, fmtEur, TOTAL_VALUE } from '../data/portfolio';
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

const options = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '72%',
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#000000', padding: 11, cornerRadius: 10, displayColors: true, boxPadding: 5,
      bodyFont: { family: 'Inter', size: 13, weight: '600' },
      callbacks: { label: (c) => '  ' + c.label + ':  ' + c.parsed + '%' },
    },
  },
};

export default function AllocationCard() {
  const { theme } = useTheme();
  return (
    <section className="card">
      <div className="card-head">
        <div>
          <div className="card-title">Portfolio Allocation</div>
          <div className="card-sub">By market value</div>
        </div>
      </div>
      <div className="donut-layout">
        <div className="donut-wrap">
          <Doughnut data={makeData(theme)} options={options} />
          <div className="donut-center">
            <div className="dc-val">{fmtEur(TOTAL_VALUE)}</div>
            <div className="dc-lab">Total Portfolio</div>
          </div>
        </div>
        <div className="donut-legend">
          {funds.map((f) => (
            <div className="dl-item" key={f.name}>
              <span className="dl-dot" style={{ background: f.color }}></span>
              <div className="dl-text">
                <div className="dl-name">{f.name}</div>
                <div className="dl-sub">{fmtEur(f.value)}</div>
              </div>
              <div className="dl-pct">{f.alloc}%</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
