import { ChevronDown } from "lucide-react";
import { cn } from "@/pages/lib/utils";
import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  wrapperClassName?: string;
}

export default function Select({
  className,
  children,
  wrapperClassName,
  ...props
}: SelectProps) {
  return (
    <div className={cn("relative inline-block", wrapperClassName)}>
      <select
        {...props}
        className={cn(
          "w-full appearance-none rounded-full border border-gray-200 bg-white pl-4 pr-10 py-2.5 text-sm font-medium text-gray-700 outline-none cursor-pointer transition-colors hover:border-gray-300 focus:border-[#5D3FD3] focus:ring-2 focus:ring-[#5D3FD3]/15",
          className,
        )}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
    </div>
  );
}
