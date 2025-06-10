import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Typography,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { Edit, Delete, Add, Block, CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import BackButton from '../layout/BackButton';
import api from '../../services/api';
import toast from 'react-hot-toast';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blockDialog, setBlockDialog] = useState({ open: false, user: null, action: '' });
  const [motivo, setMotivo] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('usuarios/');
      setUsers(response.data.results || response.data);
    } catch (error) {
      toast.error('Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await api.delete(`usuarios/${id}/`);
        toast.success('Usuario eliminado correctamente');
        fetchUsers();
      } catch (error) {
        toast.error('Error al eliminar el usuario');
      }
    }
  };

  const handleBlockUser = (user, action) => {
    setBlockDialog({ open: true, user, action });
    setMotivo('');
  };

  const confirmBlockUser = async () => {
    try {
      const { user, action } = blockDialog;
      const bloqueado = action === 'block';
      
      await api.patch(`usuarios/${user.id}/bloquear_usuario/`, {
        bloqueado,
        motivo
      });
      
      const actionText = bloqueado ? 'bloqueado' : 'desbloqueado';
      toast.success(`Usuario ${actionText} correctamente`);
      
      setBlockDialog({ open: false, user: null, action: '' });
      fetchUsers();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error al procesar la solicitud';
      toast.error(errorMessage);
    }
  };

  const getRolDisplay = (user) => {
    if (user.rol) {
      const roles = {
        'administrador': 'Administrador',
        'entrenador': 'Entrenador',
        'competidor': 'Competidor'
      };
      return roles[user.rol] || user.rol;
    }
    return user.is_staff ? 'Administrador' : 'Usuario';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <BackButton />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Gestión de Usuarios</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/usuarios/nuevo')}
        >
          Nuevo Usuario
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.nombre}</TableCell>
                <TableCell>{getRolDisplay(user)}</TableCell>
                <TableCell>
                  <Chip
                    label={user.is_active ? 'Activo' : 'Bloqueado'}
                    color={user.is_active ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton 
                    onClick={() => navigate(`/usuarios/editar/${user.id}`)}
                    title="Editar usuario"
                  >
                    <Edit />
                  </IconButton>
                  
                  {user.is_active ? (
                    <IconButton 
                      onClick={() => handleBlockUser(user, 'block')}
                      title="Bloquear usuario"
                      color="warning"
                    >
                      <Block />
                    </IconButton>
                  ) : (
                    <IconButton 
                      onClick={() => handleBlockUser(user, 'unblock')}
                      title="Desbloquear usuario"
                      color="success"
                    >
                      <CheckCircle />
                    </IconButton>
                  )}
                  
                  <IconButton 
                    onClick={() => handleDelete(user.id)}
                    title="Eliminar usuario"
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog para confirmar bloqueo/desbloqueo */}
      <Dialog open={blockDialog.open} onClose={() => setBlockDialog({ open: false, user: null, action: '' })}>
        <DialogTitle>
          {blockDialog.action === 'block' ? 'Bloquear Usuario' : 'Desbloquear Usuario'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            ¿Estás seguro de que quieres {blockDialog.action === 'block' ? 'bloquear' : 'desbloquear'} al usuario <strong>{blockDialog.user?.nombre}</strong>?
          </Typography>
          {blockDialog.action === 'block' && (
            <TextField
              fullWidth
              label="Motivo del bloqueo (opcional)"
              multiline
              rows={3}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBlockDialog({ open: false, user: null, action: '' })}>
            Cancelar
          </Button>
          <Button 
            onClick={confirmBlockUser} 
            variant="contained" 
            color={blockDialog.action === 'block' ? 'warning' : 'success'}
          >
            {blockDialog.action === 'block' ? 'Bloquear' : 'Desbloquear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export { UserList };
export default UserList;