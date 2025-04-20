// Navigation.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navigation.css'; // Импортируем стили

const Navigation = () => {
  return (
    <nav>
      <ul>
        <li>
          <div className="nav-button">
            <NavLink to="/" className={({ isActive }) => (isActive ? 'active-link' : '')}>
              TOKENS
            </NavLink>
          </div>
        </li>
        <li>
          <div className="nav-button">
            <NavLink to="/about" className={({ isActive }) => (isActive ? 'active-link' : '')}>
              FAVOURITES
            </NavLink>
          </div>
        </li>
        <li>
          <div className="nav-button">
            <NavLink to="/settings" className={({ isActive }) => (isActive ? 'active-link' : '')}>
              WALLETS
            </NavLink>
          </div>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;