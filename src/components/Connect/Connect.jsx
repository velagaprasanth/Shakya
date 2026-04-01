import React from 'react';
import HomeConnectItem from './ConnectItem';
import "./connect.scss";
import { AiFillInstagram } from "react-icons/ai";

const Connect = () => {
    return (
        <div className="home-connect page-container">
            <h3 data-aos="fade-up">Connect with us!</h3>
            <div className="connections">
                <HomeConnectItem 
                    logo={<AiFillInstagram />} 
                    link="https://www.instagram.com/shakya_devarakonda_furniture?igsh=MTkwaGt4MXNyMmR6Nw==" 
                />
            </div>
        </div>
    )
}

export default Connect;