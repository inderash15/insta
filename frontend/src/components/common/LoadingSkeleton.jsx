import React from 'react';

export default function LoadingSkeleton({ type = 'card', count = 3 }) {
  if (type === 'card') {
    return (
      <div className="space-y-6 max-w-lg mx-auto">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-800" />
              <div className="space-y-1.5 flex-1">
                <div className="w-24 h-3 bg-neutral-800 rounded" />
                <div className="w-16 h-2 bg-neutral-800/60 rounded" />
              </div>
            </div>
            <div className="w-full aspect-square bg-neutral-800/70 rounded-2xl" />
            <div className="space-y-2">
              <div className="w-32 h-3 bg-neutral-800 rounded" />
              <div className="w-full h-2.5 bg-neutral-800/60 rounded" />
              <div className="w-2/3 h-2.5 bg-neutral-800/60 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'grid') {
    return (
      <div className="grid grid-cols-3 gap-1 sm:gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="aspect-square bg-neutral-900 border border-neutral-800/60 rounded-xl sm:rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-neutral-900/40 border border-neutral-800/60 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-neutral-800" />
              <div className="space-y-1.5">
                <div className="w-28 h-3 bg-neutral-800 rounded" />
                <div className="w-20 h-2 bg-neutral-800/60 rounded" />
              </div>
            </div>
            <div className="w-20 h-7 bg-neutral-800 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-8 text-center text-xs text-neutral-500 animate-pulse">
      Loading content...
    </div>
  );
}
