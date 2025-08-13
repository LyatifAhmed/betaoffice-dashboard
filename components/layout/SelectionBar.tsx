"use client";

type Props = {
  selectedCount: number;
  onDeleteMarked: () => void;   // inbox: move to trash, trash: restore
  onSelectAll: () => void;
  onClear: () => void;
  isTrashView?: boolean;
};

export default function SelectionBar({
  selectedCount,
  onDeleteMarked,
  onSelectAll,
  onClear,
  isTrashView = false,
}: Props) {
  const visible = selectedCount > 0;
  const primaryLabel = isTrashView ? "Restore" : "Move to Trash";

  return (
    <div
      role="toolbar"
      aria-hidden={!visible}
      className={[
        "flex items-center gap-2",
        "rounded-full px-2 py-1 shadow-sm border",
        // glassy + transparent
        "bg-white/40 text-gray-800 border-white/40 backdrop-blur-md",
        // dark mode
        "dark:bg-white/10 dark:text-white dark:border-white/20",
        // show/hide
        "transition-opacity duration-200",
        visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
      ].join(" ")}
    >
      {/* Primary action (transparent pastel like before) */}
      <button
        onClick={onDeleteMarked}
        className={[
          "px-3 py-1 text-xs rounded-full font-medium transition",
          isTrashView
            ? "bg-emerald-200/70 text-emerald-900 hover:bg-emerald-300/70 dark:bg-emerald-400/20 dark:text-emerald-200 dark:hover:bg-emerald-400/30"
            : "bg-rose-200/70 text-rose-900 hover:bg-rose-300/70 dark:bg-rose-400/20 dark:text-rose-200 dark:hover:bg-rose-400/30",
        ].join(" ")}
      >
        {primaryLabel}
      </button>

      {/* Count chip (subtle, translucent) */}
      <span
        className="text-[11px] px-2 py-0.5 rounded-full
                   bg-white/50 text-gray-700
                   dark:bg-white/10 dark:text-white/80"
      >
        {selectedCount} selected
      </span>

      {/* Divider */}
      <div className="w-px h-5 bg-gray-300/60 dark:bg-white/15" />

      {/* Helpers (transparent hover) */}
      <button
        onClick={onSelectAll}
        className="px-2 py-1 text-xs rounded-md border border-transparent hover:bg-white/60
                   dark:hover:bg-white/10"
      >
        Select all (page)
      </button>
      <button
        onClick={onClear}
        className="px-2 py-1 text-xs rounded-md border border-transparent hover:bg-white/60
                   dark:hover:bg-white/10"
      >
        Clear
      </button>
    </div>
  );
}
