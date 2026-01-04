import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Shops from './pages/Shops';
import StockTransfers from './pages/StockTransfers';
import Sales from './pages/Sales';
import Inventory from './pages/Inventory';


export const PAGES = {
    "Dashboard": Dashboard,
    "Products": Products,
    "Shops": Shops,
    "StockTransfers": StockTransfers,
    "Sales": Sales,
    "Inventory": Inventory,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
};