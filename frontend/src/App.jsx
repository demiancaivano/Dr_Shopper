import React, { useState, useContext } from 'react';
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
import ProductReviews from './pages/ProductReviews';
import Search from './pages/Search';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import { AuthProvider } from './context/AuthContext';
import AuthContext from './context/AuthContext';

function AppContent() {
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const { state } = useContext(AuthContext);

  const openCartModal = () => setIsCartModalOpen(true);
  const closeCartModal = () => setIsCartModalOpen(false);

  return (
    <div>
      <Navbar onCartClick={openCartModal} />
      <main>
        {state.loading ? (
          <div className="min-h-screen flex items-center justify-center bg-blue-950">
            <LoadingSpinner size="xl" text="Checking authentication..." />
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/product/:id/reviews" element={<ProductReviews />} />
            <Route path="/cart" element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/category/:categoryName" element={<Category />} />
            <Route path="/brand/:brandName" element={<Brand />} />
            <Route path="/search/:query" element={<Search />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
      </main>
      <CartModal isOpen={isCartModalOpen} onClose={closeCartModal} />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
