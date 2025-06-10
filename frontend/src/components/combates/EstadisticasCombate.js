// Agregar la importación
import BackButton from '../layout/BackButton';

// En el JSX:
<BackButton to="/combates" label="Volver a Combates" />
import React, { useState, useEffect } from 'react';
import {
  Card, CardContent, Typography, Grid, Chip, Box, LinearProgress
} from '@mui/material';
import combatesService from '../../services/combatesService';

function EstadisticasCombate({ combateId, combate }) {
  const [estadisticas, setEstadisticas] = useState(null);

  useEffect(() => {
    if (combateId) {
      fetchEstadisticas();
    }
  }, [combateId]);

  const fetchEstadisticas = async () => {
    try {
      const data = await combatesService.getEstadisticasCombate(combateId);
      setEstadisticas(data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  if (!estadisticas) {
    return null;
  }

  const renderPuntuacion = (competidor, puntos) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6">{competidor}</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        {Array.from({ length: puntos.ippon }, (_, i) => (
          <Chip key={`ippon-${i}`} label="IPPON" color="error" size="small" />
        ))}
        {Array.from({ length: puntos.waza_ari }, (_, i) => (
          <Chip key={`waza-${i}`} label="WAZA-ARI" color="warning" size="small" />
        ))}
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        {Array.from({ length: puntos.shidos }, (_, i) => (
          <Chip key={`shido-${i}`} label="SHIDO" color="default" size="small" />
        ))}
        {puntos.hansoku_make && (
          <Chip label="HANSOKU-MAKE" color="error" variant="outlined" size="small" />
        )}
      </Box>
    </Box>
  );

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Puntuación Actual
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            {renderPuntuacion(combate.competidor1_nombre, estadisticas.competidor1)}
          </Grid>
          <Grid item xs={6}>
            {renderPuntuacion(combate.competidor2_nombre, estadisticas.competidor2)}
          </Grid>
        </Grid>
        
        {estadisticas.ganador_proyectado && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
            <Typography variant="body1" color="success.dark">
              <strong>Ganador proyectado:</strong> {estadisticas.ganador_proyectado_nombre}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default EstadisticasCombate;