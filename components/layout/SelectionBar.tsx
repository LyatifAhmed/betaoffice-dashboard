"use client";

type Props = {
  selectedCount: number;
  onDeleteMarked: () => void;
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

  return (
    <div
      className={[
        "flex items-center gap-2",
        "border border-white/30 rounded-full px-2 py-1 shadow-sm",
        "bg-white/60 backdrop-blur-md", // Şeffaf + cam efekti
        "transition-opacity duration-200",
        visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
      ].join(" ")}
    >
      {/* Delete / Restore butonu */}
      {!isTrashView ? (
        <>
          <button
            onClick={onDeleteMarked}
            className="px-3 py-1 text-xs rounded-full bg-rose-200 text-rose-900 hover:bg-rose-300 transition"
          >
            Delete marked
          </button>
          <span className="text-xs text-gray-600 hidden sm:inline">
            ({selectedCount} selected)
          </span>
        </>
      ) : (
        <>
          <button
            onClick={onDeleteMarked}
            className="px-3 py-1 text-xs rounded-full bg-emerald-200 text-emerald-900 hover:bg-emerald-300 transition"
          >
            Restore marked
          </button>
          <span className="text-xs text-gray-600 hidden sm:inline">
            ({selectedCount} selected)
          </span>
        </>
      )}

      {/* Ayraç */}
      <div className="w-px h-5 bg-gray-300/60" />

      {/* Select all / Clear */}
      <button
        onClick={onSelectAll}
        className="px-2 py-1 text-xs rounded-md hover:bg-white/60"
      >
        Select all (page)
      </button>
      <button
        onClick={onClear}
        className="px-2 py-1 text-xs rounded-md hover:bg-white/60"
      >
        Clear
      </button>
    </div>
  );
}
