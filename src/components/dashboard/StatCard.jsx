import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

export default function StatCard({ title, value, subtitle, icon: Icon, trend, trendUp, className, alert }) {
  return (
    <div className={cn(
      "bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-semibold text-slate-900 tracking-tight whitespace-nowrap">{value}</p>
          {subtitle && (
            <p className="text-sm text-slate-400">{subtitle}</p>
          )}
          {alert && (
            <div className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-amber-50 text-amber-600">
              <AlertTriangle className="w-3 h-3" />
              {alert}
            </div>
          )}
          {trend && (
            <div className={cn(
              "inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
              trendUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
            )}>
              {trend}
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-3 rounded-xl bg-slate-50">
            <Icon className="w-5 h-5 text-slate-600" />
          </div>
        )}
      </div>
    </div>
  );
}