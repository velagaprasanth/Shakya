import React, { useState, useEffect, useCallback } from 'react';
import ProductCard from '../../../../components/ProductCard/ProductCard';
import { supabaseAdmin } from '../../../../services/supabaseClient';
import { getCache, setCache } from '../../../../utils/cache';
import "./homeProducts.scss";

const HomeProducts = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            
            // Check cache first
            const cachedData = getCache('products');
            if (cachedData) {
                setProducts(cachedData);
                setLoading(false);
                return;
            }
            
            const { data, error } = await supabaseAdmin
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            // Cache for 30 minutes
            setCache('products', data || [], 30);
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = useCallback(() => {
        let filtered = [...products];

        // Limit to 4 products for home page
        filtered = filtered.slice(0, 4);

        setFilteredProducts(filtered);
    }, [products]);

    useEffect(() => {
        fetchProducts();
    }, []);

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