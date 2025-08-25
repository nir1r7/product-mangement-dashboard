import React, { useState, useEffect } from 'react';
import SearchBar from '../../ui/SearchBar';
import RichTextEditor from '../../ui/RichTextEditor';
import './ProductDashboard.css';

const ProductDashboard = ({ token }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingRowId, setEditingRowId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        description: '',
        category: '',
        stock: '',
        images: []
    });
    const [editFormData, setEditFormData] = useState({});

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/products?limit=1000');
            if (!response.ok) throw new Error('Failed to fetch products');
            const data = await response.json();
            setProducts(data.products || data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setNewProduct(prev => ({
            ...prev,
            images: [...prev.images, ...files]
        }));
        // Clear the input so the same file can be selected again if needed
        e.target.value = '';
    };

    const removeFile = (index) => {
        setNewProduct(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const clearFileInput = () => {
        const fileInput = document.getElementById('new-product-images');
        if (fileInput) fileInput.value = '';
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddProduct = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('name', newProduct.name);
        formData.append('price', newProduct.price);
        formData.append('description', newProduct.description);
        formData.append('category', newProduct.category);
        formData.append('stock', newProduct.stock);
        
        newProduct.images.forEach(file => {
            formData.append('images', file);
        });

        try {
            const response = await fetch('http://localhost:5000/api/products', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Failed to add product');

            await fetchProducts();
            setNewProduct({
                name: '',
                price: '',
                description: '',
                category: '',
                stock: '',
                images: []
            });
            clearFileInput();
        } catch (error) {
            console.error('Error adding product:', error);
            alert('Failed to add product');
        }
    };

    const handleEditClick = (product) => {
        setEditingRowId(product._id);
        setEditFormData({
            name: product.name,
            price: product.price,
            description: product.description,
            category: product.category,
            stock: product.stock,
            images: product.images || [],
            newImages: []
        });
    };

    const handleEditFileChange = (e) => {
        const files = Array.from(e.target.files);
        setEditFormData(prev => ({
            ...prev,
            newImages: [...(prev.newImages || []), ...files]
        }));
        // Clear the input so the same file can be selected again if needed
        e.target.value = '';
    };

    const removeExistingImage = (url) => {
        setEditFormData(prev => ({
            ...prev,
            images: prev.images.filter(img => img !== url)
        }));
    };

    const removeNewImage = (index) => {
        setEditFormData(prev => ({
            ...prev,
            newImages: prev.newImages.filter((_, i) => i !== index)
        }));
    };

    const handleSaveEdit = async (productId) => {
        const formData = new FormData();
        formData.append('name', editFormData.name);
        formData.append('price', editFormData.price);
        formData.append('description', editFormData.description);
        formData.append('category', editFormData.category);
        formData.append('stock', editFormData.stock);
        formData.append('images', JSON.stringify(editFormData.images));
        
        editFormData.newImages.forEach(file => {
            formData.append('images', file);
        });

        try {
            const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Failed to update product');

            await fetchProducts();
            setEditingRowId(null);
            setEditFormData({});
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Failed to update product');
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete product');

            await fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product');
        }
    };

    if (loading) {
        return (
            <div className="product-dashboard-container">
                <div className="loading-container">
                    <div className="loading"></div>
                    <p>Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="product-dashboard-container">
            <h1 className="product-dashboard-title">Product Management</h1>

            <div className="product-dashboard-content">
                <div className="add-product-section">
                    <div className="add-product-header">
                        <h2>Add New Product</h2>
                        <button
                            type="button"
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="toggle-form-btn"
                        >
                            {showAddForm ? '▲ Hide Form' : '▼ Show Form'}
                        </button>
                    </div>

                    {showAddForm && (
                        <form onSubmit={handleAddProduct} className="add-product-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="name" className="form-label">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={newProduct.name}
                                    onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                                    className="form-input"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="price" className="form-label">Price</label>
                                <input
                                    type="number"
                                    id="price"
                                    value={newProduct.price}
                                    onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                                    className="form-input"
                                    step="0.01"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="description" className="form-label">Description</label>
                            <RichTextEditor
                                value={newProduct.description}
                                onChange={(value) => setNewProduct(prev => ({ ...prev, description: value }))}
                                placeholder="Enter product description..."
                            />
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="category" className="form-label">Category</label>
                                <input
                                    type="text"
                                    id="category"
                                    value={newProduct.category}
                                    onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                                    className="form-input"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="stock" className="form-label">Stock</label>
                                <input
                                    type="number"
                                    id="stock"
                                    value={newProduct.stock}
                                    onChange={(e) => setNewProduct(prev => ({ ...prev, stock: e.target.value }))}
                                    className="form-input"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="new-product-images" className="form-label">Images</label>
                            <input
                                type="file"
                                id="new-product-images"
                                multiple
                                accept="image/*"
                                onChange={handleFileChange}
                                className="form-input"
                            />
                            {newProduct.images.length > 0 && (
                                <div className="file-list">
                                    {newProduct.images.map((file, index) => (
                                        <div key={index} className="file-item">
                                            <span className="file-name">{file.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeFile(index)}
                                                className="file-remove"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <button type="submit" className="btn btn-primary">Add Product</button>
                        </form>
                    )}
                </div>

                {/* Search Bar */}
                <div className="search-section">
                    <SearchBar
                        onSearch={handleSearch}
                        placeholder="Search products by name, description, or category..."
                        value={searchQuery}
                    />
                    {searchQuery && (
                        <div className="search-results-info">
                            <p>Showing {filteredProducts.length} of {products.length} products</p>
                        </div>
                    )}
                </div>

                <div className="products-table-section">
                    <h2>Existing Products</h2>
                    <div className="products-table-container">
                        <table className="products-table">
                            <thead>
                                <tr>
                                    <th>Images</th>
                                    <th>Name</th>
                                    <th>Price</th>
                                    <th>Category</th>
                                    <th>Stock</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map(product => (
                                    <tr key={product._id}>
                                        <td>
                                            {editingRowId === product._id ? (
                                                <div className="edit-images">
                                                    {editFormData.images && editFormData.images.length > 0 && (
                                                        editFormData.images.map((url, i) => (
                                                            <div key={i} className="edit-image-item">
                                                                <img src={`http://localhost:5000${url}`} alt={product.name} width="50" />
                                                                <button type="button" onClick={() => removeExistingImage(url)} className="image-remove">×</button>
                                                            </div>
                                                        ))
                                                    )}
                                                    <input type="file" multiple accept="image/*" onChange={handleEditFileChange} className="edit-file-input" />
                                                    {editFormData.newImages && editFormData.newImages.length > 0 && (
                                                        <div className="new-files-list">
                                                            {editFormData.newImages.map((file, index) => (
                                                                <div key={index} className="file-item">
                                                                    <span className="file-name">{file.name}</span>
                                                                    <button type="button" onClick={() => removeNewImage(index)} className="file-remove">×</button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="product-images">
                                                    {product.images && product.images.length > 0 && (
                                                        product.images.map((url, i) => (
                                                            <img key={i} src={`http://localhost:5000${url}`} alt={product.name} width="50" style={{ marginRight: '4px' }} />
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            {editingRowId === product._id ? (
                                                <input
                                                    type="text"
                                                    value={editFormData.name}
                                                    onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                                                    className="form-input"
                                                />
                                            ) : (
                                                product.name
                                            )}
                                        </td>
                                        <td>
                                            {editingRowId === product._id ? (
                                                <input
                                                    type="number"
                                                    value={editFormData.price}
                                                    onChange={(e) => setEditFormData(prev => ({ ...prev, price: e.target.value }))}
                                                    className="form-input"
                                                    step="0.01"
                                                />
                                            ) : (
                                                `$${product.price}`
                                            )}
                                        </td>
                                        <td>
                                            {editingRowId === product._id ? (
                                                <input
                                                    type="text"
                                                    value={editFormData.category}
                                                    onChange={(e) => setEditFormData(prev => ({ ...prev, category: e.target.value }))}
                                                    className="form-input"
                                                />
                                            ) : (
                                                product.category
                                            )}
                                        </td>
                                        <td>
                                            {editingRowId === product._id ? (
                                                <input
                                                    type="number"
                                                    value={editFormData.stock}
                                                    onChange={(e) => setEditFormData(prev => ({ ...prev, stock: e.target.value }))}
                                                    className="form-input"
                                                />
                                            ) : (
                                                product.stock
                                            )}
                                        </td>
                                        <td>
                                            {editingRowId === product._id ? (
                                                <div className="action-buttons">
                                                    <button onClick={() => handleSaveEdit(product._id)} className="btn btn-success">Save</button>
                                                    <button onClick={() => setEditingRowId(null)} className="btn btn-secondary">Cancel</button>
                                                </div>
                                            ) : (
                                                <div className="action-buttons">
                                                    <button onClick={() => handleEditClick(product)} className="btn btn-secondary">Edit</button>
                                                    <button onClick={() => handleDeleteProduct(product._id)} className="btn btn-danger">Delete</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDashboard;
