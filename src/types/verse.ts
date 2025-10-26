export interface Verse {
  id: number;
  verse_key: string;
  verse_number: number;
  chapter_id: number;
  text_uthmani: string;
  translations?: Translation[];
}

export interface Translation {
  id: number;
  text: string;
  resource_name?: string;
  language_name?: string;
}

export interface Chapter {
  id: number;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  revelation_place: string;
  translated_name?: {
    name: string;
    language_name?: string;
  };
}
