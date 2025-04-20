import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TokenCard from '../TokenCard';
import './Tokens.css';

const Tokens = () => {
    const [tokens, setTokens] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {
        // Загрузка токенов из API
        const fetchTokens = async () => {
          try {
            setIsLoading(true);
            // Замените URL на ваш API endpoint
            const response = await axios.get('https://rush-api-service-tradingappserverv4.up.railway.app/database/getJettonsByMarketCap?page=1&limit=20');
            
            const tokenData = response.data && response.data.data ? response.data.data : [];

            const formattedTokens = tokenData.map(token => ({
                id: token.contract_address, // используем адрес контракта как уникальный ID
                name: token.name,
                symbol: token.symbol,
                image: token.image_url,
                metrics: `Price: $${parseFloat(token.usd_price).toFixed(4)} | TON: ${parseFloat(token.ton_price).toFixed(6)}`,
                address: token.contract_address
              }));

            setTokens(formattedTokens);
            setError(null);

          } catch (err) {
            console.error('Ошибка загрузки токенов:', err);
            setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
            
            // Тестовые данные в случае ошибки
           
          } finally {
            setIsLoading(false);
          }
        };
    
        fetchTokens();
      }, []);
    
      const handleAddToFavorites = (token) => {
        // Реализация добавления в избранное
        console.log(`Added ${token.name} to favorites`);
        // Здесь можно добавить логику сохранения в localStorage или отправки на сервер
      };
    
      const handleOpenDetails = (token) => {
        // Реализация открытия детальной информации о токене
        console.log(`Opening details for ${token.name}`);
        // Здесь можно реализовать переход на детальную страницу или открытие модального окна
      };
    
      if (isLoading) {
        return <div className="loading">Загрузка токенов...</div>;
      }
    
      if (error) {
        return <div className="error">{error}</div>;
      }
    
      return (
        <div className="tokens-container">
          <div className="tokens-list">
            {tokens.map(token => (
              <TokenCard 
                key={token.id} 
                token={token} 
                onAddToFavorites={handleAddToFavorites}
                onOpenDetails={handleOpenDetails}
              />
            ))}
          </div>
        </div>
      );
 };
    
export default Tokens;

    
//   useEffect(() => {
//     axios.get('https://rush-api-service-tradingappserverv4.up.railway.app/database/getJettonsByMarketCap?page=1&limit=20')
//       .then(response => setTokens(response.data))
//       .catch(error => console.error('Error fetching data:', error));
//   }, []);

//   return (
//     <div>
//       {tokens.map(token => (
//         <TokenCard key={token.id} token={token} />
//       ))}
//     </div>
//   );
// };

