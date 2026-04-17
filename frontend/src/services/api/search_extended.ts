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
  searchReflections: async (q: string): Promise<ReflectionSearchResult[]> => {
    const r = await apiClient.get<{ results: ReflectionSearchResult[] }>('/api/search/reflections', { params: { q } });
    return r.data.results;
  },

  searchJournal: async (q: string): Promise<JournalSearchResult[]> => {
    const r = await apiClient.get<{ results: JournalSearchResult[] }>('/api/search/journal', { params: { q } });
    return r.data.results;
  },

  getSavedSearches: async (): Promise<SavedSearch[]> => {
    const r = await apiClient.get<{ saved_searches: SavedSearch[] }>('/api/search/saved');
    return r.data.saved_searches;
  },

  saveSearch: async (query: string, name?: string): Promise<SavedSearch> => {
    const r = await apiClient.post<SavedSearch>('/api/search/saved', { query, name: name ?? '' });
    return r.data;
  },

  deleteSavedSearch: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/search/saved/${id}`);
  },
};

export default searchExtendedApi;
