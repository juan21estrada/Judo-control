import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container,
} from '@mui/material';
import { Add, Edit, Delete, EmojiEvents, PlayArrow, PersonAdd } from '@mui/icons-material';
import toast from 'react-hot-toast';


import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';


import BackButton from '../layout/BackButton';



const THEME_COLORS = {
  primary: '#1a237e',
  error: 'error',
  secondary: 'secondary',
  default: 'default',
};

const INITIAL_DELETE_DIALOG_STATE = {
  open: false,
  competicion: null,
};



const formatDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES');
};

const getEventoColor = (evento) => {
  return evento === 'combate_oficial' ? 'error' : 'primary';
};

const getTipoColor = (tipo) => {
  return tipo === 'internacional' ? 'secondary' : 'default';
};

const getEventoLabel = (evento) => {
  return evento === 'combate_oficial' ? 'Combate Oficial' : 'Entrenamiento';
};

const getTipoLabel = (tipo) => {
  return tipo === 'internacional' ? 'Internacional' : 'Nacional';
};



const CompeticionesList = () => {
 
  
  const [competiciones, setCompeticiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(INITIAL_DELETE_DIALOG_STATE);
  
 
  
  const { isEntrenador } = useAuth();
  
  useEffect(() => {
    fetchCompeticiones();
  }, []);
  
 
  
  const fetchCompeticiones = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get('competiciones/');
      const data = response.data.results || response.data;
      
      setCompeticiones(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al cargar las competiciones';
      setError(errorMessage);
      console.error('Error fetching competiciones:', err);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
 
  
  const handleDeleteClick = (competicion) => {
    setDeleteDialog({ open: true, competicion });
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialog(INITIAL_DELETE_DIALOG_STATE);
  };
  
  const handleDeleteConfirm = async () => {
    if (!deleteDialog.competicion) return;
    
    try {
      await api.delete(`competiciones/${deleteDialog.competicion.id}/`);
      
      setCompeticiones(prev => 
        prev.filter(c => c.id !== deleteDialog.competicion.id)
      );
      
      toast.success('Competición eliminada correctamente');
      setDeleteDialog(INITIAL_DELETE_DIALOG_STATE);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar la competición';
      toast.error(errorMessage);
      console.error('Error deleting competicion:', err);
    }
  };
  
 
  
  const renderLoadingState = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <CircularProgress size={60} />
    </Box>
  );
  
  const renderHeader = () => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
        🏆 Competiciones
      </Typography>
      {isEntrenador && (
        <Button
          variant="contained"
          startIcon={<Add />}
          component={Link}
          to="/competiciones/nueva"
          sx={{ 
            bgcolor: THEME_COLORS.primary,
            '&:hover': {
              bgcolor: '#0d47a1',
            },
          }}
        >
          Nueva Competición
        </Button>
      )}
    </Box>
  );
  
  const renderCompeticionInfo = (competicion) => (
    <Box>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        👥 Atletas: {competicion.cantidad_atletas || 0}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        🥋 Combates: {competicion.cantidad_combates_realizados || 0}/{competicion.cantidad_combates_planificados || 0}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        👨‍🏫 Creado por: {competicion.creado_por_nombre || 'No especificado'}
      </Typography>
    </Box>
  );
  
  const renderCompeticionChips = (competicion) => (
    <Box sx={{ mb: 2 }}>
      <Chip
        label={getEventoLabel(competicion.evento)}
        color={getEventoColor(competicion.evento)}
        size="small"
        sx={{ mr: 1, mb: 1 }}
      />
      <Chip
        label={getTipoLabel(competicion.tipo)}
        color={getTipoColor(competicion.tipo)}
        size="small"
        sx={{ mb: 1 }}
      />
    </Box>
  );
  
  const renderCompeticionActions = (competicion) => (
    isEntrenador && (
      <Box sx={{ 
        mt: 2, 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 1,
        alignItems: { xs: 'stretch', sm: 'center' },
      }}>
        <Button
          variant="contained"
          size="small"
          startIcon={<PersonAdd />}
          component={Link}
          to={`/competiciones/${competicion.id}/inscribir`}
          sx={{ flex: 1 }}
        >
          Inscribir
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<PlayArrow />}
          component={Link}
          to={`/combates?competicion=${competicion.id}`}
          sx={{ flex: 1 }}
        >
          Ver Combates
        </Button>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton
            component={Link}
            to={`/competiciones/${competicion.id}/editar`}
            color="primary"
            size="small"
          >
            <Edit />
          </IconButton>
          <IconButton
            onClick={() => handleDeleteClick(competicion)}
            color="error"
            size="small"
          >
            <Delete />
          </IconButton>
        </Box>
      </Box>
    )
  );
  
  const renderCompeticionCard = (competicion) => (
    <Grid item xs={12} md={6} lg={4} key={competicion.id}>
      <Card 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4,
          },
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <EmojiEvents sx={{ fontSize: 40, color: THEME_COLORS.primary, mr: 2 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                {competicion.nombre}
              </Typography>
              <Typography color="text.secondary">
                📅 {formatDate(competicion.fecha)}
              </Typography>
            </Box>
          </Box>
          
          {/* Chips */}
          {renderCompeticionChips(competicion)}
          
          {/* Info */}
          {renderCompeticionInfo(competicion)}
          
          {/* Actions */}
          {renderCompeticionActions(competicion)}
        </CardContent>
      </Card>
    </Grid>
  );
  
  const renderEmptyState = () => (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <EmojiEvents sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        No hay competiciones disponibles
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {isEntrenador 
          ? 'Crea tu primera competición para comenzar'
          : 'Las competiciones aparecerán aquí cuando estén disponibles'
        }
      </Typography>
      {isEntrenador && (
        <Button
          variant="contained"
          startIcon={<Add />}
          component={Link}
          to="/competiciones/nueva"
          sx={{ bgcolor: THEME_COLORS.primary }}
        >
          Crear Primera Competición
        </Button>
      )}
    </Box>
  );
  
  const renderDeleteDialog = () => (
    <Dialog 
      open={deleteDialog.open} 
      onClose={handleDeleteCancel}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ pb: 1 }}>
        ⚠️ Confirmar eliminación
      </DialogTitle>
      <DialogContent>
        <Typography>
          ¿Está seguro de que desea eliminar la competición 
          <strong>"{deleteDialog.competicion?.nombre}"</strong>?
        </Typography>
        <Typography variant="body2" color="error" sx={{ mt: 2 }}>
          Esta acción eliminará también todos los combates asociados y no se puede deshacer.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleDeleteCancel} variant="outlined">
          Cancelar
        </Button>
        <Button 
          onClick={handleDeleteConfirm} 
          color="error" 
          variant="contained"
          startIcon={<Delete />}
        >
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
  
  // ========================================
  // MAIN RENDER
  // ========================================
  
  if (loading) {
    return renderLoadingState();
  }
  
  return (
    <div className="competitions-background">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Back Button */}
        <BackButton to="/dashboard" label="Volver al Dashboard" />
        
        {/* Header */}
        {renderHeader()}
        
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        
        {/* Content */}
        {competiciones.length === 0 ? (
          renderEmptyState()
        ) : (
          <Grid container spacing={3}>
            {competiciones.map(renderCompeticionCard)}
          </Grid>
        )}
        
        {/* Delete Dialog */}
        {renderDeleteDialog()}
      </Container>
    </div>
  );
};

export default CompeticionesList;