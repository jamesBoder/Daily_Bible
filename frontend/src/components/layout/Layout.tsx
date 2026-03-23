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
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <OfflineBanner />
      {/* pb-20 on mobile clears the fixed bottom nav bar (56px + safe area) */}
      <main key={location.pathname} className="flex-1 py-8 pb-24 md:pb-8 animate-fade-in">
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
