import React from 'react';

function SearchBar({ 
    searchTerm, 
    onSearchChange, 
    placeholder = "Search...",
    className = "",
    additionalFilters
}) {
    return (
        <div className={`search-container ${className}`}>
            <div className="search-input-wrapper">
                <input
                    type="text"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="search-input"
                />
            </div>
            {additionalFilters && (
                <div className="additional-filters">
                    {additionalFilters}
                </div>
            )}
        </div>
    );
}

export default SearchBar;