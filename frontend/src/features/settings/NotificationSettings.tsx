import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { settingsService } from '../../services/api/settings';
import { showToast } from '../../utils/toast';
import { SettingsToggle } from '../../components/ui/SettingsToggle';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { Bell } from '@phosphor-icons/react';

interface NotificationSettingsProps {
  /** Pre-loaded values from parent — skips own API call when provided */
  initialEmail?: boolean;
  initialReminder?: boolean;
  initialPushReminderTime?: string;
}

/** Formats a "HH:00" string into a human-readable 12-hour time (e.g. "8:00 AM"). */
function formatHour(hhmm: string): string {
  const hour = parseInt(hhmm.split(':')[0], 10);
  if (isNaN(hour)) return hhmm;
  const period = hour < 12 ? 'AM' : 'PM';
  const display = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${display}:00 ${period}`;
}

/** All valid hour options for the time picker. */
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  value: `${String(i).padStart(2, '0')}:00`,
  label: formatHour(`${String(i).padStart(2, '0')}:00`),
}));

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  initialEmail,
  initialReminder,
  initialPushReminderTime,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [emailNotifications, setEmailNotifications] = useState(initialEmail ?? true);
  const [dailyVerseReminder, setDailyVerseReminder] = useState(initialReminder ?? true);
  const [pushReminderTime, setPushReminderTime] = useState(initialPushReminderTime ?? '08:00');
  const [savingTime, setSavingTime] = useState(false);

  const { isSupported, permission, subscribed, loading, subscribe, unsubscribe } =
    usePushNotifications();

  // Show confirmation toast when user lands here after clicking the unsubscribe link in an email.
  useEffect(() => {
    if (searchParams.get('unsubscribed') === 'true') {
      showToast.success(t('notifications.unsubscribed', 'You have been unsubscribed from daily reminders.'));
      const next = new URLSearchParams(searchParams);
      next.delete('unsubscribed');
      setSearchParams(next, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Only fetch independently when parent didn't provide initial values
  useEffect(() => {
    if (!user || initialEmail !== undefined) return;
    settingsService.getSettings().then(s => {
      setEmailNotifications(s.email_notifications);
      setDailyVerseReminder(s.daily_verse_reminder);
      if (s.push_reminder_time) setPushReminderTime(s.push_reminder_time);
    }).catch(() => {});
  }, [user, initialEmail]);

  const save = async (updates: { email_notifications?: boolean; daily_verse_reminder?: boolean }) => {
    if (!user) return;
    try {
      await settingsService.updateSettings(updates);
    } catch {
      showToast.error(t('settings.saveFailed'));
    }
  };

  const handleEmailToggle = (value: boolean) => {
    setEmailNotifications(value);
    save({ email_notifications: value });
  };

  const handleReminderToggle = (value: boolean) => {
    setDailyVerseReminder(value);
    save({ daily_verse_reminder: value });
  };

  const handlePushToggle = async (value: boolean) => {
    if (value) {
      await subscribe();
    } else {
      await unsubscribe();
    }
  };

  const handleTimeChange = async (value: string) => {
    setPushReminderTime(value);
    setSavingTime(true);
    try {
      await settingsService.updateSettings({ push_reminder_time: value });
      showToast.success(
        t('settings.notifications.pushTimeSaved', 'Reminder time updated to {{time}}', { time: formatHour(value) })
      );
    } catch {
      showToast.error(t('settings.saveFailed'));
    } finally {
      setSavingTime(false);
    }
  };

  // Human-readable status hint below the push toggle
  const pushDescription = (): string => {
    if (!isSupported)
      return t('settings.notifications.pushUnsupported', 'Not supported on this browser. Use Chrome on Android or Safari on iPhone.');
    if (permission === 'denied')
      return t('settings.notifications.pushDenied', 'Notifications are blocked. Allow them in your browser settings, then try again.');
    if (subscribed)
      return t('settings.notifications.pushActiveDesc', "You'll receive a reminder at {{time}}.", { time: formatHour(pushReminderTime) });
    return t('settings.notifications.pushDesc', "Get a daily notification when the verse is ready.");
  };

  return (
    <div>
      <SettingsToggle
        label={t('settings.notifications.emailNotifications')}
        description={t('settings.notifications.emailDescription')}
        checked={emailNotifications}
        onChange={handleEmailToggle}
      />
      <SettingsToggle
        label={t('settings.notifications.dailyReminder')}
        description={t('settings.notifications.reminderDescription')}
        checked={dailyVerseReminder}
        onChange={handleReminderToggle}
      />

      {/* Push notification toggle — authenticated users only */}
      {!!user && (
        <>
          <SettingsToggle
            label={t('settings.notifications.pushNotifications', 'Push Notifications')}
            description={pushDescription()}
            checked={subscribed}
            onChange={handlePushToggle}
            disabled={loading || !isSupported || permission === 'denied'}
          />

          {/* Time picker — only shown when the user is subscribed */}
          {subscribed && (
            <div className="flex items-center gap-3 py-3 pl-1 mt-1">
              <Bell
                size={18}
                weight="duotone"
                className="text-amber-600 dark:text-amber-400 flex-shrink-0"
                aria-hidden
              />
              <label
                htmlFor="push-reminder-time"
                className="flex-1 text-sm text-gray-700 dark:text-gray-300"
              >
                {t('settings.notifications.pushReminderLabel', 'Remind me at')}
              </label>
              <select
                id="push-reminder-time"
                value={pushReminderTime}
                onChange={(e) => handleTimeChange(e.target.value)}
                disabled={savingTime}
                className="text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-60"
                aria-label={t('settings.notifications.pushReminderLabel', 'Remind me at')}
              >
                {HOUR_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </>
      )}
    </div>
  );
};
