import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from "../../assets/images/logo.png";
import "./header.scss";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoCloseSharp } from "react-icons/io5";
import { useDispatch } from 'react-redux';
import { handleCategory } from '../../store/features/filterSlice';
import { supabaseAdmin } from '../../services/supabaseClient';
import { getCache, setCache } from '../../utils/cache';

const Header = () => {
    const [hamburger, setHamburger] = useState(true);
    const [nav, setNav] = useState(false);
    const [categories, setCategories] = useState([]);
    const dispatch = useDispatch()
    const navigate = useNavigate()

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            // Check cache first
            const cachedData = getCache('categories');
            if (cachedData) {
                setCategories(cachedData);
                return;
            }

            const { data, error } = await supabaseAdmin
                .from('categories')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;

            // Cache for 30 minutes
            setCache('categories', data || [], 30);
            setCategories(data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const changeCategory = (category) => {
        dispatch(handleCategory(category));
        navigate('/shop')
    }
    
    const handleAllProducts = () => {
        dispatch(handleCategory(""));
        navigate('/shop')
    }

    const closeHamburger = () => {
        setNav(false);
        setHamburger(true)
    }
    const openHamburger = () => {
        setNav(true);
        setHamburger(false)
    }
    
    return (
        <header className='bg-white'>
            <div className="page-container">
                <div className="header-content">
                    <div className="header-left">
                        <div className="logo-part pe-4">
                            <Link to="/"><img src={logo} alt="logo" /></Link>
                        </div>
                        <ul className='dekstop-nav list-unstyled m-0'>
                            <li><button className='clean-button' onClick={() => { handleAllProducts() }}>All Products</button></li>
                            {categories.map((cat) => (
                                <li key={cat.id}>
                                    <button 
                                        className='clean-button' 
                                        onClick={() => { changeCategory(cat.name) }}
                                    >
                                        {cat.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="header-right">
                        <div className="hamburger-menu">
                            {hamburger ? (<button onClick={() => { openHamburger() }}><GiHamburgerMenu /></button>) : (<button onClick={() => { closeHamburger() }}><IoCloseSharp /></button>)}
                        </div>
                    </div>
                </div>
            </div>
            <ul className={nav ? 'mobile-nav open-nav  list-unstyled m-0' : 'mobile-nav list-unstyled m-0'}>
                <li><button className='clean-button' onClick={() => { handleAllProducts(); closeHamburger() }}>All Products</button></li>
                {categories.map((cat) => (
                    <li key={cat.id}>
                        <button 
                            className='clean-button' 
                            onClick={() => { changeCategory(cat.name); closeHamburger() }}
                        >
                            {cat.name}
                        </button>
                    </li>
                ))}
            </ul>
        </header>
    )
}

export default Header;