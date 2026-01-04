import { AlertTriangle, Package } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StockAlertCard({ alerts, type = "storage" }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-emerald-50">
            <Package className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="font-semibold text-slate-900">
            {type === "storage" ? "Storage Stock" : "Shop Stock"} Status
          </h3>
        </div>
        <p className="text-slate-500 text-sm">All stock levels are healthy</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-amber-50">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        </div>
        <h3 className="font-semibold text-slate-900">
          {type === "storage" ? "Storage" : "Shop"} Stock Alerts
        </h3>
        <span className="ml-auto text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-700">
          {alerts.length} {alerts.length === 1 ? 'item' : 'items'}
        </span>
      </div>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {alerts.map((alert, index) => (
          <div 
            key={index} 
            className={cn(
              "flex items-center justify-between p-3 rounded-xl",
              alert.quantity === 0 ? "bg-red-50" : "bg-amber-50"
            )}
          >
            <div>
              <p className="font-medium text-slate-900 text-sm">{alert.productName}</p>
              {alert.shopName && (
                <p className="text-xs text-slate-500">{alert.shopName}</p>
              )}
            </div>
            <div className="text-right">
              <p className={cn(
                "font-semibold text-sm",
                alert.quantity === 0 ? "text-red-600" : "text-amber-600"
              )}>
                {alert.quantity} units
              </p>
              <p className="text-xs text-slate-400">Min: {alert.minLevel}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}