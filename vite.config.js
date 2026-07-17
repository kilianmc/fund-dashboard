import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';

// Under Vitest we skip the Module Federation plugin: it rewrites the module
// graph (shared singletons, top-level await) which conflicts with the jsdom
// test runner and is irrelevant to unit tests. Builds/dev keep it, so the MF
// contract is unchanged.
const isTest = process.env.VITEST === 'true';

// This project is exposed as a Module Federation *remote* ("fundDashboard")
// so the portfolio shell can load it at runtime. It also still runs standalone
// via `npm run dev` (entry: src/main.jsx).
export default defineConfig({
  plugins: [
    react(),
    !isTest &&
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
  // Ensure any JSX not handled by the React Babel plugin (e.g. Vitest's esbuild
  // fallback for .jsx test files) uses the automatic runtime, so React need not
  // be in scope — matching the project's new-JSX-transform convention.
  esbuild: {
    jsx: 'automatic',
  },
  // Vitest configuration. jsdom gives components a DOM; globals lets tests use
  // describe/it/expect without importing them; setupFiles wires jest-dom.
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: false,
  },
});
