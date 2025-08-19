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
import Contact from './pages/Contact';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import { AuthProvider } from './context/AuthContext';
import AuthContext from './context/AuthContext';
import Manage from './pages/Manage';
import ManageBrands from './pages/ManageBrands';
import ManageCategories from './pages/ManageCategories';
import ManageProducts from './pages/ManageProducts';
import { CartProvider } from './context/CartContext';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';

function AppContent() {
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const { state } = useContext(AuthContext);

  const openCartModal = () => setIsCartModalOpen(true);
  const closeCartModal = () => setIsCartModalOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-blue-950">
      <Navbar onCartClick={openCartModal} />
      <main className="flex-1">
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
            <Route path="/contact" element={<Contact />} />
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
            <Route path="/my-orders" element={
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            } />
            <Route path="/category/:categoryName" element={<Category />} />
            <Route path="/brand/:brandName" element={<Brand />} />
            <Route path="/search/:query" element={<Search />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/manage" element={
              <ProtectedRoute requireAdmin={true}>
                <Manage />
              </ProtectedRoute>
            } />
            <Route path="/manage/brands" element={
              <ProtectedRoute requireAdmin={true}>
                <ManageBrands />
              </ProtectedRoute>
            } />
            <Route path="/manage/categories" element={
              <ProtectedRoute requireAdmin={true}>
                <ManageCategories />
              </ProtectedRoute>
            } />
            <Route path="/manage/products" element={
              <ProtectedRoute requireAdmin={true}>
                <ManageProducts />
              </ProtectedRoute>
            } />
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
        <AuthContext.Consumer>
          {({ state }) => (
            <CartProvider user={state.user}>
              <AppContent />
            </CartProvider>
          )}
        </AuthContext.Consumer>
      </AuthProvider>
    </Router>
  );
}

export default App;
