"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { signUpAction } from "@/app/[locale]/auth/signup/actions";
import { useTranslations } from 'next-intl';

export function SignUpForm() {
  const router = useRouter();
  const t = useTranslations('auth.signUp');
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const result = await signUpAction(formData);

      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        // Navigate client-side after successful signup
        router.push("/auth/signin");
      } else {
        setError(t('error'));
      }
    } catch (err) {
      console.error("Sign up action error:", err);
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1 text-accent">
          {t('nameLabel')}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="input"
          placeholder={t('namePlaceholder')}
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1 text-accent">
          {t('emailLabel')}
        </label>
        <input
          id="email"
          name="email"
          type="email"
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
          name="password"
          type="password"
          required
          minLength={8}
          className="input"
          placeholder={t('passwordPlaceholder')}
        />
        <p className="text-xs mt-1" style={{ color: 'rgba(0,0,0,0.6)' }}>At least 8 characters</p>
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
