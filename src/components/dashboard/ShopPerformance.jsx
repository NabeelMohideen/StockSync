import { Store, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ShopPerformance({ shops, sales }) {
  const getShopSales = (shopId) => {
    return sales.filter(s => s.shop_id === shopId);
  };

  const getShopTotal = (shopId) => {
    return getShopSales(shopId).reduce((sum, s) => sum + (s.total_amount || 0), 0);
  };

  const shopStats = shops
    .map(shop => ({
      ...shop,
      totalSales: getShopTotal(shop.id),
      saleCount: getShopSales(shop.id).length
    }))
    .sort((a, b) => b.totalSales - a.totalSales);

  const maxSales = Math.max(...shopStats.map(s => s.totalSales), 1);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-slate-50">
          <Store className="w-5 h-5 text-slate-600" />
        </div>
        <h3 className="font-semibold text-slate-900">Shop Performance</h3>
      </div>
      <div className="space-y-4">
        {shopStats.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-4">No shops added yet</p>
        ) : (
          shopStats.slice(0, 5).map((shop, index) => (
            <div key={shop.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                    index === 0 ? "bg-amber-100 text-amber-700" :
                    index === 1 ? "bg-slate-200 text-slate-700" :
                    index === 2 ? "bg-orange-100 text-orange-700" :
                    "bg-slate-100 text-slate-600"
                  )}>
                    {index + 1}
                  </span>
                  <span className="font-medium text-slate-900 text-sm">{shop.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900 text-sm">${shop.totalSales.toLocaleString()}</p>
                  <p className="text-xs text-slate-400">{shop.saleCount} sales</p>
                </div>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-slate-600 to-slate-400 rounded-full transition-all duration-500"
                  style={{ width: `${(shop.totalSales / maxSales) * 100}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}