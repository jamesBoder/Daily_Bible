import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../contexts/LanguageContext";
import StreakCandle from "../StreakCandle";
import BlessingsChip from "../BlessingsChip";
import {
  MagnifyingGlass,
  Path,
  HandsPraying,
  Sun,
  Moon,
  UsersThree,
  Heart,
  NotePencil,
  Storefront,
  Gear,
  SignOut,
  DotsThree,
  CaretDown,
  GlobeHemisphereWest,
} from "@phosphor-icons/react";

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { currentLanguage, changeLanguage, supportedLanguages } = useLanguage();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const { t } = useTranslation();

  const handleLogout = async () => {
    await logout();
    navigate("/daily");
  };

  // Unified amber pill nav link — desktop (rounded-full)
  const navLinkDesktop = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-all duration-200 flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
      isActive
        ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
        : "text-gray-600 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-700 dark:hover:text-amber-400"
    }`;

  // Dropdown menu item style
  const dropdownItem =
    "flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-700 dark:hover:text-amber-400 rounded-lg transition-colors";

  const iconBtn =
    "flex items-center justify-center w-8 h-8 rounded-full text-gray-500 dark:text-gray-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-700 dark:hover:text-amber-400 transition-colors";

  const userInitial = user?.username ? user.username.charAt(0).toUpperCase() : null;

  // Reusable dark-mode toggle button
  const DarkToggle = () => (
    <button
      onClick={toggleTheme}
      className={iconBtn}
      aria-label={isDarkMode ? t("header.switchToLight", "Switch to light mode") : t("header.switchToDark", "Switch to dark mode")}
      title={isDarkMode ? t("header.switchToLight", "Switch to light mode") : t("header.switchToDark", "Switch to dark mode")}
    >
      {isDarkMode
        ? <Sun size={17} weight="duotone" />
        : <Moon size={17} weight="duotone" />}
    </button>
  );

  // Reusable language dropdown
  const LangDropdown = ({ align = "left" }: { align?: "left" | "right" }) => (
    <div className="relative" ref={langRef}>
      <button
        onClick={() => setLangOpen((v) => !v)}
        className={`${iconBtn} gap-1 w-auto px-2`}
        aria-haspopup="true"
        aria-expanded={langOpen}
        aria-label={t("header.changeLanguage", "Change language")}
        title={t("header.changeLanguage", "Change language")}
      >
        <GlobeHemisphereWest size={15} weight="duotone" />
        <span className="text-xs font-semibold">{currentLanguage.toUpperCase()}</span>
      </button>
      {langOpen && (
        <div
          className={`absolute top-full mt-2 w-40 rounded-xl border border-amber-200/60 dark:border-amber-700/40 shadow-lg py-1.5 px-1.5 z-50 ${align === "right" ? "right-0" : "left-0"}`}
          style={{ background: "var(--header-bg)" }}
        >
          {supportedLanguages.map((lang) => (
            <button
              key={lang.code}
              onPointerDown={e => e.stopPropagation()}
              onClick={() => { changeLanguage(lang.code); setLangOpen(false); }}
              className={`${dropdownItem} ${currentLanguage === lang.code ? "text-amber-700 dark:text-amber-400 font-semibold" : ""}`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );

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
          <Link to="/" className="flex items-center gap-1.5 group shrink-0 min-w-0">
            <span className="text-base sm:text-lg leading-none shrink-0" aria-hidden="true">🕯</span>
            <span className="text-base sm:text-xl font-display font-bold text-amber-700 dark:text-amber-400 tracking-tight transition-all duration-300 group-hover:drop-shadow-[0_0_10px_rgba(245,158,11,0.55)] truncate">
              Words of Praise&#8482;
            </span>
          </Link>

          {/* ── Desktop Navigation ─────────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/search" className={navLinkDesktop}>
              <MagnifyingGlass size={14} weight="duotone" className="shrink-0" />
              {t("nav.search")}
            </NavLink>
            <NavLink to="/manna" className={navLinkDesktop}>
              <Sun size={14} weight="duotone" className="shrink-0" />
              {t("nav.manna", "Manna")}
            </NavLink>
            <NavLink to="/plans" className={navLinkDesktop}>
              <Path size={14} weight="duotone" className="shrink-0" />
              {t("nav.plans", "Plans")}
            </NavLink>
            <NavLink to="/prayer" className={navLinkDesktop}>
              <HandsPraying size={14} weight="duotone" className="shrink-0" />
              {t("nav.prayer", "Prayer")}
            </NavLink>
            <NavLink to="/community" className={navLinkDesktop}>
              <UsersThree size={14} weight="duotone" className="shrink-0" />
              {t("nav.leaderboard", "Community")}
            </NavLink>

            {/* ── More dropdown ──────────────────────────────────────────── */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreOpen((v) => !v)}
                className={`text-sm font-medium transition-all duration-200 flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
                  moreOpen
                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                    : "text-gray-600 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-700 dark:hover:text-amber-400"
                }`}
                aria-haspopup="true"
                aria-expanded={moreOpen}
              >
                <DotsThree size={16} weight="bold" className="shrink-0" />
                {t("nav.more", "More")}
              </button>
              {moreOpen && (
                <div className="absolute top-full mt-2 left-0 w-44 rounded-xl border border-amber-200/60 dark:border-amber-700/40 shadow-lg py-1.5 px-1.5 z-50"
                  style={{ background: "var(--header-bg)" }}>
                  <NavLink to="/favorites" className={dropdownItem} onClick={() => setMoreOpen(false)}>
                    <Heart size={15} weight="duotone" className="shrink-0 text-amber-500" />
                    {t("nav.favorites")}
                  </NavLink>
                  <NavLink to="/journal" className={dropdownItem} onClick={() => setMoreOpen(false)}>
                    <NotePencil size={15} weight="duotone" className="shrink-0 text-amber-500" />
                    {t("nav.journal", "Journal")}
                  </NavLink>
                  <NavLink to="/shop" className={dropdownItem} onClick={() => setMoreOpen(false)}>
                    <Storefront size={15} weight="duotone" className="shrink-0 text-amber-500" />
                    {t("nav.shop", "Shop")}
                  </NavLink>
                </div>
              )}
            </div>
          </div>

          {/* ── Desktop User Section ───────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-2">
            {/* Divider separating nav tabs from utility/user controls */}
            <div className="w-px h-6 bg-amber-300/50 dark:bg-amber-700/40 mr-1" />
            {/* Dark mode toggle — always visible */}
            <DarkToggle />

            {/* Language switcher — unauthenticated only */}
            {!user && <LangDropdown align="right" />}

            {/* Vertical divider */}
            <div className="w-px h-6 bg-amber-300/50 dark:bg-amber-700/40 mx-1" />

            {!user ? (
              /* Unauthenticated: Sign In + Sign Up */
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/login")}
                  className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-amber-700 dark:hover:text-amber-400 transition-colors px-3 py-1.5"
                >
                  {t("nav.signin", "Sign In")}
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="text-sm font-semibold px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500 text-white transition-colors"
                >
                  {t("nav.signup", "Sign Up")}
                </button>
              </div>
            ) : (
              /* Authenticated: streak, blessings, avatar dropdown */
              <>
                <StreakCandle />
                <BlessingsChip />

                {/* Avatar + user menu dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex items-center gap-1.5 rounded-full px-2 py-1 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                    aria-haspopup="true"
                    aria-expanded={userMenuOpen}
                  >
                    {userInitial && (
                      <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/40 border border-amber-300/60 dark:border-amber-600/40 flex items-center justify-center text-xs font-bold text-amber-700 dark:text-amber-400 shrink-0">
                        {userInitial}
                      </div>
                    )}
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {user?.username}
                    </span>
                    <CaretDown
                      size={12}
                      weight="bold"
                      className={`text-gray-400 dark:text-gray-500 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute top-full mt-2 right-0 w-44 rounded-xl border border-amber-200/60 dark:border-amber-700/40 shadow-lg py-1.5 px-1.5 z-50"
                      style={{ background: "var(--header-bg)" }}>
                      <button
                        onClick={() => { setUserMenuOpen(false); navigate("/settings"); }}
                        className={dropdownItem}
                      >
                        <Gear size={15} weight="duotone" className="shrink-0 text-amber-500" />
                        {t("nav.settings")}
                      </button>
                      <div className="my-1 border-t border-amber-200/40 dark:border-amber-700/30" />
                      <button onClick={handleLogout} className={dropdownItem}>
                        <SignOut size={15} weight="duotone" className="shrink-0 text-amber-500" />
                        {t("nav.logout")}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* ── Mobile right section ──────────────────────────────────────── */}
          <div className="md:hidden flex items-center gap-1">
            {/* Dark mode toggle — always visible */}
            <DarkToggle />
            {/* Language switcher — unauthenticated only */}
            {!user && <LangDropdown align="right" />}
            {/* Divider */}
            <div className="w-px h-5 bg-amber-300/50 dark:bg-amber-700/40 mx-0.5" />
            {!user ? (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-amber-700 dark:hover:text-amber-400 transition-colors px-2 py-1"
                >
                  {t("nav.signin", "Sign In")}
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500 text-white transition-colors whitespace-nowrap"
                >
                  {t("nav.signup", "Sign Up")}
                </button>
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
