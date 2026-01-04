import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Shops from './pages/Shops';
import StockTransfers from './pages/StockTransfers';
import Sales from './pages/Sales';
import Inventory from './pages/Inventory';
import POS from './pages/POS';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Products": Products,
    "Shops": Shops,
    "StockTransfers": StockTransfers,
    "Sales": Sales,
    "Inventory": Inventory,
    "POS": POS,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};