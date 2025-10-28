'use client';

import { useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { createCollectionAction } from '@/actions/collection-actions';

export default function CreateCollectionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

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
        onClick={() => setIsOpen(true)}
        className="btn-primary"
      >
        Create Collection
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="card glass max-w-md w-full relative z-10">
            <h2 className="text-2xl font-bold mb-4 text-accent">Create New Collection</h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="collection-name" className="block text-sm font-medium mb-2 text-accent">
                  Collection Name *
                </label>
                <input
                  id="collection-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  maxLength={100}
                  autoFocus
                />
              </div>

              <div className="mb-4">
                <label htmlFor="collection-description" className="block text-sm font-medium mb-2 text-accent">
                  Description (optional)
                </label>
                <textarea
                  id="collection-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input"
                  rows={3}
                  maxLength={500}
                />
              </div>

              {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border rounded-md transition-colors text-accent"
                  style={{ borderColor: 'rgba(16, 185, 129, 0.3)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-primary disabled:opacity-50"
                >
                  {isPending ? 'Creating...' : 'Create'}
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
