import React, { useEffect, useState, useCallback } from 'react';
import './App.css'; // Наши стили

function App() {
  const [isTelegramApp, setIsTelegramApp] = useState(false);
  const [themeParams, setThemeParams] = useState({});
  const [initDataUnsafe, setInitDataUnsafe] = useState(null);
  const [platform, setPlatform] = useState('');
  const [version, setVersion] = useState('');

  // Инициализация Telegram WebApp
  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      setIsTelegramApp(true);

      tg.ready(); // Сообщаем Telegram, что приложение готово
      tg.expand(); // Разворачиваем приложение на весь экран

      // Сохраняем начальные данные
      setThemeParams(tg.themeParams);
      setInitDataUnsafe(tg.initDataUnsafe);
      setPlatform(tg.platform);
      setVersion(tg.version);

      // Установка цветов нативного заголовка и фона
      // Эти цвета будут видны только внутри Telegram
      tg.setHeaderColor(tg.themeParams.header_bg_color || '#0088cc');
      tg.setBackgroundColor(tg.themeParams.bg_color || '#f0f2f5');

      // Обновление темы при ее изменении в Telegram
      const handleThemeChange = () => {
        setThemeParams(tg.themeParams);
        tg.setHeaderColor(tg.themeParams.header_bg_color || '#0088cc');
        tg.setBackgroundColor(tg.themeParams.bg_color || '#f0f2f5');
        console.log('Тема изменена:', tg.themeParams);
      };
      tg.onEvent('themeChanged', handleThemeChange);

      // --- Управление MainButton ---
      tg.MainButton.setText('Нажмите Главную кнопку!');
      tg.MainButton.show();
      const handleMainButtonClick = () => {
        tg.showAlert('Вы нажали Главную кнопку!', () => {
          console.log('Пользователь закрыл MainButton Alert');
        });
        tg.HapticFeedback.impactOccurred('medium');
      };
      tg.MainButton.onClick(handleMainButtonClick);

      // --- Управление BackButton ---
      // В данном примере у нас нет нескольких страниц, но покажем, как ее можно было бы включить
      // tg.BackButton.show();
      // const handleBackButtonClick = () => {
      //   tg.showAlert('Вы нажали кнопку "Назад"!');
      //   // Здесь должна быть логика навигации назад, например, history.back() или изменение state
      // };
      // tg.BackButton.onClick(handleBackButtonClick);

      // Очистка при размонтировании компонента
      return () => {
        if (tg.MainButton) {
          tg.MainButton.offClick(handleMainButtonClick);
          tg.MainButton.hide();
        }
        // if (tg.BackButton) {
        //   tg.BackButton.offClick(handleBackButtonClick);
        //   tg.BackButton.hide();
        // }
        tg.offEvent('themeChanged', handleThemeChange);
      };
    } else {
      console.warn('Telegram WebApp SDK не обнаружен. Запустите приложение внутри Telegram.');
    }
  }, []);

  // --- Функции для демонстрации SDK ---

  const handleShowAlert = useCallback(() => {
    if (isTelegramApp) {
      window.Telegram.WebApp.showAlert('Это нативное всплывающее окно Telegram!');
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    } else {
      alert('Это обычное окно alert. Запустите приложение в Telegram, чтобы увидеть нативное.');
    }
  }, [isTelegramApp]);

  const handleShowConfirm = useCallback(() => {
    if (isTelegramApp) {
      window.Telegram.WebApp.showConfirm('Вы уверены, что хотите продолжить?', (ok) => {
        if (ok) {
          window.Telegram.WebApp.showAlert('Вы подтвердили!');
        } else {
          window.Telegram.WebApp.showAlert('Вы отменили.');
        }
        window.Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
      });
    } else {
      confirm('Это обычное окно confirm. Запустите приложение в Telegram, чтобы увидеть нативное.');
    }
  }, [isTelegramApp]);

  const handleHapticFeedback = useCallback((type) => {
    if (isTelegramApp && window.Telegram.WebApp.HapticFeedback) {
      if (type === 'light') window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
      else if (type === 'medium') window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
      else if (type === 'heavy') window.Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
      else if (type === 'selection') window.Telegram.WebApp.HapticFeedback.selectionChanged();
      else if (type === 'vibration') window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      window.Telegram.WebApp.showAlert(`Тактильная отдача: ${type}`);
    } else {
      alert(`Тактильная отдача типа "${type}" недоступна вне Telegram.`);
    }
  }, [isTelegramApp]);

  const handleOpenTelegramLink = useCallback(() => {
    if (isTelegramApp) {
      window.Telegram.WebApp.openTelegramLink('https://t.me/telegram'); // Пример ссылки на канал Telegram
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    } else {
      window.open('https://t.me/telegram', '_blank');
      alert('Ссылка открыта в новой вкладке. В Telegram она откроется нативно.');
    }
  }, [isTelegramApp]);

  // Стили, основанные на themeParams
  const containerStyle = {
    backgroundColor: themeParams.bg_color || 'var(--tg-theme-bg-color)',
    color: themeParams.text_color || 'var(--tg-theme-text-color)',
  };

  const contentBgStyle = {
    backgroundColor: themeParams.secondary_bg_color || 'var(--tg-theme-secondary-bg-color)',
  };

  const headerTextStyle = {
    color: themeParams.button_color || 'var(--tg-theme-button-color)',
  };

  const buttonStyle = {
    backgroundColor: themeParams.button_color || 'var(--tg-theme-button-color)',
    color: themeParams.button_text_color || 'var(--tg-theme-button-text-color)',
  };

  const linkStyle = {
    color: themeParams.link_color || 'var(--tg-theme-link-color)',
  };

  return (
    <div className="telegram-mini-app-container" style={containerStyle}>
      <div className="placeholder-content" style={contentBgStyle}>
        <h1 style={headerTextStyle}>Демо Telegram Mini App!</h1>
        <p>
          Это заглушка, демонстрирующая возможности Telegram Web Apps SDK.
          <br />
          {isTelegramApp ? (
            <small className="status-text in-telegram">
              Вы находитесь в Telegram WebApp. Весь функционал доступен!
            </small>
          ) : (
            <small className="status-text outside-telegram">
              Вы вне Telegram. Некоторые функции могут быть ограничены.
            </small>
          )}
        </p>

        <img src="https://via.placeholder.com/150/0088cc/FFFFFF?text=Demo" alt="Demo Image" className="placeholder-image" />

        <div className="feature-section">
          <h2>Нативные взаимодействия SDK</h2>
          <div className="button-group">
            <button className="styled-button" style={buttonStyle} onClick={handleShowAlert}>
              Показать Alert
            </button>
            <button className="styled-button" style={buttonStyle} onClick={handleShowConfirm}>
              Показать Confirm
            </button>
            <button className="styled-button" style={buttonStyle} onClick={() => handleHapticFeedback('light')}>
              Тактильная отдача (Light)
            </button>
            <button className="styled-button" style={buttonStyle} onClick={() => handleHapticFeedback('medium')}>
              Тактильная отдача (Medium)
            </button>
            <button className="styled-button" style={buttonStyle} onClick={() => handleHapticFeedback('success')}>
              Тактильная отдача (Success)
            </button>
            <button className="styled-button" style={buttonStyle} onClick={handleOpenTelegramLink}>
              Открыть Telegram ссылку
            </button>
          </div>
        </div>

        <div className="info-section">
          <h2>Информация о WebApp</h2>
          {isTelegramApp && (
            <div className="info-grid">
              <div><strong>Платформа:</strong> {platform}</div>
              <div><strong>Версия WebApp:</strong> {version}</div>
              <div><strong>Цвет фона (hex):</strong> {themeParams.bg_color}</div>
              <div><strong>Цвет текста (hex):</strong> {themeParams.text_color}</div>
              <div><strong>Инициализационные данные:</strong>
                <pre style={linkStyle}>
                  {initDataUnsafe ? JSON.stringify(initDataUnsafe, null, 2) : 'Нет данных'}
                </pre>
              </div>
            </div>
          )}
          {!isTelegramApp && <p>Информация о WebApp доступна только внутри Telegram.</p>}
        </div>

      </div>
    </div>
  );
}

export default App;