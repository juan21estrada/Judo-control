import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { createBrowserRouter } from 'react-router-dom';
import routes from './routes';

const root = createRoot(document.getElementById('root'));
const router = createBrowserRouter(
  routes,
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);