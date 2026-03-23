import React from "react";
import ReactDOM from "react-dom/client";
import { reportWebVitals } from "./reportWebVitals";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import "./i18n"; // Initialize i18n
import "./index.css";
import App from "./App";

// Optimize initial render by using requestIdleCallback if available
const renderApp = () => {
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

// Use requestIdleCallback to avoid forced reflows during initial render
if ('requestIdleCallback' in window) {
  (window as any).requestIdleCallback(renderApp);
} else {
  // Fallback for browsers that don't support requestIdleCallback
  setTimeout(renderApp, 1);
}

reportWebVitals(console.log);

// Register service worker for offline support
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .catch((err) => console.warn('SW registration failed:', err));
  });
}

