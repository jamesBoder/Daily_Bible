import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../common/Button";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../contexts/LanguageContext";
import StreakCandle from "../StreakCandle";
import BlessingsChip from "../BlessingsChip";

export const Header: React.FC = () => {
  const { user, logout, isGuest } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { currentLanguage: _lang } = useLanguage();

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

  // Mobile nav link — rounded-lg, full-width feel
  const navLinkMobile = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 font-medium transition-colors px-3 py-2 rounded-lg ${
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
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <span className="text-lg leading-none" aria-hidden="true">🕯</span>
            <span className="text-xl font-display font-bold text-amber-700 dark:text-amber-400 tracking-tight transition-all duration-300 group-hover:drop-shadow-[0_0_10px_rgba(245,158,11,0.55)]">
              Words of Praise
            </span>
          </Link>

          {/* ── Desktop Navigation ─────────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-1">
            {!isGuest && (
              <NavLink to="/search" className={navLinkDesktop}>
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
                </svg>
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
            <NavLink to="/settings" className={navLinkDesktop}>
              {t("nav.settings")}
            </NavLink>
          </div>

          {/* ── Desktop User Section ───────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-3">
            {/* Vertical divider */}
            <div className="w-px h-6 bg-amber-300/50 dark:bg-amber-700/40" />

            {/* Streak + Blessings */}
            {!isGuest && (
              <>
                <StreakCandle />
                <BlessingsChip />
              </>
            )}

            {/* Avatar + welcome + logout */}
            <div className="flex items-center gap-2">
              {!isGuest && userInitial && (
                <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/40 border border-amber-300/60 dark:border-amber-600/40 flex items-center justify-center text-xs font-bold text-amber-700 dark:text-amber-400 shrink-0">
                  {userInitial}
                </div>
              )}
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {isGuest
                  ? t("auth.browsingAsGuest")
                  : t("auth.welcome", { username: user?.username })}
              </span>
              {isGuest && (
                <Button onClick={() => navigate("/signup")} variant="primary" className="text-sm">
                  {t("nav.signup")}
                </Button>
              )}
              <Button onClick={handleLogout} variant="secondary" className="text-sm">
                {isGuest ? t("auth.exitGuest") : t("nav.logout")}
              </Button>
            </div>
          </div>

          {/* ── Mobile Menu Button ─────────────────────────────────────────── */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-full text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* ── Mobile Menu ────────────────────────────────────────────────────── */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="py-3 border-t border-amber-300/30 dark:border-amber-700/20">
            <div className="flex flex-col gap-1">
              {!isGuest && (
                <NavLink to="/search" className={navLinkMobile} onClick={() => setIsMenuOpen(false)}>
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
                  </svg>
                  {t("nav.search")}
                </NavLink>
              )}
              {!isGuest && (
                <NavLink to="/favorites" className={navLinkMobile} onClick={() => setIsMenuOpen(false)}>
                  {t("nav.favorites")}
                </NavLink>
              )}
              {!isGuest && (
                <NavLink to="/journal" className={navLinkMobile} onClick={() => setIsMenuOpen(false)}>
                  {t("nav.journal", "Journal")}
                </NavLink>
              )}
              {!isGuest && (
                <NavLink to="/shop" className={navLinkMobile} onClick={() => setIsMenuOpen(false)}>
                  {t("nav.shop", "Shop")}
                </NavLink>
              )}
              {!isGuest && (
                <NavLink to="/community" className={navLinkMobile} onClick={() => setIsMenuOpen(false)}>
                  {t("nav.leaderboard", "Community")}
                </NavLink>
              )}
              {!isGuest && (
                <NavLink to="/manna" className={navLinkMobile} onClick={() => setIsMenuOpen(false)}>
                  {t("nav.manna", "Manna")}
                </NavLink>
              )}
              <NavLink to="/settings" className={navLinkMobile} onClick={() => setIsMenuOpen(false)}>
                {t("nav.settings")}
              </NavLink>

              {/* Mobile user section */}
              <div className="pt-3 mt-1 border-t border-amber-300/30 dark:border-amber-700/20">
                {!isGuest && (
                  <div className="flex items-center gap-3 mb-3 px-1">
                    {userInitial && (
                      <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 border border-amber-300/60 dark:border-amber-600/40 flex items-center justify-center text-sm font-bold text-amber-700 dark:text-amber-400 shrink-0">
                        {userInitial}
                      </div>
                    )}
                    <StreakCandle />
                    <BlessingsChip />
                  </div>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 px-1">
                  {isGuest
                    ? t("auth.browsingAsGuest")
                    : t("auth.welcome", { username: user?.username })}
                </p>
                {isGuest && (
                  <Button
                    onClick={() => { navigate("/signup"); setIsMenuOpen(false); }}
                    variant="primary"
                    className="w-full mb-2"
                  >
                    {t("nav.signup")}
                  </Button>
                )}
                <Button onClick={handleLogout} variant="secondary" className="w-full">
                  {isGuest ? t("auth.exitGuest") : t("nav.logout")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
