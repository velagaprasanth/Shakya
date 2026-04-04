import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';
import { supabaseAdmin } from '../../services/supabaseClient';
import './subcategoryProducts.scss';

const SubcategoryProducts = () => {
    const { subcategoryName } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabaseAdmin
                    .from('products')
                    .select('*')
                    .eq('subcategory', subcategoryName)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setProducts(data || []);
            } catch (error) {
                console.error('Error fetching products by subcategory:', error);
            } finally {
                setLoading(false);
            }
        };

        if (subcategoryName) {
            fetchProducts();
        }
    }, [subcategoryName]);

    return (
        <div className="subcategory-products-page page-container">
            <div className="py-5">
                <h1 className="text-center">{subcategoryName} Products</h1>
                <div className="divider-part mb-5">
                    <div className="divider"></div>
                </div>

                {loading ? (
                    <p className="text-center">Loading products...</p>
                ) : products.length === 0 ? (
                    <p className="text-center">No products found in this subcategory.</p>
                ) : (
                    <div className="products-grid container-fluid">
                        <div className="row g-4">
                            {products.map((product) => (
                                <div key={product.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <ProductCard 
                                        item={product}
                                        title={product.title}
                                        image={product.image}
                                        category={product.category}
                                        price={product.price}
                                        oldPrice={product.oldPrice}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubcategoryProducts;
