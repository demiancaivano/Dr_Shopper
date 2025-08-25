import React, { useContext, useEffect } from 'react';
import CartContext from '../context/CartContext';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import usePageTitle from '../hooks/usePageTitle';

const Checkout = () => {
  const { state: cartState } = useContext(CartContext);
  const { state: authState } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // Cambiar el título de la página
  usePageTitle('Checkout');

  // Cargar direcciones del usuario
  useEffect(() => {
    if (authState.isAuthenticated) {
      fetchAddresses();
    }
  }, [authState.isAuthenticated]);

  const fetchAddresses = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/addresses`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAddresses(data.addresses || []);
        // Seleccionar la dirección por defecto
        const defaultAddress = data.addresses?.find(addr => addr.is_default);
        setSelectedAddress(defaultAddress || data.addresses?.[0]);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoadingAddresses(false);
    }
  };

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
    if (!selectedAddress) {
      setError('Please select a shipping address');
      return;
    }

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
          success_url: window.location.origin + '/payment-success?session_id={CHECKOUT_SESSION_ID}',
          cancel_url: window.location.origin + '/payment-canceled?reason=Payment was canceled by user',
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
        <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
        
        {loadingAddresses ? (
          <div className="mb-4 text-gray-600">Loading addresses...</div>
        ) : addresses.length === 0 ? (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">No shipping addresses found. Please add an address in your profile.</p>
            <button
              onClick={() => navigate('/profile')}
              className="mt-2 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 text-sm"
            >
              Add Address
            </button>
          </div>
        ) : (
          <div className="mb-6">
            <div className="space-y-3">
              {addresses.map((address) => (
                <label key={address.id} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="address"
                    value={address.id}
                    checked={selectedAddress?.id === address.id}
                    onChange={() => setSelectedAddress(address)}
                    className="mt-1 text-blue-600"
                  />
                  <div className={`flex-1 p-3 rounded-lg border ${
                    selectedAddress?.id === address.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="font-medium text-gray-900">{address.street}</div>
                    <div className="text-gray-600">
                      {address.city}, {address.state} {address.postal_code}
                    </div>
                    <div className="text-gray-600">{address.country}</div>
                    {address.is_default && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                        Default
                      </span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-xl font-semibold mb-4">Payment</h2>
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 text-blue-800">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Secure Payment with Stripe</span>
          </div>
          <p className="mt-2 text-blue-700 text-sm">
            Your payment will be processed securely through Stripe. You'll be redirected to Stripe's secure checkout page.
          </p>
        </div>

        {error && <div className="text-red-600 text-sm mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">{error}</div>}
        
        <button
          className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 font-semibold w-full disabled:opacity-60 text-lg"
          onClick={handleConfirmOrder}
          disabled={loading || !selectedAddress || addresses.length === 0}
        >
          {loading ? 'Processing...' : 'Proceed to Payment'}
        </button>
      </div>
    </div>
  );
};

export default Checkout; 