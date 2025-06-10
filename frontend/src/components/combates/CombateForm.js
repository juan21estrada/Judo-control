import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import api from '../../services/api';
import toast from 'react-hot-toast';
import BackButton from '../layout/BackButton';

// ============================================================================
// CONSTANTES
// ============================================================================
const INITIAL_FORM_DATA = {
  competicion: '',
  competidor1: '',
  competidor2: '',
};

const ALERT_MESSAGES = {
  NO_COMPETITORS: 'No hay competidores inscritos en esta competición. Debe inscribir competidores antes de crear combates.',
  NO_SAME_GENDER: 'No hay otros competidores del mismo género disponibles para enfrentar.',
  COMBAT_INFO: 'Una vez creado el combate, podrá controlarlo en tiempo real desde la lista de combates.',
  LIMIT_REACHED: 'Esta competición ya tiene el máximo de combates permitidos'
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
const CombateForm = () => {
  // --------------------------------------------------------------------------
  // HOOKS Y ESTADO
  // --------------------------------------------------------------------------
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  // Estados del formulario
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  // Estados de datos
  const [competiciones, setCompeticiones] = useState([]);
  const [competidores, setCompetidores] = useState([]);
  const [competidoresDisponibles, setCompetidoresDisponibles] = useState([]);

  // Estados de validación
  const [competicionSeleccionada, setCompeticionSeleccionada] = useState(null);
  const [combatesExistentes, setCombatesExistentes] = useState(0);
  const [puedeCrearCombate, setPuedeCrearCombate] = useState(true);

  // --------------------------------------------------------------------------
  // EFECTOS
  // --------------------------------------------------------------------------
  useEffect(() => {
    fetchCompeticiones();
    if (isEditing) {
      fetchCombate();
    } else {
      setLoadingData(false);
    }
  }, [id, isEditing]);

  // Filtrar competidores por género cuando se selecciona el primer competidor
  useEffect(() => {
    if (formData.competidor1 && competidores.length > 0) {
      const competidor1 = competidores.find(c => c.id === parseInt(formData.competidor1));
      if (competidor1) {
        const competidoresDelMismoGenero = competidores.filter(
          c => c.genero === competidor1.genero && c.id !== competidor1.id
        );
        setCompetidoresDisponibles(competidoresDelMismoGenero);
      }
    } else {
      setCompetidoresDisponibles(competidores);
    }
  }, [formData.competidor1, competidores]);

  // --------------------------------------------------------------------------
  // FUNCIONES DE API
  // --------------------------------------------------------------------------
  const fetchCompeticiones = async () => {
    try {
      const response = await api.get('competiciones/');
      setCompeticiones(response.data.results || response.data);
    } catch (err) {
      setError('Error al cargar las competiciones');
      console.error(err);
    }
  };

  const fetchCombate = async () => {
    try {
      setLoadingData(true);
      const response = await api.get(`combates/${id}/`);
      const data = response.data;
      
      setFormData({
        competicion: data.competicion,
        competidor1: data.competidor1,
        competidor2: data.competidor2,
      });
      
      // Cargar competidores de la competición
      if (data.competicion) {
        await fetchCompetidoresInscritos(data.competicion);
      }
    } catch (err) {
      setError('Error al cargar los datos del combate');
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchCompetidoresInscritos = async (competicionId) => {
    try {
      setLoading(true);
      const response = await api.get(`competiciones/${competicionId}/competidores_inscritos/`);
      const competidoresData = response.data || [];
      
      setCompetidores(competidoresData);
      setCompetidoresDisponibles(competidoresData);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al cargar los competidores inscritos';
      setError(errorMessage);
      toast.error(errorMessage);
      setCompetidores([]);
      setCompetidoresDisponibles([]);
    } finally {
      setLoading(false);
    }
  };

  const verificarLimiteCombates = async (competicionId) => {
    try {
      // Obtener datos de la competición
      const competicionResponse = await api.get(`competiciones/${competicionId}/`);
      const competicion = competicionResponse.data;
      
      // Obtener combates existentes de esta competición
      const combatesResponse = await api.get(`combates/?competicion=${competicionId}`);
      const combatesActuales = combatesResponse.data.results || combatesResponse.data;
      
      setCompeticionSeleccionada(competicion);
      setCombatesExistentes(combatesActuales.length);
      
      // Verificar si se puede crear un combate más
      const puedeCrear = combatesActuales.length < competicion.cantidad_combates_planificados;
      setPuedeCrearCombate(puedeCrear);
      
      if (!puedeCrear) {
        setError(`${ALERT_MESSAGES.LIMIT_REACHED} (${competicion.cantidad_combates_planificados})`);
      } else {
        setError('');
      }
    } catch (err) {
      console.error('Error al verificar límite de combates:', err);
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
    
    // Si cambia la competición, cargar competidores inscritos y verificar límite
    if (name === 'competicion' && value) {
      fetchCompetidoresInscritos(value);
      verificarLimiteCombates(value);
      
      // Limpiar competidores seleccionados
      setFormData(prev => ({
        ...prev,
        competidor1: '',
        competidor2: ''
      }));
    }

    // Si cambia el competidor1, limpiar competidor2
    if (name === 'competidor1') {
      setFormData(prev => ({
        ...prev,
        competidor2: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const submitData = {
      competicion: parseInt(formData.competicion, 10),
      competidor1: parseInt(formData.competidor1, 10),
      competidor2: parseInt(formData.competidor2, 10)
    };

    try {
      if (isEditing) {
        await api.put(`combates/${id}/`, submitData);
        toast.success('Combate actualizado exitosamente');
      } else {
        await api.post('combates/', submitData);
        toast.success('Combate creado exitosamente');
      }
      navigate('/combates');
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Error al guardar el combate';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/combates');
  };

  // --------------------------------------------------------------------------
  // FUNCIONES DE UTILIDAD
  // --------------------------------------------------------------------------
  const isFormDisabled = () => {
    return loading || 
           competidores.length === 0 || 
           (formData.competidor1 && competidoresDisponibles.length === 0) ||
           !puedeCrearCombate;
  };

  const getCompetitionStatus = () => {
    if (!competicionSeleccionada) return null;
    
    return {
      severity: puedeCrearCombate ? "info" : "warning",
      message: `Combates: ${combatesExistentes} de ${competicionSeleccionada.cantidad_combates_planificados} planificados${!puedeCrearCombate ? " - Límite alcanzado" : ""}`
    };
  };

  // --------------------------------------------------------------------------
  // COMPONENTES DE RENDERIZADO
  // --------------------------------------------------------------------------
  const renderHeader = () => (
    <Box sx={{ mb: 3 }}>
      <BackButton to="/combates" label="Volver a Combates" />
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 2 }}>
        {isEditing ? 'Editar Combate' : 'Nuevo Combate'}
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

  const renderCompeticionField = () => (
    <Grid item xs={12}>
      <TextField
        select
        fullWidth
        label="Competición"
        name="competicion"
        value={formData.competicion || ''}
        onChange={handleChange}
        required
        disabled={isEditing}
      >
        <MenuItem value="">Seleccione una competición</MenuItem>
        {competiciones.map((competicion) => (
          <MenuItem key={competicion.id} value={competicion.id}>
            {competicion.nombre}
          </MenuItem>
        ))}
      </TextField>
    </Grid>
  );

  const renderCompetidorFields = () => {
    if (!formData.competicion) return null;

    return (
      <>
        <Grid item xs={12}>
          <TextField
            select
            fullWidth
            label="Competidor 1"
            name="competidor1"
            value={formData.competidor1 || ''}
            onChange={handleChange}
            required
            disabled={competidores.length === 0}
          >
            <MenuItem value="">Seleccione el primer competidor</MenuItem>
            {competidores.map((competidor) => (
              <MenuItem key={competidor.id} value={competidor.id}>
                {competidor.nombre} ({competidor.genero})
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <TextField
            select
            fullWidth
            label="Competidor 2"
            name="competidor2"
            value={formData.competidor2 || ''}
            onChange={handleChange}
            required
            disabled={competidoresDisponibles.length === 0 || !formData.competidor1}
          >
            <MenuItem value="">Seleccione el segundo competidor</MenuItem>
            {competidoresDisponibles.map((competidor) => (
              <MenuItem key={competidor.id} value={competidor.id}>
                {competidor.nombre} ({competidor.genero})
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </>
    );
  };

  const renderAlerts = () => {
    const competitionStatus = getCompetitionStatus();
    
    return (
      <>
        {/* Alerta de estado de competición */}
        {competitionStatus && (
          <Grid item xs={12}>
            <Alert severity={competitionStatus.severity} sx={{ mb: 2 }}>
              {competitionStatus.message}
            </Alert>
          </Grid>
        )}

        {/* Alerta de no competidores */}
        {competidores.length === 0 && formData.competicion && (
          <Grid item xs={12}>
            <Alert severity="warning">
              {ALERT_MESSAGES.NO_COMPETITORS}
            </Alert>
          </Grid>
        )}

        {/* Alerta de no competidores del mismo género */}
        {formData.competidor1 && competidoresDisponibles.length === 0 && (
          <Grid item xs={12}>
            <Alert severity="info">
              {ALERT_MESSAGES.NO_SAME_GENDER}
            </Alert>
          </Grid>
        )}

        {/* Alerta informativa */}
        <Grid item xs={12}>
          <Alert severity="info">
            {ALERT_MESSAGES.COMBAT_INFO}
          </Alert>
        </Grid>
      </>
    );
  };

  const renderActionButtons = () => (
    <Grid item xs={12}>
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          startIcon={<Cancel />}
          onClick={handleCancel}
          disabled={loading}
          sx={{ minWidth: 120 }}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          startIcon={<Save />}
          disabled={isFormDisabled()}
          sx={{ bgcolor: '#1a237e', minWidth: 120 }}
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      </Box>
    </Grid>
  );

  // --------------------------------------------------------------------------
  // RENDERIZADO PRINCIPAL
  // --------------------------------------------------------------------------
  if (loadingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {renderHeader()}
      
      <Card sx={{ maxWidth: 800, mx: 'auto' }}>
        <CardContent>
          {renderErrorAlert()}
          
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {renderCompeticionField()}
              {renderCompetidorFields()}
              {renderAlerts()}
              {renderActionButtons()}
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CombateForm;