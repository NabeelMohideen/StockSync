import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Cart({ items, onUpdateQuantity, onRemove, onCheckout }) {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <Card className="h-full flex flex-col max-h-[calc(100vh-180px)] lg:max-h-none">
      <CardHeader className="border-b border-slate-100 flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Cart ({items.length})
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <ShoppingCart className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">Cart is empty</p>
            <p className="text-sm text-slate-400 mt-1">Add products to get started</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="bg-slate-50 rounded-xl p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 mr-2">
                      <h4 className="font-medium text-slate-900 truncate">{item.name}</h4>
                      <p className="text-sm text-slate-500">{item.brand}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => onRemove(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-10 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.available}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="font-semibold text-slate-900">
                      LKR {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 p-4 space-y-3 flex-shrink-0 bg-white">
              <div className="space-y-2">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-slate-900">Total</span>
                  <span className="text-slate-900">LKR {total.toLocaleString()}</span>
                </div>
              </div>
              
              <Button 
                onClick={onCheckout}
                className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base font-semibold"
              >
                Checkout
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}