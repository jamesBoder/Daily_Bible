import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash } from '@phosphor-icons/react';
import annotationsApi, { type VerseAnnotation } from '../../services/api/annotations';

interface AnnotationEditorProps {
  annotation: VerseAnnotation;
  verseReference: string;
  onDone: () => void;
}

/** Inline editor for editing or deleting an existing annotation. */
const AnnotationEditor: React.FC<AnnotationEditorProps> = ({ annotation, verseReference, onDone }) => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [phrase, setPhrase] = useState(annotation.phrase_text);
  const [note, setNote] = useState(annotation.annotation_text);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const updateMutation = useMutation({
    mutationFn: () => annotationsApi.update(annotation.id, phrase, note),
    onSuccess: () => {
      if (navigator.vibrate) navigator.vibrate(8);
      qc.invalidateQueries({ queryKey: ['annotations-verse', verseReference] });
      onDone();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => annotationsApi.delete(annotation.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['annotations-verse', verseReference] });
      onDone();
    },
  });

  if (confirmDelete) {
    return (
      <div className="space-y-3 py-2">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {t('annotation.deleteConfirm', 'Delete this annotation?')}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setConfirmDelete(false)}
            className="flex-1 py-2 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60"
          >
            {deleteMutation.isPending ? '…' : t('annotation.delete', 'Delete')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 py-2">
      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          {t('annotation.phrasePlaceholder', 'Phrase from this verse…')}
        </label>
        <input
          type="text"
          value={phrase}
          onChange={e => setPhrase(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
          placeholder={t('annotation.phrasePlaceholder', 'Phrase from this verse…')}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          {t('annotation.addNote', 'Add a note')}
        </label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
          placeholder={t('annotation.notePlaceholder', 'Your reflection on this phrase…')}
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => updateMutation.mutate()}
          disabled={!note.trim() || updateMutation.isPending}
          className="flex-1 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-60 transition-colors"
          style={{ background: 'var(--blessing-gold)' }}
        >
          {updateMutation.isPending ? '…' : t('annotation.save', 'Save')}
        </button>
        <button
          onClick={() => setConfirmDelete(true)}
          className="px-3 py-2 rounded-lg text-xs text-red-500 dark:text-red-400 border border-red-200 dark:border-red-800/40 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <Trash size={14} />
        </button>
        <button
          onClick={onDone}
          className="px-3 py-2 rounded-lg text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AnnotationEditor;
