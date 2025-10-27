'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { db } from '@/db';
import { tags } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { normalizeTag } from '@/lib/utils/tag-normalizer';

export async function createTagAction(verseKey: string, tagText: string, isPublic: boolean = false) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: 'Not authenticated' };
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

    revalidatePath(`/surah/${verseKey.split(':')[0]}`);
    revalidatePath('/tags');

    return { data: tag };
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      return { error: 'Tag already exists for this verse' };
    }
    return { error: 'Failed to create tag' };
  }
}

export async function deleteTagAction(tagId: string) {
  console.log('Deleting tag with ID:', tagId);
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

  revalidatePath('/tags');
  return { success: true };
}

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

  revalidatePath('/tags');
  revalidatePath('/community-tags');

  return { data: tag };
}
