import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

// ============================================================================
// CONSTANTES Y CONFIGURACIÓN
// ============================================================================

const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user'
};

const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Credenciales inválidas. Por favor, intente de nuevo.',
  REGISTRATION_ERROR: 'Error al registrar usuario. Por favor, intente de nuevo.',
  CONTEXT_ERROR: 'useAuth debe ser usado dentro de un AuthProvider'
};

const USER_ROLES = {
  ADMIN: 'administrador',
  TRAINER: 'entrenador',
  COMPETITOR: 'competidor'
};

// ============================================================================
// CONTEXTO DE AUTENTICACIÓN
// ============================================================================

export const AuthContext = createContext();

// ============================================================================
// FUNCIONES UTILITARIAS
// ============================================================================

/**
 * Verifica si un token JWT ha expirado
 * @param {string} token - Token a verificar
 * @returns {boolean} True si el token ha expirado
 */
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // Para tokens JWT, verificar expiración
    if (token.includes('.')) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    }
    // Para tokens simples de Django, verificar si existe en localStorage
    return false;
  } catch {
    return true;
  }
};

/**
 * Configura el token de autorización en las cabeceras de la API
 * @param {string} token - Token de autenticación
 */
const setAuthToken = (token) => {
  if (token && !isTokenExpired(token)) {
    api.defaults.headers.Authorization = `Token ${token}`;
  } else {
    delete api.defaults.headers.Authorization;
    if (token && isTokenExpired(token)) {
      clearUserData();
    }
  }
};

/**
 * Guarda los datos del usuario en localStorage
 * @param {string} token - Token de autenticación
 * @param {Object} userData - Datos del usuario
 */
const saveUserData = (token, userData) => {
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
};

/**
 * Limpia los datos del usuario del localStorage
 */
const clearUserData = () => {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
};

/**
 * Obtiene los datos del usuario desde localStorage
 * @returns {Object|null} Datos del usuario o null
 */
const getStoredUserData = () => {
  try {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    
    if (token && storedUser) {
      return {
        token,
        user: JSON.parse(storedUser)
      };
    }
    return null;
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    return null;
  }
};

/**
 * Verifica si el usuario tiene un rol específico
 * @param {Object} user - Datos del usuario
 * @param {string} role - Rol a verificar
 * @returns {boolean}
 */
const hasRole = (user, role) => {
  return user?.rol === role;
};

/**
 * Verifica si el usuario es administrador
 * @param {Object} user - Datos del usuario
 * @returns {boolean}
 */
const isAdmin = (user) => hasRole(user, USER_ROLES.ADMIN);

/**
 * Verifica si el usuario es entrenador o administrador
 * @param {Object} user - Datos del usuario
 * @returns {boolean}
 */
const isTrainer = (user) => {
  return hasRole(user, USER_ROLES.TRAINER) || isAdmin(user);
};

/**
 * Verifica si el usuario es competidor
 * @param {Object} user - Datos del usuario
 * @returns {boolean}
 */
const isCompetitor = (user) => hasRole(user, USER_ROLES.COMPETITOR);

// ============================================================================
// PROVEEDOR DE CONTEXTO
// ============================================================================

export const AuthProvider = ({ children }) => {
  // ========================================
  // ESTADO
  // ========================================
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ========================================
  // EFECTOS
  // ========================================
  
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedData = getStoredUserData();
        
        if (storedData) {
          // Verificar si el token ha expirado
          if (isTokenExpired(storedData.token)) {
            clearUserData();
            setUser(null);
          } else {
            setUser(storedData.user);
            setAuthToken(storedData.token);
          }
        }
      } catch (error) {
        console.error('Error al cargar usuario:', error);
        clearUserData();
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Verificación periódica de expiración de tokens
  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (token && isTokenExpired(token)) {
        console.log('Token expirado, cerrando sesión automáticamente');
        logout();
      }
    };
    
    // Verificar cada minuto
    const interval = setInterval(checkTokenExpiration, 60000);
    return () => clearInterval(interval);
  }, [user]);

  // ========================================
  // FUNCIONES DE AUTENTICACIÓN
  // ========================================
  
  /**
   * Inicia sesión con email y contraseña
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise<Object>} Datos del usuario
   */
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      // Autenticar usuario
      const response = await api.post('token-auth/', { 
        username: email, 
        password 
      });
      const { token } = response.data;
      
      // Configurar token
      setAuthToken(token);
      
      // Obtener datos del usuario
      const userResponse = await api.get('usuarios/me/');
      const userData = userResponse.data;
      
      // Guardar datos
      saveUserData(token, userData);
      setUser(userData);
      
      return userData;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || ERROR_MESSAGES.INVALID_CREDENTIALS;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registra un nuevo usuario
   * @param {Object} userData - Datos del usuario a registrar
   * @returns {Promise<Object>} Datos del usuario registrado
   */
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      // Registrar usuario
      await api.post('usuarios/', userData);
      
      // Iniciar sesión automáticamente
      return await login(userData.email, userData.password);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || ERROR_MESSAGES.REGISTRATION_ERROR;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cierra la sesión del usuario
   */
  const logout = () => {
    clearUserData();
    setAuthToken(null);
    setUser(null);
    setError(null);
  };

  /**
   * Actualiza los datos del usuario
   * @param {Object} userData - Nuevos datos del usuario
   */
  const updateUser = (userData) => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (token) {
        saveUserData(token, userData);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
    }
  };

  /**
   * Limpia los errores
   */
  const clearError = () => {
    setError(null);
  };

  // ========================================
  // VALORES COMPUTADOS
  // ========================================
  
  const contextValue = {
    // Estado
    user,
    loading,
    error,
    
    // Funciones
    login,
    register,
    logout,
    updateUser,
    clearError,
    
    // Propiedades computadas
    isAuthenticated: !!user,
    isAdmin: isAdmin(user),
    isEntrenador: isTrainer(user),
    isCompetidor: isCompetitor(user),
  };

  // ========================================
  // RENDERIZADO
  // ========================================
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================================================
// HOOK PERSONALIZADO
// ============================================================================

/**
 * Hook para usar el contexto de autenticación
 * @returns {Object} Contexto de autenticación
 * @throws {Error} Si se usa fuera del AuthProvider
 */
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error(ERROR_MESSAGES.CONTEXT_ERROR);
  }
  
  return context;
};