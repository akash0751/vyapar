import { FaUserCircle, FaShoppingCart, FaBell, FaHome } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import axiosInstance from "../utils/axiosInstance";

const PRODUCTS_PER_PAGE = 8;

const Home = () => {
  const [category, setCategory] = useState("fruits");
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const navigate = useNavigate();
  const token = localStorage.getItem("token") || localStorage.getItem("authToken");
  const api = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axiosInstance.get(`${api}/api/products`);
        setProducts(res.data.product);
      } catch (error) {
        console.error("Error fetching products", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleProductClick = (id) => navigate(`/product/${id}`);
  const handleCartClick = () => navigate("/cart");
  const handleProfileClick = () => navigate(token ? "/profile" : "/login");

  const productsByCategory = products.reduce((acc, product) => {
    const cat = product.category?.toLowerCase() || "others";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(product);
    return acc;
  }, {});

  const allFiltered = searchQuery
    ? products.filter((product) =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : productsByCategory[category] || [];

  const startIdx = (page - 1) * PRODUCTS_PER_PAGE;
  const paginatedProducts = allFiltered.slice(startIdx, startIdx + PRODUCTS_PER_PAGE);
  const hasMore = startIdx + PRODUCTS_PER_PAGE < allFiltered.length;

  const handleNext = () => setPage((prev) => prev + 1);
  const handlePrev = () => setPage((prev) => (prev > 1 ? prev - 1 : 1));

  // Reset page on search/category change
  useEffect(() => {
    setPage(1);
  }, [category, searchQuery]);

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

      {/* Category Buttons */}
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

      {!searchQuery && (
        <h2 className="category-heading">
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </h2>
      )}

      {/* Loading Spinner */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      ) : (
        <div className="product-section">
          <div className="product-grid">
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((product) => (
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

          {/* Pagination Controls */}
          {allFiltered.length > PRODUCTS_PER_PAGE && (
            <div className="pagination-controls">
              <button
                className="btn btn-outline-secondary me-2"
                disabled={page === 1}
                onClick={handlePrev}
              >
                Previous
              </button>
              <button
                className="btn btn-outline-primary"
                disabled={!hasMore}
                onClick={handleNext}
              >
                Load More
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
