import React from 'react';
import ReactDOM from 'react-dom/client';
import RemoteApp from './RemoteApp';

// Standalone entry: mounts the same self-contained component that is exposed
// as a Module Federation remote (see RemoteApp.jsx and vite.config.js).
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RemoteApp />
  </React.StrictMode>,
);
