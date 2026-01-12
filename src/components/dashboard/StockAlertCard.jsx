import { AlertTriangle, Package } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StockAlertCard({ alerts, type = "storage" }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-gradient-to-br from-emerald-50/80 to-white rounded-2xl p-6 border border-emerald-200/60 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-emerald-100">
            <Package className="w-5 h-5 text-emerald-700" />
          </div>
          <h3 className="font-semibold text-slate-900 text-lg">
            {type === "storage" ? "Storage Stock" : "Shop Stock"} Status
          </h3>
        </div>
        <p className="text-slate-600 text-sm font-medium">✨ All stock levels are healthy</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-50/80 to-white rounded-2xl p-6 border border-amber-200 shadow-md">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 rounded-xl bg-amber-100">
          <AlertTriangle className="w-5 h-5 text-amber-700" />
        </div>
        <h3 className="font-semibold text-slate-900 text-lg">
          {type === "storage" ? "Storage" : "Shop"} Stock Alerts
        </h3>
        <span className="ml-auto text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-100 text-amber-800">
          {alerts.length} {alerts.length === 1 ? 'item' : 'items'}
        </span>
      </div>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {alerts.map((alert, index) => (
          <div 
            key={index} 
            className={cn(
              "flex items-center justify-between p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow border",
              alert.quantity === 0 ? "bg-white border-red-200" : "bg-white border-amber-100"
            )}
          >
            <div>
              <p className="font-semibold text-slate-900 text-sm">{alert.productName}</p>
              {alert.shopName && (
                <p className="text-xs text-slate-500 font-medium mt-1">{alert.shopName}</p>
              )}
            </div>
            <div className="text-right">
              <p className={cn(
                "font-bold text-sm",
                alert.quantity === 0 ? "text-red-600" : "text-amber-700"
              )}>
                {alert.quantity} units
              </p>
              <p className="text-xs text-slate-500 font-medium">Min: {alert.minLevel}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}