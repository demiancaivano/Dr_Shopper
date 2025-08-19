import React, { useContext } from 'react';
import CartContext from '../context/CartContext';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ShippingAddressSelector from '../components/ShippingAddressSelector';
import { useState } from 'react';
import usePageTitle from '../hooks/usePageTitle';

const Checkout = () => {
  const { state: cartState } = useContext(CartContext);
  const { state: authState } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cambiar el título de la página
  usePageTitle('Checkout');

  if (!authState.isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4 min-h-[60vh]">
        <h1 className="text-2xl font-bold mb-6 text-white">Checkout</h1>
        <div className="bg-white rounded shadow p-6 text-blue-900 text-center">
          You must be logged in to proceed to checkout.
          <div className="mt-4 flex gap-4 justify-center">
            <button className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 font-semibold" onClick={() => navigate('/login')}>Login</button>
            <button className="bg-gray-200 text-blue-900 px-4 py-2 rounded hover:bg-gray-300" onClick={() => navigate('/register')}>Register</button>
          </div>
        </div>
      </div>
    );
  }

  if (cartState.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4 min-h-[60vh]">
        <h1 className="text-2xl font-bold mb-6 text-white">Checkout</h1>
        <div className="bg-white rounded shadow p-6 text-blue-900 text-center">
          Your cart is empty.
          <div className="mt-4">
            <button className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 font-semibold" onClick={() => navigate('/')}>Go to Home</button>
          </div>
        </div>
      </div>
    );
  }

  const handleConfirmOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/stripe-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          items: cartState.items.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })),
          success_url: window.location.origin + '/checkout?success=true',
          cancel_url: window.location.origin + '/checkout?canceled=true',
        })
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Could not start payment.');
      }
    } catch {
      setError('Could not start payment.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 min-h-[60vh]">
      <h1 className="text-2xl font-bold mb-6 text-white">Checkout</h1>
      <div className="bg-white rounded shadow p-6 text-blue-900">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        <ul className="mb-4 divide-y divide-gray-200">
          {cartState.items.map(item => (
            <li key={item.productId} className="py-2 flex justify-between items-center">
              <span>{item.name} <span className="text-xs text-gray-500">x{item.quantity}</span></span>
              <span>€{(item.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between font-bold text-lg mb-6">
          <span>Total:</span>
          <span>€{cartState.total.toFixed(2)}</span>
        </div>
        <h2 className="text-xl font-semibold mb-4">Shipping & Payment (demo)</h2>
        <div className="mb-4 text-gray-700">This is a demo checkout. No real payment will be processed.</div>
        <ShippingAddressSelector />
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <button
          className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 font-semibold w-full disabled:opacity-60"
          onClick={handleConfirmOrder}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Confirm Order'}
        </button>
      </div>
    </div>
  );
};

export default Checkout; 