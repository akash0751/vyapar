import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import axios from "axios";
import { FaSearch, FaShoppingCart, FaBell, FaUserCircle, FaHome } from "react-icons/fa";
import "../styles/Product.css";

const Product = () => {
  const { id } = useParams(); // Get product ID from URL
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showMessage, setShowMessage] = useState(false);
  const [review, setReview] = useState("");
  const [question, setQuestion] = useState("");
  const [reviews, setReviews] = useState([]);
  const [questions, setQuestions] = useState([]);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const api = import.meta.env.VITE_API_URL // Backend URL

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${api}/api/product/${id}`);
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

  const handleIncrease = () => setQuantity((prev) => prev + 1);
  const handleDecrease = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token"); // Get token from localStorage
  
    if (!token) {
      console.error("No token found. Please login.");
      navigate("/login"); // Redirect to login if no token
      return;
    }
  
    try {
      const itemToAdd = {
        productId: product._id,
        quantity,
      };
  
      const response = await axios.post(`${api}/api/cart/add`, itemToAdd, {
        headers: {
          Authorization: `Bearer ${token}`, // Send token in Authorization header
        },
      });
  
      console.log("Item added to cart:", response.data);
      addToCart(response.data.cart.items); // Update the context/cart state
      setShowMessage(true); // Show success message
      setTimeout(() => setShowMessage(false), 2000); // Hide after 2 seconds
      navigate("/cart"); // Navigate to cart page
    } catch (error) {
      console.error("Error adding item to cart:", error.response ? error.response.data : error.message);
    }
  };
  
  
  

  const handleGoToCart = () => {
    navigate("/cart");
  };

  const handleSubmitReview = () => {
    if (review.trim()) {
      setReviews((prevReviews) => [...prevReviews, review]);
      setReview("");
    }
  };

  const handleSubmitQuestion = () => {
    if (question.trim()) {
      setQuestions((prevQuestions) => [...prevQuestions, question]);
      setQuestion("");
    }
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">Vyapar</div>
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

          <div className="options">
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min="1"
              className="quantity-input"
            />
            <p className="kg">kg</p>
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

          {showMessage && <div className="add-to-cart-message">Item added to cart!</div>}
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
            {reviews.map((reviewText, index) => (
              <div key={index} className="review-item">
                <p>{reviewText}</p>
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
            {questions.map((questionText, index) => (
              <div key={index} className="question-item">
                <p>{questionText}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="related-products">
          <h2>Viewers Also Liked</h2>
          {/* Related products will come here in future */}
          <div className="products"></div>
        </div>
      </div>
    </div>
  );
};

export default Product;

