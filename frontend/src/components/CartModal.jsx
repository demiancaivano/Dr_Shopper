import React from 'react';

const CartModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="cart-modal-overlay" onClick={onClose}>
      <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cart-modal-header">
          <h2>Mi Carrito</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="cart-modal-content">
          <p>Aquí irán los productos del carrito</p>
          <button className="view-cart-button">Ver carrito completo</button>
        </div>
      </div>
    </div>
  );
};

export default CartModal; 