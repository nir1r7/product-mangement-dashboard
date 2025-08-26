import React, { useState } from 'react';
import './ExportTools.css';

const ExportTools = ({ onExport }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleExport = (type, component) => {
        onExport(type, component);
        setIsOpen(false);
    };

    return (
        <div className="export-tools">
            <button 
                className="export-toggle btn btn-secondary"
                onClick={() => setIsOpen(!isOpen)}
            >
                Export Data ▼
            </button>
            
            {isOpen && (
                <div className="export-dropdown">
                    <div className="export-section">
                        <h4>KPIs</h4>
                        <button 
                            className="export-btn"
                            onClick={() => handleExport('csv', 'kpis')}
                        >
                            Export KPIs as CSV
                        </button>
                    </div>
                    
                    <div className="export-section">
                        <h4>Trends</h4>
                        <button 
                            className="export-btn"
                            onClick={() => handleExport('csv', 'trends')}
                        >
                            Export Trends as CSV
                        </button>
                    </div>
                    
                    <div className="export-section">
                        <h4>Products</h4>
                        <button 
                            className="export-btn"
                            onClick={() => handleExport('csv', 'products')}
                        >
                            Export Products as CSV
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExportTools;
