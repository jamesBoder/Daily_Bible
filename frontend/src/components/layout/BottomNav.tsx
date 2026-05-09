import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import {
  House,
  TextT,
  Crown,
  List,
  Heart,
  BookOpen,
  MagnifyingGlass,
  Gear,
  SignOut,
  X,
  LockSimple,
  Path,
  HandsPraying,
} from '@phosphor-icons/react';
import { useSwipe } from '../../hooks/useSwipe';
import { useInstallPromptContext } from '../../contexts/InstallPromptContext';
import { DeviceMobile } from '@phosphor-icons/react';

// ── BottomNav ─────────────────────────────────────────────────────────────────
// Mobile-only persistent tab bar. Hidden on md+ screens where the header nav
// handles everything. Shown to all users including guests — restricted tabs
// display a lock indicator and lead to the guest upsell screen.
// ─────────────────────────────────────────────────────────────────────────────

const BottomNav: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  const { canInstall, isInstalled, isIOS, install } = useInstallPromptContext();
  // Show nudge dot when the app can be installed and isn't already
  const showInstallNudge = !isInstalled && (canInstall || isIOS);
  const sheetSwipe = useSwipe({ onSwipeDown: () => setSheetOpen(false) });
  const haptic = () => { if (navigator.vibrate) navigator.vibrate(8); };

  // Close sheet on route change
  useEffect(() => {
    setSheetOpen(false);
  }, [location.pathname]);

  // Close sheet on escape key
  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSheetOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheetOpen]);

  const handleLogout = async () => {
    setSheetOpen(false);
    await logout();
    navigate('/daily');
  };

  // Pill indicator position — derived from current route / sheet state
  const tabPaths = ['/daily', '/manna', '/plans', '/shop'];
  const moreRoutes = ['/favorites', '/journal', '/search', '/prayer', '/settings', '/profile', '/account'];
  const isMoreRoute = moreRoutes.some(p => location.pathname === p || location.pathname.startsWith(p + '/'));
  const activePillIndex = sheetOpen || isMoreRoute
    ? 4
    : (() => {
        const idx = tabPaths.findIndex(
          (p) => location.pathname === p || location.pathname.startsWith(p + '/'),
        );
        return idx === -1 ? -1 : idx;
      })();

  const tabBase =
    'relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[11px] font-medium transition-colors duration-150 active:scale-90 select-none focus:outline-none min-w-0 overflow-hidden';
  const tabActive = 'text-amber-700 dark:text-amber-400';
  const tabInactive = 'text-gray-500 dark:text-gray-400';

  // Lock badge overlaid on restricted tab icons for guest users
  const LockBadge = () => (
    <LockSimple
      size={9}
      weight="fill"
      className="absolute -top-0.5 -right-1 text-gray-400 dark:text-gray-500"
    />
  );

  return (
    <>
      {/* ── Tab bar ─────────────────────────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-amber-300/30 dark:border-amber-700/20"
        style={{
          background: 'var(--header-bg)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          // Force GPU compositing so iOS Safari's dynamic viewport resize
          // (address-bar hide/show) doesn't cause the nav to visually float.
          willChange: 'transform',
          transform: 'translateZ(0)',
        }}
        aria-label={t('nav.mainNavigation', 'Main navigation')}
      >
        <div className="relative flex items-stretch h-14">
          {/* Sliding pill behind active tab */}
          {activePillIndex >= 0 && (
            <div
              className="absolute top-1.5 bottom-1.5 rounded-full bg-amber-100/80 dark:bg-amber-900/30 pointer-events-none transition-[left,width] duration-300 ease-out"
              style={{
                left: `calc(${activePillIndex * 20}% + 6px)`,
                width: 'calc(20% - 12px)',
              }}
              aria-hidden="true"
            />
          )}

          {/* Home — always unlocked */}
          <NavLink
            to="/daily"
            onClick={haptic}
            className={({ isActive }) =>
              `${tabBase} ${isActive ? tabActive : tabInactive}`
            }
            aria-label={t('nav.home', 'Home')}
          >
            {({ isActive }) => (
              <>
                <House size={22} weight={isActive ? 'fill' : 'regular'} />
                <span className="truncate w-full text-center">{t('nav.home', 'Home')}</span>
              </>
            )}
          </NavLink>

          {/* Manna */}
          <NavLink
            to="/manna"
            onClick={haptic}
            className={({ isActive }) =>
              `${tabBase} ${isActive ? tabActive : tabInactive}`
            }
            aria-label={t('nav.manna', 'Manna')}
          >
            {({ isActive }) => (
              <>
                <span className="relative">
                  <TextT size={22} weight={isActive ? 'fill' : 'regular'} />
                  {!user && <LockBadge />}
                </span>
                <span className="truncate w-full text-center">{t('nav.manna', 'Manna')}</span>
              </>
            )}
          </NavLink>

          {/* Reading Plans */}
          <NavLink
            to="/plans"
            onClick={haptic}
            className={({ isActive }) =>
              `${tabBase} ${isActive ? tabActive : tabInactive}`
            }
            aria-label={t('nav.plans', 'Plans')}
          >
            {({ isActive }) => (
              <>
                <Path size={22} weight={isActive ? 'fill' : 'regular'} />
                <span className="truncate w-full text-center">{t('nav.plansTab', 'Plans')}</span>
              </>
            )}
          </NavLink>

          {/* Shop */}
          <NavLink
            to="/shop"
            onClick={haptic}
            className={({ isActive }) =>
              `${tabBase} ${isActive ? tabActive : tabInactive} relative`
            }
            aria-label={t('nav.shop', 'Shop')}
          >
            {({ isActive }) => (
              <>
                <span className="relative">
                  <Crown size={22} weight={isActive ? 'fill' : 'regular'} />
                  {!user ? (
                    <LockBadge />
                  ) : null}
                </span>
                <span className="truncate w-full text-center">{t('nav.shop', 'Shop')}</span>
              </>
            )}
          </NavLink>

          {/* More */}
          <button
            className={`${tabBase} ${sheetOpen ? tabActive : tabInactive}`}
            onClick={() => { haptic(); setSheetOpen(true); }}
            aria-label={t('nav.more', 'More')}
            aria-haspopup="dialog"
            aria-expanded={sheetOpen}
          >
            <span className="relative">
              <List size={22} weight={sheetOpen ? 'fill' : 'regular'} />
              {!user ? <LockBadge /> : showInstallNudge && (
                <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse" aria-hidden="true" />
              )}
            </span>
            <span className="truncate w-full text-center">{t('nav.more', 'More')}</span>
          </button>
        </div>
      </nav>

      {/* ── More slide-up sheet ──────────────────────────────────────────── */}
      {/* Backdrop */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 ${
          sheetOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
        onClick={() => setSheetOpen(false)}
      />

      {/* Sheet panel */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('nav.moreMenu', 'More options')}
        className={`md:hidden fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-amber-300/30 dark:border-amber-700/20 transition-transform duration-300 ease-out ${
          sheetOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          background: 'var(--header-bg)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
        {...sheetSwipe}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        {/* Close button */}
        <button
          className="absolute top-3 right-4 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onClick={() => setSheetOpen(false)}
          aria-label={t('common.close', 'Close')}
        >
          <X size={18} />
        </button>

        <div className="px-4 pb-4 pt-2">
          {/* Visitor sign-up banner — shown at the top when not signed in */}
          {!user && (
            <div className="mb-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-700/40 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 leading-snug">
                  Unlock the full experience
                </p>
                <p className="text-xs text-amber-700/70 dark:text-amber-400/70 mt-0.5">
                  Save progress, track your streak &amp; more.
                </p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => { setSheetOpen(false); navigate('/signup'); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 transition-colors"
                >
                  Sign Up
                </button>
                <button
                  onClick={() => { setSheetOpen(false); navigate('/login'); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Sign In
                </button>
              </div>
            </div>
          )}

          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-1">
            {t('nav.moreMenu', 'More')}
          </p>

          <div className="flex flex-col gap-1">
            <NavLink
              to="/favorites"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                }`
              }
            >
              <Heart size={20} weight="duotone" />
              <span className="flex-1">{t('nav.favorites', 'Favorites')}</span>
              {!user && <LockSimple size={13} weight="fill" className="text-gray-400 dark:text-gray-500" />}
            </NavLink>

            <NavLink
              to="/journal"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                }`
              }
            >
              <BookOpen size={20} weight="duotone" />
              <span className="flex-1">{t('nav.journal', 'Journal')}</span>
              {!user && <LockSimple size={13} weight="fill" className="text-gray-400 dark:text-gray-500" />}
            </NavLink>

            <NavLink
              to="/search"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                }`
              }
            >
              <MagnifyingGlass size={20} weight="duotone" />
              <span className="flex-1">{t('nav.search', 'Search')}</span>
              {!user && <LockSimple size={13} weight="fill" className="text-gray-400 dark:text-gray-500" />}
            </NavLink>

            <NavLink
              to="/prayer"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                }`
              }
            >
              <HandsPraying size={20} weight="duotone" />
              <span className="flex-1">{t('nav.prayer', 'Prayer')}</span>
              {!user && <LockSimple size={13} weight="fill" className="text-gray-400 dark:text-gray-500" />}
            </NavLink>

            {/* Install App — only shown when app is installable and not yet installed */}
            {showInstallNudge && (
              canInstall ? (
                <button
                  onClick={async () => { setSheetOpen(false); await install(); }}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-colors text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 w-full text-left"
                >
                  <DeviceMobile size={20} weight="duotone" />
                  <span className="flex-1">{t('pwa.settings.androidTitle', 'Add to Home Screen')}</span>
                  <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 animate-pulse" aria-hidden="true" />
                </button>
              ) : (
                <NavLink
                  to="/settings"
                  className="flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-colors text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                  onClick={() => setSheetOpen(false)}
                >
                  <DeviceMobile size={20} weight="duotone" />
                  <span className="flex-1">{t('pwa.settings.iosTitle', 'Add to Home Screen')}</span>
                  <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 animate-pulse" aria-hidden="true" />
                </NavLink>
              )
            )}

            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                }`
              }
            >
              <Gear size={20} weight="duotone" />
              {t('nav.settings', 'Settings')}
            </NavLink>

            {!!user && (
              <>
                <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                >
                  <SignOut size={20} />
                  {t('nav.logout', 'Log out')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BottomNav;
