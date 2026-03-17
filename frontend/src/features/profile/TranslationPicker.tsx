import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../contexts/LanguageContext";
import { Card } from "../../components/common/Card";
import api from "../../services/api/api";
import { settingsService } from "../../services/api/settings";
import { showToast } from "../../utils/toast";

interface Translation {
  key: string;
  name: string;
  abbreviation: string;
  requires_premium: boolean;
}

interface TranslationsResponse {
  translations: Translation[];
  user_is_premium: boolean;
  current_version: string;
}

// Settings card for selecting the user's preferred Bible translation.
// Free translations are selectable immediately; premium translations show a lock.
// Selection persists to the backend via PUT /api/settings.
export const TranslationPicker: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [currentVersion, setCurrentVersion] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const langRef = useRef(currentLanguage);

  useEffect(() => {
    langRef.current = currentLanguage;
    let cancelled = false;
    setIsLoading(true);

    api
      .get<TranslationsResponse>(`/api/translations?lang=${encodeURIComponent(currentLanguage)}`)
      .then((res) => {
        if (cancelled) return;
        setTranslations(res.data.translations);
        setIsPremium(res.data.user_is_premium);
        setCurrentVersion(res.data.current_version);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [currentLanguage]);

  const handleSelect = async (key: string) => {
    if (key === currentVersion) return;
    setIsSaving(true);
    try {
      await settingsService.updateSettings({ preferred_bible_version: key });
      setCurrentVersion(key);
      showToast.success(t("settings.translation.saved", "Translation saved"));
    } catch {
      showToast.error(t("settings.translation.saveFailed", "Could not save translation"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <h2 className="text-2xl font mb-4 text-gray-900 dark:text-gray-100 text-center">
        {t("settings.translation.title", "Bible Translation")}
      </h2>
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {t("settings.translation.label", "Preferred Bible Version")}
        </label>

        {isLoading ? (
          <div className="h-9 rounded-md bg-gray-100 dark:bg-gray-700 animate-pulse" />
        ) : (
          <select
            value={currentVersion}
            onChange={(e) => handleSelect(e.target.value)}
            disabled={isSaving}
            className="block w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-60"
          >
            {translations.map((tr) => {
              const locked = tr.requires_premium && !isPremium;
              return (
                <option key={tr.key} value={tr.key} disabled={locked}>
                  {locked ? `🔒 ${tr.abbreviation} — ${tr.name}` : `${tr.abbreviation} — ${tr.name}`}
                </option>
              );
            })}
          </select>
        )}

        {!isLoading && translations.some((tr) => tr.requires_premium) && !isPremium && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {/* Phase 8: wire Modern Translations Pack purchase here */}
            {t(
              "settings.translation.premiumNote",
              "🔒 Locked translations are available with a Words of Praise membership."
            )}
          </p>
        )}
      </div>
    </Card>
  );
};
