import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import './admin.scss';
import AddProduct from './components/AddProduct';
import ProductsList from './components/ProductsList';
import CategoriesList from './components/CategoriesList';
import SubcategoriesList from './components/SubcategoriesList';
import CarouselList from './components/CarouselList';
import AdminLogin from './AdminLogin';

/**
 * AdminDashboard Component
 * Main admin panel for managing products and categories
 * Features:
 * - Authentication check (email verification)
 * - Product CRUD operations
 * - Category management
 * - Role-based access control (only shakyafurnitures@gmail.com)
 */
const AdminDashboard = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [activeTab, setActiveTab] = useState('products');
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    // Auth initialization and listener setup
    useEffect(() => {
        // Check if user already has an active session
        checkAuth();

        // Set up real-time listener for auth state changes
        // This handles session refresh and logout
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session && session.user.email === 'shakyafurnitures@gmail.com') {
                setUser(session.user);
            } else {
                setUser(null);
            }
            setAuthLoading(false);
        });

        return () => subscription?.unsubscribe();
    }, []);

    // Check if user has an existing valid session
    const checkAuth = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            
            // Verify session exists and email matches authorized admin
            if (session && session.user.email === 'shakyafurnitures@gmail.com') {
                setUser(session.user);
            }
        } catch (error) {
            console.error('Auth check error:', error);
        } finally {
            setAuthLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchProducts();
            fetchCategories();
        }
    }, [user]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error.message);
            alert('Error loading products: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;
            setCategories(data || []);
        } catch (error) {
            console.error('Error fetching categories:', error.message);
        }
    };

    const handleProductAdded = () => {
        setShowAddForm(false);
        fetchProducts();
    };

    const handleProductDeleted = () => {
        fetchProducts();
    };

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
            alert('Error logging out');
        }
    };

    // Show loading state while checking auth
    // This prevents flash of login page if user has valid session
    if (authLoading) {
        return <div className="admin-dashboard page-container"><p>Checking authentication...</p></div>;
    }

    // Show login page if user is not authenticated
    // Only authenticated users with correct email can access dashboard
    if (!user) {
        return <AdminLogin onLoginSuccess={checkAuth} />;
    }

    return (
        <div className="admin-dashboard page-container">
            <div className="admin-header">
                <div>
                    <h1>Admin Panel</h1>
                    <p className="user-info">Logged in as: {user.email}</p>
                </div>
                <div className="admin-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
                        onClick={() => setActiveTab('products')}
                    >
                        Products
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
                        onClick={() => setActiveTab('categories')}
                    >
                        Categories
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'subcategories' ? 'active' : ''}`}
                        onClick={() => setActiveTab('subcategories')}
                    >
                        Subcategories
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'carousel' ? 'active' : ''}`}
                        onClick={() => setActiveTab('carousel')}
                    >
                        Carousel
                    </button>
                    <button 
                        className="tab-btn logout-btn"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </div>

            {activeTab === 'products' && (
                <>
                    <div className="section-header mb-4">
                        <h2>Product Management</h2>
                        <button 
                            className="btn-primary"
                            onClick={() => setShowAddForm(!showAddForm)}
                        >
                            {showAddForm ? '✕ Cancel' : '+ Add New Product'}
                        </button>
                    </div>

                    {showAddForm && (
                        <AddProduct onProductAdded={handleProductAdded} />
                    )}

                    {loading ? (
                        <p>Loading products...</p>
                    ) : (
                        <ProductsList 
                            products={products}
                            categories={categories}
                            onProductDeleted={handleProductDeleted}
                            onProductUpdated={fetchProducts}
                        />
                    )}
                </>
            )}

            {activeTab === 'categories' && (
                <CategoriesList onCategoriesChanged={() => {}} />
            )}

            {activeTab === 'subcategories' && (
                <SubcategoriesList onSubcategoriesChanged={() => {}} />
            )}

            {activeTab === 'carousel' && (
                <CarouselList />
            )}
        </div>
    );
};

export default AdminDashboard;
