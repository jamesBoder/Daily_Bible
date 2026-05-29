/**
 * FavoritesList QoL tests
 * - No window.confirm when removing a favorite
 * - Clicking Remove (after expanding card) shows inline confirm/cancel
 * - Clicking Cancel hides the inline confirm
 * - Clicking Confirm calls removeFavorite (not window.confirm)
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { FavoritesList } from '../features/favorites/FavoritesList';
import { useFavorites } from '../hooks/useFavorites';

// ── Mocks ─────────────────────────────────────────────────────────────────────
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Use a module-level stable mock — avoids creating a new jest.fn() each call
jest.mock('../hooks/useFavorites', () => ({
  useFavorites: jest.fn(),
}));

jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, username: 'Test', email: 'test@test.com', is_guest: false },
    isAuthenticated: true,
    isGuest: false,
    logout: jest.fn(),
  }),
}));

jest.mock('../utils/toast', () => ({
  showToast: { error: jest.fn(), success: jest.fn() },
}));

jest.mock('../features/verse/CommentSection', () => ({
  CommentSection: () => <div data-testid="comment-section" />,
}));

jest.mock('../features/verse/AnnotationPanel', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../features/verse/AnnotationIndicator', () => ({
  __esModule: true,
  default: () => null,
}));

const mockRemoveFavorite = jest.fn().mockResolvedValue(undefined);

const defaultFavoritesReturn = {
  favorites: [
    {
      id: 1,
      verse_id: 100,
      created_at: '2024-01-01T00:00:00Z',
      verse: {
        id: 100,
        text: 'For God so loved the world',
        reference: 'John 3:16',
        book: 'John',
        chapter: 3,
        verse: 16,
        version: 'KJV',
        translation: 'KJV',
      },
    },
  ],
  isLoading: false,
  error: null,
  removeFavorite: mockRemoveFavorite,
  isFavorited: () => true,
  getFavoriteId: () => 1,
  isAdding: false,
  isRemoving: false,
  refetch: jest.fn(),
};

const renderComponent = () =>
  render(
    <MemoryRouter>
      <FavoritesList />
    </MemoryRouter>
  );

// Click the card text to expand it — reveals the Remove button
const expandCard = () =>
  fireEvent.click(screen.getByText('For God so loved the world'));

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('FavoritesList – inline remove confirmation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.confirm = jest.fn();
    (useFavorites as jest.Mock).mockReturnValue(defaultFavoritesReturn);
  });

  it('shows the Remove button after expanding a card', () => {
    renderComponent();
    expandCard();
    expect(screen.getByText('favorites.remove')).toBeInTheDocument();
  });

  it('does NOT call window.confirm when clicking Remove', () => {
    renderComponent();
    expandCard();
    fireEvent.click(screen.getByText('favorites.remove'));
    expect(window.confirm).not.toHaveBeenCalled();
  });

  it('shows inline Confirm and Cancel after clicking Remove', () => {
    renderComponent();
    expandCard();
    fireEvent.click(screen.getByText('favorites.remove'));
    expect(screen.getByText('common.confirm')).toBeInTheDocument();
    expect(screen.getByText('common.cancel')).toBeInTheDocument();
    expect(screen.queryByText('favorites.remove')).not.toBeInTheDocument();
  });

  it('hides inline confirm and shows Remove again after Cancel', () => {
    renderComponent();
    expandCard();
    fireEvent.click(screen.getByText('favorites.remove'));
    fireEvent.click(screen.getByText('common.cancel'));
    expect(screen.getByText('favorites.remove')).toBeInTheDocument();
    expect(screen.queryByText('common.confirm')).not.toBeInTheDocument();
  });

  it('calls removeFavorite (not window.confirm) when Confirm is clicked', async () => {
    renderComponent();
    expandCard();
    fireEvent.click(screen.getByText('favorites.remove'));
    fireEvent.click(screen.getByText('common.confirm'));
    await waitFor(() => expect(mockRemoveFavorite).toHaveBeenCalledWith(1));
    expect(window.confirm).not.toHaveBeenCalled();
  });
});
