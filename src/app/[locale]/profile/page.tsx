import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import ProfileForm from '@/components/profile/ProfileForm';

export default async function ProfilePage() {
  const session = await auth();
  const t = await getTranslations('profile');

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Fetch user data
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user) {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto px-4 py-16 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="link text-sm mb-4 inline-block">
            ← {t('backToHome')}
          </Link>
          <h1 className="section-title">{t('title')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('description')}</p>
        </div>

        <div className="card glass">
          <ProfileForm user={user} />
        </div>
      </div>
    </div>
  );
}
