import React, { useState } from 'react';
import './SearchBar.css';

const SearchBar = ({ onSearch, placeholder = "Search...", value = "" }) => {
    const [searchValue, setSearchValue] = useState(value);

    const handleChange = (e) => {
        const query = e.target.value;
        setSearchValue(query);
        onSearch(query); // Update search on each keystroke
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(searchValue);
    };

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
