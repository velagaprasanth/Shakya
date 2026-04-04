import React, { useState, useEffect } from 'react';
import "./hero.scss";
import image1 from '../../../../assets/images/image1.png';
import image2 from '../../../../assets/images/image2.png';
import image3 from '../../../../assets/images/image3.png';
import image4 from '../../../../assets/images/image4.png';
import image5 from '../../../../assets/images/image5.png';

import { supabase } from '../../../../services/supabaseClient';

const Hero = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [slides, setSlides] = useState([image1, image2, image3, image4, image5]);

    useEffect(() => {
        const fetchCarouselImages = async () => {
            try {
                const { data, error } = await supabase.storage
                    .from('product-images')
                    .list('carousel', { limit: 10, sortBy: { column: 'name', order: 'asc' } });
                
                if (error) throw error;
                
                const files = (data || []).filter(f => f.name !== '.emptyFolderPlaceholder' && f.name !== '.DS_Store');
                
                if (files.length > 0) {
                    const imageUrls = files.map(file => {
                        const { data: publicUrlData } = supabase.storage
                            .from('product-images')
                            .getPublicUrl(`carousel/${file.name}`);
                        return publicUrlData.publicUrl;
                    });
                    setSlides(imageUrls);
                }
            } catch (error) {
                console.error("Error fetching carousel images:", error);
            }
        };

        fetchCarouselImages();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [slides.length]);

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    return (
        <div data-aos="zoom-in" className="hero page-container mb-4">
            <div className="hero-content" style={{ backgroundImage: `url(${slides[currentSlide]})` }}>
            </div>
            <div className="carousel-indicators">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        className={`indicator-dot ${index === currentSlide ? 'active' : ''}`}
                        onClick={() => goToSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    )
}

export default Hero;