import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';

const PaymentCanceled = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Cambiar el título de la página
  usePageTitle('Payment Canceled');

  const reason = searchParams.get('reason') || 'Payment was canceled';

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center bg-white rounded-lg shadow-lg p-8">
        <div className="text-red-500 text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Payment Canceled</h1>
        <p className="text-gray-600 mb-6">{reason}</p>
        
        <div className="space-y-3">
          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/cart')}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Back to Cart
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
        
        <div className="mt-6 text-sm text-gray-500">
          <p>No charges were made to your account.</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentCanceled;
