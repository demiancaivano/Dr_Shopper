import React, { createContext, useReducer, useEffect, useCallback } from "react";
import { useRef } from "react";

const CartContext = createContext();

const initialState = {
  items: [], // { productId, name, price, image_url, quantity, stock, ... }
  total: 0,
  loading: false,
  error: null,
};

function cartReducer(state, action) {
  switch (action.type) {
    case "SET_CART":
      return { ...state, items: action.payload.items, total: action.payload.total, loading: false, error: null };
    case "ADD_ITEM": {
      const exists = state.items.find(i => i.productId === action.payload.productId);
      let items;
      if (exists) {
        items = state.items.map(i =>
          i.productId === action.payload.productId
            ? { ...i, quantity: Math.min(i.quantity + action.payload.quantity, i.stock) }
            : i
        );
      } else {
        items = [...state.items, { ...action.payload, quantity: Math.min(action.payload.quantity, action.payload.stock) }];
      }
      return { ...state, items, total: calcTotal(items), loading: false, error: null };
    }
    case "REMOVE_ITEM": {
      const items = state.items.filter(i => i.productId !== action.payload);
      return { ...state, items, total: calcTotal(items), loading: false, error: null };
    }
    case "UPDATE_QUANTITY": {
      const items = state.items.map(i =>
        i.productId === action.payload.productId
          ? { ...i, quantity: Math.max(1, Math.min(action.payload.quantity, i.stock)) }
          : i
      );
      return { ...state, items, total: calcTotal(items), loading: false, error: null };
    }
    case "CLEAR_CART":
      return { ...state, items: [], total: 0, loading: false, error: null };
    case "SET_LOADING":
      return { ...state, loading: true };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

function calcTotal(items) {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function CartProvider({ children, user }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const prevUserId = useRef(user?.id);
  const hasJustLoggedIn = useRef(false);

  // Detectar transición de no autenticado a autenticado y fusionar carritos
  useEffect(() => {
    if (!prevUserId.current && user?.id) {
      // El usuario acaba de loguearse
      hasJustLoggedIn.current = true;
      const localCart = localStorage.getItem("cart");
      if (localCart) {
        try {
          const parsed = JSON.parse(localCart);
          syncLocalCartWithBackend(parsed.items || []);
        } catch {
          fetchCartFromBackend();
        }
      } else {
        fetchCartFromBackend();
      }
    } else if (!user?.id) {
      // Usuario no autenticado: cargar carrito de localStorage
      const localCart = localStorage.getItem("cart");
      if (localCart) {
        try {
          const parsed = JSON.parse(localCart);
          dispatch({ type: "SET_CART", payload: { items: parsed.items || [], total: calcTotal(parsed.items || []) } });
        } catch {
          dispatch({ type: "SET_CART", payload: { items: [], total: 0 } });
        }
      } else {
        dispatch({ type: "SET_CART", payload: { items: [], total: 0 } });
      }
    } else if (user?.id && prevUserId.current === user.id && !hasJustLoggedIn.current) {
      // Usuario autenticado, no es un login nuevo: refrescar carrito del backend
      fetchCartFromBackend();
    }
    prevUserId.current = user?.id;
    // eslint-disable-next-line
  }, [user?.id]);

  // Guardar carrito en localStorage en cada cambio si no está autenticado
  useEffect(() => {
    if (!user?.id) {
      localStorage.setItem("cart", JSON.stringify({ items: state.items }));
    }
  }, [state.items, user?.id]);

  // Función para sincronizar carrito local con backend (fusión real)
  const syncLocalCartWithBackend = useCallback(async (localItems) => {
    if (!user?.id) {
      fetchCartFromBackend();
      return;
    }
    // 1. Obtener carrito actual del backend
    let backendItems = [];
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        backendItems = (data.items || []).map(item => ({
          productId: item.product_id,
          quantity: item.quantity,
          stock: item.product?.stock ?? 0
        }));
      }
    } catch {}
    // 2. Fusionar ambos carritos (sumar cantidades, sin superar stock)
    const merged = [...backendItems];
    for (const localItem of localItems) {
      const idx = merged.findIndex(i => i.productId === localItem.productId);
      if (idx !== -1) {
        // Sumar cantidades, sin superar el stock
        merged[idx].quantity = Math.min(
          (merged[idx].quantity || 0) + (localItem.quantity || 0),
          merged[idx].stock || localItem.stock || 99
        );
      } else {
        merged.push({
          productId: localItem.productId,
          quantity: localItem.quantity,
          stock: localItem.stock || 99
        });
      }
    }
    // 3. Limpiar el carrito del backend
    try {
      const token = localStorage.getItem("access_token");
      await fetch(`${import.meta.env.VITE_API_URL}/api/cart/clear`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
    // 4. Agregar todos los productos fusionados al backend
    for (const item of merged) {
      if (item.quantity > 0) {
        const token = localStorage.getItem("access_token");
        await fetch(`${import.meta.env.VITE_API_URL}/api/cart/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ product_id: item.productId, quantity: item.quantity }),
        });
      }
    }
    // 5. Limpiar carrito local y refrescar desde backend
    localStorage.removeItem("cart");
    hasJustLoggedIn.current = false;
    fetchCartFromBackend();
  }, [user?.id]);

  // Función para obtener carrito del backend
  const fetchCartFromBackend = useCallback(async () => {
    if (!user?.id) return;
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // Mapear los items para extraer los datos del producto
        const items = (data.items || []).map(item => ({
          id: item.id,
          productId: item.product_id,
          quantity: item.quantity,
          name: item.product?.name || '',
          price: item.product?.final_price ?? item.product?.price ?? 0,
          image_url: item.product?.image_url || '',
          stock: item.product?.stock ?? 0,
        }));
        dispatch({ type: "SET_CART", payload: { items, total: calcTotal(items) } });
      }
    } catch {}
  }, [user?.id]);

  // Acciones del carrito
  const addItem = async (item) => {
    dispatch({ type: "ADD_ITEM", payload: item });
    if (user?.id) {
      const token = localStorage.getItem("access_token");
      await fetch(`${import.meta.env.VITE_API_URL}/api/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: item.productId, quantity: item.quantity }),
      });
      fetchCartFromBackend();
    }
  };

  const removeItem = async (productId) => {
    dispatch({ type: "REMOVE_ITEM", payload: productId });
    if (user?.id) {
      const token = localStorage.getItem("access_token");
      // Buscar el item en el carrito actual para obtener su id
      const item = state.items.find(i => i.productId === productId);
      if (item && item.id) {
        await fetch(`${import.meta.env.VITE_API_URL}/api/cart/remove/${item.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchCartFromBackend();
      }
    }
  };

  const updateQuantity = async (productId, quantity) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity } });
    if (user?.id) {
      const token = localStorage.getItem("access_token");
      const item = state.items.find(i => i.productId === productId);
      if (item && item.id) {
        await fetch(`${import.meta.env.VITE_API_URL}/api/cart/update/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ quantity }),
        });
        fetchCartFromBackend();
      }
    }
  };

  const clearCart = async () => {
    dispatch({ type: "CLEAR_CART" });
    if (user?.id) {
      const token = localStorage.getItem("access_token");
      await fetch(`${import.meta.env.VITE_API_URL}/api/cart/clear`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCartFromBackend();
    }
  };

  return (
    <CartContext.Provider value={{ state, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export default CartContext; 