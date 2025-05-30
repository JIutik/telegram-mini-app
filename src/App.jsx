import React, { useEffect, useState, useCallback, useMemo } from 'react';
// Импорты MUI
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { Box, Typography, Button, Card, CardContent, CircularProgress, IconButton, Alert, Snackbar } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Иконка для смены темы
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Иконка для смены темы

// Наш App.css будет сильно упрощен, но пока оставим его
import './App.css';

// --- Функция для создания темы MUI на основе themeParams Telegram ---
const getTelegramMuiTheme = (telegramThemeParams) => {
  const mode = telegramThemeParams.bg_color && isLightColor(telegramThemeParams.bg_color) ? 'light' : 'dark';

  return createTheme({
    palette: {
      mode: mode, // Определяем светлую/темную тему
      primary: {
        main: telegramThemeParams.button_color || '#0088cc', // Цвет кнопки Telegram как primary
        contrastText: telegramThemeParams.button_text_color || '#ffffff', // Цвет текста кнопки Telegram
      },
      secondary: {
        main: telegramThemeParams.link_color || '#007bff', // Цвет ссылок Telegram как secondary
      },
      background: {
        default: telegramThemeParams.bg_color || (mode === 'light' ? '#f0f2f5' : '#1e1e1e'),
        paper: telegramThemeParams.secondary_bg_color || telegramThemeParams.header_bg_color || (mode === 'light' ? '#ffffff' : '#2c2c2c'),
      },
      text: {
        primary: telegramThemeParams.text_color || (mode === 'light' ? '#333333' : '#ffffff'),
        secondary: telegramThemeParams.hint_color || (mode === 'light' ? '#888888' : '#bbbbbb'),
      },
      divider: telegramThemeParams.border_color || (mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)'),
    },
    typography: {
      fontFamily: ['Roboto', 'Arial', 'sans-serif'].join(','),
      h1: {
        fontSize: '2rem',
        fontWeight: 700,
      },
      h2: {
        fontSize: '1.5rem',
        fontWeight: 600,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8, // Немного скругленные углы, как в MD3
            textTransform: 'none', // Без заглавных букв
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12, // Более скругленные углы для карточек
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          },
        },
      },
      MuiPaper: { // Для Card, Dialog, Alert
        styleOverrides: {
          root: {
            // Убедимся, что Paper использует фоновый цвет из Telegram
            backgroundColor: telegramThemeParams.secondary_bg_color || telegramThemeParams.header_bg_color || (mode === 'light' ? '#ffffff' : '#2c2c2c'),
          },
        },
      },
    },
  });
};

// Вспомогательная функция для определения, светлый ли цвет
const isLightColor = (hexColor) => {
  if (!hexColor) return true;
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 180; // Порог яркости для определения "светлого" цвета
};

function App() {
  const [isTelegramApp, setIsTelegramApp] = useState(false);
  const [telegramThemeParams, setTelegramThemeParams] = useState({});
  const [initDataUnsafe, setInitDataUnsafe] = useState(null);
  const [platform, setPlatform] = useState('');
  const [version, setVersion] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info'); // 'success', 'error', 'warning', 'info'

  const muiTheme = useMemo(() => getTelegramMuiTheme(telegramThemeParams), [telegramThemeParams]);

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      setIsTelegramApp(true);

      tg.ready();
      tg.expand();

      setTelegramThemeParams(tg.themeParams);
      setInitDataUnsafe(tg.initDataUnsafe);
      setPlatform(tg.platform);
      setVersion(tg.version);

      tg.setHeaderColor(tg.themeParams.header_bg_color || '#0088cc');
      tg.setBackgroundColor(tg.themeParams.bg_color || '#f0f2f5');

      const handleThemeChange = () => {
        setTelegramThemeParams(tg.themeParams);
        tg.setHeaderColor(tg.themeParams.header_bg_color || '#0088cc');
        tg.setBackgroundColor(tg.themeParams.bg_color || '#f0f2f5');
        console.log('Тема изменена:', tg.themeParams);
        showSnackbar('Тема изменена на: ' + (isLightColor(tg.themeParams.bg_color) ? 'Светлая' : 'Темная'), 'info');
      };
      tg.onEvent('themeChanged', handleThemeChange);

      // --- Управление MainButton ---
      tg.MainButton.setText('Нажмите Главную кнопку MUI!');
      tg.MainButton.show();
      tg.MainButton.disable(); // Отключим по умолчанию, пока не загрузится все
      setTimeout(() => tg.MainButton.enable(), 1000); // Включим через секунду
      tg.MainButton.onClick(() => {
        tg.showAlert('Вы нажали Главную кнопку!', () => {
          showSnackbar('Пользователь закрыл MainButton Alert', 'success');
        });
        tg.HapticFeedback.impactOccurred('medium');
      });

      // --- Управление BackButton ---
      // Для демонстрации, покажем ее и скроем через несколько секунд
      tg.BackButton.show();
      const handleBackButtonClick = () => {
        tg.showAlert('Вы нажали кнопку "Назад"! (В реальном приложении это вернет на предыдущий экран)');
        tg.HapticFeedback.impactOccurred('light');
        tg.BackButton.hide(); // Скроем после нажатия для демонстрации
      };
      tg.BackButton.onClick(handleBackButtonClick);
      setTimeout(() => tg.BackButton.hide(), 5000); // Скрыть кнопку назад через 5 секунд

      return () => {
        if (tg.MainButton) {
          tg.MainButton.offClick(tg.MainButton.onClick);
          tg.MainButton.hide();
        }
        if (tg.BackButton) {
          tg.BackButton.offClick(handleBackButtonClick);
          tg.BackButton.hide();
        }
        tg.offEvent('themeChanged', handleThemeChange);
      };
    } else {
      console.warn('Telegram WebApp SDK не обнаружен. Запустите приложение внутри Telegram.');
      // Установим дефолтные параметры темы для работы вне Telegram
      setTelegramThemeParams({
        bg_color: '#f0f2f5',
        text_color: '#333333',
        hint_color: '#888888',
        link_color: '#007bff',
        button_color: '#0088cc',
        button_text_color: '#ffffff',
        header_bg_color: '#ffffff',
        secondary_bg_color: '#e6e9ee',
      });
    }
  }, []);

  const showSnackbar = useCallback((message, severity = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }, []);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleShowAlert = useCallback(() => {
    if (isTelegramApp) {
      window.Telegram.WebApp.showAlert('Это нативное всплывающее окно Telegram SDK!');
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    } else {
      showSnackbar('Это обычное окно alert. Запустите приложение в Telegram, чтобы увидеть нативное.', 'info');
    }
  }, [isTelegramApp, showSnackbar]);

  const handleShowConfirm = useCallback(() => {
    if (isTelegramApp) {
      window.Telegram.WebApp.showConfirm('Вы уверены, что хотите продолжить?', (ok) => {
        if (ok) {
          window.Telegram.WebApp.showAlert('Вы подтвердили!');
          showSnackbar('Вы подтвердили действие!', 'success');
        } else {
          window.Telegram.WebApp.showAlert('Вы отменили.');
          showSnackbar('Вы отменили действие!', 'error');
        }
        window.Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
      });
    } else {
      if (confirm('Это обычное окно confirm. Запустите приложение в Telegram, чтобы увидеть нативное.')) {
        showSnackbar('Вы подтвердили действие!', 'success');
      } else {
        showSnackbar('Вы отменили действие!', 'error');
      }
    }
  }, [isTelegramApp, showSnackbar]);

  const handleHapticFeedback = useCallback((type) => {
    if (isTelegramApp && window.Telegram.WebApp.HapticFeedback) {
      if (type === 'light') window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
      else if (type === 'medium') window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
      else if (type === 'heavy') window.Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
      else if (type === 'selection') window.Telegram.WebApp.HapticFeedback.selectionChanged();
      else if (type === 'success') window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      else if (type === 'error') window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      else if (type === 'warning') window.Telegram.WebApp.HapticFeedback.notificationOccurred('warning');
      showSnackbar(`Тактильная отдача: ${type}`, 'info');
    } else {
      showSnackbar(`Тактильная отдача типа "${type}" недоступна вне Telegram.`, 'warning');
    }
  }, [isTelegramApp, showSnackbar]);

  const handleOpenTelegramLink = useCallback(() => {
    if (isTelegramApp) {
      window.Telegram.WebApp.openTelegramLink('https://t.me/telegram'); // Пример ссылки на канал Telegram
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    } else {
      window.open('https://t.me/telegram', '_blank');
      showSnackbar('Ссылка открыта в новой вкладке. В Telegram она откроется нативно.', 'info');
    }
  }, [isTelegramApp, showSnackbar]);

  // Функция для имитации смены темы для тестирования вне Telegram
  const toggleMockTheme = () => {
    setTelegramThemeParams(prevParams => {
      const isCurrentlyLight = isLightColor(prevParams.bg_color || '#f0f2f5');
      return {
        ...prevParams,
        bg_color: isCurrentlyLight ? '#1e1e1e' : '#f0f2f5',
        text_color: isCurrentlyLight ? '#ffffff' : '#333333',
        hint_color: isCurrentlyLight ? '#bbbbbb' : '#888888',
        header_bg_color: isCurrentlyLight ? '#2c2c2c' : '#ffffff',
        secondary_bg_color: isCurrentlyLight ? '#2c2c2c' : '#e6e9ee',
        button_color: isCurrentlyLight ? '#4a90e2' : '#0088cc', // Слегка меняем цвет кнопки для демонстрации
        button_text_color: '#ffffff',
        link_color: isCurrentlyLight ? '#8bc34a' : '#007bff',
      };
    });
    showSnackbar('Имитация смены темы', 'info');
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline enableColorScheme /> {/* Применяет базовые стили CSS и адаптацию к системной теме */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          p: 2, // padding
          boxSizing: 'border-box',
          bgcolor: 'background.default', // Используем цвет фона из темы MUI
          color: 'text.primary', // Используем цвет текста из темы MUI
          textAlign: 'center',
          fontFamily: 'typography.fontFamily',
        }}
      >
        <Card
          sx={{
            p: 4, // padding
            maxWidth: 600,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 3, // gap between sections
            animation: 'fadeInPop 1s forwards ease-out', // Сохраним анимацию появления
            animationDelay: '0.3s',
            opacity: 0,
            transform: 'translateY(20px) scale(0.98)',
            position: 'relative', // Для кнопки переключения темы
          }}
        >
          {/* Кнопка для переключения темы (только вне Telegram) */}
          {!isTelegramApp && (
            <IconButton
              sx={{ position: 'absolute', top: 16, right: 16 }}
              color="inherit"
              onClick={toggleMockTheme}
            >
              {muiTheme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          )}

          <Typography variant="h4" component="h1" color="primary">
            Демо Telegram Mini App (Material You)
          </Typography>
          <Typography variant="body1">
            Это заглушка, демонстрирующая возможности Telegram Web Apps SDK и Material Design 3.
            <br />
            {isTelegramApp ? (
              <Typography variant="caption" color="success.main" sx={{ fontWeight: 'bold' }}>
                Вы находитесь в Telegram WebApp. Весь функционал доступен!
              </Typography>
            ) : (
              <Typography variant="caption" color="error.main" sx={{ fontWeight: 'bold' }}>
                Вы вне Telegram. Некоторые функции могут быть ограничены.
              </Typography>
            )}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Box
              component="img"
              src="https://via.placeholder.com/120/0088cc/FFFFFF?text=MD3"
              alt="Material Design Demo"
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid',
                borderColor: 'primary.main',
                animation: 'imageBounce 0.8s ease-out forwards',
                animationDelay: '1s',
                transform: 'scale(0) rotate(-180deg)',
              }}
            />
          </Box>

          <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="h5" component="h2" color="primary" gutterBottom>
              Нативные взаимодействия SDK
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center' }}>
              <Button variant="contained" onClick={handleShowAlert}>
                Показать Alert
              </Button>
              <Button variant="contained" onClick={handleShowConfirm}>
                Показать Confirm
              </Button>
              <Button variant="outlined" onClick={() => handleHapticFeedback('light')}>
                Тактильная отдача (Light)
              </Button>
              <Button variant="outlined" onClick={() => handleHapticFeedback('success')}>
                Тактильная отдача (Success)
              </Button>
              <Button variant="contained" color="secondary" onClick={handleOpenTelegramLink}>
                Открыть Telegram ссылку
              </Button>
            </Box>
          </Card>

          <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="h5" component="h2" color="primary" gutterBottom>
              Информация о WebApp
            </Typography>
            {isTelegramApp ? (
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body2">
                  <strong>Платформа:</strong> {platform}
                </Typography>
                <Typography variant="body2">
                  <strong>Версия WebApp:</strong> {version}
                </Typography>
                <Typography variant="body2">
                  <strong>Режим темы:</strong> {muiTheme.palette.mode}
                </Typography>
                <Typography variant="body2">
                  <strong>Цвет фона (Telegram):</strong> {telegramThemeParams.bg_color}
                </Typography>
                <Typography variant="body2">
                  <strong>Цвет текста (Telegram):</strong> {telegramThemeParams.text_color}
                </Typography>
                <Typography variant="body2">
                  <strong>Инициализационные данные:</strong>
                  <Box component="pre" sx={{ bgcolor: 'rgba(0,0,0,0.05)', p: 1, borderRadius: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.8em' }}>
                    {initDataUnsafe ? JSON.stringify(initDataUnsafe, null, 2) : 'Нет данных'}
                  </Box>
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Информация о WebApp доступна только внутри Telegram.
              </Typography>
            )}
          </Card>
        </Card>

        {/* Snackbar для внутренних уведомлений MUI */}
        <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>

      </Box>
    </ThemeProvider>
  );
}

export default App;