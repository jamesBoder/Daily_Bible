import React from "react";
import ReactDOM from "react-dom/client";
import { reportWebVitals } from "./reportWebVitals";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import "./i18n"; // Initialize i18n
import "./index.css";
import App from "./App";

const renderApp = async () => {
  // If an early verse prefetch was kicked off in index.html, await it now and
  // seed the React Query cache before the first render. By the time this runs
  // (after the JS bundle has downloaded and parsed) the fetch has been in-flight
  // for that entire duration, so the await is usually instant.
  const prefetch = (window as any).__VERSE_PREFETCH__;
  if (prefetch) {
    try {
      const data = await prefetch;
      if (data?.verse) {
        const today = new Date().toISOString().split('T')[0];
        // Seed with the same query key used by useVerse('en', undefined)
        queryClient.setQueryData(['dailyVerse', today, 'en', ''], data);
      }
    } catch {
      // Prefetch failed — React Query will fetch normally on mount
    }
  }

  const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
  );

  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
};

renderApp();

reportWebVitals(console.log);

// Register service worker for offline support
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .catch((err) => console.warn('SW registration failed:', err));
  });
}

