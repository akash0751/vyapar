import React, { createContext, useReducer, useContext } from "react";

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_TO_CART":
      const existingItem = state.find(item => item.id === action.product.id);
      if (existingItem) {
        return state.map(item =>
          item.id === action.product.id
            ? { ...item, quantity: item.quantity + action.product.quantity }
            : item
        );
      } else {
        return [...state, action.product];
      }
    case "INCREASE_QUANTITY":
      return state.map(item =>
        item.id === action.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    case "DECREASE_QUANTITY":
      return state.map(item =>
        item.id === action.id
          ? { ...item, quantity: item.quantity - 1 > 0 ? item.quantity - 1 : 1 }
          : item
      );
    case "REMOVE_FROM_CART":
      return state.filter(item => item.id !== action.id);
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, []);

  const addToCart = product => {
    dispatch({ type: "ADD_TO_CART", product });
  };

  const increaseQuantity = id => {
    dispatch({ type: "INCREASE_QUANTITY", id });
  };

  const decreaseQuantity = id => {
    dispatch({ type: "DECREASE_QUANTITY", id });
  };

  const removeFromCart = id => {
    dispatch({ type: "REMOVE_FROM_CART", id });
  };

  return (
    <CartContext.Provider value={{ cart: state, addToCart, increaseQuantity, decreaseQuantity, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
