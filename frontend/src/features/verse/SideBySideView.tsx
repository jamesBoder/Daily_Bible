import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../../services/api/api";

interface Translation {
  key: string;
  abbreviation: string;
  name: string;
  requires_premium: boolean;
}

interface TranslationColumn {
  abbreviation: string;
  name: string;
  text: string | null;
  error: boolean;
}

interface SideBySideViewProps {
  reference: string;    // e.g. "John 3:16"
  lang: string;         // app language code
  onClose: () => void;
}

// Module-level cache so re-opening the panel for the same verse+lang is instant.
const translationCache = new Map<string, TranslationColumn[]>();

// Premium-only inline comparison panel rendered below the verse card.
// Fetches the same verse in up to 3 free translations simultaneously and displays
// them side by side. Mobile: horizontal scroll. Hidden entirely for free users.
export const SideBySideView: React.FC<SideBySideViewProps> = ({ reference, lang, onClose }) => {
  const { t } = useTranslation();
  const cacheKey = `${reference}::${lang}`;
  const cached = translationCache.get(cacheKey);
  const [columns, setColumns] = useState<TranslationColumn[]>(cached ?? []);
  const [isLoading, setIsLoading] = useState(!cached);

  useEffect(() => {
    if (translationCache.has(cacheKey)) return;

    let cancelled = false;

    const fetchAll = async () => {
      // Fetch available translations for the language
      let freeVersions: Translation[] = [];
      try {
        const res = await api.get<{ translations: Translation[] }>(
          `/api/translations?lang=${encodeURIComponent(lang)}`
        );
        freeVersions = res.data.translations.filter((t) => !t.requires_premium).slice(0, 3);
      } catch {
        if (!cancelled) setIsLoading(false);
        return;
      }

      if (freeVersions.length === 0) {
        if (!cancelled) setIsLoading(false);
        return;
      }

      // Fetch all versions in parallel
      const results = await Promise.allSettled(
        freeVersions.map((v) =>
          api
            .get<{ verse: { text: string } }>(`/api/verses/${encodeURIComponent(reference)}?version=${v.key}&lang=${lang}`)
            .then((r) => r.data.verse.text)
        )
      );

      if (cancelled) return;

      const resolved = freeVersions.map((v, i) => ({
        abbreviation: v.abbreviation,
        name: v.name,
        text: results[i].status === "fulfilled" ? (results[i] as PromiseFulfilledResult<string>).value : null,
        error: results[i].status === "rejected",
      }));
      translationCache.set(cacheKey, resolved);
      setColumns(resolved);
      setIsLoading(false);
    };

    fetchAll();
    return () => { cancelled = true; };
  }, [cacheKey, reference, lang]);

  return (
    <div
      className="
        mt-4 rounded-2xl border border-[var(--theme-border)]
        bg-[var(--theme-surface)] shadow-sm
        animate-fade-in overflow-hidden
      "
      role="region"
      aria-label={t("verse.compareTranslations", "Compare Translations")}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--theme-border)]">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--journal-text-muted)]">
          {t("verse.compareTranslations", "Compare Translations")}
        </p>
        <button
          onClick={onClose}
          aria-label={t("common.close", "Close")}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Columns */}
      {isLoading ? (
        <div className="flex gap-4 p-4 overflow-x-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-48 space-y-2">
              <div className="skeleton-shimmer h-4 w-12 rounded" />
              <div className="skeleton-shimmer h-3 w-32 rounded" />
              <div className="skeleton-shimmer h-3 w-full rounded" />
              <div className="skeleton-shimmer h-3 w-4/5 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-0 overflow-x-auto">
          {columns.map((col, idx) => (
            <div
              key={col.abbreviation}
              className={`
                flex-shrink-0 w-56 sm:w-64 p-4
                ${idx < columns.length - 1 ? "border-r border-[var(--theme-border)]" : ""}
              `}
            >
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-0.5">
                {col.abbreviation}
              </p>
              <p className="text-[0.625rem] text-[var(--journal-text-muted)] mb-2 truncate">
                {col.name}
              </p>
              {col.error ? (
                <p className="text-xs text-red-500 italic">
                  {t("verse.translationUnavailable", "Translation unavailable")}
                </p>
              ) : (
                <p className="text-sm text-[var(--foreground)] leading-relaxed font-serif">
                  {col.text}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reference footer */}
      <div className="px-4 py-2.5 border-t border-[var(--theme-border)] text-center">
        <p className="text-xs text-[var(--journal-text-muted)] font-medium">{reference}</p>
      </div>
    </div>
  );
};
