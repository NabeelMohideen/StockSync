import { format } from "date-fns";
import { ReceiptText } from "lucide-react";

export default function RecentSalesTable({ sales, shops, products }) {
  const getShopName = (shopId) => {
    const shop = shops.find(s => s.id === shopId);
    return shop?.name || 'Unknown Shop';
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product?.name || 'Unknown Product';
  };

  if (!sales || sales.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-slate-50">
            <ReceiptText className="w-5 h-5 text-slate-600" />
          </div>
          <h3 className="font-semibold text-slate-900">Recent Sales</h3>
        </div>
        <p className="text-slate-500 text-sm text-center py-8">No sales recorded yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-50">
            <ReceiptText className="w-5 h-5 text-slate-600" />
          </div>
          <h3 className="font-semibold text-slate-900">Recent Sales</h3>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Date</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Product</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Shop</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Qty</th>
              <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sales.slice(0, 5).map((sale) => (
              <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-600">
                  {sale.sale_date ? format(new Date(sale.sale_date), 'MMM d, yyyy') : '-'}
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-slate-900">{getProductName(sale.product_id)}</p>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{getShopName(sale.shop_id)}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{sale.quantity}</td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-900 text-right">
                  ${sale.total_amount?.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}