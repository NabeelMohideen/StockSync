import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import POS from './pages/POS';
import Products from './pages/Products';
import Reports from './pages/Reports';
import Sales from './pages/Sales';
import Shops from './pages/Shops';
import StockTransfers from './pages/StockTransfers';
import Users from './pages/Users';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Inventory": Inventory,
    "POS": POS,
    "Products": Products,
    "Reports": Reports,
    "Sales": Sales,
    "Shops": Shops,
    "StockTransfers": StockTransfers,
    "Users": Users,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};