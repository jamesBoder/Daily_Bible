import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../../services/api/api";

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

interface TranslationSwitcherPopoverProps {
  lang: string;
  currentVersion: string;      // abbreviation of currently displayed version
  onVersionSelect: (key: string, abbreviation: string) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
}

// Popover that lists available translations and lets the user switch for this session.
// Premium translations are shown but disabled with a lock icon.
// Selection does NOT update preferred_bible_version in settings — per-session only.
export const TranslationSwitcherPopover: React.FC<TranslationSwitcherPopoverProps> = ({
  lang,
  currentVersion,
  onVersionSelect,
  onClose,
  anchorRef,
}) => {
  const { t } = useTranslation();
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Fetch translations on mount
  useEffect(() => {
    let cancelled = false;
    api
      .get<TranslationsResponse>(`/api/translations?lang=${encodeURIComponent(lang)}`)
      .then((res) => {
        if (cancelled) return;
        setTranslations(res.data.translations);
        setIsPremium(res.data.user_is_premium);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [lang]);

  // Close on outside click or Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const handleClick = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [onClose, anchorRef]);

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label={t("verse.switchTranslation", "Switch Translation")}
      className="
        absolute z-50 mt-1.5
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        rounded-xl shadow-lg
        py-1.5 min-w-[200px] max-w-[260px]
        animate-fade-in
      "
      style={{ top: "100%", left: "50%", transform: "translateX(-50%)" }}
    >
      {/* Header */}
      <div className="px-3 pb-1.5 border-b border-gray-100 dark:border-gray-700 mb-1">
        <p className="text-[0.625rem] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          {t("verse.switchTranslation", "Switch Translation")}
        </p>
        <p className="text-[0.625rem] text-gray-400 dark:text-gray-500 mt-0.5">
          {t("verse.sessionOnly", "Session only — won't change your settings")}
        </p>
      </div>

      {isLoading ? (
        <div className="px-3 py-2 text-xs text-gray-400">{t("common.loading", "Loading…")}</div>
      ) : (
        <ul role="listbox" aria-label="Available translations">
          {translations.map((tr) => {
            const isActive = tr.abbreviation.toLowerCase() === currentVersion.toLowerCase()
              || tr.key === currentVersion.toLowerCase();
            const isLocked = tr.requires_premium && !isPremium;

            return (
              <li key={tr.key} role="option" aria-selected={isActive} aria-disabled={isLocked}>
                <button
                  disabled={isLocked}
                  onClick={() => {
                    if (!isLocked) {
                      onVersionSelect(tr.key, tr.abbreviation);
                      onClose();
                    }
                  }}
                  className={`
                    w-full text-left px-3 py-2 flex items-center justify-between gap-2
                    text-sm transition-colors duration-100
                    ${isLocked
                      ? "opacity-50 cursor-not-allowed text-gray-400 dark:text-gray-500"
                      : isActive
                        ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-semibold"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                    }
                  `}
                  title={isLocked ? t("verse.premiumTranslation", "Available with a Words of Praise membership") : undefined}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-xs font-bold shrink-0 w-12">{tr.abbreviation}</span>
                    <span className="truncate text-xs opacity-75">{tr.name}</span>
                  </span>
                  <span className="shrink-0 flex items-center gap-1">
                    {isActive && !isLocked && (
                      <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    )}
                    {isLocked && (
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
