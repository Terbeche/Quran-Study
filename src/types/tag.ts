export interface Tag {
  id: string;
  userId: string;
  verseKey: string;
  tagText: string;
  isPublic: boolean;
  votes?: number;
  userVote?: 1 | -1 | null;
  createdAt: Date;
  updatedAt: Date;
}
