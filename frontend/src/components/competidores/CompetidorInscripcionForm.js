import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
  Avatar,
  Chip
} from '@mui/material';
import api from '../../services/api';
import toast from 'react-hot-toast';
import BackButton from '../layout/BackButton';

const CompetidorInscripcionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [competidores, setCompetidores] = useState([]);
  const [selectedCompetidores, setSelectedCompetidores] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      toast.error('ID de competición no válido');
      navigate('/competiciones');
      return;
    }
    fetchCompetidores();
  }, [id, navigate]);

  const fetchCompetidores = async () => {
    try {
      setLoading(true);
      const response = await api.get('/competidores/');
      setCompetidores(response.data.results || response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al cargar los competidores';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedCompetidores.length === 0) {
      setError('Debe seleccionar al menos un competidor');
      toast.error('Debe seleccionar al menos un competidor');
      return;
    }

    try {
      setLoading(true);
      await api.post(`/competiciones/${id}/inscribir_competidores/`, {
        competidores: selectedCompetidores
      });
      toast.success('Competidores inscritos exitosamente');
      navigate('/competiciones');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al inscribir los competidores';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error detallado:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompetidorToggle = (competidorId) => {
    setSelectedCompetidores(prev => {
      if (prev.includes(competidorId)) {
        return prev.filter(id => id !== competidorId);
      } else {
        return [...prev, competidorId];
      }
    });
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
      <BackButton to="/competiciones" label="Volver a Competiciones" />
      
      <Typography variant="h4" component="h1" gutterBottom>
        Inscribir Competidores
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {competidores.map((competidor) => (
            <Grid item xs={12} sm={6} md={4} key={competidor.id}>
              <Card 
                className="competitor-card"
                onClick={() => handleCompetidorToggle(competidor.id)}
                sx={{ cursor: 'pointer' }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: selectedCompetidores.includes(competidor.id) ? '#1a237e' : '#757575',
                        mr: 2,
                        width: 56,
                        height: 56
                      }}
                    >
                      {competidor.nombre.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="h3">
                        {competidor.nombre}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ID: {competidor.identificacion_personal || 'No especificado'}
                      </Typography>
                    </Box>
                    <Checkbox
                      checked={selectedCompetidores.includes(competidor.id)}
                      onChange={() => handleCompetidorToggle(competidor.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    <Chip 
                      label={`${competidor.division_peso} Kg`}
                      color="primary"
                      size="small"
                    />
                    <Chip 
                      label={competidor.genero === 'M' ? 'Masculino' : 'Femenino'}
                      color="secondary"
                      size="small"
                    />
                    {competidor.cinturon && (
                      <Chip 
                        label={competidor.cinturon}
                        color="default"
                        size="small"
                      />
                    )}
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Edad:</strong> {competidor.edad || 'No especificada'} años
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Categoría:</strong> {competidor.categoria || 'No especificada'}
                    </Typography>
                    {competidor.equipo && (
                      <Typography variant="body2">
                        <strong>Equipo:</strong> {competidor.equipo}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default CompetidorInscripcionForm;