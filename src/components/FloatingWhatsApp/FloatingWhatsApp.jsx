import React from 'react';
import waImage from '../../assets/images/image.png';
import './floatingWhatsApp.scss';

const FloatingWhatsApp = () => {
    const phoneNumber = "919533556501"; 
    const message = "Hello, I want to know more about your furniture!";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    return (
        <a 
            href={whatsappUrl} 
            className="floating-whatsapp" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
        >
            <img src={waImage} alt="WhatsApp" className="wa-icon" />
        </a>
    );
};

export default FloatingWhatsApp;
