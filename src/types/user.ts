export interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  password?: string;
  createdAt: Date;
}

export interface TagVote {
  id: string;
  tagId: string;
  userId: string;
  voteType: 1 | -1; // 1 for upvote, -1 for downvote
  createdAt: Date;
}

export interface CollectionVerse {
  id: string;
  collectionId: string;
  verseKey: string;
  addedAt: Date;
}
