import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db, supabase } from "@/api/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Store, Search, X } from "lucide-react";
import ProductCard from "@/components/pos/ProductCard";
import Cart from "@/components/pos/Cart";
import CheckoutModalWithSerial from "@/components/pos/CheckoutModalWithSerial";
import InvoiceModal from "@/components/pos/InvoiceModal";

export default function POS() {
  const [selectedShop, setSelectedShop] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);

  const queryClient = useQueryClient();

  const { data: shops = [] } = useQuery({
    queryKey: ['shops'],
    queryFn: async () => {
      const { data, error } = await db.shops.list();
      if (error) throw error;
      return data || [];
    }
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await db.products.list();
      if (error) throw error;
      return data || [];
    }
  });

  const { data: shopInventory = [] } = useQuery({
    queryKey: ['shopInventory'],
    queryFn: async () => {
      const { data, error } = await supabase.from('inventory').select('*');
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedShop
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await db.customers.list();
      if (error) throw error;
      return data || [];
    }
  });

  const createSaleMutation = useMutation({
    mutationFn: async ({ saleData, items }) => {
      // Check if customer exists, if not create
      let customerId = null;
      if (saleData.customer_phone) {
        let existingCustomer = customers.find(c => c.phone === saleData.customer_phone);
        if (!existingCustomer) {
          const { data: newCustomer, error } = await db.customers.create({
            full_name: saleData.customer_name,
            phone: saleData.customer_phone,
            email: saleData.customer_email || "",
            address: saleData.customer_address || ""
          });
          if (error) throw error;
          customerId = newCustomer.id;
        } else {
          customerId = existingCustomer.id;
        }
      }

      // Calculate totals
      const totalAmount = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
      const saleDate = new Date().toISOString().split('T')[0];

      // Create sale record
      const { data: sale, error: saleError } = await db.sales.create({
        shop_id: selectedShop,
        customer_id: customerId,
        customer_name: saleData.customer_name,
        customer_phone: saleData.customer_phone,
        sale_date: saleDate,
        payment_method: saleData.payment_method,
        final_amount: totalAmount,
        notes: saleData.notes
      });
      if (saleError) throw saleError;

      // Create sale items and warranties
      for (const item of items) {
        // Create sale item
        const { error: itemError } = await supabase.from('sale_items').insert({
          sale_id: sale.id,
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.unit_price * item.quantity,
          serial_number: saleData.serialNumbers?.[item.id] || null
        });
        if (itemError) throw itemError;

        // Create warranty
        const warrantyExpiryDate = new Date();
        warrantyExpiryDate.setMonth(warrantyExpiryDate.getMonth() + 12);
        
        const { error: warrantyError } = await db.warranties.create({
          sale_id: sale.id,
          product_id: item.id,
          customer_name: saleData.customer_name,
          customer_phone: saleData.customer_phone || "",
          warranty_period_months: 12,
          purchase_date: saleDate,
          expiry_date: warrantyExpiryDate.toISOString().split('T')[0],
          serial_number: saleData.serialNumbers?.[item.id] || null,
          status: "active"
        });
        if (warrantyError) throw warrantyError;

        // Update shop inventory
        const inventory = shopInventory.find(
          inv => inv.shop_id === selectedShop && inv.product_id === item.id
        );
        if (inventory) {
          const { error: invError } = await supabase
            .from('inventory')
            .update({ quantity: Math.max(0, (inventory.quantity || 0) - item.quantity) })
            .eq('id', inventory.id);
          if (invError) throw invError;
        }
      }

      return { sale, items, customerData: saleData };
    },
    onSuccess: ({ sale, items, customerData }) => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['shopInventory'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['warranties'] });
      setCompletedSale({ sale, items, customerData });
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

  const total = cartItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

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
      <CheckoutModalWithSerial
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onComplete={handleCompleteCheckout}
        total={total}
        cartItems={cartItems}
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
          customerData={completedSale.customerData}
          shopName={currentShop?.name || ""}
        />
      )}
    </div>
  );
}