import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Button, Typography, Paper, Box, Alert } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    password2: '',
    rol: 'competidor',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password2) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      if (err.response && err.response.data) {
        // Formatear errores de la API
        const errorMessages = [];
        for (const key in err.response.data) {
          errorMessages.push(`${key}: ${err.response.data[key].join(', ')}`);
        }
        setError(errorMessages.join('\n'));
      } else {
        setError('Error al registrar usuario. Por favor, intente de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '400px',
        mx: 'auto',
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Registro de Competidor
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="nombre"
            label="Nombre completo"
            name="nombre"
            autoComplete="name"
            autoFocus
            value={formData.nombre}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Correo electrónico"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Contraseña"
            type="password"
            id="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password2"
            label="Confirmar contraseña"
            type="password"
            id="password2"
            autoComplete="new-password"
            value={formData.password2}
            onChange={handleChange}
          />
          <Typography variant="body2" color="primary" sx={{ mt: 2, mb: 1, textAlign: 'center' }}>
            Registro exclusivo para competidores
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, textAlign: 'center' }}>
            Para otros tipos de acceso, contacte al administrador del sistema.
          </Typography>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, bgcolor: '#1a237e' }}
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrarse como Competidor'}
          </Button>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" style={{ color: '#1a237e' }}>
                Inicia sesión
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;