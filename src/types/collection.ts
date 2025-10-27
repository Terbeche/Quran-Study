export interface Collection {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CollectionVerse {
  id: string;
  collectionId: string;
  verseKey: string;
  position: number;
  notes: string | null;
  createdAt: Date;
}

export interface CollectionWithCount extends Collection {
  verseCount: number;
}

export interface CollectionWithVerses extends Collection {
  verses: (CollectionVerse & {
    verse?: {
      textUthmani: string;
      translation: string;
    };
  })[];
}
