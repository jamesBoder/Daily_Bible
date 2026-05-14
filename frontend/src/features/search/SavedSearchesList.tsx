import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FloppyDisk, Trash, MagnifyingGlass } from '@phosphor-icons/react';
import searchExtendedApi, { type SavedSearch } from '../../services/api/search_extended';

interface SavedSearchesListProps {
  currentQuery: string;
  onSelectSearch: (query: string) => void;
}

const SavedSearchesList: React.FC<SavedSearchesListProps> = ({ currentQuery, onSelectSearch }) => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saveName, setSaveName] = useState('');

  const { data: searches = [] } = useQuery({
    queryKey: ['saved-searches'],
    queryFn: searchExtendedApi.getSavedSearches,
    staleTime: 1000 * 60 * 5,
  });

  const saveMutation = useMutation({
    mutationFn: () => searchExtendedApi.saveSearch(currentQuery, saveName),
    onSuccess: () => {
      if (navigator.vibrate) navigator.vibrate(8);
      qc.invalidateQueries({ queryKey: ['saved-searches'] });
      setShowSaveForm(false);
      setSaveName('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => searchExtendedApi.deleteSavedSearch(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['saved-searches'] }),
  });

  const alreadySaved = searches.some(s => s.query.toLowerCase().trim() === currentQuery.toLowerCase().trim());

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--journal-text-muted)]">
          {t('search.savedSearches', 'Saved Searches')}
        </span>
        {currentQuery && !alreadySaved && (
          <button
            onClick={() => setShowSaveForm(!showSaveForm)}
            className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:opacity-75 transition-opacity"
          >
            <FloppyDisk size={13} />
            {t('search.saveThisSearch', 'Save this search')}
          </button>
        )}
      </div>

      {/* Save form */}
      {showSaveForm && (
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={saveName}
            onChange={e => setSaveName(e.target.value)}
            placeholder={t('search.searchName', 'Name (optional)')}
            className="flex-1 px-3 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-[var(--journal-surface)] text-[var(--foreground)] border-[var(--theme-border)] border"
          />
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-60"
            style={{ background: 'var(--blessing-gold)' }}
          >
            {saveMutation.isPending ? '…' : t('search.saved', 'Save')}
          </button>
        </div>
      )}

      {/* Search chips */}
      {searches.length === 0 ? (
        <p className="text-xs text-[var(--journal-text-muted)] py-1">
          {t('search.noSavedSearches', 'No saved searches yet.')}
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {searches.map((s: SavedSearch) => (
            <div
              key={s.id}
              className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full border border-amber-200/60 dark:border-amber-800/40 text-xs"
              style={{ background: 'var(--card-bg)' }}
            >
              <button
                onClick={() => { onSelectSearch(s.query); }}
                className="flex items-center gap-1 text-[var(--foreground)] hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                <MagnifyingGlass size={11} />
                {s.name}
              </button>
              <button
                onClick={() => deleteMutation.mutate(s.id)}
                className="ml-0.5 text-gray-300 dark:text-gray-600 hover:text-red-400 transition-colors"
              >
                <Trash size={11} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedSearchesList;
