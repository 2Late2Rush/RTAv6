import { useEffect } from 'react'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import Navigation from '../components/Navigation'
import Tokens from '../components/Pages/Tokens'
import { ToastProvider } from '../components/ToastContext'


// Компоненты страниц

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
    <ToastProvider>
      <div className="container">
        <Navigation/>
        <main style={{ paddingTop: '60px' }}>
          <Routes>
            <Route path="/" element={<Tokens />} />
            <Route path="/about" element={<About />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </ToastProvider>
  )
}
       

export default App