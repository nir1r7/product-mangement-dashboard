import React, { useState, useEffect } from 'react';

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
        image: null
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/products');
            const data = await response.json();
            setProducts(data.products || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct({ ...newProduct, [name]: value });
    };

    const handleFileChange = (e) => {
        setNewProduct({ ...newProduct, image: e.target.files[0] });
    };

    const handleAddProduct = async () => {
        const formData = new FormData();
        for (const key in newProduct) {
            if (key === 'image' && newProduct[key]) {
                formData.append('image', newProduct[key]);
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
                setProducts([...products, addedProduct]);
                setNewProduct({
                    name: '',
                    price: '',
                    description: '',
                    category: '',
                    stock: '',
                    image: null
                });
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
                setProducts(products.filter(p => p._id !== id));
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

    const handleSaveEdit = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editFormData)
            });

            if (response.ok) {
                const updatedProduct = await response.json();
                setProducts(products.map(p => p._id === id ? updatedProduct : p));
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


    if (loading) {
        return <div>Loading products...</div>;
    }

    return (
        <div>
            <h2>Product Management</h2>
            {message && <p>{message}</p>}
            <table border="1" cellPadding="10">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Category</th>
                        <th>Stock</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <input type="file" onChange={handleFileChange} />
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
                    {products.map(product => (
                        <tr key={product._id}>
                            <td>
                                {product.imageUrl && (
                                    <img src={`http://localhost:5000${product.imageUrl}`} alt={product.name} width="50" />
                                )}
                            </td>
                            <td>
                                {editingRowId === product._id ? (
                                    <input type="text" name="name" value={editFormData.name} onChange={handleEditChange} />
                                ) : product.name}
                            </td>
                            <td>
                                {editingRowId === product._id ? (
                                    <input type="text" name="description" value={editFormData.description} onChange={handleEditChange} />
                                ) : product.description}
                            </td>
                            <td>
                                {editingRowId === product._id ? (
                                    <input type="number" name="price" value={editFormData.price} onChange={handleEditChange} />
                                ) : `$${product.price}`}
                            </td>
                            <td>
                                {editingRowId === product._id ? (
                                    <input type="text" name="category" value={editFormData.category} onChange={handleEditChange} />
                                ) : product.category}
                            </td>
                            <td>
                                {editingRowId === product._id ? (
                                    <input type="number" name="stock" value={editFormData.stock} onChange={handleEditChange} />
                                ) : product.stock}
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
                </tbody>
            </table>
        </div>
    );
}

export default ProductDashboard;
