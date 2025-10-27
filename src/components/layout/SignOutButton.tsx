'use client';

import { signOut } from 'next-auth/react';

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="text-sm transition-colors"
      style={{ color: '#dc2626' }}
      onMouseEnter={(e) => e.currentTarget.style.color = '#b91c1c'}
      onMouseLeave={(e) => e.currentTarget.style.color = '#dc2626'}
    >
      Sign Out
    </button>
  );
}
