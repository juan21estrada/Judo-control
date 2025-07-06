import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Box, Typography, Alert } from '@mui/material';

const RoleBasedRoute = ({ 
  children, 
  allowedRoles = [], 
  requireAuth = true,
  fallbackPath = '/dashboard',
  showAccessDenied = true 
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography>Verificando permisos...</Typography>
      </Box>
    );
  }
  
  // Verificar autenticación
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Verificar roles si se especificaron
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.rol)) {
    if (showAccessDenied) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="error">
            <Typography variant="h6">Acceso Denegado</Typography>
            <Typography>
              No tienes permisos para acceder a esta página. 
              Tu rol actual es: {user.rol}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Roles permitidos: {allowedRoles.join(', ')}
            </Typography>
          </Alert>
        </Box>
      );
    }
    return <Navigate to={fallbackPath} replace />;
  }
  
  return children;
};

export default RoleBasedRoute;