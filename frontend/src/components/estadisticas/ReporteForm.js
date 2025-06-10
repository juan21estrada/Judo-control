import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Chip,
  MenuItem,
} from '@mui/material';
import { Save, Cancel, Assessment } from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import api from '../../services/api';
import toast from 'react-hot-toast';
import BackButton from '../layout/BackButton';

// ============================================================================
// CONSTANTES Y CONFIGURACIONES
// ============================================================================

const TIPOS_REPORTE = [
  { value: 'individual', label: 'Reporte Individual' },
  { value: 'comparativo', label: 'Reporte Comparativo' }
];

const INITIAL_FORM_DATA = {
  titulo: '',
  tipo: '',
  fecha_inicio: new Date(),
  fecha_fin: new Date(),
  competidores: [],
  competiciones: [],
};

// ============================================================================
// FUNCIONES UTILITARIAS
// ============================================================================

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES');
};

const validateFormData = (formData) => {
  const errors = [];

  if (!formData.titulo?.trim()) {
    errors.push('El título del reporte es obligatorio');
  }

  if (!formData.tipo) {
    errors.push('El tipo de reporte es obligatorio');
  }

  if (!formData.fecha_inicio || !formData.fecha_fin) {
    errors.push('Las fechas de inicio y fin son obligatorias');
  }

  if (formData.fecha_inicio && formData.fecha_fin && formData.fecha_inicio >= formData.fecha_fin) {
    errors.push('La fecha de inicio debe ser anterior a la fecha de fin');
  }

  if (formData.competidores.length === 0) {
    errors.push('Debe seleccionar al menos un competidor');
  }

  return errors;
};

const formatSubmitData = (formData) => ({
  ...formData,
  fecha_inicio: formData.fecha_inicio.toISOString().split('T')[0],
  fecha_fin: formData.fecha_fin.toISOString().split('T')[0],
});

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const ReporteForm = () => {
  // Hooks de navegación
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  // Estados del formulario
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  
  // Estados de datos
  const [competidores, setCompetidores] = useState([]);
  const [competiciones, setCompeticiones] = useState([]);
  
  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [generandoEstadisticas, setGenerandoEstadisticas] = useState(false);

  // ============================================================================
  // EFECTOS
  // ============================================================================

  useEffect(() => {
    const initializeComponent = async () => {
      await fetchInitialData();
      if (isEditing) {
        await fetchReporte();
      } else {
        setLoadingData(false);
      }
    };

    initializeComponent();
  }, [id, isEditing]);

  // ============================================================================
  // FUNCIONES DE API
  // ============================================================================

  const fetchInitialData = async () => {
    try {
      const [competidoresRes, competicionesRes] = await Promise.all([
        api.get('competidores/'),
        api.get('competiciones/'),
      ]);
      
      setCompetidores(competidoresRes.data.results || competidoresRes.data);
      setCompeticiones(competicionesRes.data.results || competicionesRes.data);
    } catch (err) {
      setError('Error al cargar datos iniciales');
      console.error('Error fetching initial data:', err);
    }
  };

  const fetchReporte = async () => {
    try {
      setLoadingData(true);
      const response = await api.get(`reportes/${id}/`);
      const data = response.data;
      
      setFormData({
        ...data,
        fecha_inicio: new Date(data.fecha_inicio),
        fecha_fin: new Date(data.fecha_fin),
      });
    } catch (err) {
      setError('Error al cargar los datos del reporte');
      console.error('Error fetching reporte:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const generarEstadisticas = async (reporteId) => {
    try {
      setGenerandoEstadisticas(true);
      await api.post(`reportes/${reporteId}/generar_estadisticas/`);
      toast.success('Estadísticas generadas correctamente');
    } catch (err) {
      toast.error('Error al generar estadísticas');
      console.error('Error generating statistics:', err);
    } finally {
      setGenerandoEstadisticas(false);
    }
  };

  // ============================================================================
  // MANEJADORES DE EVENTOS
  // ============================================================================

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (field, date) => {
    setFormData(prev => ({
      ...prev,
      [field]: date,
    }));
  };

  const handleMultiSelectChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validación del formulario
    const validationErrors = validateFormData(formData);
    if (validationErrors.length > 0) {
      setError(validationErrors.join('\n'));
      return;
    }

    setLoading(true);

    try {
      const submitData = formatSubmitData(formData);
      let reporteId;

      if (isEditing) {
        await api.put(`reportes/${id}/`, submitData);
        reporteId = id;
        toast.success('Reporte actualizado correctamente');
      } else {
        const response = await api.post('reportes/', submitData);
        reporteId = response.data.id;
        toast.success('Reporte creado correctamente');
      }

      // Generar estadísticas automáticamente
      await generarEstadisticas(reporteId);
      
      navigate('/estadisticas');
    } catch (err) {
      handleSubmitError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitError = (err) => {
    if (err.response?.data) {
      const errorMessages = [];
      for (const key in err.response.data) {
        if (Array.isArray(err.response.data[key])) {
          errorMessages.push(`${key}: ${err.response.data[key].join(', ')}`);
        } else {
          errorMessages.push(`${key}: ${err.response.data[key]}`);
        }
      }
      setError(errorMessages.join('\n'));
    } else {
      setError('Error al guardar el reporte');
    }
    console.error('Submit error:', err);
  };

  // ============================================================================
  // COMPONENTES DE RENDERIZADO
  // ============================================================================

  const renderDatePicker = (label, field, required = true) => (
    <DatePicker
      label={label}
      value={formData[field]}
      onChange={(date) => handleDateChange(field, date)}
      slots={{
        textField: TextField
      }}
      slotProps={{
        textField: {
          fullWidth: true,
          required: required
        }
      }}
    />
  );

  const renderMultiSelect = (label, field, options, required = false, renderOption) => (
    <FormControl fullWidth required={required}>
      <InputLabel>{label}</InputLabel>
      <Select
        multiple
        value={formData[field]}
        onChange={handleMultiSelectChange(field)}
        input={<OutlinedInput label={label} />}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((value) => {
              const item = options.find(option => option.id === value);
              return (
                <Chip 
                  key={value} 
                  label={item?.nombre || value}
                  size="small"
                />
              );
            })}
          </Box>
        )}
      >
        {options.map((option) => (
          <MenuItem key={option.id} value={option.id}>
            {renderOption ? renderOption(option) : option.nombre}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  const renderCompetidorOption = (competidor) => (
    `${competidor.nombre} - ${competidor.division_peso} Kg`
  );

  const renderCompeticionOption = (competicion) => (
    `${competicion.nombre} - ${formatDate(competicion.fecha)}`
  );

  const renderFormActions = () => (
    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
      <Button
        variant="outlined"
        startIcon={<Cancel />}
        onClick={() => navigate('/estadisticas')}
        disabled={loading || generandoEstadisticas}
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        variant="contained"
        startIcon={loading ? <CircularProgress size={20} /> : <Save />}
        disabled={loading || generandoEstadisticas}
        sx={{ 
          bgcolor: '#1a237e',
          '&:hover': { bgcolor: '#0d47a1' }
        }}
      >
        {loading ? 'Guardando...' : (isEditing ? 'Actualizar y Generar' : 'Guardar y Generar')}
      </Button>
    </Box>
  );

  const renderAlerts = () => (
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 3, whiteSpace: 'pre-line' }}>
          {error}
        </Alert>
      )}

      {generandoEstadisticas && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            Generando estadísticas automáticamente...
          </Box>
        </Alert>
      )}
    </>
  );

  // ============================================================================
  // RENDER PRINCIPAL
  // ============================================================================

  if (loadingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={40} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Cargando datos del reporte...
        </Typography>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box>
        <BackButton to="/estadisticas" label="Volver a Estadísticas" />
        
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Assessment sx={{ mr: 2, color: '#1a237e', fontSize: 32 }} />
          <Typography variant="h4" component="h1">
            {isEditing ? 'Editar Reporte' : 'Nuevo Reporte'}
          </Typography>
        </Box>

        <Card sx={{ 
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          borderRadius: 2
        }}>
          <CardContent sx={{ p: 4 }}>
            {renderAlerts()}

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Información básica */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#1a237e', mb: 2 }}>
                    📋 Información Básica
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Título del reporte"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    required
                    placeholder="Ej: Reporte Mensual Enero 2024"
                    helperText="Ingrese un título descriptivo para el reporte"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    label="Tipo de reporte"
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    required
                    helperText="Seleccione el tipo de análisis a realizar"
                  >
                    {TIPOS_REPORTE.map((tipo) => (
                      <MenuItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Período de análisis */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#1a237e', mb: 2, mt: 2 }}>
                    📅 Período de Análisis
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  {renderDatePicker('Fecha de inicio', 'fecha_inicio')}
                </Grid>

                <Grid item xs={12} md={6}>
                  {renderDatePicker('Fecha de fin', 'fecha_fin')}
                </Grid>

                {/* Selección de datos */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#1a237e', mb: 2, mt: 2 }}>
                    👥 Selección de Competidores y Competiciones
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  {renderMultiSelect(
                    'Competidores',
                    'competidores',
                    competidores,
                    true,
                    renderCompetidorOption
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Seleccione los competidores que desea incluir en el análisis
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  {renderMultiSelect(
                    'Competiciones (opcional)',
                    'competiciones',
                    competiciones,
                    false,
                    renderCompeticionOption
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Si no se selecciona ninguna competición, se incluirán todas las del período especificado
                  </Typography>
                </Grid>

                {/* Información adicional */}
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      ℹ️ Información importante:
                    </Typography>
                    <Typography variant="body2">
                      • Al guardar el reporte, se generarán automáticamente las estadísticas para el período y competidores seleccionados
                      <br />
                      • El proceso puede tomar unos momentos dependiendo de la cantidad de datos
                      <br />
                      • Una vez completado, podrá visualizar las estadísticas en la sección correspondiente
                    </Typography>
                  </Alert>
                </Grid>

                {/* Acciones */}
                <Grid item xs={12}>
                  <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #e0e0e0' }}>
                    {renderFormActions()}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </LocalizationProvider>
  );
};

export default ReporteForm;