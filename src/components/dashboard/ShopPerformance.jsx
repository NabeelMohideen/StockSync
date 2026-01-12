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
    <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
      <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100">
        <div className="p-2 rounded-xl bg-slate-900">
          <Store className="w-5 h-5 text-white" />
        </div>
        <h3 className="font-semibold text-slate-900 text-lg">Shop Performance</h3>
      </div>
      <div className="space-y-5">
        {shopStats.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-4">No shops added yet</p>
        ) : (
          shopStats.slice(0, 5).map((shop, index) => (
            <div key={shop.id} className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-sm",
                    index === 0 ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white" :
                    index === 1 ? "bg-gradient-to-br from-slate-300 to-slate-500 text-white" :
                    index === 2 ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white" :
                    "bg-slate-100 text-slate-700"
                  )}>
                    {index + 1}
                  </span>
                  <span className="font-semibold text-slate-900 text-sm">{shop.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 text-sm">LKR {shop.totalSales.toLocaleString()}</p>
                  <div className="flex items-center gap-1 text-xs text-slate-500 font-medium justify-end mt-0.5">
                    <TrendingUp className="w-3 h-3" />
                    {shop.saleCount} sales
                  </div>
                </div>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-slate-700 to-slate-500 rounded-full transition-all duration-500"
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