export default function SurahLoading() {
  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* Chapter Header Skeleton */}
      <div className="mb-8">
        <div className="h-4 w-32 rounded mb-4" style={{ background: 'var(--card-bg)' }} />
        
        <div className="card">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="h-8 w-48 rounded mb-2" style={{ background: 'var(--input-bg)' }} />
              <div className="h-4 w-64 rounded" style={{ background: 'var(--input-bg)' }} />
            </div>
            <div className="h-10 w-32 rounded" style={{ background: 'var(--input-bg)' }} />
          </div>
          
          <div className="flex gap-6">
            <div className="h-4 w-24 rounded" style={{ background: 'var(--input-bg)' }} />
            <div className="h-4 w-24 rounded" style={{ background: 'var(--input-bg)' }} />
            <div className="h-4 w-24 rounded" style={{ background: 'var(--input-bg)' }} />
          </div>
        </div>
      </div>

      {/* Audio Player Skeleton */}
      <div className="card mb-8">
        <div className="h-32 rounded" style={{ background: 'var(--input-bg)' }} />
      </div>

      {/* Verses Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card">
            <div className="h-4 w-20 rounded mb-4" style={{ background: 'var(--input-bg)' }} />
            <div className="h-16 rounded mb-4" style={{ background: 'var(--input-bg)' }} />
            <div className="h-12 rounded" style={{ background: 'var(--input-bg)' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
