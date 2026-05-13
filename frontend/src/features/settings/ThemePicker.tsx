import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, Check, Sparkle, Sun, Moon } from '@phosphor-icons/react';
import { THEMES, type ThemeId, useTheme } from '../../contexts/ThemeContext';
import { useUnlocks } from '../../hooks/useUnlocks';
import { SoundService } from '../../services/SoundService';
import { showToast } from '../../utils/toast';
import styles from './ThemePicker.module.css';

export const ThemePicker: React.FC = () => {
  const { t } = useTranslation();
  const { activeTheme, setTheme } = useTheme();
  const { unlocks, balance, purchaseTheme, purchaseError, isLoading, isGuest } = useUnlocks();
  const [confirming, setConfirming] = useState<ThemeId | null>(null);
  const [previewTheme, setPreviewTheme] = useState<ThemeId | null>(null);
  const previewRef = useRef<ThemeId | null>(null);

  const getUnlockStatus = (id: ThemeId) =>
    unlocks.find(u => u.theme_id === id);

  // Live preview: temporarily apply theme on hover, revert on leave.
  // Only fires on pointer:fine devices (mouse) — no-op on touch.
  const applyPreview = useCallback((id: ThemeId | null) => {
    const target = id ?? activeTheme;
    const root = document.documentElement;
    root.setAttribute('data-theme', target);
    const def = THEMES.find(t => t.id === target);
    if (def?.isDark) root.classList.add('dark');
    else root.classList.remove('dark');
    previewRef.current = id;
    setPreviewTheme(id);
  }, [activeTheme]);

  // Restore when activeTheme changes (e.g. after purchase) while not hovering
  useEffect(() => {
    if (!previewRef.current) {
      const root = document.documentElement;
      root.setAttribute('data-theme', activeTheme);
      const def = THEMES.find(t => t.id === activeTheme);
      if (def?.isDark) root.classList.add('dark');
      else root.classList.remove('dark');
    }
  }, [activeTheme]);

  const handleMouseEnter = (id: ThemeId, isOwned: boolean) => {
    if (!isOwned || id === activeTheme) return;
    applyPreview(id);
  };

  const handleMouseLeave = () => {
    applyPreview(null);
  };

  const handleThemeClick = async (id: ThemeId) => {
    applyPreview(null);
    const themeDef = THEMES.find(t => t.id === id);
    const isFree = themeDef?.unlockCost === 0;

    if (isGuest) {
      if (isFree) setTheme(id);
      return;
    }

    if (isLoading) return;
    const status = getUnlockStatus(id);

    if (isFree || status?.is_owned) {
      setTheme(id);
      setConfirming(null);
      return;
    }
    if (!status) return;

    if (confirming === id) {
      const success = await purchaseTheme(id);
      if (success) {
        SoundService.play('journal-save');
        setTheme(id);
        showToast.success(`${themeDef?.name ?? 'Theme'} unlocked!`);
      }
      setConfirming(null);
    } else {
      setConfirming(id);
    }
  };

  const confirmingTheme = THEMES.find(t => t.id === confirming);
  const remainingAfterPurchase = confirming
    ? balance - (confirmingTheme?.unlockCost ?? 0)
    : 0;
  const canAfford = remainingAfterPurchase >= 0;

  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>{t('settings.appearance.title')}</h3>

      {isGuest ? (
        <p className={styles.guestNote}>{t('settings.appearance.guestNote')}</p>
      ) : (
        <p className={styles.balance}>
          <Sparkle weight="duotone" size={14} />
          <span>{t('settings.appearance.blessingsAvailable', { count: balance })}</span>
        </p>
      )}

      {purchaseError && <p className={styles.error}>{purchaseError}</p>}

      {isLoading ? (
        <p className={styles.loading}>{t('settings.appearance.loadingThemes')}</p>
      ) : (
        <>
          <div className={styles.swatchRow}>
            {THEMES.map(theme => {
              const status = getUnlockStatus(theme.id);
              const isOwned = status?.is_owned ?? theme.unlockCost === 0;
              const isFreeTheme = theme.unlockCost === 0;
              const isActive = activeTheme === theme.id;
              const isConfirming = confirming === theme.id;
              const isPreviewing = previewTheme === theme.id;

              return (
                <button
                  key={theme.id}
                  className={[
                    styles.swatch,
                    isActive ? styles.active : '',
                    isPreviewing ? styles.previewing : '',
                    !isOwned && !isGuest ? styles.locked : '',
                    isGuest && !isFreeTheme ? styles.guestLocked : '',
                  ].join(' ').trim()}
                  onClick={() => handleThemeClick(theme.id)}
                  onMouseEnter={() => handleMouseEnter(theme.id, isOwned)}
                  onMouseLeave={handleMouseLeave}
                  disabled={isGuest && !isFreeTheme}
                  aria-label={`${theme.name}${
                    isGuest && !isFreeTheme
                      ? ` — ${t('settings.appearance.signInToUnlock')}`
                      : !isOwned
                      ? ` — ${theme.unlockCost} Blessings to unlock`
                      : isActive
                      ? ' (active)'
                      : ''
                  }`}
                >
                  {/* Mini card preview — bg fill, surface card, accent dot */}
                  <span
                    className={styles.preview}
                    style={{
                      background: theme.previewColors.background,
                      borderColor: theme.previewColors.accent,
                    }}
                  >
                    <span
                      className={styles.previewSurface}
                      style={{ background: theme.previewColors.surface }}
                    />
                    <span
                      className={styles.previewAccentDot}
                      style={{ background: theme.previewColors.accent }}
                    />
                  </span>

                  <span className={styles.name}>{theme.name}</span>

                  <span className={[
                    styles.modeBadge,
                    theme.isDark ? styles.darkBadge : styles.lightBadge,
                  ].join(' ')}>
                    {theme.isDark
                      ? <><Moon size={8} weight="fill" /> Dark</>
                      : <><Sun size={8} weight="fill" /> Light</>
                    }
                  </span>

                  <span className={styles.description}>{theme.description}</span>

                  {isActive && (
                    <span className={styles.checkmark}>
                      <Check size={12} weight="bold" />
                    </span>
                  )}

                  {!isOwned && !isConfirming && (
                    <span className={styles.lockBadge}>
                      <Lock size={10} />
                      <span>{isGuest ? t('settings.appearance.signIn') : String(theme.unlockCost)}</span>
                    </span>
                  )}

                  {isConfirming && !isGuest && (
                    <span className={styles.confirmingBadge}>{t('settings.appearance.tapToConfirm')}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Purchase confirmation panel */}
          {confirming && confirmingTheme && (
            <div className={styles.confirmPanel}>
              <span
                className={styles.confirmSwatch}
                style={{
                  background: confirmingTheme.previewColors.background,
                  borderColor: confirmingTheme.previewColors.accent,
                }}
              >
                <span
                  className={styles.confirmSwatchSurface}
                  style={{ background: confirmingTheme.previewColors.surface }}
                />
              </span>

              <div className={styles.confirmBody}>
                <p className={styles.confirmName}>{confirmingTheme.name}</p>
                <p className={styles.confirmCost}>
                  <Sparkle weight="duotone" size={11} />
                  {confirmingTheme.unlockCost} blessings
                  {canAfford
                    ? ` · ${remainingAfterPurchase} remaining`
                    : ` · need ${Math.abs(remainingAfterPurchase)} more`}
                </p>
              </div>

              <div className={styles.confirmActions}>
                <button
                  className={styles.confirmCancel}
                  onClick={() => setConfirming(null)}
                >
                  {t('common.cancel')}
                </button>
                <button
                  className={styles.confirmBtn}
                  onClick={() => handleThemeClick(confirming)}
                  disabled={!canAfford}
                >
                  Unlock
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
