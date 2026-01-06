import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Banknote, Building2, Wallet } from "lucide-react";

const paymentMethods = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "card", label: "Card", icon: CreditCard },
  { value: "bank_transfer", label: "Bank Transfer", icon: Building2 },
  { value: "credit", label: "Credit", icon: Wallet }
];

export default function CheckoutModalWithSerial({ isOpen, onClose, onComplete, total, cartItems }) {
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    customer_address: "",
    payment_method: "cash",
    notes: ""
  });

  const [serialNumbers, setSerialNumbers] = useState({});

  const handleSerialChange = (itemId, serial) => {
    setSerialNumbers(prev => ({ ...prev, [itemId]: serial }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete({ ...formData, serialNumbers });
    setFormData({ customer_name: "", customer_phone: "", customer_email: "", customer_address: "", payment_method: "cash", notes: "" });
    setSerialNumbers({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Sale</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-sm text-slate-600 mb-1">Total Amount</p>
            <p className="text-3xl font-bold text-slate-900">LKR {total.toLocaleString()}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Customer Name *</Label>
              <Input
                value={formData.customer_name}
                onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Number *</Label>
              <Input
                type="tel"
                value={formData.customer_phone}
                onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                placeholder="555-0123"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.customer_email}
                onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={formData.customer_address}
                onChange={(e) => setFormData({...formData, customer_address: e.target.value})}
                placeholder="123 Main St"
              />
            </div>
          </div>

          {/* Serial Numbers */}
          <div className="space-y-3 border-t pt-4">
            <Label className="text-base font-semibold">TV Serial Numbers</Label>
            {cartItems.map(item => (
              <div key={item.id} className="bg-slate-50 rounded-lg p-3 space-y-2">
                <p className="text-sm font-medium text-slate-900">
                  {item.name} - {item.brand} (Qty: {item.quantity})
                </p>
                <Input
                  placeholder="Enter serial number"
                  value={serialNumbers[item.id] || ""}
                  onChange={(e) => handleSerialChange(item.id, e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Payment Method *</Label>
            <Select value={formData.payment_method} onValueChange={(v) => setFormData({...formData, payment_method: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map(method => {
                  const Icon = method.icon;
                  return (
                    <SelectItem key={method.value} value={method.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {method.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
              Complete Sale
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}