import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import CartModal from './components/CartModal';
import Home from './pages/Home';
import Login from './pages/Login';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import Category from './pages/Category';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import NotFound from './pages/NotFound';
import Brand from './pages/Brand';
import Footer from './components/Footer';

function App() {
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  const openCartModal = () => setIsCartModalOpen(true);
  const closeCartModal = () => setIsCartModalOpen(false);

  return (
    <Router>
      <div>
        <Navbar onCartClick={openCartModal} />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/category/:categoryName" element={<Category />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/brand/:brandName" element={<Brand />} />
          </Routes>
        </main>
        <CartModal isOpen={isCartModalOpen} onClose={closeCartModal} />
        <Footer />
      </div>
    </Router>
  );
}

export default App;
