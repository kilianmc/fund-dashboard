import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';

// This project is exposed as a Module Federation *remote* ("fundDashboard")
// so the portfolio shell can load it at runtime. It also still runs standalone
// via `npm run dev` (entry: src/main.jsx).
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'fundDashboard',
      filename: 'remoteEntry.js',
      // This is a JS project (no tsconfig.json); skip federated type generation.
      dts: false,
      exposes: {
        // Consumed by the shell as `import('fundDashboard/App')`.
        './App': './src/RemoteApp.jsx',
      },
      // React must be a singleton shared with the host so it loads once.
      shared: {
        react: { singleton: true, requiredVersion: '^18.2.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.2.0' },
      },
    }),
  ],
  // Module Federation relies on top-level await; needs a modern build target.
  build: {
    target: 'chrome89',
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
});
