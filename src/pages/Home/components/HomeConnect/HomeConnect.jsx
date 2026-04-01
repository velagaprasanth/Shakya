import React from 'react';
import HomeConnectItem from './HomeConnectItem';
import "./homeConnect.scss";
import { AiFillInstagram } from "react-icons/ai";

const HomeConnect = () => {
    return (
        <div className="home-connect page-container">
            <h3>Connect with us!</h3>
            <div className="connections">
                <HomeConnectItem 
                    logo={<AiFillInstagram />} 
                    link="https://www.instagram.com/shakya_devarakonda_furniture?igsh=MTkwaGt4MXNyMmR6Nw==" 
                />
            </div>
        </div>
    )
}

export default HomeConnect;