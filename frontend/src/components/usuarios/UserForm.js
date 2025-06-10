import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import api from '../../services/api';
import toast from 'react-hot-toast';
import BackButton from '../layout/BackButton';

// ============================================================================
// CONSTANTES
// ============================================================================
const ROLES = [
  { value: 'competidor', label: 'Competidor' },
  { value: 'entrenador', label: 'Entrenador' },
  { value: 'administrador', label: 'Administrador' }
];

const INITIAL_FORM_DATA = {
  email: '',
  nombre: '',
  password: '',
  password2: '',
  rol: 'competidor'
};

const MIN_PASSWORD_LENGTH = 8;

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
const UserForm = () => {
  // --------------------------------------------------------------------------
  // HOOKS Y ESTADO
  // --------------------------------------------------------------------------
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  // --------------------------------------------------------------------------
  // EFECTOS
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (isEditing) {
      fetchUser();
    }
  }, [id, isEditing]);

  // --------------------------------------------------------------------------
  // FUNCIONES DE API
  // --------------------------------------------------------------------------
  const fetchUser = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get(`usuarios/${id}/`);
      const userData = response.data;
      
      setFormData({
        email: userData.email || '',
        nombre: userData.nombre || '',
        password: '',
        password2: '',
        rol: userData.rol || 'competidor'
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al cargar el usuario';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // MANEJADORES DE EVENTOS
  // --------------------------------------------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const submitData = prepareSubmitData();

      if (isEditing) {
        await api.put(`usuarios/${id}/`, submitData);
        toast.success('Usuario actualizado exitosamente');
      } else {
        await api.post('usuarios/', submitData);
        toast.success('Usuario creado exitosamente');
      }
      
      navigate('/usuarios');
    } catch (err) {
      console.error('Error detallado:', err.response?.data);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/usuarios');
  };

  // --------------------------------------------------------------------------
  // FUNCIONES DE UTILIDAD
  // --------------------------------------------------------------------------
  const validateForm = () => {
    // Validación de email
    if (!formData.email?.trim()) {
      setError('El email es obligatorio');
      return false;
    }

    // Validación de nombre
    if (!formData.nombre?.trim()) {
      setError('El nombre es obligatorio');
      return false;
    }

    // Validación de contraseña para nuevos usuarios
    if (!isEditing && !formData.password) {
      setError('La contraseña es obligatoria');
      return false;
    }

    // Validación de coincidencia de contraseñas
    if (!isEditing && formData.password !== formData.password2) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    // Validación de longitud de contraseña
    if (formData.password && formData.password.length < MIN_PASSWORD_LENGTH) {
      setError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`);
      return false;
    }

    // Validación de confirmación de contraseña cuando se edita
    if (isEditing && formData.password && formData.password !== formData.password2) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    return true;
  };

  const prepareSubmitData = () => {
    const submitData = {
      email: formData.email.trim(),
      nombre: formData.nombre.trim(),
      rol: formData.rol
    };

    // Solo incluir contraseñas si no estamos editando o si se proporcionó una nueva contraseña
    if (!isEditing || formData.password) {
      submitData.password = formData.password;
      submitData.password2 = formData.password2;
    }

    return submitData;
  };

  const getErrorMessage = (err) => {
    return err.response?.data?.message || 
           err.response?.data?.error ||
           Object.values(err.response?.data || {}).flat().join(', ') ||
           'Error al guardar el usuario';
  };

  // --------------------------------------------------------------------------
  // COMPONENTES DE RENDERIZADO
  // --------------------------------------------------------------------------
  const renderHeader = () => (
    <Box sx={{ mb: 3 }}>
      <BackButton to="/usuarios" label="Volver a Usuarios" />
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 2 }}>
        {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
      </Typography>
    </Box>
  );

  const renderErrorAlert = () => (
    error && (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    )
  );

  const renderFormFields = () => (
    <>
      <TextField
        fullWidth
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        margin="normal"
        required
        autoComplete="email"
      />

      <TextField
        fullWidth
        label="Nombre Completo"
        name="nombre"
        value={formData.nombre}
        onChange={handleChange}
        margin="normal"
        required
        autoComplete="name"
      />

      <TextField
        fullWidth
        label={isEditing ? "Nueva Contraseña (opcional)" : "Contraseña"}
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        margin="normal"
        required={!isEditing}
        helperText={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`}
        autoComplete={isEditing ? "new-password" : "current-password"}
      />

      <TextField
        fullWidth
        label="Confirmar Contraseña"
        name="password2"
        type="password"
        value={formData.password2}
        onChange={handleChange}
        margin="normal"
        required={!isEditing || formData.password}
        autoComplete="new-password"
      />

      <FormControl fullWidth margin="normal">
        <InputLabel>Rol</InputLabel>
        <Select
          name="rol"
          value={formData.rol}
          onChange={handleChange}
          label="Rol"
        >
          {ROLES.map((rol) => (
            <MenuItem key={rol.value} value={rol.value}>
              {rol.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );

  const renderActionButtons = () => (
    <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <Button
        type="submit"
        variant="contained"
        disabled={loading}
        sx={{ minWidth: 120 }}
      >
        {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear Usuario')}
      </Button>
      
      <Button
        variant="outlined"
        onClick={handleCancel}
        disabled={loading}
        sx={{ minWidth: 120 }}
      >
        Cancelar
      </Button>
    </Box>
  );

  // --------------------------------------------------------------------------
  // RENDERIZADO PRINCIPAL
  // --------------------------------------------------------------------------
  if (loading && isEditing) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {renderHeader()}
      {renderErrorAlert()}
      
      <Box 
        component="form" 
        onSubmit={handleSubmit} 
        sx={{ 
          maxWidth: 600,
          mx: 'auto'
        }}
      >
        {renderFormFields()}
        {renderActionButtons()}
      </Box>
    </Box>
  );
};

export { UserForm };
export default UserForm;