/**
 * CommentSection QoL tests
 * - No window.confirm for delete
 * - Inline confirm/cancel UI when clicking Delete
 * - Clicking Cancel hides the confirm UI
 * - Clicking Confirm calls deleteComment (not window.confirm)
 * - Note badge "1" appears when section is collapsed and comment exists
 * - Note badge is hidden when section is expanded
 * - No badge when no comment exists
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CommentSection } from '../features/verse/CommentSection';
import { commentService } from '../services/api/comment';

// ── Mocks ─────────────────────────────────────────────────────────────────────
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

// Use inline jest.fn() to avoid hoisting issues
jest.mock('../services/api/comment', () => ({
  commentService: {
    getCommentForVerse: jest.fn().mockResolvedValue({
      id: 42,
      verse_reference: 'John 3:16',
      comment_text: 'My note',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }),
    addOrUpdateComment: jest.fn(),
    deleteComment: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../hooks/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: jest.fn(),
}));

const renderComponent = () =>
  render(<CommentSection verseId={1} verseReference="John 3:16" />);

const withComment = {
  id: 42,
  verse_reference: 'John 3:16',
  comment_text: 'My note',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('CommentSection – inline delete confirmation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.confirm = jest.fn();
    (commentService.getCommentForVerse as jest.Mock).mockResolvedValue(withComment);
    (commentService.deleteComment as jest.Mock).mockResolvedValue(undefined);
  });

  const expandSection = async () => {
    const toggleBtn = await screen.findByRole('button', { name: /notes.showNotes/i });
    fireEvent.click(toggleBtn);
    await screen.findByText('notes.delete');
  };

  it('shows the Delete button after expanding', async () => {
    renderComponent();
    await expandSection();
    expect(screen.getByText('notes.delete')).toBeInTheDocument();
  });

  it('does NOT call window.confirm when Delete is clicked', async () => {
    renderComponent();
    await expandSection();
    fireEvent.click(screen.getByText('notes.delete'));
    expect(window.confirm).not.toHaveBeenCalled();
  });

  it('shows Confirm and Cancel after clicking Delete', async () => {
    renderComponent();
    await expandSection();
    fireEvent.click(screen.getByText('notes.delete'));
    expect(screen.getByText('common.confirm')).toBeInTheDocument();
    expect(screen.getByText('common.cancel')).toBeInTheDocument();
    expect(screen.queryByText('notes.delete')).not.toBeInTheDocument();
  });

  it('returns to normal view after clicking Cancel', async () => {
    renderComponent();
    await expandSection();
    fireEvent.click(screen.getByText('notes.delete'));
    fireEvent.click(screen.getByText('common.cancel'));
    expect(screen.getByText('notes.delete')).toBeInTheDocument();
    expect(screen.queryByText('common.confirm')).not.toBeInTheDocument();
  });

  it('calls deleteComment (not window.confirm) when Confirm is clicked', async () => {
    renderComponent();
    await expandSection();
    fireEvent.click(screen.getByText('notes.delete'));
    fireEvent.click(screen.getByText('common.confirm'));
    await waitFor(() =>
      expect(commentService.deleteComment).toHaveBeenCalledWith(42)
    );
    expect(window.confirm).not.toHaveBeenCalled();
  });
});

describe('CommentSection – note badge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (commentService.getCommentForVerse as jest.Mock).mockResolvedValue(withComment);
  });

  it('shows badge "1" when collapsed and comment exists', async () => {
    renderComponent();
    await waitFor(() =>
      expect(commentService.getCommentForVerse).toHaveBeenCalled()
    );
    expect(await screen.findByText('1')).toBeInTheDocument();
  });

  it('hides badge when section is expanded', async () => {
    renderComponent();
    await waitFor(() =>
      expect(commentService.getCommentForVerse).toHaveBeenCalled()
    );
    const toggleBtn = await screen.findByRole('button', { name: /notes.showNotes/i });
    fireEvent.click(toggleBtn);
    await waitFor(() =>
      expect(screen.queryByText('1')).not.toBeInTheDocument()
    );
  });

  it('shows no badge when no comment exists', async () => {
    (commentService.getCommentForVerse as jest.Mock).mockResolvedValue(null);
    renderComponent();
    await waitFor(() =>
      expect(commentService.getCommentForVerse).toHaveBeenCalled()
    );
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });
});
