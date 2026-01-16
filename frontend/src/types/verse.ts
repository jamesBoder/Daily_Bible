
// Define the structure of a Verse object
export interface Verse {
  id: number;
  reference: string;
  text: string;
  book: string;
  chapter: number;
  verse: number;
  version: string;
  translation?: string;
}


// Define the structure of a Daily Verse API response
export interface DailyVerseResponse {
  verse: Verse;
}