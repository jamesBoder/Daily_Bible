import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card } from "../../components/common/Card";
import { Profile } from "./Profile";
import { AccountManagement } from "./AccountManagement";
import { GuestAccountManagement } from "./GuestAccountManagement";
import { TranslationPicker } from "./TranslationPicker";
import { GraceDaySettings } from "../settings/GraceDaySettings";
import { NotificationSettings } from "../settings/NotificationSettings";
import { LanguageSettings } from "../settings/LanguageSettings";
import { AppearanceSettings } from "../settings/AppearanceSettings";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../contexts/ThemeContext";

import { settingsService } from "../../services/api/settings";
import type { ThemeId } from "../../contexts/ThemeContext";

export const Settings: React.FC = () => {
  const { isGuest } = useAuth();
  const { t } = useTranslation();
  const { initTheme } = useTheme();
  const [notifEmail, setNotifEmail] = useState<boolean | undefined>(undefined);
  const [notifReminder, setNotifReminder] = useState<boolean | undefined>(undefined);

  // Single settings load: syncs theme silently + passes notification values down
  useEffect(() => {
    if (isGuest) return;
    settingsService.getSettings().then(s => {
      if (s.active_theme) initTheme(s.active_theme as ThemeId);
      setNotifEmail(s.email_notifications);
      setNotifReminder(s.daily_verse_reminder);
    }).catch(() => {});
  }, [isGuest, initTheme]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-display font-bold text-primary-600 dark:text-primary-400 transition-all duration-300 hover:brightness-125 hover:drop-shadow-[0_0_8px_rgba(79,70,229,0.3)] dark:hover:drop-shadow-[0_0_8px_rgba(129,140,248,0.3)] cursor-default">
        {t('settings.title')}
      </h1>

      {/* My Journey — authenticated users only */}
      {!isGuest && (
        <Card>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            {t('settings.sections.myJourney', 'My Journey')}
          </h2>
          <Profile />
          <GraceDaySettings />
        </Card>
      )}

      {/* Devotion & Notifications */}
      <Card>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          {t('settings.sections.devotion', 'Devotion & Notifications')}
        </h2>
        <NotificationSettings initialEmail={notifEmail} initialReminder={notifReminder} />
        <div className="mt-2">
          <LanguageSettings />
        </div>
        {!isGuest && (
          <div className="mt-2">
            <TranslationPicker />
          </div>
        )}
      </Card>

      {/* Appearance */}
      <Card>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          {t('settings.sections.appearance', 'Appearance')}
        </h2>
        <AppearanceSettings />
      </Card>

      {/* Account */}
      <Card>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          {t('settings.tabs.account')}
        </h2>
        {isGuest ? <GuestAccountManagement /> : <AccountManagement />}
        <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
          <NavLink
            to="/about"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            {t('nav.about')}
          </NavLink>
        </div>
      </Card>
    </div>
  );
};
