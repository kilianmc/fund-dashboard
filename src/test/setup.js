// Vitest global setup: extends `expect` with jest-dom matchers (toBeInTheDocument,
// toHaveTextContent, etc.) for all test files.
import '@testing-library/jest-dom';

// jsdom does not implement matchMedia; ThemeProvider reads it on init.
// Provide a minimal light-mode stub so components can render in tests.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
