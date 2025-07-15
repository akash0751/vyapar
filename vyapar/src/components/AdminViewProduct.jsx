import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { FaSearch, FaSignOutAlt } from "react-icons/fa";
import '../styles/AdminViewProduct.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import adminAxiosInstance from '../utils/adminAxiosInstance';

const AdminViewProduct = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);
  const [editedProduct, setEditedProduct] = useState({
    title: '', description: '', price: '', offerDescription: '', category: '',
    image: null,
    shopStocks: [],
  });

  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const modalRef = useRef(null);
  const api = import.meta.env.VITE_API_URL;

  const showToast = (message, type = "success") => {
    setToastMessage(message);
    type === "success" ? setShowSuccessToast(true) : setShowErrorToast(true);
    setTimeout(() => {
      type === "success" ? setShowSuccessToast(false) : setShowErrorToast(false);
    }, 2000);
  };

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      showToast("Access denied. Please log in as admin.", "error");
      navigate("/");
      return;
    }
    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== "admin") {
        showToast("Access denied. Admins only.", "error");
        navigate("/");
        return;
      }
      fetchProducts(token);
    } catch {
      showToast("Access denied. Invalid token.", "error");
      navigate("/");
    }
  }, [navigate]);

  const fetchProducts = async (token) => {
    try {
      const res = await adminAxiosInstance.get(`${api}/api/products`, {
        headers: { "authorization": `Bearer ${token}` }
      });
      setProducts(res.data.product);
    } catch (error) {
      console.error("Error fetching products", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/adminloginpage");
  };

  const handleEditClick = async (product) => {
    setEditedProduct({ ...product, image: null });
    setEditingProductId(product._id);
    const bootstrap = await import('bootstrap/dist/js/bootstrap.bundle.min.js');
    const modal = new bootstrap.Modal(modalRef.current);
    modal.show();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleStockChange = (index, field, value) => {
    const updatedStocks = [...editedProduct.shopStocks];
    updatedStocks[index][field] = value;
    setEditedProduct((prev) => ({ ...prev, shopStocks: updatedStocks }));
  };

  const handleFileChange = (e) => {
    setEditedProduct((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSaveClick = async () => {
    const token = localStorage.getItem("adminToken");
    try {
      const formData = new FormData();
      Object.entries(editedProduct).forEach(([key, value]) => {
        if (key === 'shopStocks') {
          formData.append('shopStocks', JSON.stringify(value));
        } else if (value !== null) {
          formData.append(key, value);
        }
      });

      await adminAxiosInstance.put(`${api}/api/updateProduct/${editingProductId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          "authorization": `Bearer ${token}`
        }
      });

      setEditingProductId(null);
      setEditedProduct({
        title: '', description: '', price: '', offerDescription: '', category: '', image: null, shopStocks: []
      });

      const bootstrap = await import('bootstrap/dist/js/bootstrap.bundle.min.js');
      const modal = bootstrap.Modal.getInstance(modalRef.current);
      modal.hide();

      fetchProducts(token);
      showToast("Product updated successfully!");
    } catch (error) {
      console.error("Error updating product", error);
      showToast("Failed to update product", "error");
    }
  };

  const handleCancelClick = async () => {
    setEditingProductId(null);
    const bootstrap = await import('bootstrap/dist/js/bootstrap.bundle.min.js');
    const modal = bootstrap.Modal.getInstance(modalRef.current);
    modal.hide();
  };

  const handleDeleteClick = async (id) => {
    const token = localStorage.getItem("adminToken");
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await adminAxiosInstance.delete(`${api}/api/deleteProduct/${id}`, {
        headers: { "authorization": `Bearer ${token}` }
      });
      fetchProducts(token);
      showToast("Product deleted!");
    } catch (error) {
      console.error("Error deleting product", error);
      showToast("Failed to delete product", "error");
    }
  };

  return (
    <div className="home-container">
      {showSuccessToast && <div className="success-toast">{toastMessage}</div>}
      {showErrorToast && <div className="error-toast">{toastMessage}</div>}

      <header>
        <nav className="navbar">
          <div className="navbar-brand">CORE FOUR / Admin</div>
          <div className="navbar-search">
            <input type="text" placeholder="Search..." className="search-input" />
            <FaSearch className="search-icon" />
          </div>
          <div className="navbar-icons">
            <FaSignOutAlt onClick={handleLogout} className="logout-icon" title="Logout" />
          </div>
        </nav>
      </header>

      <main>
        <aside className="sidebar">
          <ul>
            <li><Link to="/adminproduct">Add products</Link></li>
            <li><Link to="/adminview">View product</Link></li>
          </ul>
        </aside>

        <section className="content">
          <h2>View Products</h2>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Price</th>
                <th>Offer</th>
                <th>Stock (All Shops)</th>
                <th>Category</th>
                <th>Image</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>{product.title}</td>
                  <td>{product.description}</td>
                  <td>{product.price}</td>
                  <td>{product.offerDescription}</td>
                  <td>
                    {product.shopStocks && product.shopStocks.length > 0 ? (
                      <ul className="stock-list">
                        {product.shopStocks.map((stock, index) => (
                          <li key={index}>
                            {stock.shopName}: {stock.quantity} {stock.unit}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>{product.category}</td>
                  <td><img src={`${api}/uploads/${product.image}`} alt={product.title} width="50" /></td>
                  <td>
                    <button onClick={() => handleEditClick(product)}>Edit</button>
                    <button onClick={() => handleDeleteClick(product._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>

      {/* Edit Modal */}
      <div className="modal fade" ref={modalRef} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">Edit Product</h5>
              <button type="button" className="btn-close" onClick={handleCancelClick}></button>
            </div>
            <div className="modal-body">
              <form>
                <label>Title: <input className="form-control" name="title" value={editedProduct.title} onChange={handleInputChange} /></label>
                <label>Description: <input className="form-control" name="description" value={editedProduct.description} onChange={handleInputChange} /></label>
                <label>Price: <input className="form-control" type="number" name="price" value={editedProduct.price} onChange={handleInputChange} /></label>
                <label>Offer: <input className="form-control" name="offerDescription" value={editedProduct.offerDescription} onChange={handleInputChange} /></label>
                <label>Category: <input className="form-control" name="category" value={editedProduct.category} onChange={handleInputChange} /></label>
                <label>Image: <input className="form-control" type="file" onChange={handleFileChange} /></label>

                <h6 className="mt-3">Shop Stocks</h6>
                {editedProduct.shopStocks?.map((stock, index) => (
                  <div key={index} className="row mb-2">
                    <div className="col">
                      <input
                        className="form-control"
                        placeholder="Shop Name"
                        value={stock.shopName}
                        onChange={(e) => handleStockChange(index, 'shopName', e.target.value)}
                      />
                    </div>
                    <div className="col">
                      <input
                        className="form-control"
                        type="number"
                        placeholder="Quantity"
                        value={stock.quantity}
                        onChange={(e) => handleStockChange(index, 'quantity', e.target.value)}
                      />
                    </div>
                    <div className="col">
                      <input
                        className="form-control"
                        placeholder="Unit"
                        value={stock.unit}
                        onChange={(e) => handleStockChange(index, 'unit', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-success" onClick={handleSaveClick}>Save</button>
              <button className="btn btn-secondary" onClick={handleCancelClick}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminViewProduct;
