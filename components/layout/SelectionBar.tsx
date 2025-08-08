// components/mail/SelectionBar.tsx
import { useMemo } from "react";

export default function SelectionBar({
  selectedCount,
  onDeleteMarked,
  onSelectAll,
  onClear,
}: {
  selectedCount: number;
  onDeleteMarked: () => void;
  onSelectAll: () => void;
  onClear: () => void;
}) {
  const visible = selectedCount > 0;

  return (
    <div
      className={`
        pointer-events-none relative h-10
      `}
    >
      {/* Sabitlenen bar: yer değiştirmez, sadece şeffaflığı değişir */}
      <div
        className={`
          absolute inset-0 mx-auto max-w-screen-sm sm:max-w-none
          flex items-center justify-between gap-2
          rounded-full border border-white/30 backdrop-blur-md
          bg-white/20 shadow-inner px-3
          transition-opacity duration-200
          ${visible ? "opacity-100" : "opacity-0"}
          pointer-events-auto
        `}
      >
        <button
          onClick={onDeleteMarked}
          className="px-3 py-1.5 text-sm rounded-full bg-rose-400/80 text-white hover:bg-rose-500"
        >
          Delete marked
        </button>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={onSelectAll}
            className="px-3 py-1.5 rounded-full bg-white/60 hover:bg-white"
          >
            Select all (page)
          </button>
          <button
            onClick={onClear}
            className="px-3 py-1.5 rounded-full bg-white/40 hover:bg-white/70"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
