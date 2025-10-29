export default function CollectionsLoading() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div className="h-8 w-48 rounded" style={{ background: 'var(--card-bg)' }} />
        <div className="h-10 w-40 rounded" style={{ background: 'var(--card-bg)' }} />
      </div>

      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card">
            <div className="h-6 w-3/4 rounded mb-2" style={{ background: 'var(--input-bg)' }} />
            <div className="h-4 w-full rounded mb-3" style={{ background: 'var(--input-bg)' }} />
            <div className="h-4 w-32 rounded" style={{ background: 'var(--input-bg)' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
