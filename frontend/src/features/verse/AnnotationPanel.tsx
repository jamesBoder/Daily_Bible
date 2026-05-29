import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Pencil } from '@phosphor-icons/react';
import annotationsApi, { type VerseAnnotation } from '../../services/api/annotations';
import AnnotationEditor from './AnnotationEditor';
import { useStreak } from '../../contexts/StreakContext';
import { usePricingModal } from '../../hooks/usePricingModal';
import { useSwipe } from '../../hooks/useSwipe';
import { showToast } from '../../utils/toast';

interface AnnotationPanelProps {
  verseReference: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Bottom sheet (mobile) / right sidebar (desktop) for verse annotations.
 * - Shows existing annotations for the verse
 * - Allows creating new annotations
 * - Non-premium users are prompted to upgrade
 */
const AnnotationPanel: React.FC<AnnotationPanelProps> = ({ verseReference, isOpen, onClose }) => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { subscription } = useStreak();
  const { openModal } = usePricingModal();
  const isPremium = subscription?.is_premium ?? false;
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newPhrase, setNewPhrase] = useState('');
  const [newNote, setNewNote] = useState('');

  const swipe = useSwipe({ onSwipeDown: onClose });

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const { data: annotations = [] } = useQuery({
    queryKey: ['annotations-verse', verseReference],
    queryFn: () => annotationsApi.getForVerse(verseReference),
    enabled: isOpen && isPremium,
    staleTime: 1000 * 60 * 5,
  });

  const createMutation = useMutation({
    mutationFn: () => annotationsApi.create(verseReference, newPhrase, newNote),
    onSuccess: () => {
      if (navigator.vibrate) navigator.vibrate(8);
      qc.invalidateQueries({ queryKey: ['annotations-verse', verseReference] });
      setNewPhrase('');
      setNewNote('');
    },
    onError: () => {
      showToast.error(t('annotation.saveError', 'Could not save annotation. Please try again.'));
    },
  });

  if (!isOpen) return null;

  if (!isPremium) {
    const upsellContent = (
      <>
        <p className="text-sm text-[var(--foreground)] opacity-75 mb-4">
          {t('annotation.premiumRequired', 'Annotations are available with a Words of Praise subscription.')}
        </p>
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); openModal(); }}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'var(--blessing-gold)' }}
        >
          {t('common.learnMore', 'Learn More')}
        </button>
      </>
    );
    return (
      <>
        {/* Backdrop */}
        <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} aria-hidden="true" />

        {/* Mobile bottom sheet */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('annotation.premiumRequired', 'Annotations are available with a Words of Praise subscription.')}
          className="md:hidden fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-amber-300/30 dark:border-amber-700/20 px-4 pt-4"
          style={{ background: 'var(--header-bg)', paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
          {...swipe}
        >
          <div className="flex justify-center mb-3">
            <div className="w-10 h-1 rounded-full bg-[var(--theme-border)]" />
          </div>
          {upsellContent}
        </div>

        {/* Desktop sidebar */}
        <aside
          role="dialog"
          aria-modal="true"
          aria-label={t('annotation.premiumRequired', 'Annotations are available with a Words of Praise subscription.')}
          className="hidden md:flex flex-col fixed right-0 top-0 bottom-0 w-80 z-50 border-l border-amber-200/60 dark:border-amber-800/40"
          style={{ background: 'var(--header-bg)' }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-amber-200/40 dark:border-amber-800/30">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">
              {t('annotation.panelTitle', 'Your Notes on {{reference}}', { reference: verseReference })}
            </h2>
            <button onClick={onClose} className="p-1.5 rounded-full text-[var(--foreground)] opacity-40 hover:opacity-90 transition-opacity">
              <X size={16} />
            </button>
          </div>
          <div className="p-4">
            {upsellContent}
          </div>
        </aside>
      </>
    );
  }

  return (
    <>
      {/* Backdrop — mobile and desktop */}
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} aria-hidden="true" />

      {/* Mobile bottom sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('annotation.panelTitle', 'Your Notes on {{reference}}', { reference: verseReference })}
        className="md:hidden fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-amber-300/30 dark:border-amber-700/20 overflow-y-auto max-h-[70vh]"
        style={{ background: 'var(--header-bg)', paddingBottom: 'env(safe-area-inset-bottom)' }}
        {...swipe}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 sticky top-0" style={{ background: 'var(--header-bg)' }}>
          <div className="w-10 h-1 rounded-full bg-[var(--theme-border)]" />
        </div>

        <div className="flex items-center justify-between px-4 py-2">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">
            {t('annotation.panelTitle', 'Your Notes on {{reference}}', { reference: verseReference })}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-full text-[var(--foreground)] opacity-40 hover:opacity-90 transition-opacity">
            <X size={16} />
          </button>
        </div>

        <div className="px-4 pb-6 space-y-4">
          <PanelContent
            annotations={annotations}
            editingId={editingId}
            setEditingId={setEditingId}
            verseReference={verseReference}
            newPhrase={newPhrase}
            setNewPhrase={setNewPhrase}
            newNote={newNote}
            setNewNote={setNewNote}
            onSave={() => createMutation.mutate()}
            isSaving={createMutation.isPending}
          />
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col fixed right-0 top-0 bottom-0 w-80 z-50 border-l border-amber-200/60 dark:border-amber-800/40 overflow-y-auto"
        style={{ background: 'var(--header-bg)' }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-amber-200/40 dark:border-amber-800/30">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">
            {t('annotation.panelTitle', 'Your Notes on {{reference}}', { reference: verseReference })}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-full text-[var(--foreground)] opacity-40 hover:opacity-90 transition-opacity">
            <X size={16} />
          </button>
        </div>
        <div className="p-4 space-y-4 flex-1">
          <PanelContent
            annotations={annotations}
            editingId={editingId}
            setEditingId={setEditingId}
            verseReference={verseReference}
            newPhrase={newPhrase}
            setNewPhrase={setNewPhrase}
            newNote={newNote}
            setNewNote={setNewNote}
            onSave={() => createMutation.mutate()}
            isSaving={createMutation.isPending}
          />
        </div>
      </aside>
    </>
  );
};

// ── Inner panel content (shared between mobile sheet and desktop sidebar) ────

interface PanelContentProps {
  annotations: VerseAnnotation[];
  editingId: number | null;
  setEditingId: (id: number | null) => void;
  verseReference: string;
  newPhrase: string;
  setNewPhrase: (v: string) => void;
  newNote: string;
  setNewNote: (v: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

const PanelContent: React.FC<PanelContentProps> = ({
  annotations, editingId, setEditingId, verseReference,
  newPhrase, setNewPhrase, newNote, setNewNote, onSave, isSaving,
}) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Existing annotations */}
      {annotations.length === 0 ? (
        <p className="text-xs text-[var(--journal-text-muted)] py-2">
          {t('annotation.empty', 'No annotations yet for this verse.')}
        </p>
      ) : (
        <div className="space-y-3">
          {annotations.map(a => (
            <div key={a.id} className="p-3 rounded-xl border border-amber-100/60 dark:border-amber-900/30" style={{ background: 'var(--card-bg)' }}>
              {editingId === a.id ? (
                <AnnotationEditor
                  annotation={a}
                  verseReference={verseReference}
                  onDone={() => setEditingId(null)}
                />
              ) : (
                <>
                  {a.phrase_text && (
                    <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-1 italic">"{a.phrase_text}"</p>
                  )}
                  <p className="text-sm text-[var(--journal-text)] leading-relaxed">{a.annotation_text}</p>
                  <button
                    onClick={() => setEditingId(a.id)}
                    className="mt-2 flex items-center gap-1 text-xs text-[var(--journal-text-muted)] hover:text-[var(--candle-amber)] transition-colors"
                  >
                    <Pencil size={12} />
                    {t('annotation.edit', 'Edit')}
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New annotation form */}
      <div className="border-t border-amber-100/60 dark:border-amber-900/30 pt-4 space-y-3">
        <p className="text-xs font-semibold text-[var(--journal-text-muted)] uppercase tracking-wider">
          {t('annotation.addNote', 'Add a note')}
        </p>
        <input
          type="text"
          value={newPhrase}
          onChange={e => setNewPhrase(e.target.value)}
          placeholder={t('annotation.phrasePlaceholder', 'Phrase from this verse…')}
          className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--theme-border)] bg-[var(--journal-surface)] text-[var(--journal-text)] focus:outline-none focus:ring-2 focus:ring-[var(--candle-amber)] transition-colors duration-300"
        />
        <textarea
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
          rows={3}
          placeholder={t('annotation.notePlaceholder', 'Your reflection on this phrase…')}
          className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--theme-border)] bg-[var(--journal-surface)] text-[var(--foreground)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--candle-amber)] transition-colors duration-300"
        />
        <button
          onClick={onSave}
          disabled={!newNote.trim() || isSaving}
          aria-busy={isSaving}
          className="w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60 transition-colors"
          style={{ background: 'var(--blessing-gold)' }}
        >
          {isSaving ? t('common.saving', 'Saving…') : t('annotation.save', 'Save')}
        </button>
      </div>
    </>
  );
};

export default AnnotationPanel;
