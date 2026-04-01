import React from 'react';
import Hero from './components/Hero/Hero';
import HomeServices from './components/HomeServices/HomeServices';
import HomeProducts from './components/HomeProducts/HomeProducts';
import Testimonials from './components/Testimonials/Testimonials';

const Home = () => {
    return (
        <div className="home">
            <Hero />
            <Testimonials />
            <HomeProducts />
        </div>
    )
}

export default Home;