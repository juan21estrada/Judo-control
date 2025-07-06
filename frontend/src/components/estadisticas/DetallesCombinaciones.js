import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress
} from '@mui/material';
import {
  ExpandMore,
  CheckCircle,
  Cancel,
  TrendingUp,
  TrendingDown,
  Timeline
} from '@mui/icons-material';
import api from '../../services/api';

const DetallesCombinaciones = ({ competidorId }) => {
  const [detalles, setDetalles] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetallesCombinaciones = async () => {
      try {
        setLoading(true);
        const response = await api.get(
          `/estadisticas/${competidorId}/detalles_combinaciones/`
        );
        setDetalles(response.data);
        setError(null);
      } catch (err) {
        console.error('Error al cargar detalles de combinaciones:', err);
        setError('Error al cargar los detalles de las combinaciones');
      } finally {
        setLoading(false);
      }
    };

    if (competidorId) {
      fetchDetallesCombinaciones();
    }
  }, [competidorId]);

  const formatearTecnica = (tecnica) => {
    return tecnica.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatearPuntuacion = (puntuacion) => {
    const puntuaciones = {
      'sin_puntuacion': 'Sin puntuación',
      'yuko': 'Yuko',
      'waza_ari': 'Waza-ari',
      'ippon': 'Ippon'
    };
    return puntuaciones[puntuacion] || puntuacion;
  };

  const getColorPorTipo = (tipo) => {
    switch (tipo) {
      case 'Tashi Waza':
        return 'primary';
      case 'Ne Waza':
        return 'secondary';
      case 'Combinación Directa':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getColorPorPuntuacion = (puntuacion) => {
    switch (puntuacion) {
      case 'ippon':
        return 'error';
      case 'waza_ari':
        return 'warning';
      case 'yuko':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando detalles de combinaciones...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!detalles || detalles.resumen.total_combinaciones === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No se encontraron acciones combinadas para este competidor.
      </Alert>
    );
  }

  const { resumen, detalles: listaCombinaciones } = detalles;

  return (
    <Box>
      {/* Resumen estadístico */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {resumen.total_combinaciones}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Combinaciones
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {resumen.combinaciones_efectivas}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Efectivas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {resumen.combinaciones_no_efectivas}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                No Efectivas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {resumen.porcentaje_efectividad}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Efectividad
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Desglose por tipos de técnicas */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            📈 Desglose por Tipos de Técnicas
          </Typography>
          
          <Grid container spacing={2}>
            {/* Tashi Waza */}
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 2, border: '1px solid', borderColor: 'primary.main', borderRadius: 1 }}>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  🥋 Tashi Waza
                </Typography>
                <Typography><strong>Total:</strong> {resumen.tipos_tecnicas.tashi_waza.total}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <CheckCircle color="success" sx={{ mr: 1, fontSize: 16 }} />
                  <Typography color="success.main">
                    Efectivas: {resumen.tipos_tecnicas.tashi_waza.efectivas}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Cancel color="error" sx={{ mr: 1, fontSize: 16 }} />
                  <Typography color="error.main">
                    No efectivas: {resumen.tipos_tecnicas.tashi_waza.no_efectivas}
                  </Typography>
                </Box>
                {resumen.tipos_tecnicas.tashi_waza.total > 0 && (
                  <LinearProgress 
                    variant="determinate" 
                    value={(resumen.tipos_tecnicas.tashi_waza.efectivas / resumen.tipos_tecnicas.tashi_waza.total) * 100}
                    sx={{ mt: 1 }}
                    color="primary"
                  />
                )}
              </Box>
            </Grid>
            
            {/* Ne Waza */}
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 2, border: '1px solid', borderColor: 'secondary.main', borderRadius: 1 }}>
                <Typography variant="subtitle1" color="secondary" gutterBottom>
                  🤼 Ne Waza
                </Typography>
                <Typography><strong>Total:</strong> {resumen.tipos_tecnicas.ne_waza.total}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <CheckCircle color="success" sx={{ mr: 1, fontSize: 16 }} />
                  <Typography color="success.main">
                    Efectivas: {resumen.tipos_tecnicas.ne_waza.efectivas}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Cancel color="error" sx={{ mr: 1, fontSize: 16 }} />
                  <Typography color="error.main">
                    No efectivas: {resumen.tipos_tecnicas.ne_waza.no_efectivas}
                  </Typography>
                </Box>
                {resumen.tipos_tecnicas.ne_waza.total > 0 && (
                  <LinearProgress 
                    variant="determinate" 
                    value={(resumen.tipos_tecnicas.ne_waza.efectivas / resumen.tipos_tecnicas.ne_waza.total) * 100}
                    sx={{ mt: 1 }}
                    color="secondary"
                  />
                )}
              </Box>
            </Grid>
            
            {/* Combinaciones Directas */}
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 2, border: '1px solid', borderColor: 'warning.main', borderRadius: 1 }}>
                <Typography variant="subtitle1" color="warning.main" gutterBottom>
                  🔗 Combinaciones Directas
                </Typography>
                <Typography><strong>Total:</strong> {resumen.tipos_tecnicas.combinaciones_directas.total}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <CheckCircle color="success" sx={{ mr: 1, fontSize: 16 }} />
                  <Typography color="success.main">
                    Efectivas: {resumen.tipos_tecnicas.combinaciones_directas.efectivas}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Cancel color="error" sx={{ mr: 1, fontSize: 16 }} />
                  <Typography color="error.main">
                    No efectivas: {resumen.tipos_tecnicas.combinaciones_directas.no_efectivas}
                  </Typography>
                </Box>
                {resumen.tipos_tecnicas.combinaciones_directas.total > 0 && (
                  <LinearProgress 
                    variant="determinate" 
                    value={(resumen.tipos_tecnicas.combinaciones_directas.efectivas / resumen.tipos_tecnicas.combinaciones_directas.total) * 100}
                    sx={{ mt: 1 }}
                    color="warning"
                  />
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Lista detallada de combinaciones */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            📋 Detalle de Cada Combinación
          </Typography>
          
          {listaCombinaciones.map((combinacion, index) => (
            <Accordion key={combinacion.id} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Timeline sx={{ mr: 1 }} />
                  <Typography sx={{ flexGrow: 1 }}>
                    {combinacion.descripcion}
                  </Typography>
                  <Chip 
                    icon={combinacion.efectiva ? <TrendingUp /> : <TrendingDown />}
                    label={combinacion.efectiva ? 'Efectiva' : 'No Efectiva'}
                    color={combinacion.efectiva ? 'success' : 'error'}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip 
                    label={formatearPuntuacion(combinacion.puntuacion)}
                    color={getColorPorPuntuacion(combinacion.puntuacion)}
                    size="small"
                  />
                </Box>
              </AccordionSummary>
              
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="success.main" gutterBottom>
                      ✅ Técnicas Efectivas ({combinacion.tecnicas_efectivas.length})
                    </Typography>
                    {combinacion.tecnicas_efectivas.length > 0 ? (
                      <List dense>
                        {combinacion.tecnicas_efectivas.map((tecnica, idx) => (
                          <ListItem key={idx} sx={{ py: 0.5 }}>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Chip 
                                    label={tecnica.tipo}
                                    color={getColorPorTipo(tecnica.tipo)}
                                    size="small"
                                    sx={{ mr: 1 }}
                                  />
                                  <Typography variant="body2">
                                    {formatearTecnica(tecnica.tecnica)}
                                  </Typography>
                                  <Chip 
                                    label={formatearPuntuacion(tecnica.puntuacion)}
                                    color={getColorPorPuntuacion(tecnica.puntuacion)}
                                    size="small"
                                    sx={{ ml: 1 }}
                                  />
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                        No hay técnicas efectivas registradas
                      </Typography>
                    )}
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="error.main" gutterBottom>
                      ❌ Técnicas No Efectivas ({combinacion.tecnicas_no_efectivas.length})
                    </Typography>
                    {combinacion.tecnicas_no_efectivas.length > 0 ? (
                      <List dense>
                        {combinacion.tecnicas_no_efectivas.map((tecnica, idx) => (
                          <ListItem key={idx} sx={{ py: 0.5 }}>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Chip 
                                    label={tecnica.tipo}
                                    color={getColorPorTipo(tecnica.tipo)}
                                    size="small"
                                    sx={{ mr: 1 }}
                                  />
                                  <Typography variant="body2">
                                    {formatearTecnica(tecnica.tecnica)}
                                  </Typography>
                                  <Chip 
                                    label={formatearPuntuacion(tecnica.puntuacion)}
                                    color={getColorPorPuntuacion(tecnica.puntuacion)}
                                    size="small"
                                    sx={{ ml: 1 }}
                                  />
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                        No hay técnicas no efectivas registradas
                      </Typography>
                    )}
                  </Grid>
                </Grid>
                
                {combinacion.descripcion_detallada && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      📝 Descripción Detallada:
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {combinacion.descripcion_detallada}
                    </Typography>
                  </>
                )}
                
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" color="textSecondary">
                  Tiempo: {combinacion.tiempo} | Combate ID: {combinacion.combate_id} | Total técnicas: {combinacion.total_tecnicas}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
};

export default DetallesCombinaciones;