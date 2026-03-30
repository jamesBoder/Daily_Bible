import React from "react";

interface TranslationBadgeProps {
  version: string; // abbreviation, e.g. "KJV"
  onClick: () => void;
}

// Small amber pill displayed on the verse card showing the active translation.
// Clicking it opens the TranslationSwitcherPopover.
export const TranslationBadge: React.FC<TranslationBadgeProps> = ({ version, onClick }) => (
  <button
    onClick={onClick}
    aria-label={`Current translation: ${version}. Click to switch.`}
    className="
      inline-flex items-center gap-1
      px-2 py-0.5 rounded-full
      text-[0.6875rem] font-semibold tracking-wide
      bg-amber-50 dark:bg-amber-900/30
      text-amber-700 dark:text-amber-400
      border border-amber-200 dark:border-amber-700/60
      hover:bg-amber-100 dark:hover:bg-amber-900/50
      hover:border-amber-300 dark:hover:border-amber-600
      active:scale-95
      transition-all duration-150
      cursor-pointer
      select-none
    "
  >
    {version}
    <svg
      className="w-2.5 h-2.5 opacity-70"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  </button>
);
