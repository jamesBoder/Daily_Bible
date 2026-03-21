import React, { useEffect, useState } from "react";
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
import { CommunitySection } from "../settings/CommunitySection";
import { AboutContent } from "../about/About";

import { settingsService } from "../../services/api/settings";
import type { ThemeId } from "../../contexts/ThemeContext";

type Tab = 'settings' | 'about';

export const Settings: React.FC = () => {
  const { isGuest } = useAuth();
  const { t } = useTranslation();
  const { initTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('settings');
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Tab bar */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
        {(['settings', 'about'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={[
              'px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-colors',
              activeTab === tab
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400 bg-white/30 dark:bg-white/5'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
            ].join(' ')}
          >
            {tab === 'settings' ? t('settings.title', 'Settings') : t('nav.about', 'About')}
          </button>
        ))}
      </div>

      {activeTab === 'about' ? (
        <AboutContent />
      ) : (
        <div className="space-y-6">
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

          {/* Community — authenticated users only (Phase 9) */}
          {!isGuest && (
            <Card>
              <CommunitySection />
            </Card>
          )}

          {/* Account */}
          <Card>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              {t('settings.tabs.account')}
            </h2>
            {isGuest ? <GuestAccountManagement /> : <AccountManagement />}
          </Card>
        </div>
      )}
    </div>
  );
};
