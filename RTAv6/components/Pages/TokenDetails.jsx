import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './TokenDetails.css';


const TokenDetails = () => {
    const { tokenId } = useParams();
    const [token, setToken] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiBaseUrl = 'https://rush-api-service-tradingappserverv4.up.railway.app/database';

    useEffect(() => {
        const fetchTokenDetails = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${apiBaseUrl}/getJettonByAddress/${tokenId}`);
                const data = await response.json();
                setToken(data);
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }   
        };

        fetchTokenDetails();
    }, [tokenId]);



    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    if (!token) return <div>Token not found</div>;

    return (
        <div className="details-page-token-details-container">
            <div className="details-page-token-header">
                <Link to="/" className="details-page-back-button">
                    ←
                    Back to Tokens
                </Link>
                <h1 className="details-page-token-name">{token.name}</h1>
                <div className="details-page-favorite-button" onClick={() => setIsFavorite(!isFavorite)}>
                    {isFavorite ? '❤️' : '🤍'}
                </div>
            </div>
            <div className="details-page-token-image">
                <img src={token.image} alt={token.name} />
            </div>
            <div className="details-page-token-info">
                <p className="details-page-token-description">{token.description}</p>
                <p className="details-page-token-price">Price: {token.price}</p>
                <p className="details-page-token-market-cap">Market Cap: {token.marketCap}</p>
            </div>
        </div>
    );
};

export default TokenDetails;



