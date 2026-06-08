export default function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-[#cffafe] bg-white overflow-hidden">
      <div className="h-[240px] bg-[#f0f9ff] animate-shimmer"
        style={{
          backgroundImage: 'linear-gradient(90deg, #f0f9ff 25%, #e0f2fe 50%, #f0f9ff 75%)',
          backgroundSize: '200% 100%',
        }}
      />
      <div className="p-5 space-y-3">
        <div className="h-4 w-20 rounded-full bg-[#f0f9ff] animate-shimmer"
          style={{
            backgroundImage: 'linear-gradient(90deg, #f0f9ff 25%, #e0f2fe 50%, #f0f9ff 75%)',
            backgroundSize: '200% 100%',
          }}
        />
        <div className="h-5 w-full rounded bg-[#f0f9ff] animate-shimmer"
          style={{
            backgroundImage: 'linear-gradient(90deg, #f0f9ff 25%, #e0f2fe 50%, #f0f9ff 75%)',
            backgroundSize: '200% 100%',
          }}
        />
        <div className="h-5 w-3/4 rounded bg-[#f0f9ff] animate-shimmer"
          style={{
            backgroundImage: 'linear-gradient(90deg, #f0f9ff 25%, #e0f2fe 50%, #f0f9ff 75%)',
            backgroundSize: '200% 100%',
          }}
        />
        <div className="h-4 w-1/2 rounded bg-[#f0f9ff] animate-shimmer"
          style={{
            backgroundImage: 'linear-gradient(90deg, #f0f9ff 25%, #e0f2fe 50%, #f0f9ff 75%)',
            backgroundSize: '200% 100%',
          }}
        />
        <div className="pt-3 border-t border-[#cffafe] flex justify-between items-center">
          <div className="h-4 w-24 rounded bg-[#f0f9ff] animate-shimmer"
            style={{
              backgroundImage: 'linear-gradient(90deg, #f0f9ff 25%, #e0f2fe 50%, #f0f9ff 75%)',
              backgroundSize: '200% 100%',
            }}
          />
          <div className="h-8 w-16 rounded bg-[#f0f9ff] animate-shimmer"
            style={{
              backgroundImage: 'linear-gradient(90deg, #f0f9ff 25%, #e0f2fe 50%, #f0f9ff 75%)',
              backgroundSize: '200% 100%',
            }}
          />
        </div>
      </div>
    </div>
  );
}
