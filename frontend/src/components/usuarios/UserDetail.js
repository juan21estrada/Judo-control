import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import BackButton from '../layout/BackButton';

const UserDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserDetail();
  }, [id]);

  const fetchUserDetail = async () => {
    try {
      const response = await api.get(`usuarios/${id}/`);
      setUser(response.data);
    } catch (error) {
      setError('Error al cargar los detalles del usuario');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <BackButton to="/usuarios" label="Volver a Usuarios" />
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <BackButton to="/usuarios" label="Volver a Usuarios" />
      
      <Typography variant="h4" gutterBottom>
        Detalles del Usuario
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Información Personal
              </Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Nombre" 
                    secondary={user?.nombre || 'No especificado'} 
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText 
                    primary="Email" 
                    secondary={user?.email} 
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText 
                    primary="Fecha de registro" 
                    secondary={user?.date_joined ? new Date(user.date_joined).toLocaleDateString('es-ES') : 'No disponible'} 
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText 
                    primary="Último acceso" 
                    secondary={user?.last_login ? new Date(user.last_login).toLocaleDateString('es-ES') : 'Nunca'} 
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Estado y Permisos
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2">Rol:</Typography>
                  <Chip 
                    label={user?.is_staff ? 'Administrador' : user?.is_entrenador ? 'Entrenador' : 'Competidor'}
                    color={user?.is_staff ? 'error' : user?.is_entrenador ? 'warning' : 'primary'}
                  />
                </Box>
                
                <Box>
                  <Typography variant="subtitle2">Estado:</Typography>
                  <Chip 
                    label={user?.is_active ? 'Activo' : 'Bloqueado'}
                    color={user?.is_active ? 'success' : 'error'}
                  />
                </Box>
                
                <Box>
                  <Typography variant="subtitle2">Verificado:</Typography>
                  <Chip 
                    label={user?.email_verified ? 'Email verificado' : 'Email no verificado'}
                    color={user?.email_verified ? 'success' : 'warning'}
                    variant="outlined"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserDetail;