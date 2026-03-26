import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import "./styles/background.css";
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import Login from './pages/Login';
import Register from './pages/Register';
import Orders from './pages/Orders';
import Customize from "./pages/Customize";
import AdminOrders from './pages/AdminOrders';
import AdminAddProduct from './pages/AdminAddProduct';
import AdminCategories from './pages/AdminCategories';
import AdminInsights from './pages/AdminInsights';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Profile from './pages/profile';
import AdminProducts from './pages/AdminProducts';
import InfoPage from './pages/InfoPage';

function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const element = document.getElementById(location.hash.slice(1));
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    }
  }, [location.hash, location.pathname]);

  return null;
}

function App() {
  return (
    <>
      <ScrollToHash />
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/customize/:productId" element={<Customize />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/products/new" element={<AdminAddProduct />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/insights" element={<AdminInsights />} />
        <Route path="/products/:productId" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/info" element={<InfoPage />} />
      </Routes>

      <Footer />
    </>
  );
}

export default function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
