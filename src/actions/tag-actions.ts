'use server';

import { auth } from '@/auth';
import { db } from '@/db';
import { tags } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { normalizeTag } from '@/lib/utils/tag-normalizer';
import { revalidatePath } from 'next/cache';

export async function createTagAction(verseKey: string, tagText: string, isPublic: boolean = false) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: 'Not authenticated' };
  }

  // Validate verse key format
  const verseKeyPattern = /^\d+:\d+$/;
  if (!verseKey || !verseKeyPattern.exec(verseKey)) {
    return { error: 'Invalid verse key format' };
  }

  const normalized = normalizeTag(tagText);

  if (!normalized) {
    return { error: 'Invalid tag' };
  }

  try {
    const [tag] = await db
      .insert(tags)
      .values({
        userId: session.user.id,
        verseKey,
        tagText: normalized,
        isPublic,
      })
      .returning();

    return { data: tag };
  } catch (error) {
    console.error('Create tag error:', error);
    // Check for unique constraint violation in the cause property
    if (error && typeof error === 'object' && 'cause' in error) {
      const cause = error.cause;
      if (cause && typeof cause === 'object' && 'code' in cause && cause.code === '23505') {
        return { error: 'You already have this tag on this verse' };
      }
    }
    return { error: 'Failed to create tag' };
  }
}

// Fast version without revalidation (for verse cards with optimistic updates)
export async function deleteTagAction(tagId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: 'Not authenticated' };
  }

  await db
    .delete(tags)
    .where(and(
      eq(tags.id, tagId),
      eq(tags.userId, session.user.id)
    ));

  return { success: true };
}

// Version with revalidation (for tags page)
export async function deleteTagWithRevalidationAction(tagId: string) {
  const result = await deleteTagAction(tagId);
  
  if (result.success) {
    revalidatePath('/[locale]/tags', 'page');
  }
  
  return result;
}

// Fast version without revalidation (for verse cards with optimistic updates)
export async function toggleTagVisibilityAction(tagId: string, isPublic: boolean) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: 'Not authenticated' };
  }

  const [tag] = await db
    .update(tags)
    .set({ isPublic, updatedAt: new Date() })
    .where(and(
      eq(tags.id, tagId),
      eq(tags.userId, session.user.id)
    ))
    .returning();

  return { data: tag };
}

// Version with revalidation (for tags page)
export async function toggleTagVisibilityWithRevalidationAction(tagId: string, isPublic: boolean) {
  const result = await toggleTagVisibilityAction(tagId, isPublic);
  
  if (result.data) {
    revalidatePath('/[locale]/tags', 'page');
  }
  
  return result;
}
