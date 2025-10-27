export interface Tag {
  id: string;
  userId: string;
  verseKey: string;
  tagText: string;
  isPublic: boolean;
  votes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TagWithVerse extends Tag {
  verse?: {
    textUthmani: string;
    translation: string;
    chapterId: number;
    verseNumber: number;
  };
}
