import apiClient from './client';

export interface ReflectionSearchResult {
  verse_reference: string;
  comment_text: string;
  match_excerpt: string;
  created_at: string;
}

export interface JournalSearchResult {
  id: number;
  content_preview: string;
  linked_verse: string;
  match_excerpt: string;
  created_at: string;
}

export interface SavedSearch {
  id: number;
  query: string;
  name: string;
  created_at: string;
}

const searchExtendedApi = {
  searchReflections: (q: string) =>
    apiClient.get<{ results: ReflectionSearchResult[] }>('/api/search/reflections', { params: { q } })
      .then(r => r.data.results),

  searchJournal: (q: string) =>
    apiClient.get<{ results: JournalSearchResult[] }>('/api/search/journal', { params: { q } })
      .then(r => r.data.results),

  getSavedSearches: () =>
    apiClient.get<{ saved_searches: SavedSearch[] }>('/api/search/saved')
      .then(r => r.data.saved_searches),

  saveSearch: (query: string, name?: string) =>
    apiClient.post<SavedSearch>('/api/search/saved', { query, name: name ?? '' })
      .then(r => r.data),

  deleteSavedSearch: (id: number) =>
    apiClient.delete(`/api/search/saved/${id}`),
};

export default searchExtendedApi;
