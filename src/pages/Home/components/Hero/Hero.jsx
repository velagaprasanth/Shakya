import React, { useState, useEffect } from 'react';
import "./hero.scss";
import image1 from '../../../../assets/images/image1.png';
import image2 from '../../../../assets/images/image2.png';
import image3 from '../../../../assets/images/image3.png';
import image4 from '../../../../assets/images/image4.png';
import image5 from '../../../../assets/images/image5.png';

const Hero = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const slides = [image1, image2, image3, image4, image5];

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