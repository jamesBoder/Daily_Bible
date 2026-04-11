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
import { MannaSettings } from "../settings/MannaSettings";
import { AboutContent } from "../about/About";
import { TutorialsSection } from "../settings/TutorialsSection";
import InstallAppSection from "../settings/InstallAppSection";

import { settingsService } from "../../services/api/settings";
import type { ThemeId } from "../../contexts/ThemeContext";

type Tab = 'settings' | 'about';

type SectionId = 'journey' | 'devotion' | 'appearance' | 'manna' | 'community' | 'install' | 'help' | 'feedback' | 'account';

const scrollToSection = (id: SectionId) => {
  document.getElementById(`settings-section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export const Settings: React.FC = () => {
  const { isGuest } = useAuth();
  const { t } = useTranslation();
  const { initTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('settings');
  const [notifEmail, setNotifEmail] = useState<boolean | undefined>(undefined);
  const [notifReminder, setNotifReminder] = useState<boolean | undefined>(undefined);
  const [pushReminderTime, setPushReminderTime] = useState<string | undefined>(undefined);

  // Single settings load: syncs theme silently + passes notification values down
  useEffect(() => {
    if (isGuest) return;
    settingsService.getSettings().then(s => {
      if (s.active_theme) initTheme(s.active_theme as ThemeId);
      setNotifEmail(s.email_notifications);
      setNotifReminder(s.daily_verse_reminder);
      setPushReminderTime(s.push_reminder_time ?? '08:00');
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
        <>
          {/* Section quick-jump nav */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
            {(!isGuest) && (
              <button onClick={() => scrollToSection('journey')} className="shrink-0 px-3 py-1.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-primary-900/40 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
                {t('settings.sections.myJourney', 'My Journey')}
              </button>
            )}
            <button onClick={() => scrollToSection('devotion')} className="shrink-0 px-3 py-1.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-primary-900/40 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
              {t('settings.sections.devotion', 'Devotion')}
            </button>
            <button onClick={() => scrollToSection('appearance')} className="shrink-0 px-3 py-1.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-primary-900/40 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
              {t('settings.sections.appearance', 'Appearance')}
            </button>
            {!isGuest && (
              <button onClick={() => scrollToSection('manna')} className="shrink-0 px-3 py-1.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-primary-900/40 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
                {t('settings.sections.manna', 'Manna')}
              </button>
            )}
            {!isGuest && (
              <button onClick={() => scrollToSection('community')} className="shrink-0 px-3 py-1.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-primary-900/40 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
                {t('nav.community', 'Community')}
              </button>
            )}
            <button onClick={() => scrollToSection('install')} className="shrink-0 px-3 py-1.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-primary-900/40 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
              {t('pwa.settings.sectionTitle', 'Install App')}
            </button>
            <button onClick={() => scrollToSection('help')} className="shrink-0 px-3 py-1.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-primary-900/40 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
              {t('settings.sections.help', 'Help')}
            </button>
            <button onClick={() => scrollToSection('feedback')} className="shrink-0 px-3 py-1.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-primary-900/40 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
              {t('settings.sections.feedback', 'Feedback')}
            </button>
            <button onClick={() => scrollToSection('account')} className="shrink-0 px-3 py-1.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-primary-900/40 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
              {t('settings.tabs.account', 'Account')}
            </button>
          </div>

          <div className="space-y-6">
            {/* My Journey — authenticated users only */}
            {!isGuest && (
              <Card id="settings-section-journey">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  {t('settings.sections.myJourney', 'My Journey')}
                </h2>
                <Profile />
                <GraceDaySettings />
              </Card>
            )}

            {/* Devotion & Notifications */}
            <Card id="settings-section-devotion">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                {t('settings.sections.devotion', 'Devotion & Notifications')}
              </h2>
              <NotificationSettings initialEmail={notifEmail} initialReminder={notifReminder} initialPushReminderTime={pushReminderTime} />
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
            <Card id="settings-section-appearance">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                {t('settings.sections.appearance', 'Appearance')}
              </h2>
              <AppearanceSettings />
            </Card>

            {/* Manna — authenticated users only (Phase 10) */}
            {!isGuest && (
              <Card id="settings-section-manna">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  {t('settings.sections.manna', 'Manna Puzzle')}
                </h2>
                <MannaSettings />
              </Card>
            )}

            {/* Community — authenticated users only (Phase 9) */}
            {!isGuest && (
              <Card id="settings-section-community">
                <CommunitySection />
              </Card>
            )}

            {/* Install App */}
            <Card id="settings-section-install">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                {t('pwa.settings.sectionTitle', 'Install App')}
              </h2>
              <InstallAppSection />
            </Card>

            {/* Help & Tutorials */}
            <Card id="settings-section-help">
              <h2 className="text-xl font-semibold mb-1 text-gray-900 dark:text-gray-100">
                {t('settings.sections.help', 'Help & Tutorials')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {t('settings.sections.helpDesc', 'Tap any feature to view its guide again.')}
              </p>
              <TutorialsSection />
            </Card>

            {/* Feedback & Contact */}
            <Card id="settings-section-feedback">
              <h2 className="text-xl font-semibold mb-1 text-gray-900 dark:text-gray-100">
                {t('settings.sections.feedback', 'Feedback & Contact')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {t('settings.sections.feedbackDesc', 'Found a bug or have a suggestion? We would love to hear from you.')}
              </p>
              <a
                href="mailto:wordsofpraiseapp@gmail.com?subject=Words%20of%20Praise%20-%20Feedback"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700 text-primary-700 dark:text-primary-300 font-medium text-sm hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                  <path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48Zm-96,85.15L52.57,64H203.43ZM98.71,128,40,181.81V74.19Zm11.84,10.85,12,11.05a8,8,0,0,0,10.82,0l12-11.05,58,53.15H52.57ZM157.29,128,216,74.19V181.81Z"/>
                </svg>
                wordsofpraiseapp@gmail.com
              </a>
            </Card>

            {/* Account */}
            <Card id="settings-section-account">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                {t('settings.tabs.account')}
              </h2>
              {isGuest ? <GuestAccountManagement /> : <AccountManagement />}
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
