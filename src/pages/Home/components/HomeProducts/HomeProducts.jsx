import React, { useState, useEffect } from 'react';
import ProductCard from '../../../../components/ProductCard/ProductCard';
import { supabase } from '../../../../services/supabaseClient';
import { useSelector } from 'react-redux';
import { getCache, setCache } from '../../../../utils/cache';
import "./homeProducts.scss";

const HomeProducts = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const selectedCategory = useSelector((state) => state.products.selectedCategory);

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [selectedCategory, products, applyFilters]);

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
            
            const { data, error } = await supabase
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

    const applyFilters = () => {
        let filtered = [...products];

        // Apply category filter
        if (selectedCategory) {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        // Limit to 4 products for home page
        filtered = filtered.slice(0, 4);

        setFilteredProducts(filtered);
    };

    return (
        <div className="home-products page-container">
            <h3 className='text-center part-title'>
                {selectedCategory ? `${selectedCategory} Products` : 'Our Latest Products'}
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
                    {filteredProducts.map((item) => (
                        <ProductCard
                            key={item.id}
                            item={item}
                            image={item.image}
                            title={item.title}
                            category={item.category}
                            price={item.price}
                            oldPrice={item.oldPrice}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default HomeProducts;