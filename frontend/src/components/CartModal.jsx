import React, { useContext, useState } from 'react';
import CartContext from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const CartModal = ({ isOpen, onClose }) => {
  const { state: authState } = useContext(AuthContext);
  const { state, addItem, removeItem, updateQuantity, clearCart } = useContext(CartContext);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  // Elimino la lógica que muestra el modal de login si no está autenticado

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

  const goToCartPage = () => {
    onClose();
    navigate('/cart');
  };

  const modalContent = () => (
    <>
      <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" onClick={onClose}>&times;</button>
      <h2 className="text-xl font-bold mb-4 text-blue-900">Shopping Cart</h2>
      {state.items.length === 0 ? (
        <div className="text-blue-900 text-center py-8">Your cart is empty.</div>
      ) : (
        <>
          <div className="flex flex-col gap-4 max-h-80 overflow-y-auto mb-4">
            {state.items.map(item => (
              <div key={item.productId} className="flex gap-3 items-center border-b pb-2">
                <img src={item.image_url} alt={item.name} className="w-14 h-14 object-cover rounded border" />
                <div className="flex-1">
                  <div className="font-semibold text-blue-900">{item.name}</div>
                  <div className="text-blue-900 text-sm">€{item.price.toFixed(2)} x {item.quantity} = <span className="font-bold">€{(item.price * item.quantity).toFixed(2)}</span></div>
                  <div className="flex items-center gap-2 mt-1">
                    <button className="px-2 py-1 bg-blue-200 text-blue-900 rounded" onClick={() => handleQuantity(item.productId, item.quantity - 1, item.stock)} disabled={item.quantity <= 1}>-</button>
                    <span className="px-2 text-blue-900 font-semibold">{item.quantity}</span>
                    <button className="px-2 py-1 bg-blue-200 text-blue-900 rounded" onClick={() => handleQuantity(item.productId, item.quantity + 1, item.stock)} disabled={item.quantity >= item.stock}>+</button>
                    <button className="ml-4 px-2 py-1 bg-red-200 text-red-700 rounded" onClick={() => handleRemove(item.productId)}>Remove</button>
                  </div>
                  <div className="text-xs text-blue-900 mt-1">Stock: {item.stock}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mb-4">
            <div className="font-bold text-blue-900">Total:</div>
            <div className="font-bold text-blue-900 text-lg">€{state.total.toFixed(2)}</div>
          </div>
          <div className="flex gap-2 mb-2">
            <button className="bg-gray-200 text-blue-900 px-4 py-2 rounded hover:bg-gray-300 flex-1" onClick={() => setShowClearConfirm(true)}>Clear Cart</button>
            <button className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 flex-1" onClick={goToCartPage}>View Full Cart</button>
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
    </>
  );

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 z-50"
      style={{}}
      onClick={onClose}
    >
      {/* Mobile modal (block md:hidden) */}
      <div
        className="absolute block md:hidden top-20 left-1/2 -translate-x-1/2 w-[95vw] max-w-xs bg-white rounded-lg shadow-lg p-6 relative mx-2"
        style={{ minWidth: '240px' }}
        onClick={e => e.stopPropagation()}
      >
        {modalContent()}
      </div>
      {/* Desktop modal (hidden md:block) */}
      <div
        className="absolute hidden md:block top-16 right-8 w-96 max-w-md bg-white rounded-lg shadow-lg p-6"
        style={{ minWidth: '240px' }}
        onClick={e => e.stopPropagation()}
      >
        {modalContent()}
      </div>
    </div>
  );
};

export default CartModal; 