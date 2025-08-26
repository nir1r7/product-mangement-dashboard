import React, { useState, useEffect, useRef } from 'react';
import './SearchBar.css';

const SearchBar = ({ onSearch, placeholder = "Search...", value = "", debounceMs = 500 }) => {
    const [searchValue, setSearchValue] = useState(value);
    const debounceRef = useRef(null);

    // Update local state when value prop changes
    useEffect(() => {
        setSearchValue(value);
    }, [value]);

    const handleChange = (e) => {
        const query = e.target.value;
        setSearchValue(query);

        // Clear previous timeout
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        // Set new timeout for debounced search
        debounceRef.current = setTimeout(() => {
            onSearch(query);
        }, debounceMs);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Clear debounce timeout and search immediately
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        onSearch(searchValue);
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    return (
        <form className="search-bar" onSubmit={handleSubmit}>
            <input
                type="text"
                value={searchValue}
                onChange={handleChange}
                placeholder={placeholder}
                className="search-bar__input"
            />
            <button type="submit" className="search-bar__button">
                🔍
            </button>
        </form>
    );
};

export default SearchBar;
