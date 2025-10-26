'use client';

import { signOut } from 'next-auth/react';

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="text-sm text-red-600 hover:text-red-700"
    >
      Sign Out
    </button>
  );
}
