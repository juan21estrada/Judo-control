import React, { useState, useEffect } from 'react';
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
  Container,
} from '@mui/material';
import { Save, Cancel, Person } from '@mui/icons-material';
import toast from 'react-hot-toast';

// Services & Context
import api from '../../services/api';

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

const INITIAL_FORM_DATA = {
  nombre: '',
  genero: '',
  division_peso: '',
  categoria: '',
  anos_experiencia: '',
  usuario: '',
};

const DIVISION_PESO_MASCULINO = [
  { value: '55', label: '55 Kg' },
  { value: '60', label: '60 Kg' },
  { value: '66', label: '66 Kg' },
  { value: '73', label: '73 Kg' },
  { value: '81', label: '81 Kg' },
  { value: '90', label: '90 Kg' },
  { value: '100', label: '100 Kg' },
  { value: '+100', label: '+100 Kg' },
];

const DIVISION_PESO_FEMENINO = [
  { value: '44', label: '44 Kg' },
  { value: '48', label: '48 Kg' },
  { value: '52', label: '52 Kg' },
  { value: '57', label: '57 Kg' },
  { value: '63', label: '63 Kg' },
  { value: '70', label: '70 Kg' },
  { value: '78', label: '78 Kg' },
  { value: '+78', label: '+78 Kg' },
];

const CATEGORIAS = [
  { value: 'sub21_juvenil', label: 'Sub 21 - Juvenil' },
  { value: 'sub21_primera', label: 'Sub 21 - 1ra categoría' },
];

const GENEROS = [
  { value: 'M', label: 'Masculino', icon: '👨' },
  { value: 'F', label: 'Femenino', icon: '👩' },
];

const VALIDATION_RULES = {
  experiencia: {
    min: 0,
    max: 5,
    message: 'Máximo 5 años de experiencia',
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const validateForm = (formData) => {
  const errors = [];
  
  if (!formData.nombre?.trim()) {
    errors.push('El nombre es obligatorio');
  }
  
  if (!formData.genero) {
    errors.push('El género es obligatorio');
  }
  
  if (!formData.division_peso) {
    errors.push('La división de peso es obligatoria');
  }
  
  if (!formData.categoria) {
    errors.push('La categoría es obligatoria');
  }
  
  if (!formData.anos_experiencia) {
    errors.push('Los años de experiencia son obligatorios');
  } else {
    const experiencia = parseInt(formData.anos_experiencia);
    if (experiencia < VALIDATION_RULES.experiencia.min || experiencia > VALIDATION_RULES.experiencia.max) {
      errors.push(`Los años de experiencia deben estar entre ${VALIDATION_RULES.experiencia.min} y ${VALIDATION_RULES.experiencia.max}`);
    }
  }
  
  return errors;
};

const getDivisionesPeso = (genero) => {
  return genero === 'M' ? DIVISION_PESO_MASCULINO : DIVISION_PESO_FEMENINO;
};

const formatErrorMessages = (errorData) => {
  const errorMessages = [];
  for (const key in errorData) {
    if (Array.isArray(errorData[key])) {
      errorMessages.push(`${key}: ${errorData[key].join(', ')}`);
    } else {
      errorMessages.push(`${key}: ${errorData[key]}`);
    }
  }
  return errorMessages.join('\n');
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const CompetidorForm = () => {
  // ========================================
  // HOOKS
  // ========================================
  
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);
  const [error, setError] = useState('');
  
  // ========================================
  // EFFECTS
  // ========================================
  
  useEffect(() => {
    fetchUsuarios();
    if (isEditing) {
      fetchCompetidor();
    }
  }, [id, isEditing]);
  
  // Clear error when form data changes
  useEffect(() => {
    if (error) {
      setError('');
    }
  }, [formData]);
  
  // ========================================
  // API FUNCTIONS
  // ========================================
  
  const fetchUsuarios = async () => {
    try {
      const response = await api.get('usuarios/');
      const data = response.data.results || response.data;
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      toast.error('Error al cargar la lista de usuarios');
    }
  };
  
  const fetchCompetidor = async () => {
    try {
      setLoadingData(true);
      setError('');
      
      const response = await api.get(`competidores/${id}/`);
      setFormData(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al cargar los datos del competidor';
      setError(errorMessage);
      console.error('Error fetching competidor:', err);
      toast.error(errorMessage);
    } finally {
      setLoadingData(false);
    }
  };
  
  // ========================================
  // EVENT HANDLERS
  // ========================================
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Limpiar división de peso si cambia el género
      if (name === 'genero') {
        newData.division_peso = '';
      }
      
      return newData;
    });
  };
  
  const handleCancel = () => {
    navigate('/competidores');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate form
    const validationErrors = validateForm(formData);
    if (validationErrors.length > 0) {
      setError(validationErrors.join('\n'));
      return;
    }
    
    setLoading(true);
    
    try {
      const endpoint = isEditing ? `competidores/${id}/` : 'competidores/';
      const method = isEditing ? 'put' : 'post';
      
      await api[method](endpoint, formData);
      
      const successMessage = isEditing 
        ? 'Competidor actualizado correctamente' 
        : 'Competidor creado correctamente';
      
      toast.success(successMessage);
      navigate('/competidores');
    } catch (err) {
      let errorMessage = 'Error al guardar el competidor';
      
      if (err.response?.data) {
        errorMessage = formatErrorMessages(err.response.data);
      }
      
      setError(errorMessage);
      console.error('Error saving competidor:', err);
      toast.error('Error al guardar el competidor');
    } finally {
      setLoading(false);
    }
  };
  
  // ========================================
  // RENDER FUNCTIONS
  // ========================================
  
  const renderLoadingState = () => (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress size={60} />
      </Box>
    </Container>
  );
  
  const renderHeader = () => (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
        {isEditing ? '✏️ Editar Competidor' : '➕ Nuevo Competidor'}
      </Typography>
      <BackButton to="/competidores" label="Volver a Competidores" />
    </Box>
  );
  
  const renderPersonalInfoSection = () => (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: THEME_COLORS.primary, mb: 1 }}>
          👤 Información Personal
        </Typography>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Nombre completo"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
          autoComplete="name"
          placeholder="Ingrese el nombre completo"
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          select
          fullWidth
          label="Género"
          name="genero"
          value={formData.genero}
          onChange={handleChange}
          required
        >
          {GENEROS.map((genero) => (
            <MenuItem key={genero.value} value={genero.value}>
              {genero.icon} {genero.label}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
    </>
  );
  
  const renderCompetitionInfoSection = () => (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: THEME_COLORS.primary, mb: 1, mt: 2 }}>
          🥋 Información de Competición
        </Typography>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          select
          fullWidth
          label="División de peso"
          name="division_peso"
          value={formData.division_peso}
          onChange={handleChange}
          required
          disabled={!formData.genero}
          helperText={!formData.genero ? 'Seleccione primero el género' : 'Categoría de peso para competición'}
        >
          {getDivisionesPeso(formData.genero).map((division) => (
            <MenuItem key={division.value} value={division.value}>
              ⚖️ {division.label}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          select
          fullWidth
          label="Categoría"
          name="categoria"
          value={formData.categoria}
          onChange={handleChange}
          required
          helperText="Categoría de edad y nivel"
        >
          {CATEGORIAS.map((categoria) => (
            <MenuItem key={categoria.value} value={categoria.value}>
              🏆 {categoria.label}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          type="number"
          label="Años de experiencia"
          name="anos_experiencia"
          value={formData.anos_experiencia}
          onChange={handleChange}
          required
          inputProps={{ 
            min: VALIDATION_RULES.experiencia.min, 
            max: VALIDATION_RULES.experiencia.max 
          }}
          helperText={VALIDATION_RULES.experiencia.message}
        />
      </Grid>
    </>
  );
  
  const renderSystemInfoSection = () => (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: THEME_COLORS.primary, mb: 1, mt: 2 }}>
          🔗 Vinculación del Sistema
        </Typography>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          select
          fullWidth
          label="Usuario del sistema"
          name="usuario"
          value={formData.usuario}
          onChange={handleChange}
          helperText="Opcional: vincular con un usuario del sistema"
        >
          <MenuItem value="">
            <em>Sin usuario vinculado</em>
          </MenuItem>
          {usuarios.map((usuario) => (
            <MenuItem key={usuario.id} value={usuario.id}>
              👤 {usuario.nombre} ({usuario.email})
            </MenuItem>
          ))}
        </TextField>
      </Grid>
    </>
  );
  
  const renderActionButtons = () => (
    <Grid item xs={12}>
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        justifyContent: 'flex-end',
        pt: 2,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}>
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
          disabled={loading}
          sx={{ 
            bgcolor: THEME_COLORS.primary,
            minWidth: 120,
            '&:hover': {
              bgcolor: '#0d47a1',
            },
          }}
        >
          {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
        </Button>
      </Box>
    </Grid>
  );
  
  // ========================================
  // MAIN RENDER
  // ========================================
  
  if (loadingData) {
    return renderLoadingState();
  }
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {renderHeader()}
      
      <Card sx={{ boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3, whiteSpace: 'pre-line' }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {renderPersonalInfoSection()}
              {renderCompetitionInfoSection()}
              {renderSystemInfoSection()}
              {renderActionButtons()}
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CompetidorForm;