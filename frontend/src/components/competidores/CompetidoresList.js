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
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { Add, Edit, Delete, Person, FitnessCenter, Scale } from '@mui/icons-material';
import toast from 'react-hot-toast';

// Services & Context
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// Components
import BackButton from '../layout/BackButton';

// ============================================================================
// CONSTANTS
// ============================================================================

const THEME_COLORS = {
  primary: '#1a237e',
  secondary: '#3f51b5',
  error: 'error',
  success: 'success',
};

const INITIAL_DELETE_DIALOG_STATE = {
  open: false,
  competidor: null,
};

const GENERO_LABELS = {
  M: 'Masculino',
  F: 'Femenino',
};

const CATEGORIA_LABELS = {
  sub21_juvenil: 'Sub 21 - Juvenil',
  sub21_primera: 'Sub 21 - 1ra Categoría',
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getGeneroLabel = (genero) => {
  return GENERO_LABELS[genero] || 'No especificado';
};

const getCategoriaLabel = (categoria) => {
  return CATEGORIA_LABELS[categoria] || categoria;
};

const getGeneroIcon = (genero) => {
  return genero === 'M' ? '👨' : '👩';
};

const getExperienciaColor = (anos) => {
  if (anos >= 10) return 'success';
  if (anos >= 5) return 'warning';
  return 'default';
};

const getPesoColor = (peso) => {
  if (peso >= 100) return 'error';
  if (peso >= 81) return 'warning';
  if (peso >= 66) return 'info';
  return 'success';
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const CompetidoresList = () => {
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  
  const [competidores, setCompetidores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(INITIAL_DELETE_DIALOG_STATE);
  
  // ========================================
  // HOOKS
  // ========================================
  
  const { isEntrenador } = useAuth();
  
  useEffect(() => {
    fetchCompetidores();
  }, []);
  
  // ========================================
  // API FUNCTIONS
  // ========================================
  
  const fetchCompetidores = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get('competidores/');
      const data = response.data.results || response.data;
      
      setCompetidores(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al cargar los competidores';
      setError(errorMessage);
      console.error('Error fetching competidores:', err);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // ========================================
  // EVENT HANDLERS
  // ========================================
  
  const handleDeleteClick = (competidor) => {
    setDeleteDialog({ open: true, competidor });
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialog(INITIAL_DELETE_DIALOG_STATE);
  };
  
  const handleDeleteConfirm = async () => {
    if (!deleteDialog.competidor) return;
    
    try {
      await api.delete(`competidores/${deleteDialog.competidor.id}/`);
      
      setCompetidores(prev => 
        prev.filter(c => c.id !== deleteDialog.competidor.id)
      );
      
      toast.success('Competidor eliminado correctamente');
      setDeleteDialog(INITIAL_DELETE_DIALOG_STATE);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar el competidor';
      toast.error(errorMessage);
      console.error('Error deleting competidor:', err);
    }
  };
  
  // ========================================
  // RENDER FUNCTIONS
  // ========================================
  
  const renderLoadingState = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <CircularProgress size={60} />
    </Box>
  );
  
  const renderHeader = () => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
        🥋 Competidores
      </Typography>
      {isEntrenador && (
        <Button
          variant="contained"
          startIcon={<Add />}
          component={Link}
          to="/competidores/nuevo"
          sx={{ 
            bgcolor: THEME_COLORS.primary,
            '&:hover': {
              bgcolor: '#0d47a1',
            },
          }}
        >
          Nuevo Competidor
        </Button>
      )}
    </Box>
  );
  
  const renderCompetidorInfo = (competidor) => (
    <Box>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {getGeneroIcon(competidor.genero)} {getGeneroLabel(competidor.genero)}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        🎯 Experiencia: {competidor.anos_experiencia || 0} años
      </Typography>
      <Typography variant="body2" color="text.secondary">
        📊 Categoría: {getCategoriaLabel(competidor.categoria)}
      </Typography>
    </Box>
  );
  
  const renderCompetidorChips = (competidor) => (
    <Box sx={{ mb: 2 }}>
      <Chip
        icon={<Scale />}
        label={`${competidor.division_peso || 'N/A'} Kg`}
        color={getPesoColor(competidor.division_peso)}
        size="small"
        sx={{ mr: 1, mb: 1 }}
      />
      <Chip
        icon={<FitnessCenter />}
        label={`${competidor.anos_experiencia || 0} años`}
        color={getExperienciaColor(competidor.anos_experiencia)}
        size="small"
        sx={{ mb: 1 }}
      />
    </Box>
  );
  
  const renderCompetidorActions = (competidor) => (
    isEntrenador && (
      <Box sx={{ 
        mt: 2, 
        display: 'flex', 
        justifyContent: 'flex-end',
        gap: 0.5,
      }}>
        <IconButton
          component={Link}
          to={`/competidores/${competidor.id}/editar`}
          color="primary"
          size="small"
          sx={{
            '&:hover': {
              backgroundColor: 'rgba(26, 35, 126, 0.1)',
            },
          }}
        >
          <Edit />
        </IconButton>
        <IconButton
          onClick={() => handleDeleteClick(competidor)}
          color="error"
          size="small"
          sx={{
            '&:hover': {
              backgroundColor: 'rgba(211, 47, 47, 0.1)',
            },
          }}
        >
          <Delete />
        </IconButton>
      </Box>
    )
  );
  
  const renderCompetidorCard = (competidor) => (
    <Grid item xs={12} sm={6} md={4} key={competidor.id}>
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
            <Person sx={{ fontSize: 40, color: THEME_COLORS.primary, mr: 2 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                {competidor.nombre || 'Sin nombre'}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                ID: {competidor.id}
              </Typography>
            </Box>
          </Box>
          
          {/* Chips */}
          {renderCompetidorChips(competidor)}
          
          {/* Info */}
          {renderCompetidorInfo(competidor)}
          
          {/* Actions */}
          {renderCompetidorActions(competidor)}
        </CardContent>
      </Card>
    </Grid>
  );
  
  const renderEmptyState = () => (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Person sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        No hay competidores registrados
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {isEntrenador 
          ? 'Registra tu primer competidor para comenzar'
          : 'Los competidores aparecerán aquí cuando estén registrados'
        }
      </Typography>
      {isEntrenador && (
        <Button
          variant="contained"
          startIcon={<Add />}
          component={Link}
          to="/competidores/nuevo"
          sx={{ bgcolor: THEME_COLORS.primary }}
        >
          Registrar Primer Competidor
        </Button>
      )}
    </Box>
  );
  
  const renderStatsCard = () => (
    <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'white' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              📊 Resumen de Competidores
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Total registrados: {competidores.length}
            </Typography>
          </Box>
          <Person sx={{ fontSize: 48, opacity: 0.7 }} />
        </Box>
      </CardContent>
    </Card>
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
          ¿Está seguro de que desea eliminar al competidor 
          <strong>"{deleteDialog.competidor?.nombre}"</strong>?
        </Typography>
        <Typography variant="body2" color="error" sx={{ mt: 2 }}>
          Esta acción no se puede deshacer y eliminará todos los datos asociados.
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
    <div className="competitors-background">
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
        
        {/* Stats Card */}
        {competidores.length > 0 && renderStatsCard()}
        
        {/* Content */}
        {competidores.length === 0 ? (
          renderEmptyState()
        ) : (
          <Grid container spacing={3}>
            {competidores.map(renderCompetidorCard)}
          </Grid>
        )}
        
        {/* Delete Dialog */}
        {renderDeleteDialog()}
      </Container>
    </div>
  );
};

export default CompetidoresList;