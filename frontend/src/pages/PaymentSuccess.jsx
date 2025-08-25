import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import usePageTitle from '../hooks/usePageTitle';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state: authState } = useContext(AuthContext);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cambiar el título de la página
  usePageTitle('Payment Successful');

  useEffect(() => {
    if (!authState.isAuthenticated) {
      navigate('/login');
      return;
    }

    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      fetchOrderDetails(sessionId);
    } else {
      setError('No payment session found');
      setLoading(false);
    }
  }, [authState.isAuthenticated, navigate, searchParams]);

  const fetchOrderDetails = async (sessionId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/confirm-stripe-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ session_id: sessionId })
      });

      if (response.ok) {
        const data = await response.json();
        setOrderDetails(data.order);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error confirming payment');
      }
    } catch (error) {
      setError('Error confirming payment');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white rounded-lg shadow-lg p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Payment Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
      <div className="max-w-4xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-8xl mb-6">✅</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Payment Successful!</h1>
          <p className="text-xl text-gray-600">Thank you for your purchase. Your order has been confirmed.</p>
        </div>

        {/* Order Details */}
        {orderDetails && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Order Details</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Order Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Order Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-medium">#{orderDetails.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {new Date(orderDetails.creation_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-green-600 capitalize">{orderDetails.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-medium text-lg text-indigo-600">€{orderDetails.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Shipping Address</h3>
                {orderDetails.address && (
                  <div className="text-gray-600">
                    <p className="font-medium">{orderDetails.address.street}</p>
                    <p>{orderDetails.address.city}, {orderDetails.address.state}</p>
                    <p>{orderDetails.address.postal_code}</p>
                    <p>{orderDetails.address.country}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            {orderDetails.items && orderDetails.items.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Order Items</h3>
                <div className="space-y-3">
                  {orderDetails.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-500 text-sm font-medium">{item.quantity}x</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{item.product?.name || 'Product'}</p>
                          <p className="text-sm text-gray-500">€{item.price.toFixed(2)} each</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-800">€{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <button
            onClick={() => navigate('/my-orders')}
            className="bg-indigo-600 text-white py-3 px-8 rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-lg"
          >
            View My Orders
          </button>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 bg-white text-indigo-600 py-2 px-6 rounded-lg hover:bg-gray-50 transition-colors border border-indigo-200"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Continue Shopping</span>
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center text-gray-500">
          <p>A confirmation email has been sent to your registered email address.</p>
          <p className="mt-2">If you have any questions, please contact our support team.</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
