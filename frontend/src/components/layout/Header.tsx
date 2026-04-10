import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../common/Button";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../contexts/LanguageContext";
import StreakCandle from "../StreakCandle";
import BlessingsChip from "../BlessingsChip";
import { useStreak } from "../../contexts/StreakContext";
import { MagnifyingGlass, Path, HandsPraying } from "@phosphor-icons/react";

export const Header: React.FC = () => {
  const { user, logout, isGuest } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { currentLanguage: _lang } = useLanguage();
  const { subscription } = useStreak();
  const isPastDue = subscription?.status === 'past_due';

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Unified amber pill nav link — desktop (rounded-full)
  const navLinkDesktop = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-all duration-200 flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
      isActive
        ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
        : "text-gray-600 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-700 dark:hover:text-amber-400"
    }`;

  const userInitial = user?.username ? user.username.charAt(0).toUpperCase() : null;

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-md border-b border-amber-300/30 dark:border-amber-700/20 transition-all duration-300 ${
        isScrolled ? "shadow-[0_2px_16px_rgba(245,158,11,0.10)]" : ""
      }`}
      style={{ background: "var(--header-bg)" }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">

          {/* ── Logo ───────────────────────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-2 group shrink-0 min-w-0">
            <span className="text-lg leading-none shrink-0" aria-hidden="true">🕯</span>
            <span className="text-xl font-display font-bold text-amber-700 dark:text-amber-400 tracking-tight transition-all duration-300 group-hover:drop-shadow-[0_0_10px_rgba(245,158,11,0.55)] truncate">
              Words of Praise
            </span>
          </Link>

          {/* ── Desktop Navigation ─────────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-1">
            {!isGuest && (
              <NavLink to="/search" className={navLinkDesktop}>
                <MagnifyingGlass size={14} weight="duotone" className="shrink-0" />
                {t("nav.search")}
              </NavLink>
            )}
            {!isGuest && (
              <NavLink to="/favorites" className={navLinkDesktop}>
                {t("nav.favorites")}
              </NavLink>
            )}
            {!isGuest && (
              <NavLink to="/journal" className={navLinkDesktop}>
                {t("nav.journal", "Journal")}
              </NavLink>
            )}
            {!isGuest && (
              <NavLink to="/shop" className={navLinkDesktop}>
                {t("nav.shop", "Shop")}
              </NavLink>
            )}
            {!isGuest && (
              <NavLink to="/community" className={navLinkDesktop}>
                {t("nav.leaderboard", "Community")}
              </NavLink>
            )}
            {!isGuest && (
              <NavLink to="/manna" className={navLinkDesktop}>
                {t("nav.manna", "Manna")}
              </NavLink>
            )}
            {!isGuest && (
              <NavLink to="/plans" className={navLinkDesktop}>
                <Path size={14} weight="duotone" className="shrink-0" />
                {t("nav.plans", "Plans")}
              </NavLink>
            )}
            {!isGuest && (
              <NavLink to="/prayer" className={navLinkDesktop}>
                <HandsPraying size={14} weight="duotone" className="shrink-0" />
                {t("nav.prayer", "Prayer")}
              </NavLink>
            )}
            <div className="relative">
              <NavLink to="/settings" className={navLinkDesktop}>
                {t("nav.settings")}
              </NavLink>
              {isPastDue && (
                <span
                  className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-amber-500"
                  aria-label={t('subscription.nav_badge.tooltip', 'Payment issue — update your payment method')}
                  title={t('subscription.nav_badge.tooltip', 'Payment issue — update your payment method')}
                />
              )}
            </div>
          </div>

          {/* ── Desktop User Section ───────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-3">
            {/* Vertical divider */}
            <div className="w-px h-6 bg-amber-300/50 dark:bg-amber-700/40" />

            {isGuest ? (
              /* Guest: Sign In + Sign Up */
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/login")}
                  className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-amber-700 dark:hover:text-amber-400 transition-colors px-3 py-1.5"
                >
                  {t("nav.signin", "Sign In")}
                </button>
                <Button onClick={() => navigate("/signup")} variant="primary" className="text-sm">
                  {t("nav.signup", "Sign Up")}
                </Button>
              </div>
            ) : (
              /* Authenticated: streak, blessings, avatar, logout */
              <>
                <StreakCandle />
                <BlessingsChip />
                <div className="flex items-center gap-2">
                  {userInitial && (
                    <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/40 border border-amber-300/60 dark:border-amber-600/40 flex items-center justify-center text-xs font-bold text-amber-700 dark:text-amber-400 shrink-0">
                      {userInitial}
                    </div>
                  )}
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t("auth.welcome", { username: user?.username })}
                  </span>
                  <Button onClick={handleLogout} variant="secondary" className="text-sm">
                    {t("nav.logout")}
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* ── Mobile: streak + blessings for auth users; Sign In for guests */}
          <div className="md:hidden flex items-center gap-2">
            {isGuest ? (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-amber-700 dark:hover:text-amber-400 transition-colors px-2 py-1.5"
                >
                  {t("nav.signin", "Sign In")}
                </button>
                <Button onClick={() => navigate("/signup")} variant="primary" className="text-sm">
                  {t("nav.signup", "Sign Up")}
                </Button>
              </>
            ) : (
              <>
                <StreakCandle />
                <BlessingsChip />
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};
