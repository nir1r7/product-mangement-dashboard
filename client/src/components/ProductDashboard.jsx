import React, { useState, useEffect, useMemo } from 'react';
import SearchBar from './SearchBar';

function ProductDashboard({ token }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingRowId, setEditingRowId] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        description: '',
        category: '',
        stock: '',
        images: []
    });
    const [message, setMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/products');
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            const data = await response.json();
            setProducts(data.products || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            setMessage('Error fetching products.');
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct({ ...newProduct, [name]: value });
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setNewProduct((prev) => ({
            ...prev,
            images: [...prev.images, ...files]
        }));
    };

    const removeFile = (index) => {
        setNewProduct((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const clearFileInput = () => {
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleAddProduct = async () => {
        const formData = new FormData();

        for (const key in newProduct) {
            if (key === 'images' && newProduct.images.length > 0) {
                newProduct.images.forEach((file) => {
                    formData.append('images', file);
                });
            } else {
                formData.append(key, newProduct[key]);
            }
        }

        try {
            const response = await fetch('http://localhost:5000/api/products', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                const addedProduct = await response.json();
                setProducts(prev => [...prev, addedProduct]);
                setNewProduct({
                    name: '',
                    price: '',
                    description: '',
                    category: '',
                    stock: '',
                    images: []
                });
                clearFileInput();
                setMessage('Product added successfully!');
            } else {
                const errorData = await response.json();
                setMessage(`Failed to add product: ${errorData.message}`);
            }
        } catch (err) {
            console.error(err);
            setMessage('An error occurred while adding product.');
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            const response = await fetch(`http://localhost:5000/api/products/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setProducts(prev => prev.filter(p => p._id !== id));
                setMessage('Product deleted successfully.');
            } else {
                setMessage('Failed to delete product.');
            }
        } catch (err) {
            console.error(err);
            setMessage('An error occurred while deleting product.');
        }
    };

    const handleEditClick = (product) => {
        setEditingRowId(product._id);
        setEditFormData({ ...product });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData({ ...editFormData, [name]: value });
    };

    const handleEditFileChange = (e) => {
        const files = Array.from(e.target.files);
        setEditFormData((prev) => ({
            ...prev,
            newImages: [...(prev.newImages || []), ...files]
        }));
    };

    const removeExistingImage = (imageUrl) => {
        setEditFormData((prev) => ({
            ...prev,
            images: prev.images.filter(img => img !== imageUrl)
        }));
    };

    const removeNewImage = (index) => {
        setEditFormData((prev) => ({
            ...prev,
            newImages: prev.newImages.filter((_, i) => i !== index)
        }));
    };

    const handleSaveEdit = async (id) => {
        try {
            const formData = new FormData();
            
            formData.append('name', editFormData.name);
            formData.append('price', editFormData.price);
            formData.append('description', editFormData.description);
            formData.append('category', editFormData.category);
            formData.append('stock', editFormData.stock);
            
            if (editFormData.images) {
                formData.append('images', JSON.stringify(editFormData.images));
            }
            
            if (editFormData.newImages && editFormData.newImages.length > 0) {
                editFormData.newImages.forEach((file) => {
                    formData.append('images', file);
                });
            }

            const response = await fetch(`http://localhost:5000/api/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                const updatedProduct = await response.json();
                setProducts(prev => prev.map(p => p._id === id ? updatedProduct : p));
                setMessage('Product updated successfully.');
                setEditingRowId(null);
            } else {
                const errorData = await response.json();
                setMessage(`Failed to update: ${errorData.message}`);
            }
        } catch (err) {
            console.error(err);
            setMessage('An error occurred while updating product.');
        }
    };

    const filteredProducts = useMemo(() => {
        const term = (searchTerm || '').trim().toLowerCase();
        if (!term) return products;

        return products.filter((p) => {
            const fields = [
                p.name,
                p.description,
                p.category,
                String(p.price ?? ''),
                String(p.stock ?? '')
            ];
            return fields.some(f =>
                String(f || '').toLowerCase().includes(term)
            );
        });
    }, [products, searchTerm]);

    if (loading) {
        return <div>Loading products...</div>;
    }

    return (
        <div>
            <h2>Product Management</h2>

            <div style={{ marginBottom: '12px', maxWidth: 480 }}>
                <SearchBar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    placeholder="Search by name, description, category, price…"
                />
            </div>

            {message && <p>{message}</p>}

            <table border="1" cellPadding="10" width="100%">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th style={{ minWidth: 180 }}>Name</th>
                        <th>Description</th>
                        <th style={{ minWidth: 100 }}>Price</th>
                        <th style={{ minWidth: 140 }}>Category</th>
                        <th style={{ minWidth: 90 }}>Stock</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    <tr>
                        <td>
                            <input 
                                type="file" 
                                multiple 
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{
                                    padding: '8px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            />
                            {newProduct.images.length > 0 && (
                                <div style={{ marginTop: '8px' }}>
                                    {newProduct.images.map((file, index) => (
                                        <div key={index} style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            marginBottom: '4px',
                                            fontSize: '12px'
                                        }}>
                                            <span style={{ flex: 1, color: '#666' }}>
                                                {file.name}
                                            </span>
                                            <button 
                                                type="button"
                                                onClick={() => removeFile(index)}
                                                style={{
                                                    background: '#ff4444',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '20px',
                                                    height: '20px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    marginLeft: '8px'
                                                }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </td>
                        <td>
                            <input
                                type="text"
                                name="name"
                                placeholder="Name"
                                value={newProduct.name}
                                onChange={handleInputChange}
                            />
                        </td>
                        <td>
                            <input
                                type="text"
                                name="description"
                                placeholder="Description"
                                value={newProduct.description}
                                onChange={handleInputChange}
                            />
                        </td>
                        <td>
                            <input
                                type="number"
                                name="price"
                                placeholder="Price"
                                value={newProduct.price}
                                onChange={handleInputChange}
                            />
                        </td>
                        <td>
                            <input
                                type="text"
                                name="category"
                                placeholder="Category"
                                value={newProduct.category}
                                onChange={handleInputChange}
                            />
                        </td>
                        <td>
                            <input
                                type="number"
                                name="stock"
                                placeholder="Stock"
                                value={newProduct.stock}
                                onChange={handleInputChange}
                            />
                        </td>
                        <td>
                            <button onClick={handleAddProduct}>Add</button>
                        </td>
                    </tr>

                    {filteredProducts.map(product => (
                        <tr key={product._id}>
                            <td>
                                {editingRowId === product._id ? (
                                    <div>
                                        {editFormData.images && editFormData.images.length > 0 && (
                                            editFormData.images.map((url, i) => (
                                                <div key={i} style={{ 
                                                    position: 'relative', 
                                                    display: 'inline-block',
                                                    marginRight: '4px',
                                                    marginBottom: '4px'
                                                }}>
                                                    <img
                                                        src={`http://localhost:5000${url}`}
                                                        alt={product.name}
                                                        width="50"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeExistingImage(url)}
                                                        style={{
                                                            position: 'absolute',
                                                            top: '-5px',
                                                            right: '-5px',
                                                            background: '#ff4444',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '50%',
                                                            width: '20px',
                                                            height: '20px',
                                                            cursor: 'pointer',
                                                            fontSize: '12px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                        
                                        <input 
                                            type="file" 
                                            multiple 
                                            accept="image/*"
                                            onChange={handleEditFileChange}
                                            style={{
                                                padding: '4px',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                marginTop: '8px'
                                            }}
                                        />
                                        
                                        {editFormData.newImages && editFormData.newImages.length > 0 && (
                                            <div style={{ marginTop: '8px' }}>
                                                {editFormData.newImages.map((file, index) => (
                                                    <div key={index} style={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        marginBottom: '4px',
                                                        fontSize: '12px'
                                                    }}>
                                                        <span style={{ flex: 1, color: '#666' }}>
                                                            {file.name}
                                                        </span>
                                                        <button 
                                                            type="button"
                                                            onClick={() => removeNewImage(index)}
                                                            style={{
                                                                background: '#ff4444',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '50%',
                                                                width: '20px',
                                                                height: '20px',
                                                                cursor: 'pointer',
                                                                fontSize: '12px',
                                                                marginLeft: '8px'
                                                            }}
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    product.images && product.images.length > 0 && (
                                        product.images.map((url, i) => (
                                            <img
                                                key={i}
                                                src={`http://localhost:5000${url}`}
                                                alt={product.name}
                                                width="50"
                                                style={{ marginRight: '4px' }}
                                            />
                                        ))
                                    )
                                )}
                            </td>

                            <td>
                                {editingRowId === product._id ? (
                                    <input
                                        type="text"
                                        name="name"
                                        value={editFormData.name}
                                        onChange={handleEditChange}
                                    />
                                ) : (
                                    product.name
                                )}
                            </td>

                            <td>
                                {editingRowId === product._id ? (
                                    <input
                                        type="text"
                                        name="description"
                                        value={editFormData.description}
                                        onChange={handleEditChange}
                                    />
                                ) : (
                                    product.description
                                )}
                            </td>

                            <td>
                                {editingRowId === product._id ? (
                                    <input
                                        type="number"
                                        name="price"
                                        value={editFormData.price}
                                        onChange={handleEditChange}
                                    />
                                ) : (
                                    `$${product.price}`
                                )}
                            </td>

                            <td>
                                {editingRowId === product._id ? (
                                    <input
                                        type="text"
                                        name="category"
                                        value={editFormData.category}
                                        onChange={handleEditChange}
                                    />
                                ) : (
                                    product.category
                                )}
                            </td>

                            <td>
                                {editingRowId === product._id ? (
                                    <input
                                        type="number"
                                        name="stock"
                                        value={editFormData.stock}
                                        onChange={handleEditChange}
                                    />
                                ) : (
                                    product.stock
                                )}
                            </td>

                            <td>
                                {editingRowId === product._id ? (
                                    <>
                                        <button onClick={() => handleSaveEdit(product._id)}>Save</button>
                                        <button onClick={() => setEditingRowId(null)}>Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => handleEditClick(product)}>Edit</button>
                                        <button onClick={() => handleDeleteProduct(product._id)}>Delete</button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}

                    {!filteredProducts.length && (
                        <tr>
                            <td colSpan="7" style={{ textAlign: 'center', fontStyle: 'italic' }}>
                                {products.length
                                    ? 'No products match your search.'
                                    : 'No products in the catalog yet.'}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default ProductDashboard;