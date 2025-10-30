'use server';

import { auth } from '@/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function updateProfileAction(data: { name: string }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: 'Not authenticated' };
    }

    // Update user profile in database
    await db
      .update(users)
      .set({
        name: data.name,
      })
      .where(eq(users.id, session.user.id));

    return { success: true, name: data.name };
  } catch (error) {
    console.error('Failed to update profile:', error);
    return { error: 'Failed to update profile' };
  }
}
