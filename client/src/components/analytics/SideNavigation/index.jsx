import React, { useState, useEffect } from 'react';
import './SideNavigation.css';

const SideNavigation = ({ isOpen, onToggle }) => {
    const [activeSection, setActiveSection] = useState('');

    const navigationItems = [
        { id: 'filters', label: 'Filters & Date Range', icon: '🔍' },
        { id: 'kpis', label: 'Key Performance Indicators', icon: '📊' },
        { id: 'trends', label: 'Trends Over Time', icon: '📈' },
        { id: 'products', label: 'Top Products', icon: '🏆' },
        { id: 'categories', label: 'Category Performance', icon: '📂' },
        { id: 'inventory', label: 'Inventory Risk Analysis', icon: '⚠️' },
        { id: 'cohort', label: 'Cohort Analysis', icon: '👥' },
        { id: 'segments', label: 'Customer Segmentation', icon: '🎯' },
        { id: 'insights', label: 'Key Insights', icon: '💡' },
        { id: 'performance', label: 'Performance Monitor', icon: '⚡' }
    ];

    useEffect(() => {
        const handleScroll = () => {
            const sections = navigationItems.map(item => document.getElementById(item.id));
            const scrollPosition = window.scrollY + 100;

            for (let i = sections.length - 1; i >= 0; i--) {
                const section = sections[i];
                if (section && section.offsetTop <= scrollPosition) {
                    setActiveSection(navigationItems[i].id);
                    break;
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            const offset = 80;
            const elementPosition = element.offsetTop - offset;
            window.scrollTo({
                top: elementPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <>
            <button
                className={`nav-toggle ${isOpen ? 'open' : ''}`}
                onClick={onToggle}
                aria-label="Toggle navigation"
            >
                <span className="nav-toggle-icon">
                    {isOpen ? '◀' : '▶'}
                </span>
            </button>

            <div className={`side-navigation ${isOpen ? 'open' : ''}`}>
                <div className="nav-header">
                    <h3>Analytics Navigation</h3>
                    <button 
                        className="nav-close"
                        onClick={onToggle}
                        aria-label="Close navigation"
                    >
                        ✕
                    </button>
                </div>

                <nav className="nav-menu">
                    {navigationItems.map(item => (
                        <button
                            key={item.id}
                            className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                            onClick={() => scrollToSection(item.id)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="nav-footer">
                    <div className="nav-tip">
                        <strong>Tip:</strong> Use these shortcuts to quickly jump to any section of the analytics dashboard.
                    </div>
                </div>
            </div>

            {isOpen && (
                <div
                    className="nav-overlay"
                    onClick={onToggle}
                ></div>
            )}
        </>
    );
};

export default SideNavigation;
