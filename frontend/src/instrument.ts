import * as Sentry from "@sentry/react";
import React from "react";
import {
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes,
} from "react-router-dom";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  enabled: !!process.env.REACT_APP_SENTRY_DSN && process.env.NODE_ENV === "production",
  sendDefaultPii: true,
  environment: process.env.NODE_ENV,
  integrations: [
    Sentry.reactRouterV6BrowserTracingIntegration({
      useEffect: React.useEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes,
    }),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 0.2,
  tracePropagationTargets: [/^\/api/],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
