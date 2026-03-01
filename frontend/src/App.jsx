import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import Login from './pages/Login';
import Register from './pages/Register';
import Orders from './pages/Orders';
import Customize from "./pages/Customize";
import AdminOrders from './pages/AdminOrders';
import AdminAddProduct from './pages/AdminAddProduct';

function App() {
  return (
    <>
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
      </Routes>
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
