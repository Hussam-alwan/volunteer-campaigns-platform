import { cn } from "@/pages/lib/utils";

export interface SegmentedToggleOption {
  value: string;
  label: string;
}

interface SegmentedToggleProps {
  options: SegmentedToggleOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function SegmentedToggle({
  options,
  value,
  onChange,
  className,
}: SegmentedToggleProps) {
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );

  return (
    <div
      className={cn(
        "relative inline-flex items-center bg-gray-100 rounded-2xl p-1",
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute top-1 bottom-1 left-1 rounded-xl bg-[#5D3FD3] shadow-sm transition-transform duration-300 ease-out"
        style={{
          width: `calc((100% - 0.5rem) / ${options.length})`,
          transform: `translateX(${index * 100}%)`,
        }}
      />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "relative z-10 flex-1 whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors duration-300",
            value === o.value ? "text-white" : "text-gray-600 hover:text-gray-900",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
