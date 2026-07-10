import { useTheme } from '../theme/ThemeContext';
import './TopBar.scss';

export default function TopBar() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  return (
    <div className="topbar">
      <div className="brand">
        <div className="logo">A</div>
        <div>
          <h1>Asset Management</h1>
          <p>Private Client Portfolio</p>
        </div>
      </div>
      <div className="topbar-right">
        <div className="live-pill"><span className="live-dot"></span> Live · 10:42 CET</div>
        <button
          className="theme-toggle"
          onClick={toggle}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? '☀️' : '🌙'}
        </button>
        <div className="avatar">KM</div>
      </div>
    </div>
  );
}
