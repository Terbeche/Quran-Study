'use client';

import { useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { updateCollectionAction } from '@/actions/collection-actions';

interface EditCollectionButtonProps {
  readonly collectionId: string;
  readonly currentName: string;
  readonly currentDescription: string | null;
}

export default function EditCollectionButton({
  collectionId,
  currentName,
  currentDescription,
}: EditCollectionButtonProps) {
  const t = useTranslations('collections.editDialog');
  const tCommon = useTranslations('common');
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(currentName);
  const [description, setDescription] = useState(currentDescription || '');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError(t('nameRequired'));
      return;
    }

    startTransition(async () => {
      const result = await updateCollectionAction(collectionId, name, description);
      if (result.error) {
        setError(result.error);
      } else {
        setIsOpen(false);
        setError('');
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-1 text-xs transition-all hover:bg-emerald-50 rounded cursor-pointer hover:shadow-sm"
        style={{ color: 'var(--primary-green)' }}
        title={t('title')}
      >
        {tCommon('edit')}
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]" style={{ background: 'var(--modal-overlay)' }}>
          <div className="card glass max-w-md w-full relative z-10">
            <h2 className="text-2xl font-bold mb-4 text-accent">{t('title')}</h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="edit-collection-name" className="block text-sm font-medium mb-2 text-accent">
                  {t('nameLabel')} *
                </label>
                <input
                  id="edit-collection-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  maxLength={100}
                  autoFocus
                />
              </div>

              <div className="mb-4">
                <label htmlFor="edit-collection-description" className="block text-sm font-medium mb-2 text-accent">
                  {t('descriptionLabel')}
                </label>
                <textarea
                  id="edit-collection-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input"
                  rows={3}
                  maxLength={500}
                />
              </div>

              {error && <p className="mb-4 text-sm" style={{ color: 'var(--error-text)' }}>{error}</p>}

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setName(currentName);
                    setDescription(currentDescription || '');
                    setError('');
                  }}
                  className="px-4 py-2 border rounded-md transition-all duration-200 text-accent cursor-pointer hover:shadow-md"
                  style={{ borderColor: 'var(--primary-green)', background: 'transparent' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--primary-green)';
                    e.currentTarget.style.color = '#f1f5f9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--primary-green)';
                  }}
                >
                  {tCommon('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? t('saving') : t('saveChanges')}
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
