import Link from 'next/link';
import { auth } from '@/auth';
import { SignOutButton } from './SignOutButton';

export async function Header() {
  const session = await auth();

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold text-blue-600">
              QuranVerseTagger
            </h1>
          </Link>

          <nav className="flex gap-4 items-center">
            {session?.user ? (
              <>
                <Link href="/tags" className="text-gray-700 hover:text-blue-600">
                  My Tags
                </Link>
                <Link href="/collections" className="text-gray-700 hover:text-blue-600">
                  Collections
                </Link>
                <span className="text-sm text-gray-600">
                  {session.user.name || session.user.email}
                </span>
                <SignOutButton />
              </>
            ) : (
              <>
                <Link 
                  href="/auth/signin" 
                  className="text-gray-700 hover:text-blue-600"
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/signup" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
