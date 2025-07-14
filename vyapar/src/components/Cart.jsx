import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaShoppingCart,
  FaBell,
  FaUserCircle,
  FaHome,
} from "react-icons/fa";
import styles from "./Cart.module.css";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    fetchCartItemsFromAPI,
  } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const api = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchCartItemsFromAPI();
  }, []);

  const filteredItems = searchQuery
    ? cart.filter((item) =>
        item.product?.title
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    : cart;

  const calculateTotal = () => {
    return filteredItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const handleCheckout = () => {
    alert("Proceeding to checkout!");
  };

  const handlePurchaseMore = () => {
    navigate("/");
  };

  return (
    <div className={styles.container}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">CORE FOUR</div>
        <div className="navbar-search">
          <input
            type="text"
            placeholder="Search for grocery, vegetables, spices..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="navbar-icons">
          <FaHome onClick={() => navigate("/")} />
          <FaShoppingCart onClick={() => navigate("/cart")} />
          <FaBell />
          <FaUserCircle onClick={() => navigate("/profile")} />
        </div>
      </nav>

      <div className={styles.cartItems}>
        <h1>Your Cart</h1>
        {filteredItems.length > 0 ? (
          filteredItems.map((item, index) => {
            if (!item.product) return null;

            return (
              <div key={item.product._id || index} className={styles.cartItem}>
                <img
                  src={`${api}/uploads/${item.product.image}`}
                  alt={item.product.title}
                  className={styles.cartItemImage}
                />
                <div className={styles.cartItemDetails}>
                  <h3>{item.product.title}</h3>
                  <p>Quantity: {item.quantity} Kg</p>
                  <p>
                    Price: ₹{(item.product.price * item.quantity).toFixed(2)}
                  </p>
                  <div className={styles.quantityControls}>
                    <button
                      onClick={() => decreaseQuantity(item.product._id)}
                      className={styles.quantityBtn}
                    >
                      -
                    </button>
                    <button
                      onClick={() => increaseQuantity(item.product._id)}
                      className={styles.quantityBtn}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product._id)}
                    className={styles.removeBtn}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p className={styles.emptyCart}>No items match your search.</p>
        )}
      </div>

      {/* Cart Total */}
      {filteredItems.length > 0 && (
        <div className={styles.cartTotals}>
          <h2>Cart totals</h2>
          <p>Subtotal: ₹{calculateTotal().toFixed(2)}</p>
          <p>Shipping: ₹8.00</p>
          <p>Tax: ₹0.72</p>
          <p>Total: ₹{(calculateTotal() + 8.0 + 0.72).toFixed(2)}</p>
          <button
            onClick={handlePurchaseMore}
            className={styles.purchaseMoreBtn}
          >
            Purchase More
          </button>
          <button onClick={handleCheckout} className={styles.checkoutBtn}>
            Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
