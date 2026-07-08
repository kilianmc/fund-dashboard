// ---- Formatting helpers ----
export const fmtEur = (v) => '€' + Math.round(v).toLocaleString('en-US');
export const signClass = (v) => (v >= 0 ? 'pos' : 'neg');
export const fmtSigned = (v, d) => (v >= 0 ? '+' : '') + v.toFixed(d) + '%';

// ---- Headline figures ----
export const TOTAL_VALUE = 425800;
export const YTD_RETURN = '+14.8%';

// ---- Fund data (allocations sum to 100%, values sum to €425,800) ----
export const funds = [
  { name: 'Vanguard EuroStocks',             tag: 'Developed Europe Eq.', color: '#2563eb', alloc: 20, value: 85160, daily: 0.41,  ytd: 12.4 },
  { name: 'Vanguard S&P 500',                tag: 'US Large Cap Eq.',     color: '#10b981', alloc: 18, value: 76644, daily: 0.63,  ytd: 18.2 },
  { name: 'Vanguard Emerging Markets',       tag: 'EM Equity',            color: '#7c6cf0', alloc: 12, value: 51096, daily: 1.12,  ytd: 10.1 },
  { name: 'Vanguard FTSE All-World',         tag: 'Global Equity',        color: '#f59e0b', alloc: 10, value: 42580, daily: 0.34,  ytd: 11.7 },
  { name: 'Vanguard Global Bond',            tag: 'Global Fixed Income',  color: '#ef4444', alloc: 9,  value: 38322, daily: -0.08, ytd: 3.2  },
  { name: 'Vanguard Total Intl Stock',       tag: 'Intl Developed Eq.',   color: '#06b6d4', alloc: 8,  value: 34064, daily: 0.52,  ytd: 9.4  },
  { name: 'Vanguard Real Estate',            tag: 'Global REIT',          color: '#ec4899', alloc: 7,  value: 29806, daily: -0.21, ytd: 5.6  },
  { name: 'Vanguard Small-Cap',              tag: 'US Small Cap Eq.',     color: '#84cc16', alloc: 6,  value: 25548, daily: 0.88,  ytd: 14.9 },
  { name: 'Vanguard Dividend Appreciation',  tag: 'US Dividend Eq.',      color: '#6366f1', alloc: 5,  value: 21290, daily: 0.19,  ytd: 8.3  },
  { name: 'Vanguard Information Technology', tag: 'US Tech Sector',       color: '#f97316', alloc: 5,  value: 21290, daily: 1.47,  ytd: 22.6 },
];

// ---- Performance data (indexed to 100 at start) ----
export const perfData = {
  '12m': {
    labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    port:  [100, 101.8, 100.9, 103.4, 105.1, 104.2, 106.8, 108.9, 107.6, 110.9, 112.8, 114.8],
    bench: [100, 101.1, 100.2, 102.0, 103.6, 102.9, 104.7, 106.2, 105.1, 107.4, 108.9, 110.3],
  },
  '3y': {
    labels: ['2023', '', '', '2024', '', '', '2025', '', '', '2026', ''],
    port:  [100, 104, 101, 108, 113, 110, 118, 126, 122, 131, 138.5],
    bench: [100, 103, 100.5, 106, 110, 107.5, 113, 119, 116, 123, 128],
  },
  '5y': {
    labels: ['2021', '', '2022', '', '2023', '', '2024', '', '2025', '', '2026'],
    port:  [100, 109, 97, 104, 112, 120, 131, 140, 152, 161, 172],
    bench: [100, 111, 95, 101, 108, 115, 124, 132, 142, 150, 159],
  },
  'all': {
    labels: ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'],
    port:  [100, 114, 110, 132, 140, 168, 150, 178, 205, 231, 258],
    bench: [100, 118, 112, 138, 150, 182, 158, 186, 214, 238, 262],
  },
};

export const perfRanges = [
  { key: '12m', label: '12M' },
  { key: '3y', label: '3Y' },
  { key: '5y', label: '5Y' },
  { key: 'all', label: 'All' },
];
