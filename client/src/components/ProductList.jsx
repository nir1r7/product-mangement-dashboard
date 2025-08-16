import React, { useState, useEffect, useCallback, useContext } from 'react';
import { CartContext } from '../contexts/CartContext';
import { Range } from 'react-range';
import SearchBar from './SearchBar';

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [priceRange, setPriceRange] = useState([0, 100000]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const { addToCart } = useContext(CartContext);


    const fetchProducts = useCallback(async () => {
        const queryParams = new URLSearchParams({
            search,
            category,
            minPrice: priceRange[0],
            maxPrice: priceRange[1],
            page,
            limit: 5,
        });

        try {
            const res = await fetch(`http://localhost:5000/api/products?${queryParams}`);
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            const data = await res.json();
            setProducts(data.products || []);
            setPages(data.pages || 1);
        } catch (err) {
            console.error('Failed to fetch products:', err);
        }
    }, [search, category, priceRange, page]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const logScale = (value) => {

        if (value <= 0) return 0;
        if (value >= 100000) return 100000;
        
        const minp = 0;
        const maxp = 100000;
        const minv = Math.log(1);
        const maxv = Math.log(maxp);
        const scale = (maxv - minv) / (maxp - minp);
        return Math.exp((minv + scale * (value - minp)));
    };

    const inverseLogScale = (value) => {
        if (value <= 0) return 0;
        if (value >= 100000) return 100000;

        const minp = 0;
        const maxp = 100000;
        const minv = Math.log(1);
        const maxv = Math.log(maxp);
        const scale = (maxv - minv) / (maxp - minp);
        return ((Math.log(value) - minv) / scale + minp);
    };

    const additionalFilters = (
        <>
            <select 
                value={category} 
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            >
                <option value="">All Categories</option>
                <option value="People">People</option>
                <option value="Edibles">Edibles</option>
                <option value="Decoration">Decoration</option>
                <option value="Vehicles">Vehicles</option>
            </select>

            <div style={{ margin: '20px 0', width: '300px' }}>
                <Range
                        step={1}
                        min={0}
                        max={100000}
                        values={priceRange.map(inverseLogScale)}
                        onChange={(values) => {
                            setPriceRange(values.map(logScale));
                            setPage(1);
                        }}
                        renderTrack={({ props, children }) => {
                            const { key, ...restProps } = props;
                            return (
                                <div
                                    key={key}
                                    {...restProps}
                                    style={{
                                        ...restProps.style,
                                        height: '6px',
                                        background: '#ccc',
                                        position: 'relative'
                                    }}
                                >
                                    {children}
                                </div>
                            );
                        }}
                        renderThumb={({ props }) => {
                            const { key, ...restProps } = props;
                            return (
                                <div
                                    key={key}
                                    {...restProps}
                                    style={{
                                        ...restProps.style,
                                        height: '16px',
                                        width: '16px',
                                        backgroundColor: '#999'
                                    }}
                                />
                            );
                        }}
                    />
                <div>
                    Price: ${Math.round(priceRange[0])} - ${Math.round(priceRange[1])}
                </div>
            </div>
        </>
    );

    return (
        <div>
            <h1>Product List</h1>

            <SearchBar
                searchTerm={search}
                onSearchChange={(value) => { setSearch(value); setPage(1); }}
                placeholder="Search products..."
                additionalFilters={additionalFilters}
            />

            <ul>
                {products.map(product => (
                    <li key={product._id}>
                        <h3>{product.name}</h3>
                        <p>{product.description}</p>
                        <p>Price: ${product.price}</p>
                        {product.imageUrl && (
                            <img
                                src={`http://localhost:5000${product.imageUrl}`}
                                alt={product.name}
                                width="100"
                            />
                        )}
                        <button
                            onClick={() => addToCart(product)}
                            disabled={product.stock === 0}
                        >
                            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                    </li>
                ))}
            </ul>

            <div>
                {Array.from({ length: pages }, (_, i) => (
                    <button
                        key={i + 1}
                        onClick={() => setPage(i + 1)}
                        disabled={page === i + 1}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
        </div>
    );
}
