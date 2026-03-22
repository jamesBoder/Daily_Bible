import apiClient from './client';

export interface HintLetter {
  position: number; // 0-indexed
  letter: string;
}

export interface GuessEntry {
  word: string;
  result: ('correct' | 'present' | 'absent')[];
}

export interface MannaGameResponse {
  locked: false;
  game_id: number;
  status: 'in_progress' | 'solved' | 'failed';
  guess_count: number;
  max_guesses: number;
  guesses: GuessEntry[];
  word_length: number;
  // Scripture clue — shown from the start; word is blanked out
  scripture_reference: string;
  scripture_clue: string;   // verse text with target word replaced by _____
  testament: string;        // "Old Testament" | "New Testament"
  // Hints
  hints_used: number;
  hint_letters?: HintLetter[];
  // Revealed only on solved/failed:
  answer?: string;
  scripture_text?: string;
}

export interface MannaLockedResponse {
  locked: true;
  message: string;
  yesterday?: YesterdayResult;
}

export type MannaResponse = MannaGameResponse | MannaLockedResponse;

export interface GuessResult {
  result: ('correct' | 'present' | 'absent')[];
  status: 'in_progress' | 'solved' | 'failed';
  guess_count: number;
  answer?: string;
  scripture_reference?: string;
  scripture_text?: string;
  blessings_awarded?: number;
}

export interface HintResult {
  position: number;
  letter: string;
  hints_used: number;
  hint_letters: HintLetter[];
  blessings_remaining: number;
}

export interface YesterdayResult {
  word: string;
  scripture_reference: string;
  scripture_text: string;
}

export interface MannaGameSummary {
  game_date: string;
  status: 'in_progress' | 'solved' | 'failed';
  guess_count: number;
  word: string;
}

export const mannaApi = {
  getToday(): Promise<MannaResponse> {
    return apiClient.get<MannaResponse>('/api/manna/today').then(r => r.data);
  },

  submitGuess(guess: string): Promise<GuessResult> {
    return apiClient.post<GuessResult>('/api/manna/guess', { guess }).then(r => r.data);
  },

  getHint(): Promise<HintResult> {
    return apiClient.post<HintResult>('/api/manna/hint').then(r => r.data);
  },

  getYesterday(): Promise<YesterdayResult> {
    return apiClient.get<YesterdayResult>('/api/manna/yesterday').then(r => r.data);
  },

  getHistory(): Promise<{ history: MannaGameSummary[] }> {
    return apiClient.get<{ history: MannaGameSummary[] }>('/api/manna/history').then(r => r.data);
  },
};
