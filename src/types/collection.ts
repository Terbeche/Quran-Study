import type { CollectionVerse } from './user';

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  verses?: CollectionVerse[];
}
