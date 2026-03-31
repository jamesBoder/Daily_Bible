import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import BottomNav from "./BottomNav";
import { OfflineBanner } from "../common/OfflineBanner";
import MilestoneCelebrationModal from "../../features/streak/MilestoneCelebrationModal";
import { CheckoutOverlay } from "../common/CheckoutOverlay";
import { InstallPrompt } from "../InstallPrompt";
import { useStreak } from "../../contexts/StreakContext";


export const Layout: React.FC = () => {
  const location = useLocation();
  const { checkoutOverlayVisible, cancelCheckout } = useStreak();
  // min-h-screen ensures the layout fills the viewport on desktop.
  // On mobile the browser chrome can auto-hide; <main> handles internal scroll.
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <OfflineBanner />
      {/* pb-20 on mobile clears the fixed bottom nav bar (56px + safe area) */}
      <main key={location.pathname} className="flex-1 overflow-y-auto overscroll-y-contain py-8 pb-24 md:overflow-visible md:pb-8 animate-page-enter">
        <Outlet />
      </main>
      {/* Footer visible on desktop only — bottom nav replaces it on mobile */}
      <div className="hidden md:block">
        <Footer />
      </div>
      <BottomNav />
      <InstallPrompt />
      <MilestoneCelebrationModal />
      {/* §8.18.4: Full-screen checkout overlay — position:fixed, survives re-renders */}
      <CheckoutOverlay visible={checkoutOverlayVisible} onCancel={cancelCheckout} />
    </div>
  );
};
