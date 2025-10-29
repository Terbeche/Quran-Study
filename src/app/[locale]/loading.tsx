export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 rounded-full animate-spin mb-4"
          style={{ 
            borderColor: 'var(--primary-green)',
            borderTopColor: 'transparent'
          }}
        />
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    </div>
  );
}
