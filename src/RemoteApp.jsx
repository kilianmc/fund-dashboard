// Self-contained mountable entry for this project.
// Bundles everything the dashboard needs (Chart.js registration, global
// styles, theme provider) so it works both standalone and when loaded as a
// Module Federation remote inside the portfolio shell.
import './chartSetup';
import './index.scss';
import App from './App';
import { ThemeProvider } from './theme/ThemeContext';

export default function RemoteApp() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}
