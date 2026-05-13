import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import BottomNav from "./BottomNav";
import { OfflineBanner } from "../common/OfflineBanner";
import MilestoneCelebrationModal from "../../features/streak/MilestoneCelebrationModal";
import { CheckoutOverlay } from "../common/CheckoutOverlay";
import { InstallPrompt } from "../InstallPrompt";
import { PushPrompt } from "../PushPrompt";
import { useStreak } from "../../contexts/StreakContext";
import posthog from "posthog-js";


export const Layout: React.FC = () => {
  const location = useLocation();
  const { checkoutOverlayVisible, cancelCheckout } = useStreak();

  useEffect(() => {
    posthog.capture("$pageview");
  }, [location.pathname]);
  // On mobile: h-full locks the wrapper to the dvh-sized viewport so body
  // never scrolls and <main> handles all scrolling internally. The html
  // element is sized to 100dvh so the container grows when the browser
  // chrome hides, giving more visible area automatically.
  // On desktop (md+): normal min-h-screen block flow.
  return (
    <div className="md:min-h-screen h-full flex flex-col">
      <Header />
      <OfflineBanner />
      {/* pb-safe-nav clears the fixed bottom nav (3.5rem h-14 + safe-area-inset-bottom + 1.5rem buffer) */}
      <main key={location.pathname} className="flex-1 overflow-y-auto overscroll-y-contain py-8 pb-safe-nav md:overflow-visible md:pb-8 animate-page-enter">
        <Outlet />
      </main>
      {/* Footer visible on desktop only — bottom nav replaces it on mobile */}
      <div className="hidden md:block">
        <Footer />
      </div>
      <BottomNav />
      <InstallPrompt />
      <PushPrompt />
      <MilestoneCelebrationModal />
      {/* §8.18.4: Full-screen checkout overlay — position:fixed, survives re-renders */}
      <CheckoutOverlay visible={checkoutOverlayVisible} onCancel={cancelCheckout} />
    </div>
  );
};
