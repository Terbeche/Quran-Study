'use server';

import { auth } from '@/auth';
import { db } from '@/db';
import { collections, collectionVerses } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function createCollectionAction(name: string, description?: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: 'Not authenticated' };
  }

  // Validate collection name
  const trimmedName = name.trim();
  if (!trimmedName || trimmedName.length < 2) {
    return { error: 'Collection name must be at least 2 characters' };
  }

  if (trimmedName.length > 100) {
    return { error: 'Collection name is too long (max 100 characters)' };
  }

  try {
    const [collection] = await db
      .insert(collections)
      .values({
        userId: session.user.id,
        name: trimmedName,
        description: description?.trim() || null,
      })
      .returning();
    return { data: collection };
  } catch (error) {
    console.error('Create collection error:', error);
    // Check for unique constraint violation in the cause property
    if (error && typeof error === 'object' && 'cause' in error) {
      const cause = error.cause;
      if (cause && typeof cause === 'object' && 'code' in cause && cause.code === '23505') {
        return { error: 'You already have a collection with this name' };
      }
    }
    return { error: 'Failed to create collection' };
  }
}

export async function deleteCollectionAction(collectionId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: 'Not authenticated' };
  }

  try {
    await db
      .delete(collections)
      .where(and(
        eq(collections.id, collectionId),
        eq(collections.userId, session.user.id)
      ));

    return { success: true };
  } catch (error) {
    console.error('Delete collection error:', error);
    return { error: 'Failed to delete collection' };
  }
}

export async function addVerseToCollectionAction(
  collectionId: string,
  verseKey: string,
  notes?: string
) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: 'Not authenticated' };
  }

  try {
    // Verify user owns collection
    const collection = await db
      .select()
      .from(collections)
      .where(and(
        eq(collections.id, collectionId),
        eq(collections.userId, session.user.id)
      ))
      .limit(1);

    if (collection.length === 0) {
      return { error: 'Collection not found' };
    }

    // Get max position
    const verses = await db
      .select()
      .from(collectionVerses)
      .where(eq(collectionVerses.collectionId, collectionId));

    const maxPosition = verses.reduce((max, v) => Math.max(max, v.position), 0);

    const [verse] = await db
      .insert(collectionVerses)
      .values({
        collectionId,
        verseKey,
        position: maxPosition + 1,
        notes: notes || null,
      })
      .returning();

    return { data: verse };
  } catch (error) {
    console.error('Add verse error:', error);
    // Check for unique constraint violation in the cause property
    if (error && typeof error === 'object' && 'cause' in error) {
      const cause = error.cause;
      if (cause && typeof cause === 'object' && 'code' in cause && cause.code === '23505') {
        return { error: 'Verse already in collection' };
      }
    }
    return { error: 'Failed to add verse' };
  }
}

export async function removeVerseFromCollectionAction(
  collectionId: string,
  verseKey: string
) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: 'Not authenticated' };
  }

  try {
    // Verify user owns collection
    const collection = await db
      .select()
      .from(collections)
      .where(and(
        eq(collections.id, collectionId),
        eq(collections.userId, session.user.id)
      ))
      .limit(1);

    if (collection.length === 0) {
      return { error: 'Collection not found' };
    }

    await db
      .delete(collectionVerses)
      .where(and(
        eq(collectionVerses.collectionId, collectionId),
        eq(collectionVerses.verseKey, verseKey)
      ));

    return { success: true };
  } catch (error) {
    console.error('Remove verse error:', error);
    return { error: 'Failed to remove verse' };
  }
}

export async function getVerseCollectionsAction(verseKey: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: 'Not authenticated' };
  }

  try {
    const verseCollections = await db
      .select({
        id: collections.id,
        name: collections.name,
        description: collections.description,
      })
      .from(collections)
      .innerJoin(collectionVerses, eq(collections.id, collectionVerses.collectionId))
      .where(and(
        eq(collections.userId, session.user.id),
        eq(collectionVerses.verseKey, verseKey)
      ));

    return { data: verseCollections };
  } catch (error) {
    console.error('Get verse collections error:', error);
    return { error: 'Failed to get verse collections' };
  }
}

export async function updateCollectionAction(
  collectionId: string,
  name: string,
  description?: string
) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: 'Not authenticated' };
  }

  // Validate collection name
  const trimmedName = name.trim();
  if (!trimmedName || trimmedName.length < 2) {
    return { error: 'Collection name must be at least 2 characters' };
  }

  if (trimmedName.length > 100) {
    return { error: 'Collection name is too long (max 100 characters)' };
  }

  try {
    const [collection] = await db
      .update(collections)
      .set({
        name: trimmedName,
        description: description?.trim() || null,
        updatedAt: new Date(),
      })
      .where(and(
        eq(collections.id, collectionId),
        eq(collections.userId, session.user.id)
      ))
      .returning();

    if (!collection) {
      return { error: 'Collection not found' };
    }

    return { data: collection };
  } catch (error) {
    console.error('Update collection error:', error);
    // Check for unique constraint violation in the cause property
    if (error && typeof error === 'object' && 'cause' in error) {
      const cause = error.cause;
      if (cause && typeof cause === 'object' && 'code' in cause && cause.code === '23505') {
        return { error: 'You already have a collection with this name' };
      }
    }
    return { error: 'Failed to update collection' };
  }
}
