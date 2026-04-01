import React from 'react';

const HomeConnectItem = (props) => {
    const { logo, link } = props;
    return (
        <div data-aos="fade-left" className="connect-item">
            <a href={link} className='connect-button' target="_blank" rel="noopener noreferrer">
                {logo}
            </a>
        </div>
    )
}

export default HomeConnectItem;