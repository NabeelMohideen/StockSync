import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Store, Search, X } from "lucide-react";
import ProductCard from "@/components/pos/ProductCard";
import Cart from "@/components/pos/Cart";
import CheckoutModal from "@/components/pos/CheckoutModal";
import InvoiceModal from "@/components/pos/InvoiceModal";

export default function POS() {
  const [selectedShop, setSelectedShop] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);

  const queryClient = useQueryClient();

  // Get current user to check if they're assigned to a shop
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Auto-select shop for sales persons
  useEffect(() => {
    if (currentUser?.access_level === 'sales_person' && currentUser?.assigned_shop_id) {
      setSelectedShop(currentUser.assigned_shop_id);
    }
  }, [currentUser]);

  const { data: shops = [] } = useQuery({
    queryKey: ['shops'],
    queryFn: () => base44.entities.Shop.list()
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list()
  });

  const { data: shopInventory = [] } = useQuery({
    queryKey: ['shopInventory'],
    queryFn: () => base44.entities.ShopInventory.list(),
    enabled: !!selectedShop
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list()
  });

  const createSaleMutation = useMutation({
    mutationFn: async ({ saleData, items }) => {
      // Check if customer exists, if not create
      let existingCustomer = customers.find(c => c.phone === saleData.customer_phone);
      if (!existingCustomer && saleData.customer_phone) {
        existingCustomer = await base44.entities.Customer.create({
          name: saleData.customer_name,
          phone: saleData.customer_phone,
          email: saleData.customer_email || "",
          address: saleData.customer_address || ""
        });
      }

      // Create sales for each item
      const sales = [];
      const saleDate = new Date().toISOString().split('T')[0];
      
      for (const item of items) {
        const sale = await base44.entities.Sale.create({
          shop_id: selectedShop,
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          total_amount: item.price * item.quantity,
          customer_name: saleData.customer_name,
          customer_phone: saleData.customer_phone,
          payment_method: saleData.payment_method,
          sale_date: saleDate,
          notes: saleData.notes
        });
        sales.push(sale);

        // Create warranty for each item
        const warrantyExpiryDate = new Date();
        warrantyExpiryDate.setMonth(warrantyExpiryDate.getMonth() + 12);
        
        await base44.entities.Warranty.create({
          sale_id: sale.id,
          product_id: item.id,
          customer_name: saleData.customer_name,
          customer_phone: saleData.customer_phone || "",
          warranty_period_months: 12,
          purchase_date: saleDate,
          warranty_expiry_date: warrantyExpiryDate.toISOString().split('T')[0],
          serial_number: item.serial_number || "",
          status: "active"
        });

        // Update shop inventory
        const inventory = shopInventory.find(
          inv => inv.shop_id === selectedShop && inv.product_id === item.id
        );
        if (inventory) {
          await base44.entities.ShopInventory.update(inventory.id, {
            quantity: Math.max(0, (inventory.quantity || 0) - item.quantity)
          });
        }
      }
      return { sale: sales[0], items }; // Return sale and items for invoice
    },
    onSuccess: ({ sale, items }) => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['shopInventory'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['warranties'] });
      setCompletedSale({ sale, items });
      setIsCheckoutOpen(false);
      setIsInvoiceOpen(true);
      setCartItems([]);
    }
  });

  const getAvailableProducts = () => {
    if (!selectedShop) return [];
    
    return shopInventory
      .filter(inv => inv.shop_id === selectedShop && (inv.quantity || 0) > 0)
      .map(inv => {
        const product = products.find(p => p.id === inv.product_id);
        return product ? {
          ...product,
          available: inv.quantity || 0
        } : null;
      })
      .filter(p => p && (
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchQuery.toLowerCase())
      ));
  };

  const handleAddToCart = (product) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity < product.available) {
        setCartItems(cartItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    setCartItems(cartItems.map(item =>
      item.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const handleRemoveItem = (productId) => {
    setCartItems(cartItems.filter(item => item.id !== productId));
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    setIsCheckoutOpen(true);
  };

  const handleCompleteCheckout = (customerData) => {
    createSaleMutation.mutate({
      saleData: customerData,
      items: cartItems
    });
  };

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const currentShop = shops.find(s => s.id === selectedShop);

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="max-w-[2000px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Point of Sale</h1>
            <p className="text-sm text-slate-500 mt-1">Select shop and start selling</p>
          </div>
          
          <div className="flex items-center gap-4">
            {currentUser?.access_level === 'sales_person' && currentUser?.assigned_shop_id ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl">
                <Store className="w-5 h-5 text-slate-600" />
                <span className="font-medium text-slate-900">
                  {shops.find(s => s.id === currentUser.assigned_shop_id)?.name || 'Your Shop'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl">
                <Store className="w-5 h-5 text-slate-600" />
                <Select value={selectedShop} onValueChange={setSelectedShop}>
                  <SelectTrigger className="w-64 border-0 bg-transparent focus:ring-0">
                    <SelectValue placeholder="Select Shop" />
                  </SelectTrigger>
                  <SelectContent>
                    {shops.filter(s => s.is_active !== false).map(shop => (
                      <SelectItem key={shop.id} value={shop.id}>
                        {shop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </div>

      {!selectedShop ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Store className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Select a Shop</h2>
            <p className="text-slate-500">Choose which shop you're selling from to get started</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <div className="h-full max-w-[2000px] mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Products Section */}
            <div className="lg:col-span-2 flex flex-col">
              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 text-base bg-white"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Products Grid */}
              <div className="flex-1 overflow-y-auto">
                {getAvailableProducts().length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <p className="text-slate-500 font-medium">No products available</p>
                      <p className="text-sm text-slate-400 mt-1">
                        {searchQuery ? "Try a different search" : "Add inventory to this shop"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
                    {getAvailableProducts().map(product => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        available={product.available}
                        onAdd={handleAddToCart}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Cart Section */}
            <div className="lg:col-span-1">
              <Cart
                items={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveItem}
                onCheckout={handleCheckout}
              />
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onComplete={handleCompleteCheckout}
        total={total}
      />

      {/* Invoice Modal */}
      {completedSale && (
        <InvoiceModal
          isOpen={isInvoiceOpen}
          onClose={() => {
            setIsInvoiceOpen(false);
            setCompletedSale(null);
          }}
          sale={completedSale.sale}
          items={completedSale.items}
          shopName={currentShop?.name || ""}
        />
      )}
    </div>
  );
}