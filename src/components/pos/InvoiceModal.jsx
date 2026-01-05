import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Printer, Download } from "lucide-react";
import { format } from "date-fns";

export default function InvoiceModal({ isOpen, onClose, sale, items, shopName }) {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-6" id="invoice">
          {/* Success Header */}
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Sale Complete!</h2>
            <p className="text-slate-600">Invoice generated successfully</p>
          </div>

          {/* Invoice */}
          <div className="border-2 border-slate-200 rounded-xl p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start pb-6 border-b border-slate-200">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">INVOICE</h1>
                <p className="text-slate-600 mt-1">#{sale.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-sm text-slate-500 mt-1">
                  {format(new Date(sale.created_date), 'MMMM d, yyyy h:mm a')}
                </p>
              </div>
              <div className="text-right">
                <h2 className="font-bold text-slate-900">TV Inventory System</h2>
                <p className="text-sm text-slate-600 mt-1">{shopName}</p>
              </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-2 gap-6 pb-6 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">BILL TO</h3>
                <p className="font-medium text-slate-900">{sale.customer_name}</p>
                {sale.customer_phone && (
                  <p className="text-sm text-slate-600">{sale.customer_phone}</p>
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">PAYMENT METHOD</h3>
                <p className="font-medium text-slate-900 capitalize">
                  {sale.payment_method?.replace('_', ' ')}
                </p>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">ITEMS</h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 text-sm font-medium text-slate-600">Product</th>
                    <th className="text-center py-2 text-sm font-medium text-slate-600">Qty</th>
                    <th className="text-right py-2 text-sm font-medium text-slate-600">Price</th>
                    <th className="text-right py-2 text-sm font-medium text-slate-600">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="py-3">
                        <p className="font-medium text-slate-900">{item.name}</p>
                        <p className="text-sm text-slate-500">{item.brand}</p>
                      </td>
                      <td className="text-center py-3 text-slate-900">{item.quantity}</td>
                      <td className="text-right py-3 text-slate-900">LKR {item.price.toLocaleString()}</td>
                      <td className="text-right py-3 font-medium text-slate-900">
                        LKR {(item.price * item.quantity).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="space-y-2 pt-4">
              <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t-2 border-slate-200">
                <span>Total</span>
                <span>LKR {total.toLocaleString()}</span>
              </div>
            </div>

            {sale.notes && (
              <div className="pt-4 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-900 mb-2">NOTES</h3>
                <p className="text-sm text-slate-600">{sale.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="pt-6 border-t border-slate-200 text-center">
              <p className="text-sm text-slate-500">Thank you for your business!</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={handlePrint} className="flex-1">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button onClick={onClose} className="flex-1 bg-slate-900 hover:bg-slate-800">
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}