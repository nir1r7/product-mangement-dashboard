// src/pages/ProductList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Range } from 'react-range';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [priceRange, setPriceRange] = useState([0, 100000]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);

    const fetchProducts = useCallback(async () => {
        const queryParams = new URLSearchParams({
        search,
        category,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        page,
        limit: 12,
        });

        try {
        const res = await fetch(`http://localhost:5000/api/products?${queryParams}`);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();
        setProducts(Array.isArray(data.products) ? data.products : []);
        setPages(data.pages || 1);
        } catch (err) {
        console.error('Failed to fetch products:', err);
        }
    }, [search, category, priceRange, page]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const logScale = (value) => {
        if (value <= 0) return 0;
        if (value >= 100000) return 100000;
        const minp = 0, maxp = 100000;
        const minv = Math.log(1), maxv = Math.log(maxp);
        const scale = (maxv - minv) / (maxp - minp);
        return Math.exp((minv + scale * (value - minp)));
    };

    const inverseLogScale = (value) => {
        if (value <= 0) return 0;
        if (value >= 100000) return 100000;
        const minp = 0, maxp = 100000;
        const minv = Math.log(1), maxv = Math.log(maxp);
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

            <div style={{ margin: '20px 0', width: 300 }}>
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
                                height: 6,
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
                                height: 16,
                                width: 16,
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
            <h1>Products</h1>

            <SearchBar
                searchTerm={search}
                onSearchChange={(value) => { setSearch(value); setPage(1); }}
                placeholder="Search products..."
                additionalFilters={additionalFilters}
            />

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: 16,
                    marginTop: 16
                }}
            >
                {products.map((p) => (
                    <ProductCard key={p._id} product={p} />
                ))}
            </div>

            <div style={{ marginTop: 16 }}>
                {Array.from({ length: pages }, (_, i) => (
                <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    disabled={page === i + 1}
                    style={{ marginRight: 6 }}
                >
                    {i + 1}
                </button>
                ))}
            </div>
        </div>
    );
}
