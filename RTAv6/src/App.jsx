import { useEffect } from 'react'
import './App.css'
import { Routes, Route, Link } from 'react-router-dom'
import Navigation from '../components/Navigation'

// Компоненты страниц
const Home = () => <div>Домашняя страница</div>
const About = () => <div>О приложении</div>
const Settings = () => <div>Настройки</div>

function App() {
  useEffect(() => {
    // Инициализация Telegram Web App
    const tg = window.Telegram.WebApp
    tg.ready()
    
    // Отключаем нативную анимацию при переходе по ссылкам
    if (tg.version && parseFloat(tg.version) < 6.0) {
      tg.disableClosingConfirmation();
    }
    tg.expand()
    
    // Настройка главной кнопки (опционально)
    // tg.MainButton.setText('Главная кнопка')
    // tg.MainButton.show()
  }, [])

  return (
    <div className="container">
      <Navigation/>
      <main style={{ paddingTop: '60px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  )
}
       

export default App