'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { db } from '@/db';
import { tags, tagVotes } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function voteOnTagAction(tagId: string, value: 1 | -1) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: 'Not authenticated' };
  }

  const userId = session.user.id;

  try {
    // Check if user already voted
    const existingVote = await db
      .select()
      .from(tagVotes)
      .where(and(
        eq(tagVotes.tagId, tagId),
        eq(tagVotes.userId, userId)
      ))
      .limit(1);

    if (existingVote.length > 0) {
      const currentVote = existingVote[0];

      if (currentVote.voteType === value) {
        // Remove vote if clicking the same button (toggle behavior)
        await db.delete(tagVotes).where(eq(tagVotes.id, currentVote.id));

        // Update tag votes count
        await db
          .update(tags)
          .set({ votes: sql`${tags.votes} - ${value}` })
          .where(eq(tags.id, tagId));

        revalidatePath('/community-tags');
        revalidatePath('/tags');
        return { success: true, action: 'removed' };
      } else {
        // Change vote (from upvote to downvote or vice versa)
        await db
          .update(tagVotes)
          .set({ voteType: value })
          .where(eq(tagVotes.id, currentVote.id));

        // Update tag votes count (change by 2 because we're reversing)
        await db
          .update(tags)
          .set({ votes: sql`${tags.votes} + ${value * 2}` })
          .where(eq(tags.id, tagId));

        revalidatePath('/community-tags');
        revalidatePath('/tags');
        return { success: true, action: 'changed' };
      }
    } else {
      // New vote
      await db.insert(tagVotes).values({
        tagId,
        userId,
        voteType: value,
      });

      // Update tag votes count
      await db
        .update(tags)
        .set({ votes: sql`${tags.votes} + ${value}` })
        .where(eq(tags.id, tagId));

      revalidatePath('/community-tags');
      revalidatePath('/tags');
      return { success: true, action: 'added' };
    }
  } catch (error) {
    console.error('Vote error:', error);
    return { error: 'Failed to vote' };
  }
}

export async function getUserVoteAction(tagId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { data: null };
  }

  const vote = await db
    .select()
    .from(tagVotes)
    .where(and(
      eq(tagVotes.tagId, tagId),
      eq(tagVotes.userId, session.user.id)
    ))
    .limit(1);

  return { data: vote[0] || null };
}
