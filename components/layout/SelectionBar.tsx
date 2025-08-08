"use client";

type Props = {
  selectedCount: number;               // 0 ise görünmez
  onDeleteMarked: () => void;          // Trash'te ise restore için de kullanılabilir
  onSelectAll: () => void;
  onClear: () => void;
};

export default function SelectionBar({
  selectedCount,
  onDeleteMarked,
  onSelectAll,
  onClear,
}: Props) {
  const visible = selectedCount > 0;

  return (
    // Bar’ın kapladığı alan sabit; görünmezken pointer kapalı
    <div className="relative h-10">
      <div
        className={[
          "absolute inset-0 z-20 mx-auto max-w-screen-sm", // ortala
          "flex items-center justify-between gap-2",
          "rounded-full border border-white/30 backdrop-blur-xl",
          "bg-white/15 shadow-[0_8px_30px_rgb(0,0,0,0.12)]",
          "px-2 py-1",
          // hafif pembe-mavi aura
          "before:absolute before:-inset-0.5 before:rounded-full before:blur-xl",
          "before:bg-gradient-to-r before:from-fuchsia-400/20 before:via-blue-400/20 before:to-fuchsia-400/20",
          "transition-opacity duration-200",
          visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
          // yumuşak nefes alma
          visible ? "animate-pulse" : "",
        ].join(" ")}
        aria-live="polite"
      >
        <div className="flex items-center gap-2">
          <button
            onClick={onDeleteMarked}
            className="px-3 py-1.5 text-xs sm:text-sm rounded-full bg-rose-400/90 text-white hover:bg-rose-500 active:scale-[0.98] transition"
          >
            Delete marked
          </button>
          <span className="text-[11px] sm:text-xs text-white/80 hidden sm:inline">
            ({selectedCount} selected)
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={onSelectAll}
            className="px-3 py-1.5 rounded-full bg-white/70 hover:bg-white text-gray-800"
          >
            Select all (page)
          </button>
          <button
            onClick={onClear}
            className="px-3 py-1.5 rounded-full bg-white/40 hover:bg-white/70 text-gray-800"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
