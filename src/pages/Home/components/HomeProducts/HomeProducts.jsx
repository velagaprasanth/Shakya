import React, { useState, useEffect, useCallback } from 'react';
import ProductCard from '../../../../components/ProductCard/ProductCard';
import { supabaseAdmin } from '../../../../services/supabaseClient';
import { getCache, setCache } from '../../../../utils/cache';
import "./homeProducts.scss";

const HomeProducts = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            
            // Check cache first
            const cachedData = getCache('products');
            if (cachedData && cachedData.length > 0) {
                console.log('Using cached products:', cachedData.length);
                setProducts(cachedData);
                setLoading(false);
                return;
            }
            
            console.log('Fetching fresh products from database');
            const { data, error } = await supabaseAdmin
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            const productData = data || [];
            console.log('Fetched products:', productData.length);
            
            // Cache for 30 minutes
            setCache('products', productData, 30);
            setProducts(productData);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const applyFilters = useCallback(() => {
        // Show all products (no limit)
        setFilteredProducts(products);
    }, [products]);

    // Intersection Observer for infinite scroll - REMOVED, showing all products now
    // useEffect(() => {
    //     const target = observerTarget.current;
    //     if (!target) return;
    //     ...observer code...
    // }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    return (
        <div className="home-products page-container">
            <h3 className='text-center part-title'>
                Our Latest Products
            </h3>
            <div className="divider-part">
                <div className="divider"></div>
            </div>
            {loading ? (
                <p className="text-center">Loading products...</p>
            ) : filteredProducts.length === 0 ? (
                <p className="text-center">No products available</p>
            ) : (
                <div className="row">
                    {filteredProducts.map((item) => {
                        const displayImage = item.image ? item.image : (item.images && item.images.length > 0 ? item.images[0] : '');
                        return (
                            <ProductCard
                                key={item.id}
                                item={item}
                                image={displayImage}
                                title={item.title}
                                category={item.category}
                                price={item.price}
                                oldPrice={item.oldPrice}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default HomeProducts;