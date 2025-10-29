'use client';

import { useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { createCollectionAction } from '@/actions/collection-actions';
import { useTranslations } from 'next-intl';

export default function CreateCollectionButton() {
  const t = useTranslations('collections');
  const tCommon = useTranslations('common');
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleOpen = () => {
    setName('');
    setDescription('');
    setError('');
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Collection name is required');
      return;
    }

    startTransition(async () => {
      const result = await createCollectionAction(name, description);
      if (result.error) {
        setError(result.error);
      } else {
        setIsOpen(false);
        setName('');
        setDescription('');
        setError('');
      }
    });
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="btn-primary"
      >
        {t('createNew')}
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]" style={{ background: 'var(--modal-overlay)' }}>
          <div className="card glass max-w-md w-full relative z-10">
            <h2 className="text-2xl font-bold mb-4 text-accent">{t('createDialog.title')}</h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="collection-name" className="block text-sm font-medium mb-2 text-accent">
                  {t('createDialog.nameLabel')} *
                </label>
                <input
                  id="collection-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  placeholder={t('createDialog.namePlaceholder')}
                  maxLength={100}
                  autoFocus
                />
              </div>

              <div className="mb-4">
                <label htmlFor="collection-description" className="block text-sm font-medium mb-2 text-accent">
                  {t('createDialog.descriptionLabel')}
                </label>
                <textarea
                  id="collection-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input"
                  placeholder={t('createDialog.descriptionPlaceholder')}
                  rows={3}
                  maxLength={500}
                />
              </div>

              {error && <p className="mb-4 text-sm" style={{ color: 'var(--error-text)' }}>{error}</p>}

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="btn-ghost"
                >
                  {tCommon('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-primary disabled:opacity-50"
                >
                  {isPending ? `${t('createDialog.submit')}...` : t('createDialog.submit')}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
