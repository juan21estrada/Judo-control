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
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const CompeticionForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    nombre: '',
    fecha: new Date(),
    evento: '',
    tipo: '',
    cantidad_atletas: '',
    cantidad_combates_planificados: '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const fetchCompeticion = async () => {
    try {
      setLoadingData(true);
      const response = await api.get(`competiciones/${id}/`);
      const data = response.data;
      setFormData({
        ...data,
        fecha: new Date(data.fecha),
      });
    } catch (err) {
      setError('Error al cargar los datos de la competición');
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isEditing) {
      fetchCompeticion();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      fecha: date,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        fecha: formData.fecha.toISOString().split('T')[0],
        cantidad_atletas: parseInt(formData.cantidad_atletas),
        cantidad_combates_planificados: parseInt(formData.cantidad_combates_planificados),
      
      };

      
      if (isNaN(submitData.cantidad_atletas) || isNaN(submitData.cantidad_combates_planificados)) {
        setError('Los campos numéricos deben ser valores válidos');
        return;
      }

      if (isEditing) {
        await api.put(`competiciones/${id}/`, submitData);
        toast.success('Competición actualizada correctamente');
      } else {
        await api.post('competiciones/', submitData);
        toast.success('Competición creada correctamente');
      }
      navigate('/competiciones');
    } catch (err) {
      console.error('Error completo:', err);
      if (err.response && err.response.data) {
        const errorMessages = Object.entries(err.response.data)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('\n');
        setError(errorMessages);
      } else {
        setError('Error al guardar la competición. Por favor, verifica tu conexión e inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEditing ? 'Editar Competición' : 'Nueva Competición'}
        </Typography>

        <Card>
          <CardContent>
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nombre de la competición"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Fecha"
                    value={formData.fecha}
                    onChange={handleDateChange}
                    slotProps={{ textField: { fullWidth: true, required: true } }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    label="Evento"
                    name="evento"
                    value={formData.evento}
                    onChange={handleChange}
                    required
                  >
                    <MenuItem value="entrenamiento">Entrenamiento</MenuItem>
                    <MenuItem value="combate_oficial">Combate oficial</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    label="Tipo de competencia"
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    required
                  >
                    <MenuItem value="nacional">Nacional</MenuItem>
                    <MenuItem value="internacional">Internacional</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Cantidad de atletas"
                    name="cantidad_atletas"
                    value={formData.cantidad_atletas}
                    onChange={handleChange}
                    required
                    inputProps={{ min: 2, max: 1000 }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Cantidad de combates a realizar"
                    name="cantidad_combates_planificados"
                    value={formData.cantidad_combates_planificados}
                    onChange={handleChange}
                    required
                    inputProps={{ min: 1, max: 500 }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={() => navigate('/competiciones')}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<Save />}
                      disabled={loading}
                      sx={{ bgcolor: '#1a237e' }}
                    >
                      {loading ? 'Guardando...' : 'Guardar'}
                    </Button>
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

export default CompeticionForm;