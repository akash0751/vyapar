import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { FaSearch, FaShoppingCart, FaBell, FaUserCircle, FaHome } from "react-icons/fa";
import styles from "./Cart.module.css";
import axiosInstance from "../utils/axiosInstance";


const Cart = () => {
  const { increaseQuantity, decreaseQuantity } = useCart();
  const navigate = useNavigate();
  const [items, setCartItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // 🔍 search state
  const api = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        const response = await axiosInstance.get(`${api}/api/cart`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setCartItems(response.data.items);
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    };
    fetchCartItems();
  }, []);

  const calculateTotal = () => {
    return filteredItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const handleCheckout = () => {
    alert("Proceeding to checkout!");
  };

  const handlePurchaseMore = () => {
    navigate("/");
  };

  const handleRemoveFromCart = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.delete(`${api}/api/remove/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const response = await axiosInstance.get(`${api}/api/cart`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setCartItems(response.data.items);
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  // 🔍 Filtered items based on search query
  const filteredItems = searchQuery
    ? items.filter(item =>
        item.product?.title?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : items;

  return (
    <div className={styles.container}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">Vyapar</div>
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
                  <p>Price: ₹{(item.product.price * item.quantity).toFixed(2)}</p>
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
                    onClick={() => handleRemoveFromCart(item.product._id)}
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
          <button onClick={handlePurchaseMore} className={styles.purchaseMoreBtn}>
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
