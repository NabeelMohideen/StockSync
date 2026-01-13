import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProductCard({ product, onAdd, available }) {
  return (
    <Card className="hover:shadow-lg transition-all cursor-pointer group h-full">
      <CardContent className="p-3 sm:p-4 flex flex-col h-full">
        <div className="aspect-square bg-slate-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="w-8 sm:w-12 h-8 sm:h-12 text-slate-400" />
          )}
        </div>
        
        <div className="space-y-2 flex-1 flex flex-col">
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 line-clamp-2 text-sm sm:text-base">{product.name}</h3>
            <p className="text-xs sm:text-sm text-slate-500 line-clamp-1">{product.brand}</p>
          </div>
          
          <div className="space-y-2">
            <div>
              <p className="text-xl sm:text-2xl font-bold text-slate-900">
                LKR {product.unit_price?.toLocaleString()}
              </p>
              <p className={cn(
                "text-xs font-medium",
                available > 5 ? "text-emerald-600" : available > 0 ? "text-amber-600" : "text-red-600"
              )}>
                {available} in stock
              </p>
            </div>
            
            <Button 
              onClick={() => onAdd(product)}
              disabled={available === 0}
              className="w-full bg-slate-900 hover:bg-slate-800 group-hover:shadow-lg transition-all text-xs sm:text-sm h-9 sm:h-10"
            >
              <Plus className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Add to Cart</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}