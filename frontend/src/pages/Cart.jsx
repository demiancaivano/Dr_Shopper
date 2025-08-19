import React, { useContext, useState } from 'react';
import CartContext from '../context/CartContext';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';

const Cart = () => {
  const { state: authState } = useContext(AuthContext);
  const { state, addItem, removeItem, updateQuantity, clearCart } = useContext(CartContext);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const navigate = useNavigate();

  // Cambiar el título de la página
  usePageTitle('Shopping Cart');

  if (!authState.isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4 min-h-[60vh]">
        <h1 className="text-2xl font-bold mb-6 text-white">Shopping Cart</h1>
        <div className="bg-white rounded shadow p-6 text-blue-900 text-center">
          You must be logged in to view your cart.
          <div className="mt-4 flex gap-4 justify-center">
            <button className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 font-semibold" onClick={() => navigate('/login')}>Login</button>
            <button className="bg-gray-200 text-blue-900 px-4 py-2 rounded hover:bg-gray-300" onClick={() => navigate('/register')}>Register</button>
          </div>
        </div>
      </div>
    );
  }

  const handleRemove = (id) => {
    setDeleteId(id);
    setShowDelete(true);
  };

  const confirmRemove = () => {
    removeItem(deleteId);
    setShowDelete(false);
    setDeleteId(null);
  };

  const handleQuantity = (id, qty, stock) => {
    if (qty >= 1 && qty <= stock) updateQuantity(id, qty);
  };

  // Validar stock
  const hasStockIssues = state.items.some(item => item.quantity > item.stock);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 min-h-[60vh]">
      <h1 className="text-2xl font-bold mb-6 text-white">Shopping Cart</h1>
      {state.items.length === 0 ? (
        <div className="bg-white rounded shadow p-6 text-blue-900 text-center">Your cart is empty.</div>
      ) : (
        <>
          <div className="flex flex-col gap-4 mb-6">
            {state.items.map(item => (
              <div key={item.productId} className="bg-white rounded shadow p-4 flex flex-col sm:flex-row gap-4 items-center">
                <img src={item.image_url} alt={item.name} className="w-20 h-20 object-cover rounded border" />
                <div className="flex-1 w-full">
                  <div className="font-semibold text-blue-900 text-lg">{item.name}</div>
                  <div className="text-blue-900 text-sm">€{item.price.toFixed(2)} x {item.quantity} = <span className="font-bold">€{(item.price * item.quantity).toFixed(2)}</span></div>
                  <div className="flex items-center gap-2 mt-2">
                    <button className="px-2 py-1 bg-blue-200 text-blue-900 rounded" onClick={() => handleQuantity(item.productId, item.quantity - 1, item.stock)} disabled={item.quantity <= 1}>-</button>
                    <span className="px-2 text-blue-900 font-semibold">{item.quantity}</span>
                    <button className="px-2 py-1 bg-blue-200 text-blue-900 rounded" onClick={() => handleQuantity(item.productId, item.quantity + 1, item.stock)} disabled={item.quantity >= item.stock}>+</button>
                    <button className="ml-4 px-2 py-1 bg-red-200 text-red-700 rounded" onClick={() => handleRemove(item.productId)}>Remove</button>
                  </div>
                  <div className="text-xs text-blue-900 mt-1">Stock: {item.stock}</div>
                  {item.quantity > item.stock && (
                    <div className="text-xs text-red-600 mt-1">Not enough stock available!</div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mb-4">
            <div className="font-bold text-grey-300">Total:</div>
            <div className="font-bold text-grey-300 text-lg">€{state.total.toFixed(2)}</div>
          </div>
          {hasStockIssues && (
            <div className="mb-4 text-red-600 font-semibold">Some products exceed available stock. Please adjust quantities before checkout.</div>
          )}
          <div className="flex gap-2 mb-6">
            <button className="bg-gray-200 text-blue-900 px-4 py-2 rounded hover:bg-gray-300 flex-1" onClick={() => setShowClearConfirm(true)}>Clear Cart</button>
            <button
              className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 flex-1 disabled:opacity-50"
              disabled={hasStockIssues || state.items.length === 0}
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
      {/* Modal de confirmación para eliminar */}
      {showDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-xs relative mx-2 md:mx-0">
            <h2 className="text-xl font-bold mb-4 text-blue-900">Remove Product</h2>
            <p className="mb-6 text-blue-900">Are you sure you want to remove this product from the cart?</p>
            <div className="flex gap-4">
              <button className="bg-gray-200 text-blue-900 px-4 py-2 rounded hover:bg-gray-300" onClick={() => setShowDelete(false)}>Cancel</button>
              <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-semibold" onClick={confirmRemove}>Remove</button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de confirmación para vaciar carrito */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-xs relative mx-2 md:mx-0">
            <h2 className="text-xl font-bold mb-4 text-blue-900">Clear Cart</h2>
            <p className="mb-6 text-blue-900">Are you sure you want to clear your entire cart?</p>
            <div className="flex gap-4">
              <button className="bg-gray-200 text-blue-900 px-4 py-2 rounded hover:bg-gray-300" onClick={() => setShowClearConfirm(false)}>Cancel</button>
              <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-semibold" onClick={() => { clearCart(); setShowClearConfirm(false); }}>Clear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart; 