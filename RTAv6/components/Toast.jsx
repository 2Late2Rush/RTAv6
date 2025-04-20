import React, { useState, useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, duration = 500, type = 'info', onClose }) => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        if (onClose) onClose();
      }, 300); // Дополнительное время для анимации исчезновения
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  return (
    <div className={`toast ${type} ${visible ? 'visible' : 'hidden'}`}>
      {message}
    </div>
  );
};

export default Toast;