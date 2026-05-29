import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/pages/lib/utils";

interface PaginationProps {
  /** 1-based current page */
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** when provided, shows "Showing X-Y of Z {itemLabel}" */
  totalItems?: number;
  pageSize?: number;
  itemLabel?: string;
}

const buildPages = (current: number, total: number): number[] => {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) pages.push(-1);
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < total - 1) pages.push(-1);
  pages.push(total);

  return pages;
};

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize = 10,
  itemLabel = "items",
}: PaginationProps) {
  const total = Math.max(1, totalPages);
  const safe = Math.min(Math.max(1, currentPage), total);
  const pages = buildPages(safe, total);

  const startItem =
    totalItems != null
      ? totalItems === 0
        ? 0
        : (safe - 1) * pageSize + 1
      : null;
  const endItem =
    totalItems != null ? Math.min(safe * pageSize, totalItems) : null;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
      <p className="text-sm text-gray-500">
        {totalItems != null
          ? `Showing ${startItem}-${endItem} of ${totalItems} ${itemLabel}`
          : `Page ${safe} of ${total}`}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, safe - 1))}
          disabled={safe === 1}
          className="p-2 hover:bg-gray-100 rounded-2xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4 text-gray-500" />
        </button>
        {pages.map((page, index) =>
          page === -1 ? (
            <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={cn(
                "w-8 h-8 rounded-full text-sm font-medium transition-colors",
                safe === page
                  ? "bg-[#5D3FD3] text-white"
                  : "hover:bg-gray-100 text-gray-600",
              )}
            >
              {page}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(total, safe + 1))}
          disabled={safe === total}
          className="p-2 hover:bg-gray-100 rounded-2xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
}
