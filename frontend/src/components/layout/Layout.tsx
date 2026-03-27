import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import BottomNav from "./BottomNav";
import { OfflineBanner } from "../common/OfflineBanner";
import MilestoneCelebrationModal from "../../features/streak/MilestoneCelebrationModal";
import { CheckoutOverlay } from "../common/CheckoutOverlay";
import { useStreak } from "../../contexts/StreakContext";


export const Layout: React.FC = () => {
  const location = useLocation();
  const { checkoutOverlayVisible, cancelCheckout } = useStreak();
  // On mobile: wrapper fills viewport (h-full) so body never scrolls.
  // iOS Safari hides its address bar only when the body scrolls, which
  // causes position:fixed elements to bounce. With body scroll eliminated,
  // <main> handles scrolling internally (overflow-y-auto) and the nav stays put.
  // On desktop (md+): revert to normal min-h-screen block flow.
  return (
    <div className="md:min-h-screen h-full flex flex-col">
      <Header />
      <OfflineBanner />
      {/* pb-20 on mobile clears the fixed bottom nav bar (56px + safe area) */}
      <main key={location.pathname} className="flex-1 overflow-y-auto overscroll-y-contain py-8 pb-24 md:overflow-visible md:pb-8 animate-fade-in">
        <Outlet />
      </main>
      {/* Footer visible on desktop only — bottom nav replaces it on mobile */}
      <div className="hidden md:block">
        <Footer />
      </div>
      <BottomNav />
      <MilestoneCelebrationModal />
      {/* §8.18.4: Full-screen checkout overlay — position:fixed, survives re-renders */}
      <CheckoutOverlay visible={checkoutOverlayVisible} onCancel={cancelCheckout} />
    </div>
  );
};
