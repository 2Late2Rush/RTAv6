import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import TokenCard from '../TokenCard';
import './Tokens.css';

const Tokens = () => {
    const [tokens, setTokens] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef();
    const limitPerPage = 20;
    
    // Ref для последнего элемента
    const lastTokenElementRef = useCallback(node => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreTokens();
        }
      });
      if (node) observer.current.observe(node);
    }, [isLoading, hasMore]);
    
    // Функция загрузки токенов
    const fetchTokens = async (pageNum, shouldAppend = false) => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `https://rush-api-service-tradingappserverv4.up.railway.app/database/getJettonsByMarketCap?page=${pageNum}&limit=${limitPerPage}`
        );
        
        const tokenData = response.data && response.data.data ? response.data.data : [];
        
        if (tokenData.length === 0) {
          setHasMore(false);
          setIsLoading(false);
          return;
        }
        
        const formattedTokens = tokenData.map(token => ({
          id: token.contract_address,
          name: token.name,
          symbol: token.symbol,
          image: token.image_url,
          metrics: `Price: $${parseFloat(token.usd_price).toFixed(4)} | TON: ${parseFloat(token.ton_price).toFixed(6)}`,
          address: token.contract_address,
          market_cap: token.market_cap,
          popularity_index: token.popularity_index,
        }));
        
        // Фильтруем токены по popularity_index > 1
        const filteredTokens = formattedTokens.filter(token => 
          token.popularity_index && parseFloat(token.popularity_index) > 1
        );
        
        // Если после фильтрации нет токенов и есть еще страницы, загружаем следующую страницу
        if (filteredTokens.length === 0 && tokenData.length === limitPerPage) {
          setIsLoading(false);
          loadMoreTokens();
          return;
        }
        
        setTokens(prevTokens => shouldAppend ? [...prevTokens, ...filteredTokens] : filteredTokens);
        setError(null);
        
      } catch (err) {
        console.error('Ошибка загрузки токенов:', err);
        setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Функция загрузки дополнительных токенов
    const loadMoreTokens = () => {
      if (isLoading || !hasMore) return;
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTokens(nextPage, true);
    };
    
    // Первоначальная загрузка токенов
    useEffect(() => {
      fetchTokens(1);
    }, []);
    
    const handleAddToFavorites = (token) => {
      console.log(`Added ${token.name} to favorites`);
    };
    
    const handleOpenDetails = (token) => {
      console.log(`Opening details for ${token.name}`);
    };
    
    // Ручная дозагрузка для случая, когда нет токенов или нужна кнопка "Загрузить еще"
    const handleLoadMore = () => {
      loadMoreTokens();
    };
    
    if (error) {
      return (
        <div className="tokens-container">
          <div className="error">{error}</div>
          <button className="load-more-button" onClick={() => fetchTokens(1)}>
            Повторить
          </button>
        </div>
      );
    }
    
    return (
      <div className="tokens-container">
        <div className="tokens-list">
          {tokens.map((token, index) => {
            // Если это последний элемент, добавляем ref для отслеживания
            if (tokens.length === index + 1) {
              return (
                <div ref={lastTokenElementRef} key={token.id}>
                  <TokenCard
                    token={token}
                    onAddToFavorites={handleAddToFavorites}
                    onOpenDetails={handleOpenDetails}
                  />
                </div>
              );
            } else {
              return (
                <TokenCard
                  key={token.id}
                  token={token}
                  onAddToFavorites={handleAddToFavorites}
                  onOpenDetails={handleOpenDetails}
                />
              );
            }
          })}
        </div>
        
        {tokens.length === 0 && !isLoading && (
          <div className="no-tokens">
            <p>Нет токенов с популярностью выше 1</p>
            <button className="load-more-button" onClick={handleLoadMore}>
              Загрузить еще
            </button>
          </div>
        )}
        
        {isLoading && (
          <div className="loading-more">Загрузка токенов...</div>
        )}
        
        {!isLoading && hasMore && tokens.length > 0 && (
          <button className="load-more-button" onClick={handleLoadMore}>
            Загрузить еще
          </button>
        )}
        
        {!hasMore && tokens.length > 0 && (
          <div className="end-of-list">Больше токенов нет</div>
        )}
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

