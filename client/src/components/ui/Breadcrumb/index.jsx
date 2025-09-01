import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Breadcrumb.css';

const Breadcrumb = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter(x => x);
    const [productNames, setProductNames] = useState({});

    const breadcrumbNameMap = {
        'admin': 'Admin',
        'analytics': 'Analytics',
        'products': 'Products',
        'orders': 'Orders',
        'users': 'Users',
        'dashboard': 'Dashboard',
        'inventory': 'Inventory',
        'reviews': 'Reviews',
        'cart': 'Cart',
        'checkout': 'Checkout',
        'profile': 'Profile',
        'login': 'Login',
        'register': 'Register',
        'create': 'Create',
        'edit': 'Edit',
        'view': 'View'
    };

    useEffect(() => {
        const match = location.pathname.match(/\/products\/([^/]+)/);
        if (match) {
            const productId = match[1];

            if (productNames[productId] === undefined) {
                setProductNames(prev => ({
                    ...prev,
                    [productId]: 'Loading...'
                }));

                const fetchProduct = async () => {
                    try {
                        const response = await fetch(`http://localhost:5000/api/products/${productId}`);
                        if (response.ok) {
                            const product = await response.json();
                            setProductNames(prev => ({
                                ...prev,
                                [productId]: product.name
                            }));
                        } else {
                            setProductNames(prev => ({
                                ...prev,
                                [productId]: `Product ${productId}`
                            }));
                        }
                    } catch (error) {
                        setProductNames(prev => ({
                            ...prev,
                            [productId]: `Product ${productId}`
                        }));
                    }
                };

                fetchProduct();
            }
        }
    }, [location.pathname]);

    const getBreadcrumbName = (pathname, index) => {
        if (index > 0 && pathnames[index - 1] === 'products') {
            return productNames[pathname] || `Loading...`;
        }
        return breadcrumbNameMap[pathname] || pathname.charAt(0).toUpperCase() + pathname.slice(1);
    };

    if (pathnames.length === 0) {
        return null;
    }

    return (
        <nav className="breadcrumb" aria-label="Breadcrumb">
            <ol className="breadcrumb-list">
                <li className="breadcrumb-item">
                    <Link to="/" className="breadcrumb-link">
                        <span className="breadcrumb-icon">🏠</span>
                        Home
                    </Link>
                </li>
                {pathnames.map((pathname, index) => {
                    const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const isLast = index === pathnames.length - 1;
                    const breadcrumbName = getBreadcrumbName(pathname, index);

                    return (
                        <li key={routeTo} className="breadcrumb-item">
                            <span className="breadcrumb-separator">›</span>
                            {isLast ? (
                                <span className="breadcrumb-current" aria-current="page">
                                    {breadcrumbName}
                                </span>
                            ) : (
                                <Link to={routeTo} className="breadcrumb-link">
                                    {breadcrumbName}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumb;
