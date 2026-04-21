import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Binoculars, CaretDown, CaretUp } from '@phosphor-icons/react';

interface DeepDiveProps {
  deepDiveText: string;
  deepDiveRefsJson: string;
}

const DeepDive: React.FC<DeepDiveProps> = ({ deepDiveText, deepDiveRefsJson }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  let refs: string[] = [];
  try { refs = JSON.parse(deepDiveRefsJson); } catch { /* ignore */ }

  return (
    <div
      className="rounded-2xl mb-5 overflow-hidden border"
      style={{
        borderColor: 'color-mix(in srgb, #818cf8 25%, transparent)',
        background: 'color-mix(in srgb, #818cf8 5%, transparent)',
      }}
    >
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left hover:opacity-75 transition-opacity"
      >
        <Binoculars size={14} weight="bold" className="text-indigo-400 dark:text-indigo-300 flex-shrink-0" />
        <span className="text-xs font-semibold uppercase tracking-wide text-indigo-500 dark:text-indigo-300 flex-1">
          {t('plan.digDeeper', 'Dig deeper')}
        </span>
        {expanded
          ? <CaretUp size={12} className="text-indigo-400 dark:text-indigo-300 flex-shrink-0" />
          : <CaretDown size={12} className="text-indigo-400 dark:text-indigo-300 flex-shrink-0" />
        }
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4 whitespace-pre-line">
            {deepDiveText}
          </p>

          {refs.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-400 dark:text-indigo-300 mb-2">
                {t('plan.digDeeperStudy', 'Further study')}
              </p>
              <div className="flex flex-wrap gap-2">
                {refs.map(ref => (
                  <span
                    key={ref}
                    className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: 'color-mix(in srgb, #818cf8 12%, transparent)',
                      color: '#818cf8',
                    }}
                  >
                    {ref}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DeepDive;
