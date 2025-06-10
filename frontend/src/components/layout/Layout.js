import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  const location = useLocation();
  
  // Determinar la clase de fondo según la ruta con más especificidad
  const getBackgroundClass = () => {
    const path = location.pathname;
    
    // Dashboard
    if (path === '/dashboard' || path === '/') return 'dashboard-background';
    
    // Competidores - todas las rutas relacionadas
    if (path.includes('/competidores')) return 'competitors-background';
    
    // Competiciones - todas las rutas relacionadas
    if (path.includes('/competiciones')) return 'competitions-background';
    
    // Combates - todas las rutas relacionadas
    if (path.includes('/combates')) return 'combats-background';
    
    // Estadísticas y reportes
    if (path.includes('/estadisticas') || path.includes('/reportes')) return 'statistics-background';
    
    // Usuarios (si quieres una imagen específica para gestión de usuarios)
    if (path.includes('/usuarios')) return 'competitors-background'; // o crear una nueva clase
    
    // Login y Register
    if (path.includes('/login') || path.includes('/register')) return 'dashboard-background';
    
    return 'dashboard-background'; // Fondo por defecto
  };

  return (
    <div className={`min-h-screen ${getBackgroundClass()}`}>
      <Navbar />
      <main className="content-container">
        {children}
      </main>
    </div>
  );
};

export default Layout;