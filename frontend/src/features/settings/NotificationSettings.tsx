import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { settingsService } from '../../services/api/settings';
import { showToast } from '../../utils/toast';
import { SettingsToggle } from '../../components/ui/SettingsToggle';

interface NotificationSettingsProps {
  /** Pre-loaded values from parent — skips own API call when provided */
  initialEmail?: boolean;
  initialReminder?: boolean;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  initialEmail,
  initialReminder,
}) => {
  const { t } = useTranslation();
  const { isGuest } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(initialEmail ?? true);
  const [dailyVerseReminder, setDailyVerseReminder] = useState(initialReminder ?? true);

  // Only fetch independently when parent didn't provide initial values
  useEffect(() => {
    if (isGuest || initialEmail !== undefined) return;
    settingsService.getSettings().then(s => {
      setEmailNotifications(s.email_notifications);
      setDailyVerseReminder(s.daily_verse_reminder);
    }).catch(() => {});
  }, [isGuest, initialEmail]);

  const save = async (updates: { email_notifications?: boolean; daily_verse_reminder?: boolean }) => {
    if (isGuest) return;
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
    </div>
  );
};
