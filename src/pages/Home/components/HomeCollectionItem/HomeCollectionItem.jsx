import React from 'react';
import "./homeCollectionItem.scss";
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { handleCategory } from '../../../../store/features/filterSlice';

const HomeCollectionItem = (props) => {
    const { image, title, comment, reverse, category_name } = props;
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleViewCollection = () => {
        if (category_name) {
            dispatch(handleCategory(category_name));
        }
        navigate("/shop");
    };

    return (
        <div className="row pt-3 g-0" style={{ flexDirection: reverse ? 'row-reverse' : 'row' }}>
            <div data-aos="fade-right" className="col-12 col-md-4">
                <div className="collection-img p-2">
                    <img src={image} alt={title} />
                </div>
            </div>
            <div data-aos="fade-left" className="collection-title col-12 col-md-8">
                <div className="title-content">
                    <h2>{title}</h2>
                    <h6 className='mt-3'>{comment}</h6>
                    <button onClick={handleViewCollection} className='general-button mt-4'>View Collections</button>
                </div>
            </div>
        </div>
    )
}

export default HomeCollectionItem;