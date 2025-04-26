import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import TokenCard from '../TokenCard';
import './Tokens.css';
import { useNavigate } from 'react-router-dom';


const Tokens = () => {
    const [tokens, setTokens] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortType, setSortType] = useState('market_cap');
    const [popularityFilter, setPopularityFilter] = useState(1);
    const [isPopularityMenuOpen, setIsPopularityMenuOpen] = useState(false);
    const [customPopularity, setCustomPopularity] = useState('');
    const observer = useRef();
    const limitPerPage = 20;
    const apiBaseUrl = 'https://rush-api-service-tradingappserverv4.up.railway.app/database';
    const navigate = useNavigate();
    
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
        
        // Выбираем эндпоинт в зависимости от типа сортировки
        let endpoint = '';
        switch (sortType) {
          case 'market_cap':
            endpoint = `${apiBaseUrl}/getJettonsByMarketCap`;
            break;
          case 'price':
            endpoint = `${apiBaseUrl}/getJettonsByPrice`;
            break;
          case 'price_change_1m':
            endpoint = `${apiBaseUrl}/getJettonsByPriceChange?period=1_minute`;
            break;
          case 'price_change_15m':
            endpoint = `${apiBaseUrl}/getJettonsByPriceChange?period=15_minutes`;
            break;
          case 'price_change_1h':
            endpoint = `${apiBaseUrl}/getJettonsByPriceChange?period=1_hour`;
            break;
          case 'price_change_24h':
            endpoint = `${apiBaseUrl}/getJettonsByPriceChange?period=24_hours`;
            break;
          default:
            endpoint = `${apiBaseUrl}/getJettonsByMarketCap`;
        }
        
        const response = await axios.get(`${endpoint}?page=${pageNum}&limit=${limitPerPage}`);
        
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
        
        // Фильтруем токены по popularity_index > выбранного значения
        const filteredTokens = formattedTokens.filter(token => 
          token.popularity_index && parseFloat(token.popularity_index) > popularityFilter
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
    
    // Функция поиска токена по адресу
    const searchTokenByAddress = async () => {
      if (!searchTerm.trim()) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Проверяем, похоже ли значение на адрес (начинается с 'EQ' и длина примерно 48 символов)
        const isAddress = searchTerm.startsWith('EQ') && searchTerm.length > 40;
        
        let endpoint = isAddress
          ? `${apiBaseUrl}/getJettonByAddress/${searchTerm}`  // Поиск по адресу
          : `${apiBaseUrl}/searchJetton?query=${encodeURIComponent(searchTerm)}`; // Поиск по имени/символу
        
        const response = await axios.get(endpoint);
        
        if (isAddress) {
          // Если это адрес и мы получили один токен
          if (response.data && response.data.data) {
            const token = response.data.data;
            const formattedToken = {
              id: token.contract_address,
              name: token.name,
              symbol: token.symbol,
              image: token.image_url,
              metrics: `Price: $${parseFloat(token.usd_price).toFixed(4)} | TON: ${parseFloat(token.ton_price).toFixed(6)}`,
              address: token.contract_address,
              market_cap: token.market_cap,
              popularity_index: token.popularity_index,
            };
            setTokens([formattedToken]);
          } else {
            setTokens([]);
            setError('Токен не найден');
          }
        } else {
          // Если это поиск по имени и получили список токенов
          const tokenData = response.data && response.data.data ? response.data.data : [];
          
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
          
          // Фильтруем результаты по популярности
          const filteredTokens = formattedTokens.filter(token => 
            token.popularity_index && parseFloat(token.popularity_index) > popularityFilter
          );
          
          setTokens(filteredTokens);
          
          if (filteredTokens.length === 0) {
            setError('Токенов, соответствующих запросу, не найдено');
          }
        }
        
        // Сбрасываем состояние пагинации, так как это новый поиск
        setPage(1);
        setHasMore(false);
        
      } catch (err) {
        console.error('Ошибка поиска токена:', err);
        setError('Не удалось выполнить поиск. Пожалуйста, проверьте адрес и попробуйте снова.');
        setTokens([]);
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
    }, [sortType, popularityFilter]);
    
    const handleAddToFavorites = (token) => {
      console.log(`Added ${token.name} to favorites`);
    };
    
    const handleOpenDetails = (token) => {
      navigate(`/token/${token.id}`);
    };
    
    // Обработчик изменения строки поиска
    const handleSearchChange = (e) => {
      setSearchTerm(e.target.value);
    };
    
    // Обработчик поиска
    const handleSearch = (e) => {
      e.preventDefault();
      searchTokenByAddress();
    };
    
    // Обработчик сброса поиска
    const handleClearSearch = () => {
      setSearchTerm('');
      setPage(1);
      setHasMore(true);
      fetchTokens(1);
    };
    
    // Обработчик изменения типа сортировки
    const handleSortChange = (type) => {
      if (type !== sortType) {
        setSortType(type);
        setPage(1);
        setHasMore(true);
      }
    };
    
    // Обработчик изменения фильтра популярности
    const handlePopularityChange = (value) => {
      setPopularityFilter(value);
      setIsPopularityMenuOpen(false);
    };
    
    // Обработчик ввода пользовательского значения популярности
    const handleCustomPopularityChange = (e) => {
      setCustomPopularity(e.target.value);
    };
    
    // Применение пользовательского значения популярности
    const applyCustomPopularity = () => {
      const value = parseFloat(customPopularity);
      if (!isNaN(value) && value >= 0) {
        setPopularityFilter(value);
        setIsPopularityMenuOpen(false);
        setCustomPopularity('');
      }
    };
    
    // Обработчик клика вне меню популярности для закрытия
    useEffect(() => {
      const handleClickOutside = (event) => {
        const menu = document.querySelector('.popularity-menu');
        const button = document.querySelector('.popularity-button');
        
        if (menu && button && !menu.contains(event.target) && !button.contains(event.target)) {
          setIsPopularityMenuOpen(false);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isPopularityMenuOpen]);
    
    if (error && tokens.length === 0) {
      return (
        <div className="tokens-container">
          <div className="search-bar">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Поиск токена по названию или адресу"
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
              <button type="submit" className="search-button">Поиск</button>
            </form>
          </div>
          
          <div className="error">
            {error}
            <button className="clear-search-button" onClick={handleClearSearch}>
              Вернуться к списку
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="tokens-container">
        {/* Строка поиска */}
        <div className="search-bar">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Поиск токена по названию или адресу"
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            <button type="submit" className="search-button">Поиск</button>
            {searchTerm && (
              <button type="button" className="clear-button" onClick={handleClearSearch}>
                ×
              </button>
            )}
          </form>
        </div>
        
        {/* Панель сортировки */}
        <div className="sort-panel">
          <div className="sort-buttons">
            <button 
              className={`sort-button ${sortType === 'market_cap' ? 'active' : ''}`}
              onClick={() => handleSortChange('market_cap')}
            >
              MCap
            </button>
            <button 
              className={`sort-button ${sortType === 'price' ? 'active' : ''}`}
              onClick={() => handleSortChange('price')}
            >
              Price
            </button>
            <button 
              className={`sort-button ${sortType === 'price_change_1m' ? 'active' : ''}`}
              onClick={() => handleSortChange('price_change_1m')}
            >
              1m
            </button>
            <button 
              className={`sort-button ${sortType === 'price_change_15m' ? 'active' : ''}`}
              onClick={() => handleSortChange('price_change_15m')}
            >
              15m
            </button>
            <button 
              className={`sort-button ${sortType === 'price_change_1h' ? 'active' : ''}`}
              onClick={() => handleSortChange('price_change_1h')}
            >
              1h
            </button>
            <button 
              className={`sort-button ${sortType === 'price_change_24h' ? 'active' : ''}`}
              onClick={() => handleSortChange('price_change_24h')}
            >
              24h
            </button>
          </div>
        </div>
        
        {/* Фильтр по популярности */}
        <div className="popularity-filter">
          <button 
            className="popularity-button"
            onClick={() => setIsPopularityMenuOpen(!isPopularityMenuOpen)}
          >
            Популярность &gt; {popularityFilter}
          </button>
          
          {isPopularityMenuOpen && (
            <div className="popularity-menu">
              <button onClick={() => handlePopularityChange(0)}>Показать все (&gt; 0)</button>
              <button onClick={() => handlePopularityChange(1)}>Популярность &gt; 1</button>
              <button onClick={() => handlePopularityChange(5)}>Популярность &gt; 5</button>
              <button onClick={() => handlePopularityChange(10)}>Популярность &gt; 10</button>
              <button onClick={() => handlePopularityChange(50)}>Популярность &gt; 50</button>
              <button onClick={() => handlePopularityChange(100)}>Популярность &gt; 100</button>
              <div className="custom-popularity">
                <input
                  type="number"
                  placeholder="Своё значение"
                  value={customPopularity}
                  onChange={handleCustomPopularityChange}
                  min="0"
                />
                <button onClick={applyCustomPopularity}>Применить</button>
              </div>
            </div>
          )}
        </div>
        
        {/* Список токенов */}
        {error && tokens.length > 0 && (
          <div className="error-banner">{error}</div>
        )}
        
        <div className="tokens-list">
          {tokens.map((token, index) => {
            // Если это последний элемент, добавляем ref для отслеживания
            if (tokens.length === index + 1 && hasMore) {
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
            <p>Нет токенов, соответствующих заданным условиям</p>
            <button className="load-more-button" onClick={handleClearSearch}>
              Сбросить фильтры
            </button>
          </div>
        )}
        
        {isLoading && (
          <div className="loading-more">Загрузка токенов...</div>
        )}
        
        {!isLoading && hasMore && tokens.length > 0 && (
          <button className="load-more-button" onClick={loadMoreTokens}>
            Загрузить еще
          </button>
        )}
        
        {!hasMore && tokens.length > 0 && !searchTerm && (
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

