import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Container,
} from '@mui/material';
import { Add, PlayArrow, Visibility, Delete } from '@mui/icons-material';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import BackButton from '../layout/BackButton';
import toast from 'react-hot-toast';

// ============================================================================
// CONSTANTES
// ============================================================================
const COMBAT_STATUS = {
  ACTIVE: 'activos',
  FINISHED: 'finalizados'
};

const ALERT_MESSAGES = {
  NO_ACTIVE_COMBATS: 'No hay combates activos para la competición seleccionada.',
  NO_FINISHED_COMBATS: 'No hay combates finalizados para la competición seleccionada.',
  SELECT_COMPETITION: 'Selecciona una competición para ver los combates disponibles.',
  DELETE_CONFIRMATION: '¿Está seguro de que desea eliminar este combate? Esta acción eliminará también todas las acciones registradas y no se puede deshacer.'
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
const CombatesList = () => {
  // --------------------------------------------------------------------------
  // HOOKS Y ESTADO
  // --------------------------------------------------------------------------
  const [searchParams] = useSearchParams();
  const { isEntrenador } = useAuth();

  // Estados principales
  const [combates, setCombates] = useState([]);
  const [competiciones, setCompeticiones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados de filtros
  const [selectedCompeticion, setSelectedCompeticion] = useState('');
  const [combateStatus, setCombateStatus] = useState(COMBAT_STATUS.ACTIVE);

  // Estados de UI
  const [deleteDialog, setDeleteDialog] = useState({ open: false, combate: null });

  // --------------------------------------------------------------------------
  // EFECTOS
  // --------------------------------------------------------------------------
  useEffect(() => {
    fetchCompeticiones();
    
    const competicionParam = searchParams.get('competicion');
    if (competicionParam) {
      setSelectedCompeticion(competicionParam);
    }
  }, [searchParams]);

  // Solo cargar combates cuando se selecciona una competición
  useEffect(() => {
    if (selectedCompeticion) {
      fetchCombates();
    } else {
      setCombates([]);
    }
  }, [selectedCompeticion, combateStatus]);

  // --------------------------------------------------------------------------
  // FUNCIONES DE API
  // --------------------------------------------------------------------------
  const fetchCompeticiones = async () => {
    try {
      const response = await api.get('competiciones/');
      const competicionesActivas = (response.data.results || response.data)
        .filter(comp => !comp.finalizada);
      setCompeticiones(competicionesActivas);
    } catch (err) {
      console.error('Error al cargar competiciones:', err);
      setError('Error al cargar las competiciones');
    }
  };

  const fetchCombates = async () => {
    if (!selectedCompeticion) {
      setCombates([]);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const finalizado = combateStatus === COMBAT_STATUS.FINISHED;
      const params = new URLSearchParams({
        finalizado: finalizado.toString(),
        competicion: selectedCompeticion
      });
      
      const response = await api.get(`combates/?${params.toString()}`);
      setCombates(response.data.results || response.data);
    } catch (err) {
      setError('Error al cargar los combates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`combates/${deleteDialog.combate.id}/`);
      setCombates(combates.filter(c => c.id !== deleteDialog.combate.id));
      toast.success('Combate eliminado correctamente');
      setDeleteDialog({ open: false, combate: null });
    } catch (err) {
      toast.error('Error al eliminar el combate');
      console.error(err);
    }
  };

  // --------------------------------------------------------------------------
  // MANEJADORES DE EVENTOS
  // --------------------------------------------------------------------------
  const handleCompeticionChange = (e) => {
    const value = e.target.value;
    setSelectedCompeticion(value);
    setError('');
  };

  const handleStatusChange = (event, newStatus) => {
    if (newStatus !== null) {
      setCombateStatus(newStatus);
    }
  };

  const handleDeleteClick = (combate) => {
    setDeleteDialog({ open: true, combate });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, combate: null });
  };

  // --------------------------------------------------------------------------
  // FUNCIONES DE UTILIDAD
  // --------------------------------------------------------------------------
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusChip = (combate) => {
    if (combate.finalizado) {
      return <Chip label="Finalizado" color="default" size="small" />;
    } else if (combate.iniciado) {
      return <Chip label="En curso" color="success" size="small" />;
    } else {
      return <Chip label="No iniciado" color="warning" size="small" />;
    }
  };

  const getEmptyMessage = () => {
    if (!selectedCompeticion) {
      return ALERT_MESSAGES.SELECT_COMPETITION;
    }
    
    return combateStatus === COMBAT_STATUS.ACTIVE 
      ? ALERT_MESSAGES.NO_ACTIVE_COMBATS
      : ALERT_MESSAGES.NO_FINISHED_COMBATS;
  };

  const getSelectedCompeticionName = () => {
    const competicion = competiciones.find(c => c.id.toString() === selectedCompeticion);
    return competicion ? competicion.nombre : '';
  };

  // --------------------------------------------------------------------------
  // COMPONENTES DE RENDERIZADO
  // --------------------------------------------------------------------------
  const renderHeader = () => (
    <Box sx={{ mb: 3 }}>
      <BackButton to="/dashboard" label="Volver al Dashboard" />
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
        <Typography variant="h4" component="h1">
          Lista de Combates
        </Typography>
        {isEntrenador && (
          <Button
            component={Link}
            to="/combates/nuevo"
            variant="contained"
            startIcon={<Add />}
          >
            Nuevo Combate
          </Button>
        )}
      </Box>
    </Box>
  );

  const renderFilters = () => (
    <Box mb={3}>
      {/* Filtro de competiciones */}
      <Box mb={2}>
        <Typography variant="h6" gutterBottom>
          Seleccionar Competición
        </Typography>
        <FormControl fullWidth sx={{ maxWidth: 400 }}>
          <InputLabel>Competición</InputLabel>
          <Select
            value={selectedCompeticion}
            label="Competición"
            onChange={handleCompeticionChange}
          >
            <MenuItem value="">
              <em>Selecciona una competición</em>
            </MenuItem>
            {competiciones.map((competicion) => (
              <MenuItem key={competicion.id} value={competicion.id}>
                {competicion.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Filtro de estado de combates - Solo visible si hay competición seleccionada */}
      {selectedCompeticion && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Estado de Combates
          </Typography>
          <ToggleButtonGroup
            value={combateStatus}
            exclusive
            onChange={handleStatusChange}
            aria-label="estado combates"
          >
            <ToggleButton value={COMBAT_STATUS.ACTIVE} aria-label="activos">
              Combates Activos
            </ToggleButton>
            <ToggleButton value={COMBAT_STATUS.FINISHED} aria-label="finalizados">
              Combates Finalizados
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}
    </Box>
  );

  const renderSelectedCompetitionInfo = () => {
    if (!selectedCompeticion) return null;

    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        Mostrando combates {combateStatus === COMBAT_STATUS.ACTIVE ? 'activos' : 'finalizados'} de: <strong>{getSelectedCompeticionName()}</strong>
      </Alert>
    );
  };

  const renderCombateCard = (combate) => (
    <Grid item xs={12} md={6} lg={4} key={combate.id}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {combate.competidor1_nombre} vs {combate.competidor2_nombre}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Competición: {combate.competicion_nombre}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Fecha: {formatDate(combate.fecha_hora)}
          </Typography>

          <Box sx={{ mt: 1, mb: 1 }}>
            {getStatusChip(combate)}
          </Box>

          {combate.finalizado && combate.ganador_detalle && (
            <Typography variant="body2" color="success.main" gutterBottom>
              Ganador: {combate.ganador_detalle.nombre}
            </Typography>
          )}

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <IconButton
                component={Link}
                to={`/combates/${combate.id}`}
                color="primary"
                title="Ver detalles"
              >
                <Visibility />
              </IconButton>
              {isEntrenador && !combate.finalizado && (
                <IconButton
                  component={Link}
                  to={`/combates/${combate.id}/control`}
                  color="success"
                  title="Controlar combate"
                >
                  <PlayArrow />
                </IconButton>
              )}
            </Box>
            
            {isEntrenador && (
              <IconButton
                onClick={() => handleDeleteClick(combate)}
                color="error"
                title="Eliminar"
              >
                <Delete />
              </IconButton>
            )}
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );

  const renderCombatesList = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      );
    }

    if (combates.length === 0) {
      return (
        <Alert severity={selectedCompeticion ? "info" : "warning"}>
          {getEmptyMessage()}
        </Alert>
      );
    }

    return (
      <Grid container spacing={3}>
        {combates.map(renderCombateCard)}
      </Grid>
    );
  };

  const renderDeleteDialog = () => (
    <Dialog 
      open={deleteDialog.open} 
      onClose={handleDeleteCancel}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Confirmar eliminación</DialogTitle>
      <DialogContent>
        <Typography>
          {ALERT_MESSAGES.DELETE_CONFIRMATION}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDeleteCancel}>
          Cancelar
        </Button>
        <Button onClick={handleDelete} color="error" variant="contained">
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );

  // --------------------------------------------------------------------------
  // RENDERIZADO PRINCIPAL
  // --------------------------------------------------------------------------
  return (
    <Box p={3}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {renderHeader()}
        {renderFilters()}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {renderSelectedCompetitionInfo()}
        {renderCombatesList()}
        {renderDeleteDialog()}
      </Container>
    </Box>
  );
};

export default CombatesList;