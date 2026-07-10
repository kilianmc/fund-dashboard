import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { perfData, perfRanges } from '../data/portfolio';
import { useTheme } from '../theme/ThemeContext';
import './PerformanceCard.scss';

// Scriptable gradient — recomputed once the chart area is known.
function portGradient(context) {
  const { ctx, chartArea } = context.chart;
  if (!chartArea) return 'rgba(37,99,235,0)';
  const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
  g.addColorStop(0, 'rgba(37,99,235,.18)');
  g.addColorStop(1, 'rgba(37,99,235,0)');
  return g;
}

function makeData(key) {
  const d = perfData[key];
  return {
    labels: d.labels,
    datasets: [
      {
        label: 'Portfolio', data: d.port, borderColor: '#2563eb', backgroundColor: portGradient,
        borderWidth: 2.5, fill: true, tension: 0.4, pointRadius: 0, pointHoverRadius: 5,
        pointHoverBackgroundColor: '#2563eb', pointHoverBorderColor: '#fff', pointHoverBorderWidth: 2,
      },
      {
        label: 'S&P 500 Benchmark', data: d.bench, borderColor: '#94a3b8', backgroundColor: 'transparent',
        borderWidth: 2, borderDash: [6, 5], fill: false, tension: 0.4, pointRadius: 0, pointHoverRadius: 5,
        pointHoverBackgroundColor: '#94a3b8', pointHoverBorderColor: '#fff', pointHoverBorderWidth: 2,
      },
    ],
  };
}

function makeOptions(theme) {
  const gridColor = theme === 'dark' ? '#232a37' : '#eef1f5';
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0d1b2a', padding: 12, cornerRadius: 10, displayColors: true,
        titleFont: { family: 'Inter', size: 12, weight: '600' }, titleColor: '#93a1af',
        bodyFont: { family: 'Inter', size: 13, weight: '600' }, bodyColor: '#fff', boxPadding: 5,
        callbacks: { label: (c) => '  ' + c.dataset.label + ':  ' + c.parsed.y.toFixed(1) },
      },
    },
    scales: {
      x: {
        grid: { display: false }, border: { display: false },
        ticks: { color: '#93a1af', font: { family: 'Inter', size: 11.5, weight: '500' } },
      },
      y: {
        grid: { color: gridColor }, border: { display: false },
        ticks: { color: '#93a1af', font: { family: 'Inter', size: 11.5, weight: '500' }, callback: (v) => v },
      },
    },
  };
}

export default function PerformanceCard() {
  const [range, setRange] = useState('12m');
  const { theme } = useTheme();
  return (
    <section className="card">
      <div className="card-head">
        <div>
          <div className="card-title">Performance</div>
          <div className="card-sub">Indexed growth vs. benchmark</div>
        </div>
        <div className="seg">
          {perfRanges.map((r) => (
            <button
              key={r.key}
              className={range === r.key ? 'active' : ''}
              onClick={() => setRange(r.key)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <div className="legend">
        <div className="legend-item"><span className="swatch" style={{ background: '#2563eb' }}></span> Portfolio</div>
        <div className="legend-item"><span className="swatch dashed"></span> S&amp;P 500 Benchmark</div>
      </div>
      <div className="chart-wrap">
        <Line data={makeData(range)} options={makeOptions(theme)} />
      </div>
    </section>
  );
}
