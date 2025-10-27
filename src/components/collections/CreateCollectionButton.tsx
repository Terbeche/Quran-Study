'use client';

import { useState, useTransition } from 'react';
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
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Create Collection
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Create New Collection</h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="collection-name" className="block text-sm font-medium mb-2 text-gray-700">
                  Collection Name *
                </label>
                <input
                  id="collection-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-gray-900"
                  maxLength={100}
                  autoFocus
                />
              </div>

              <div className="mb-4">
                <label htmlFor="collection-description" className="block text-sm font-medium mb-2 text-gray-700">
                  Description (optional)
                </label>
                <textarea
                  id="collection-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-gray-900"
                  rows={3}
                  maxLength={500}
                />
              </div>

              {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50 text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
