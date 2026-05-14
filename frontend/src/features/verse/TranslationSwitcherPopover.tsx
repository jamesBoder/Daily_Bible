import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import api from "../../services/api/api";
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

interface TranslationSwitcherPopoverProps {
  lang: string;
  currentVersion: string;
  onVersionSelect: (key: string, abbreviation: string) => void;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLElement | null>;
}

export const TranslationSwitcherPopover: React.FC<TranslationSwitcherPopoverProps> = ({
  lang,
  currentVersion,
  onVersionSelect,
  onClose,
}) => {
  const { t } = useTranslation();
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLLIElement>(null);

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

  // Scroll active translation into view once list is rendered
  useEffect(() => {
    if (!isLoading && activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ block: "center" });
    }
  }, [isLoading]);

  // Keyboard handler: Escape closes, Tab traps focus — reruns when list loads so
  // new focusable elements are captured, but does NOT re-fire initial focus.
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "Tab") {
        const focusable = panel.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
        }
      }
    };

    panel.addEventListener("keydown", onKeyDown);
    return () => panel.removeEventListener("keydown", onKeyDown);
  }, [isLoading, onClose]);

  // Initial focus — runs once on mount only
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const first = panel.querySelector<HTMLElement>(
      'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    first?.focus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={t("verse.switchTranslation", "Switch Translation")}
    >
      <div
        ref={panelRef}
        className="relative w-full max-w-md bg-[var(--theme-surface)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85dvh]"
      >
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-primary-400 via-primary-600 to-primary-400 flex-shrink-0" />

        {/* Header */}
        <div className="px-5 pt-4 pb-4 border-b border-[var(--theme-border)] flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[var(--foreground)] font-display leading-tight">
                {t("verse.switchTranslation", "Switch Translation")}
              </h2>
              <p className="text-xs text-[var(--journal-text-muted)] mt-0.5">
                {t("verse.sessionOnly", "Session only — won't change your settings")}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label={t("common.close", "Close")}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-[var(--foreground)] opacity-40 hover:opacity-80 hover:bg-[var(--theme-surface)] transition-all focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable translation list */}
        <div className="overflow-y-auto flex-1 py-2">
          {isLoading ? (
            <div className="px-5 py-6 text-sm text-[var(--journal-text-muted)] text-center">
              {t("common.loading", "Loading…")}
            </div>
          ) : translations.length === 0 ? (
            <div className="px-5 py-6 text-sm text-[var(--journal-text-muted)] text-center">
              {t("verse.translationUnavailable", "Translation unavailable")}
            </div>
          ) : (
            <ul role="listbox" aria-label="Available translations">
              {translations.map((tr) => {
                const isActive =
                  tr.abbreviation.toLowerCase() === currentVersion.toLowerCase() ||
                  tr.key === currentVersion.toLowerCase();
                const isLocked = tr.requires_premium && !isPremium;

                return (
                  <li
                    key={tr.key}
                    ref={isActive ? activeItemRef : undefined}
                    role="option"
                    aria-selected={isActive}
                    aria-disabled={isLocked}
                  >
                    <button
                      onClick={() => {
                        if (isLocked) {
                          showToast.info(
                            t("verse.premiumTranslation", "Available with a Words of Praise membership")
                          );
                          return;
                        }
                        onVersionSelect(tr.key, tr.abbreviation);
                        onClose();
                      }}
                      className={`
                        w-full text-left px-5 py-3.5 flex items-center justify-between gap-3
                        transition-colors duration-100
                        ${
                          isLocked
                            ? "opacity-50 cursor-not-allowed text-[var(--journal-text-muted)]"
                            : isActive
                            ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                            : "text-[var(--foreground)] hover:bg-[var(--theme-surface)] cursor-pointer active:bg-[var(--theme-surface)]"
                        }
                      `}
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <span
                          className={`font-mono text-sm font-bold shrink-0 w-14 ${
                            isActive ? "text-amber-600 dark:text-amber-400" : ""
                          }`}
                        >
                          {tr.abbreviation}
                        </span>
                        <span className="text-sm truncate opacity-80">{tr.name}</span>
                      </span>
                      <span className="shrink-0 flex items-center gap-1">
                        {isActive && !isLocked && (
                          <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                        )}
                        {isLocked && (
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
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

        {/* Footer — premium upsell when there are locked translations */}
        {!isPremium && translations.some((tr) => tr.requires_premium) && (
          <div className="px-5 py-3 border-t border-[var(--theme-border)] bg-[var(--theme-surface)] flex-shrink-0">
            <p className="text-xs text-[var(--journal-text-muted)] text-center">
              <svg
                className="w-3 h-3 inline-block mr-1 opacity-70"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              {t("verse.premiumTranslationHint", "Locked translations are available with Words of Praise Premium")}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};
