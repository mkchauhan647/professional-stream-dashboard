import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx'
import './index.css';
import { AppProvider } from './context/AppContext.tsx';
import { ToastProvider } from './context/ToastContext.tsx';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <AppProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AppProvider>
  </React.StrictMode>,
);