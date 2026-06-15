import apiClient from './client';

export interface VerseAnnotation {
  id: number;
  user_id: number;
  verse_reference: string;
  phrase_text: string;
  annotation_text: string;
  created_at: string;
  updated_at: string;
  discipline_completed?: { key: string; blessings_credited: number }
}

const annotationsApi = {
  getForVerse: (reference: string) =>
    apiClient.get<{ annotations: VerseAnnotation[] }>(`/api/annotations/verse/${encodeURIComponent(reference)}`)
      .then(r => r.data.annotations),

  getAll: () =>
    apiClient.get<{ annotations: VerseAnnotation[] }>('/api/annotations')
      .then(r => r.data.annotations),

  create: (verseReference: string, phraseText: string, annotationText: string) =>
    apiClient.post<VerseAnnotation>('/api/annotations', {
      verse_reference: verseReference,
      phrase_text: phraseText,
      annotation_text: annotationText,
    }).then(r => r.data),

  update: (id: number, phraseText: string, annotationText: string) =>
    apiClient.put<VerseAnnotation>(`/api/annotations/${id}`, {
      phrase_text: phraseText,
      annotation_text: annotationText,
    }).then(r => r.data),

  delete: (id: number) =>
    apiClient.delete(`/api/annotations/${id}`),
};

export default annotationsApi;
