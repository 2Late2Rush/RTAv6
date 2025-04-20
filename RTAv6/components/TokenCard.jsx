// Обновленный TokenCard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TokenCard.css';

const TokenCard = ({ token, onAddToFavorites, onOpenDetails }) => {
    const [priceDetails, setPriceDetails] = useState(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    useEffect(() => {
        const fetchTokenDetails = async () => {
          try {
            setIsLoadingDetails(true);
            // Замените URL на ваш эндпоинт для получения деталей токена
            const response = await axios.get(`https://rush-api-service-tradingappserverv4.up.railway.app/database/getJettonPriceChanges/${token.address}`);
            setPriceDetails(response.data);
          } catch (error) {
            console.warn(`Не удалось загрузить детали для токена ${token.name}:`, error);
          } finally {
            setIsLoadingDetails(false);
          }
        };
        
        fetchTokenDetails();
      }, [token.address, token.name]);
      
      // Функция для форматирования изменения цены с соответствующим цветом
        const formatPriceChange = (change) => {
        
        if (!change) return <span className="no-data">Нет данных</span>;
        const isPositive = change.percent_change >= 0;
        const changeClass = isPositive ? 'positive-change' : 'negative-change';
        const changeSymbol = isPositive ? '+' : '';
        const percentChange = `${changeSymbol}${change.percent_change.toFixed(2)}%`;
        
        return <span className={changeClass}>{percentChange}</span>;
      };
      
      const handleAddToFavorites = (e) => {
        e.stopPropagation();
        if (onAddToFavorites) {
          onAddToFavorites(token);
        } else {
          console.log(`Added ${token.name} to favorites`);
        }
      };  
  
      const handleCopyAddress = (e) => {
        e.stopPropagation();
        e.preventDefault(); // Блокируем стандартное поведение
        navigator.clipboard.writeText(token.address);
        // Заменяем alert на console.log или можно добавить визуальную индикацию через состояние
        console.log(`Адрес скопирован: ${token.address}`);
      };
    
      const handleCardClick = () => {
        if (onOpenDetails) {
          onOpenDetails(token);
        } else {
          console.log(`Opening details for ${token.name}`);
        }
      };
  
      return (
        <div className="token-card" onClick={handleCardClick}>
          <div className="token-image">
            <img src={token.image} alt={token.name} />
          </div>
          <div className="token-info">
            <h3 className="token-name">{token.name}</h3>
            <p className="token-metrics">{token.metrics}</p>
            
            {/* Отображаем дополнительные данные, если они загружены */}
            {isLoadingDetails ? (
            <p className="loading-details">Загрузка деталей...</p>
          ) : priceDetails ? (
            <div className="price-details">
              <div className="price-row">
                <span className="time-period">1m:</span> 
                {formatPriceChange(priceDetails.changes['1_minute'])}
              </div>
              <div className="price-row">
                <span className="time-period">15m:</span> 
                {formatPriceChange(priceDetails.changes['15_minutes'])}
              </div>
              <div className="price-row">
                <span className="time-period">1h:</span> 
                {formatPriceChange(priceDetails.changes['1_hour'])}
              </div>
              <div className="price-row">
                <span className="time-period">24h:</span> 
                {formatPriceChange(priceDetails.changes['24_hours'])}
              </div>
            </div>
          ) : null}
          </div>
          <div className="token-actions">
            <button className="action-button favorite" onClick={handleAddToFavorites}>
              Добавить в избранное
            </button>
            <button className="action-button copy" onClick={handleCopyAddress}>
              Скопировать адрес
            </button>
          </div>
        </div>
      );
};

export default TokenCard;