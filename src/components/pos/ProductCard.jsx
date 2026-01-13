import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProductCard({ product, onAdd, available }) {
  return (
    <Card className="hover:shadow-lg transition-all cursor-pointer group">
      <CardContent className="p-4">
        <div className="aspect-video bg-slate-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="w-12 h-12 text-slate-400" />
          )}
        </div>
        
        <div className="space-y-2">
          <div>
            <h3 className="font-semibold text-slate-900 line-clamp-1">{product.name}</h3>
            <p className="text-sm text-slate-500">{product.brand}</p>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-900">
                LKR {product.unit_price?.toLocaleString()}
              </p>
              <p className={cn(
                "text-xs font-medium",
                available > 5 ? "text-emerald-600" : available > 0 ? "text-amber-600" : "text-red-600"
              )}>
                {available} in stock
              </p>
            </div>
          </div>
          
          <Button 
            onClick={() => onAdd(product)}
            disabled={available === 0}
            className="w-full bg-slate-900 hover:bg-slate-800 group-hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}