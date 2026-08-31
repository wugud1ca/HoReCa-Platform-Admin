import React from 'react';

interface SkeletonTableProps {
  rows?: number;
  cols?: number;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({ rows = 5, cols = 6 }) => {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white animate-pulse">
      <div className="h-10 bg-slate-50 border-b border-slate-200 flex items-center px-4 gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-3 bg-slate-200 rounded flex-1" />
        ))}
      </div>
      <div className="divide-y divide-slate-100 p-2">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="py-3 px-2 flex items-center gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <div
                key={c}
                className="h-3.5 bg-slate-100 rounded"
                style={{ width: `${Math.floor(50 + Math.random() * 45)}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
