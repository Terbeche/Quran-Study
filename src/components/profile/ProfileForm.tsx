'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { updateProfileAction } from '@/actions/profile-actions';
import { useRouter } from '@/i18n/routing';
import { useSession } from 'next-auth/react';

interface ProfileFormProps {
  readonly user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const { update } = useSession();
  const [name, setName] = useState(user.name || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError(t('nameRequired'));
      return;
    }

    startTransition(async () => {
      const result = await updateProfileAction({ name: name.trim() });
      if (result.error) {
        setError(result.error);
      } else {
        // Update the session with new name
        await update({
          user: {
            name: result.name,
          },
        });
        
        setSuccess(t('updateSuccess'));
        // Refresh to update header
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg p-3" style={{ background: 'var(--error-bg)', border: '1px solid var(--error-border)' }}>
          <p className="text-sm" style={{ color: 'var(--error-text)' }}>{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-lg p-3" style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)' }}>
          <p className="text-sm" style={{ color: 'var(--success-text)' }}>{success}</p>
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2 text-accent">
          {t('emailLabel')}
        </label>
        <input
          id="email"
          type="email"
          value={user.email}
          disabled
          className="input opacity-60 cursor-not-allowed"
        />
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          {t('emailHint')}
        </p>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2 text-accent">
          {t('nameLabel')}
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
          placeholder={t('namePlaceholder')}
          maxLength={100}
          required
        />
      </div>

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-ghost"
        >
          {tCommon('cancel')}
        </button>
        <button
          type="submit"
          disabled={isPending || name === user.name}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? `${t('saveButton')}...` : t('saveButton')}
        </button>
      </div>
    </form>
  );
}
