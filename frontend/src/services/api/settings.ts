import apiClient from './client';
import { STORAGE_KEYS } from '../../utils/constants';

export interface UserSettings {
  id: number;
  user_id: number;
  preferred_language: string;
  preferred_bible_version: string;
  email_notifications: boolean;
  daily_verse_reminder: boolean;
  dark_mode: boolean;
  active_theme: string;
  push_reminder_time: string; // "HH:00" in user's preferred timezone, e.g. "08:00"
  created_at: string;
  updated_at: string;
}

export interface UpdateSettingsRequest {
  preferred_language?: string;
  preferred_bible_version?: string;
  email_notifications?: boolean;
  daily_verse_reminder?: boolean;
  active_theme?: string;
  push_reminder_time?: string;
}

class SettingsService {
  async getSettings(): Promise<UserSettings> {
    // Check if user is authenticated (has token)
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) {
      throw new Error('Not authenticated');
    }
    const response = await apiClient.get<UserSettings>('/api/settings');
    return response.data;
  }

  async updateSettings(settings: UpdateSettingsRequest): Promise<UserSettings> {
    // Check if user is authenticated (has token)
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) {
      throw new Error('Not authenticated');
    }
    const response = await apiClient.put<{ message: string; settings: UserSettings }>(
      '/api/settings',
      settings
    );
    return response.data.settings;
  }

  async getLanguage(): Promise<string> {
    // Check if user is authenticated (has token)
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) {
      throw new Error('Not authenticated');
    }
    const response = await apiClient.get<{ language: string }>('/api/settings/language');
    return response.data.language;
  }

  async updateLanguage(language: string): Promise<void> {
    // Check if user is authenticated (has token)
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) {
      throw new Error('Not authenticated');
    }
    await apiClient.put('/api/settings/language', { language });
  }
}

export const settingsService = new SettingsService();
