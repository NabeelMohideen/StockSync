import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { 
  LayoutDashboard, 
  Package, 
  Store, 
  ArrowRightLeft, 
  ReceiptText, 
  Boxes,
  Menu,
  X,
  ShoppingCart,
  UserCog,
  BarChart3,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const allNavItems = [
  { name: "POS", icon: ShoppingCart, page: "POS", roles: ['super_admin', 'administrator', 'sales_person'] },
  { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard", roles: ['super_admin', 'administrator'] },
  { name: "Products", icon: Package, page: "Products", roles: ['super_admin', 'administrator'] },
  { name: "Shops", icon: Store, page: "Shops", roles: ['super_admin', 'administrator'] },
  { name: "Inventory", icon: Boxes, page: "Inventory", roles: ['super_admin', 'administrator'] },
  { name: "Transfers", icon: ArrowRightLeft, page: "StockTransfers", roles: ['super_admin', 'administrator'] },
  { name: "Sales", icon: ReceiptText, page: "Sales", roles: ['super_admin', 'administrator'] },
  { name: "Reports", icon: BarChart3, page: "Reports", roles: ['super_admin', 'administrator', 'report_viewer'] },
  { name: "Users", icon: UserCog, page: "Users", roles: ['super_admin', 'administrator'] },
];

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const userAccessLevel = currentUser?.access_level || 'sales_person';
  const navItems = allNavItems.filter(item => item.roles.includes(userAccessLevel));

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 z-50 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
            <Package className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-900">TV Inventory</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div className={cn(
        "lg:hidden fixed top-16 left-0 right-0 bg-white border-b border-slate-100 z-40 transition-all duration-300",
        mobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
      )}>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                currentPageName === item.page
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-100 flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-slate-900">TV Inventory</h1>
              <p className="text-xs text-slate-500">Management System</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                currentPageName === item.page
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-3">
          {currentUser && (
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">Logged in as</p>
              <p className="text-sm font-medium text-slate-900 truncate">{currentUser.full_name || currentUser.email}</p>
              <p className="text-xs text-slate-500 mt-1 capitalize">
                {userAccessLevel.replace('_', ' ')}
              </p>
            </div>
          )}
          <Button 
            variant="outline" 
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}