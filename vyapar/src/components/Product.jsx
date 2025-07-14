import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import {
  FaSearch,
  FaShoppingCart,
  FaBell,
  FaUserCircle,
  FaHome,
} from "react-icons/fa";
import "../styles/Product.css";
import axiosInstance from "../utils/axiosInstance";

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedShopIndex, setSelectedShopIndex] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  const [review, setReview] = useState("");
  const [question, setQuestion] = useState("");
  const [reviews, setReviews] = useState([]);
  const [questions, setQuestions] = useState([]);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const api = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axiosInstance.get(`${api}/api/product/${id}`);
        setProduct(response.data.product);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product || !product.price || isNaN(product.price)) {
    return <div>Product data is invalid</div>;
  }

  const discountedPrice =
    (product.price && !isNaN(product.price) ? product.price : 0) *
    (1 - (product.discount && !isNaN(product.discount) ? product.discount / 100 : 0));

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const itemToAdd = {
        productId: product._id,
        quantity: 1, // fixed
      };

      const response = await axiosInstance.post(`${api}/api/cart/add`, itemToAdd, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      addToCart(response.data.cart.items);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 2000);
      navigate("/cart");
    } catch (error) {
      console.error(
        "Error adding item to cart:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleGoToCart = () => navigate("/cart");

  const handleSubmitReview = () => {
    if (review.trim()) {
      setReviews((prev) => [...prev, review]);
      setReview("");
    }
  };

  const handleSubmitQuestion = () => {
    if (question.trim()) {
      setQuestions((prev) => [...prev, question]);
      setQuestion("");
    }
  };

  const selectedStock = product?.shopStocks?.[selectedShopIndex];

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">CORE FOUR</div>
        <div className="navbar-icons">
          <FaHome onClick={() => navigate("/")} />
          <FaShoppingCart onClick={() => navigate("/cart")} />
          <FaBell />
          <FaUserCircle onClick={() => navigate("/profile")} />
        </div>
      </nav>

      <div className="container">
        <div className="product-image">
          <img
            src={`${api}/uploads/${product.image}`}
            alt={product.title}
            className="product-image"
          />
        </div>

        <div className="product-details">
          <h1>{product.title}</h1>
          <p className="price">₹{discountedPrice.toFixed(2)}</p>
          <p>{product.deliveryTime || "Delivery time not specified"}</p>
          <p>{product.description}</p>

          {/* Shop Stock Selection */}
          {product.shopStocks?.length > 0 && (
            <>
              <label>Select Shop</label>
              <select
                value={selectedShopIndex}
                onChange={(e) => setSelectedShopIndex(Number(e.target.value))}
                className="shop-selector"
              >
                {product.shopStocks.map((stock, index) => (
                  <option key={index} value={index}>
                    {stock.shopName} - {stock.quantity} {stock.unit}
                  </option>
                ))}
              </select>
            </>
          )}

          <div className="options">
            <p className="unit-display">Quantity: 1 {selectedStock?.unit}</p>
            <div className="cart-button">
              <button onClick={handleAddToCart} className="add-to-cart-btn">
                Add to Cart
              </button>
            </div>
          </div>

          <div className="buttons">
            <button onClick={handleGoToCart} className="buy-now-btn">
              Buy Now
            </button>
          </div>

          {showMessage && (
            <div className="add-to-cart-message">Item added to cart!</div>
          )}
        </div>

        <div className="additional-info">
          <h2>Description</h2>
          <p>{product.description}</p>
        </div>

        <div className="reviews">
          <h2>Reviews ({reviews.length})</h2>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Write your review here..."
            className="review-input"
          ></textarea>
          <button onClick={handleSubmitReview} className="submit-button">
            Submit Review
          </button>

          <div className="review-list">
            {reviews.map((text, index) => (
              <div key={index} className="review-item">
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="qna">
          <h2>Q & A ({questions.length})</h2>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask your question here..."
            className="question-input"
          ></textarea>
          <button onClick={handleSubmitQuestion} className="submit-button">
            Submit Question
          </button>

          <div className="question-list">
            {questions.map((text, index) => (
              <div key={index} className="question-item">
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="related-products">
          <h2>Viewers Also Liked</h2>
          <div className="products"></div>
        </div>
      </div>
    </div>
  );
};

export default Product;
