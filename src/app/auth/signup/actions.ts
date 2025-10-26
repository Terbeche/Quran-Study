'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import bcrypt from 'bcryptjs';

export async function signUpAction(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!name || !email || !password) {
    return { error: 'All fields are required' };
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters' };
  }

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
    });

  return { success: true };
  } catch (error) {
    // Log the actual error for debugging
    console.error('Signup error:', error);
    
    // Check if it's a unique constraint violation (duplicate email)
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      return { error: 'Email already exists' };
    }
    
    // Return generic error for other issues
    return { error: 'Failed to create account. Please try again.' };
  }
}
