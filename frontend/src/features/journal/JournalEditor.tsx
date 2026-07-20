import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams, useBlocker } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import api from "../../services/api/api";
import { showToast } from "../../utils/toast";
import { SoundService } from "../../services/SoundService";
import { useStreak } from "../../contexts/StreakContext";
import { showBlessingsToast } from "../../components/BlessingsToast";
import "./JournalEditor.css";

// ── Types ──────────────────────────────────────────────────────────────────────

interface JournalEntry {
  id: number;
  content_plain: string;
  content_rich: string;
  linked_verse: string;
  prompt_id: number | null;
  created_at: string;
  updated_at: string;
}

interface JournalPrompt {
  id: number;
  text: string;
  active_from: string;
  active_until: string;
}

type SaveState = "idle" | "saving" | "saved" | "error";

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDateHeader(date: Date): string {
  const datePart = date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
  const dayPart  = date.toLocaleDateString(undefined, { weekday: 'long' });
  return `${datePart} · ${dayPart}`;
}

const AUTO_SAVE_DELAY_MS = 500;
const CHAR_COUNT_THRESHOLD = 1000;

// ── Main Component ─────────────────────────────────────────────────────────────

export const JournalEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { t } = useTranslation();
  const { refreshStreak } = useStreak();
  const queryClient = useQueryClient();

  const isEditMode = Boolean(id);

  // ── State ──────────────────────────────────────────────────────────────────

  const [entryId, setEntryId] = useState<number | null>(isEditMode ? Number(id) : null);
  const [contentPlain, setContentPlain] = useState("");
  const [linkedVerse, setLinkedVerse] = useState("");
  const [promptId, setPromptId] = useState<number | null>(null);
  const [activePrompt, setActivePrompt] = useState<JournalPrompt | null>(null);
  const [promptDismissed, setPromptDismissed] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [entryDate, setEntryDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [showVerseInput, setShowVerseInput] = useState(false);
  const [verseInputValue, setVerseInputValue] = useState("");
  const [deleteConfirming, setDeleteConfirming] = useState(false);
  const deleteConfirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Load existing entry (edit mode) ───────────────────────────────────────

  useEffect(() => {
    if (!isEditMode) return;

    let cancelled = false;
    setIsLoading(true);

    api
      .get<JournalEntry>(`/api/journal/${id}`)
      .then((res) => {
        if (cancelled) return;
        const entry = res.data;
        setContentPlain(entry.content_plain);
        setLinkedVerse(entry.linked_verse);
        setPromptId(entry.prompt_id);
        setEntryDate(new Date(entry.created_at));
        setIsLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(t("journal.errorLoading", "Failed to load this entry."));
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id, isEditMode, t]);

  // ── Load weekly prompt (runs in parallel, non-blocking) ───────────────────

  useEffect(() => {
    api
      .get<{ prompt: JournalPrompt | null }>("/api/journal/prompt")
      .then((res) => {
        if (res.data.prompt) setActivePrompt(res.data.prompt);
      })
      .catch(() => {
        // Prompt fetch is non-critical; silently ignore failures.
      });
  }, []);

  // ── Auto-grow textarea ─────────────────────────────────────────────────────

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [contentPlain]);

  // ── Save logic ─────────────────────────────────────────────────────────────

  const save = useCallback(async (plain: string, verse: string, pId: number | null) => {
    if (!plain.trim()) return;

    setSaveState("saving");
    try {
      if (entryId === null) {
        // First save — POST to create
        const res = await api.post<JournalEntry & { blessings_credited?: number; discipline_completed?: { key: string; blessings_credited: number } }>("/api/journal", {
          content_plain: plain,
          linked_verse: verse,
          prompt_id: pId,
        });
        setEntryId(res.data.id);
        if (res.data.blessings_credited && res.data.blessings_credited > 0) {
          showBlessingsToast(res.data.blessings_credited, 'journal_entry_written');
          refreshStreak().catch(() => {});
        }
        if (res.data.discipline_completed) {
          queryClient.invalidateQueries({ queryKey: ['disciplines', 'today'] });
        }
      } else {
        // Subsequent saves — PUT to update
        await api.put(`/api/journal/${entryId}`, {
          content_plain: plain,
          linked_verse: verse,
        });
      }
      setIsDirty(false);
      SoundService.play('journal-save');
      setSaveState("saved");
      // Reset to idle after the savedFade animation completes
      setTimeout(() => setSaveState("idle"), 2600);
    } catch {
      // Save failure: surface it — content stays dirty (isDirty untouched) so the
      // unsaved-changes navigation blocker still protects it, and the visible
      // indicator lets the user retry instead of silently losing the entry.
      setSaveState("error");
      showToast.error(t("journal.saveFailed", "Couldn't save — tap to retry"));
    }
  }, [entryId, refreshStreak, queryClient, t]);

  // ── Debounced auto-save ────────────────────────────────────────────────────

  const scheduleSave = useCallback(
    (plain: string, verse: string, pId: number | null) => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => {
        save(plain, verse, pId);
      }, AUTO_SAVE_DELAY_MS);
    },
    [save]
  );

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContentPlain(value);
    setIsDirty(true);
    scheduleSave(value, linkedVerse, promptId);
  };

  // Flush on blur to ensure nothing is lost when navigating away
  const handleBlur = () => {
    if (!isDirty) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    save(contentPlain, linkedVerse, promptId);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, []);

  // Block React Router navigation (Link clicks, navigate()) when there are unsaved changes
  const blocker = useBlocker(isDirty);
  useEffect(() => {
    if (blocker.state !== "blocked") return;
    const proceed = window.confirm(
      t("journal.unsavedChanges", "You have unsaved changes. Leave without saving?")
    );
    if (proceed) {
      blocker.proceed();
    } else {
      blocker.reset();
    }
  }, [blocker, t]);

  // Block browser-level navigation (refresh, close tab) when there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // ── Verse linker ───────────────────────────────────────────────────────────

  const commitVerse = () => {
    const trimmed = verseInputValue.trim();
    setLinkedVerse(trimmed);
    setShowVerseInput(false);
    setVerseInputValue("");
    if (trimmed) {
      setIsDirty(true);
      scheduleSave(contentPlain, trimmed, promptId);
    }
  };

  // ── Share ──────────────────────────────────────────────────────────────────

  const handleShare = useCallback(async () => {
    const text = contentPlain.trim();
    if (!text) return;
    const shareText = linkedVerse
      ? `${text}\n\n📖 ${linkedVerse}\n\nvia Words of Praise`
      : `${text}\n\nvia Words of Praise`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: t('journal.shareTitle', 'Journal Entry'), text: shareText });
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          await navigator.clipboard.writeText(shareText).catch(() => {});
          showToast.success(t('journal.copied', 'Copied to clipboard'));
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        showToast.success(t('journal.copied', 'Copied to clipboard'));
      } catch {
        showToast.error(t('journal.copyFailed', 'Could not copy to clipboard'));
      }
    }
  }, [contentPlain, linkedVerse, t]);

  // ── Delete ─────────────────────────────────────────────────────────────────
  // Two-tap pattern: first tap enters confirming state (auto-cancels after 3s),
  // second tap executes the irreversible delete.

  const handleDelete = async () => {
    if (!entryId) {
      navigate("/journal");
      return;
    }

    if (!deleteConfirming) {
      setDeleteConfirming(true);
      if (deleteConfirmTimer.current) clearTimeout(deleteConfirmTimer.current);
      deleteConfirmTimer.current = setTimeout(() => setDeleteConfirming(false), 3000);
      return;
    }

    if (deleteConfirmTimer.current) clearTimeout(deleteConfirmTimer.current);
    setDeleteConfirming(false);

    try {
      await api.delete(`/api/journal/${entryId}`);
      setIsDirty(false); // prevent blocker from intercepting the post-delete redirect
      navigate("/journal");
    } catch {
      showToast.error(t("journal.deleteFailed", "Couldn't delete this entry — please try again"));
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="journal-editor-surface">
          <div
            className="skeleton-shimmer"
            style={{ height: "16px", width: "45%", borderRadius: "4px", marginBottom: "1.5rem" }}
          />
          <div
            className="skeleton-shimmer"
            style={{ height: "14px", width: "100%", borderRadius: "4px", marginBottom: "0.5rem" }}
          />
          <div
            className="skeleton-shimmer"
            style={{ height: "14px", width: "80%", borderRadius: "4px" }}
          />
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 text-center" role="alert">
        <p className="journal-page-subtitle mb-4">{loadError}</p>
        <button className="journal-new-btn" onClick={() => navigate("/journal")}>
          ← {t("journal.backToJournal", "Back to Journal")}
        </button>
      </div>
    );
  }

  const charCount = contentPlain.length;
  const wordCount = contentPlain.trim() ? contentPlain.trim().split(/\s+/).length : 0;
  const readTimeMins = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Control bar */}
      <div className="journal-editor-controls">
        <button
          className="journal-editor-back-btn"
          onClick={() => navigate("/journal")}
          aria-label={t("journal.backToJournal", "Back to Journal")}
        >
          ← {t("journal.backToJournal", "Back to Journal")}
        </button>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {contentPlain.trim() && (
            <button
              className="journal-editor-back-btn"
              onClick={handleShare}
              aria-label={t("journal.share", "Share entry")}
            >
              {t("journal.share", "Share")}
            </button>
          )}
          {isEditMode && (
            <button
              className="journal-editor-delete-btn"
              onClick={handleDelete}
              aria-label={
                deleteConfirming
                  ? t("journal.confirmDeleteAriaLabel", "Tap again to permanently delete this entry")
                  : t("journal.deleteEntry", "Delete this entry")
              }
              style={deleteConfirming ? { opacity: 1, fontWeight: 700 } : undefined}
            >
              {deleteConfirming
                ? t("journal.confirmDeleteBtn", "Tap to confirm delete")
                : t("journal.deleteEntry", "Delete Entry")}
            </button>
          )}
        </div>
      </div>

      {/* Editor surface */}
      <div className="journal-editor-surface">
        {/* Auto-save indicator */}
        <div
          className={`journal-save-indicator ${saveState !== "idle" ? saveState : ""}`}
          aria-live="polite"
          aria-label={
            saveState === "saving" ? "Saving…"
            : saveState === "saved" ? "Saved"
            : saveState === "error" ? "Couldn't save — tap to retry"
            : ""
          }
          role={saveState === "error" ? "button" : undefined}
          tabIndex={saveState === "error" ? 0 : undefined}
          onClick={saveState === "error" ? () => save(contentPlain, linkedVerse, promptId) : undefined}
          onKeyDown={saveState === "error" ? (e) => { if (e.key === "Enter" || e.key === " ") save(contentPlain, linkedVerse, promptId); } : undefined}
        >
          {saveState === "saving" && (
            <>
              <span className="journal-save-quill" aria-hidden="true">🪶</span>
              <span>{t("journal.saving", "Saving…")}</span>
            </>
          )}
          {saveState === "saved" && (
            <span>✓ {t("journal.saved", "Saved")}</span>
          )}
          {saveState === "error" && (
            <span>⚠ {t("journal.saveFailedShort", "Couldn't save — tap to retry")}</span>
          )}
        </div>

        {/* Weekly prompt callout (premium — shown when active and not dismissed) */}
        {activePrompt && !promptDismissed && (
          <div className="journal-prompt-callout" role="complementary" aria-label="Weekly prompt">
            <div className="journal-prompt-callout-header">
              <span className="journal-prompt-label">
                {t("journal.thisWeeksPrompt", "This Week's Prompt")}
              </span>
              <button
                className="journal-prompt-dismiss-btn"
                onClick={() => setPromptDismissed(true)}
                aria-label={t("journal.hidePrompt", "Hide prompt")}
              >
                {t("journal.hide", "Hide")}
              </button>
            </div>
            <p className="journal-prompt-text">"{activePrompt.text}"</p>
          </div>
        )}

        {/* Linked verse */}
        {linkedVerse && (
          <div className="journal-linked-verse" aria-label={`Linked verse: ${linkedVerse}`}>
            <span aria-hidden="true">📖</span>
            <span>{linkedVerse}</span>
            <button
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--journal-text-muted)",
                fontSize: "0.75rem",
                marginLeft: "auto",
                padding: 0,
              }}
              onClick={() => {
                setLinkedVerse("");
                setIsDirty(true);
                scheduleSave(contentPlain, "", promptId);
              }}
              aria-label={t("journal.removeVerse", "Remove linked verse")}
            >
              ✕
            </button>
          </div>
        )}

        {/* Verse linker (shows when no verse linked) */}
        {!linkedVerse && !showVerseInput && (
          <button
            className="journal-link-verse-btn"
            onClick={() => setShowVerseInput(true)}
            aria-label={t("journal.linkAVerse", "Link a verse")}
          >
            📖 + {t("journal.linkAVerse", "Link a verse")}
          </button>
        )}

        {showVerseInput && (
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
            <input
              type="text"
              value={verseInputValue}
              onChange={(e) => setVerseInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitVerse();
                if (e.key === "Escape") setShowVerseInput(false);
              }}
              placeholder={t("journal.verseInputPlaceholder", "e.g. Romans 8:28")}
              autoFocus
              style={{
                background: "transparent",
                border: "1px solid var(--journal-accent-border)",
                borderRadius: "6px",
                padding: "0.375rem 0.625rem",
                fontFamily: "'Merriweather', Georgia, serif",
                fontSize: "0.875rem",
                color: "var(--journal-text)",
                outline: "none",
                flex: 1,
              }}
              aria-label={t("journal.verseInputPlaceholder", "Enter verse reference")}
            />
            <button
              className="journal-begin-btn"
              onClick={commitVerse}
              style={{ padding: "0.375rem 0.75rem", fontSize: "0.8125rem" }}
            >
              {t("journal.link", "Link")}
            </button>
            <button
              className="journal-editor-back-btn"
              onClick={() => setShowVerseInput(false)}
            >
              {t("common.cancel", "Cancel")}
            </button>
          </div>
        )}

        {/* Date header */}
        <p className="journal-editor-date-header" aria-label={`Entry date: ${formatDateHeader(entryDate)}`}>
          {formatDateHeader(entryDate)}
        </p>

        {/* Writing surface — plain textarea for all users (Tiptap replaces this in Phase 8+) */}
        <textarea
          ref={textareaRef}
          className="journal-textarea"
          value={contentPlain}
          onChange={handleContentChange}
          onBlur={handleBlur}
          placeholder={t(
            "journal.placeholder",
            "Begin writing — a reflection, a prayer, or simply what's on your heart…"
          )}
          aria-label={t("journal.editorLabel", "Journal entry")}
          spellCheck
        />

        {/* Word count + read time */}
        {wordCount > 0 && (
          <p className="journal-char-count" aria-live="polite">
            {wordCount} {wordCount === 1 ? t("journal.word", "word") : t("journal.words", "words")}
            {charCount > CHAR_COUNT_THRESHOLD && (
              <> · ~{readTimeMins} {t("journal.minRead", "min read")}</>
            )}
          </p>
        )}
      </div>
    </div>
  );
};
