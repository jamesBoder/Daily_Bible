import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, Check, Sparkle } from '@phosphor-icons/react';
import { THEMES, type ThemeId, useTheme } from '../../contexts/ThemeContext';
import { useUnlocks } from '../../hooks/useUnlocks';
import styles from './ThemePicker.module.css';

export const ThemePicker: React.FC = () => {
  const { t } = useTranslation();
  const { activeTheme, setTheme } = useTheme();
  const { unlocks, balance, purchaseTheme, purchaseError, isLoading, isGuest } = useUnlocks();
  const [confirming, setConfirming] = useState<ThemeId | null>(null);

  const getUnlockStatus = (id: ThemeId) =>
    unlocks.find(u => u.theme_id === id);

  const handleThemeClick = async (id: ThemeId) => {
    if (isGuest) return; // guests can't purchase; free themes still selectable below
    const status = getUnlockStatus(id);
    if (!status || status.is_owned) {
      setTheme(id);
      setConfirming(null);
      return;
    }
    if (confirming === id) {
      const success = await purchaseTheme(id);
      if (success) {
        setTheme(id);
      }
      setConfirming(null);
    } else {
      setConfirming(id);
    }
  };

  const handleFreeThemeClick = (id: ThemeId) => {
    setTheme(id);
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>{t('settings.appearance.title')}</h3>
      {isGuest ? (
        <p className={styles.guestNote}>{t('settings.appearance.guestNote')}</p>
      ) : (
        <p className={styles.balance}>
          <Sparkle weight="duotone" size={14} />
          <span>{t('settings.appearance.blessingsAvailable', { count: balance.toLocaleString() })}</span>
        </p>
      )}
      {purchaseError && <p className={styles.error}>{purchaseError}</p>}
      {isLoading ? (
        <p className={styles.loading}>{t('settings.appearance.loadingThemes')}</p>
      ) : (
        <div className={styles.grid}>
          {THEMES.map(theme => {
            const status = getUnlockStatus(theme.id);
            const isOwned = status?.is_owned ?? theme.unlockCost === 0;
            const isFreeTheme = theme.unlockCost === 0;
            const isActive = activeTheme === theme.id;
            const isConfirming = confirming === theme.id;

            return (
              <button
                key={theme.id}
                className={[
                  styles.swatch,
                  isActive ? styles.active : '',
                  !isOwned && !isGuest ? styles.locked : '',
                  isGuest && !isFreeTheme ? styles.guestLocked : '',
                ].join(' ')}
                onClick={() => isFreeTheme || isOwned ? handleFreeThemeClick(theme.id) : handleThemeClick(theme.id)}
                disabled={isGuest && !isFreeTheme}
                aria-label={`${theme.name}${isGuest && !isFreeTheme ? ` — ${t('settings.appearance.signInToUnlock')}` : !isOwned ? ` — ${theme.unlockCost} Blessings to unlock` : ''}`}
                title={theme.description}
              >
                <span
                  className={styles.preview}
                  style={{
                    background: theme.previewColors.background,
                    borderColor: theme.previewColors.accent,
                  }}
                >
                  <span
                    className={styles.previewAccent}
                    style={{ background: theme.previewColors.accent }}
                  />
                </span>

                <span className={styles.name}>{theme.name}</span>

                {isActive && (
                  <span className={styles.checkmark}>
                    <Check size={14} weight="bold" />
                  </span>
                )}
                {!isOwned && !isConfirming && (
                  <span className={styles.lockBadge}>
                    <Lock size={11} />
                    <span>{isGuest ? t('settings.appearance.signIn') : String(theme.unlockCost)}</span>
                  </span>
                )}
                {isConfirming && !isGuest && (
                  <span className={styles.confirmBadge}>{t('settings.appearance.tapToConfirm')}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
