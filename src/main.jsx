import React from 'react';
import ReactDOM from 'react-dom/client';
import './chartSetup';
import './index.scss';
import App from './App';
import { ThemeProvider } from './theme/ThemeContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
