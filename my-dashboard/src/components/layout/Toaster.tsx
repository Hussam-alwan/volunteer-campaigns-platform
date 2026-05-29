import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "@/pages/lib/utils";
import useToastStore from "@/store/toast.store";

const styles = {
  success: { icon: CheckCircle2, ring: "border-green-200", iconColor: "text-green-600" },
  error: { icon: XCircle, ring: "border-red-200", iconColor: "text-red-600" },
  info: { icon: Info, ring: "border-slate-200", iconColor: "text-[#5D3FD3]" },
};

export default function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const remove = useToastStore((s) => s.remove);

  return (
    <div className="fixed top-4 right-4 z-[9999] flex w-80 max-w-[90vw] flex-col gap-2">
      {toasts.map((t) => {
        const { icon: Icon, ring, iconColor } = styles[t.type];
        return (
          <div
            key={t.id}
            className={cn(
              "flex items-start gap-3 rounded-2xl border bg-white px-4 py-3 shadow-lg animate-in slide-in-from-right-4 fade-in duration-200",
              ring,
            )}
          >
            <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", iconColor)} />
            <p className="flex-1 text-sm text-slate-700 leading-snug">
              {t.message}
            </p>
            <button
              type="button"
              onClick={() => remove(t.id)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
