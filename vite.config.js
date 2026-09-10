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
          react: {
            singleton: true,
            requiredVersion: '^19.0.0',
            strictVersion: true,
          },
          'react-dom': {
            singleton: true,
            requiredVersion: '^19.0.0',
            strictVersion: true,
          },
        },
      }),
  ],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  // No JSX transform config here on purpose. @vitejs/plugin-react already sets
  // `oxc.jsx = { runtime: 'automatic', importSource, refresh }` in its own
  // `config` hook, and it is active under Vitest too (only `federation` is
  // skipped above), so the automatic runtime already covers test files. Adding
  // an explicit `oxc.jsx` block here would duplicate it and risk clobbering the
  // plugin's `refresh` (Fast Refresh) setting. The old `esbuild.jsx` block was
  // dead: Vite 8 transforms with oxc, so Vite ignored it entirely.
  // Vitest configuration. jsdom gives components a DOM; globals lets tests use
  // describe/it/expect without importing them; setupFiles wires jest-dom.
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: false,
  },
});
