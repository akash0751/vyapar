import { FaUserCircle, FaShoppingCart, FaBell, FaHome } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/Home.css';
import axiosInstance from "../utils/axiosInstance";

const Home = () => {
  const [category, setCategory] = useState("fruits");
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // 🔍 Search input state

  const navigate = useNavigate();
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  const api = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axiosInstance.get(`${api}/api/products`);
        console.log(res.data.product);
        setProducts(res.data.product);
      } catch (error) {
        console.error("Error fetching products", error);
      }
    };

    fetchProducts();
  }, []);

  const handleProductClick = (id) => {
    navigate(`/product/${id}`);
  };

  const handleCartClick = () => {
    navigate("/cart");
  };

  const handleProfileClick = () => {
    if (token) {
      navigate("/profile");
    } else {
      navigate("/login");
    }
  };

  // Group products by category
  const productsByCategory = products.reduce((acc, product) => {
    const cat = product.category?.toLowerCase() || "others";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(product);
    return acc;
  }, {});

  // Filter products based on search
  const filteredProducts = searchQuery
    ? products.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : productsByCategory[category] || [];

  return (
    <div className="home-container">
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
          <FaShoppingCart onClick={handleCartClick} />
          <FaBell />
          {token ? (
            <FaUserCircle onClick={handleProfileClick} />
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="btn btn-outline-primary btn-sm"
            >
              Login
            </button>
          )}
        </div>
      </nav>

      {/* Banner */}
      <div className="banner">
        <div className="banner-content">
          <h1 className="banner-title">From farm to your kitchen</h1>
          <p className="banner-subtitle">
            Discover the freshest and finest groceries delivered quickly and conveniently.
          </p>
          <button className="shop-now-button">Shop Now</button>
        </div>
      </div>

      {/* Category Buttons - hide if searching */}
      {!searchQuery && (
        <div className="category-buttons">
          {["fruits", "vegetables", "greens", "grocery"].map((cat) => (
            <button
              key={cat}
              className={`category-btn ${category === cat ? "active" : ""}`}
              onClick={() => setCategory(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Category Title - show only if not searching */}
      {!searchQuery && (
        <h2 className="category-heading">
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </h2>
      )}

      {/* Products */}
      <div className="product-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div
              key={product._id}
              className="product-card"
              onClick={() => handleProductClick(product._id)}
            >
              <div className="product-discount">Limited Offer</div>
              <img
                src={`${api}/uploads/${product.image}`}
                alt={product.title}
                style={{ width: "150px", height: "150px", objectFit: "cover" }}
              />
              <div className="product-info">
                <h3 className="product-name">{product.title}</h3>
                <p className="product-price">₹{product.price.toFixed(2)}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="no-products">No products available</p>
        )}
      </div>
    </div>
  );
};

export default Home;
