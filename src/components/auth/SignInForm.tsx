'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export function SignInForm() {
  const router = useRouter();
  const t = useTranslations('auth.signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t('error'));
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg p-3" style={{ background: 'var(--error-bg)', border: '1px solid var(--error-border)' }}>
          <p className="text-sm" style={{ color: 'var(--error-text)' }}>{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1 text-accent">
          {t('emailLabel')}
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input"
          placeholder={t('emailPlaceholder')}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1 text-accent">
          {t('passwordLabel')}
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="input"
          placeholder={t('passwordPlaceholder')}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? `${t('submitButton')}...` : t('submitButton')}
      </button>
    </form>
  );
}
