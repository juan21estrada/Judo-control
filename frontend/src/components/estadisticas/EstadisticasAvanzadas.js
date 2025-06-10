import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Chip, Alert,
  Accordion, AccordionSummary, AccordionDetails, TextField,
  Button, IconButton, MenuItem, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress,
  FormControl, InputLabel, Select, Checkbox, FormControlLabel,
  FormGroup, Paper, Divider
} from '@mui/material';
import { 
  ExpandMore, Save, Edit, Compare, Assessment, TrendingUp,
  FilterList, BarChart as BarChartIcon, PieChart as PieChartIcon,
  GetApp
} from '@mui/icons-material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import api from '../../services/api';
import BackButton from '../layout/BackButton';
import pdfService from '../../services/pdfService';
import toast from 'react-hot-toast';

const TECNICAS_COMPLETAS = {
  kata_te_waza: [
    'seoi_nage', 'ippon_seoi_nage', 'seoi_otoshi', 'tai_otoshi', 'kata_guruma',
    'sukui_nage', 'soto_makikomi', 'uchi_makikomi', 'koshi_guruma', 'tsurikomi_goshi',
    'uki_goshi', 'harai_goshi', 'tsuri_goshi', 'hane_goshi', 'utsuri_goshi'
  ],
  ashi_waza: [
    'deashi_harai', 'hiza_guruma', 'sasae_tsurikomi_ashi', 'okuriashi_harai',
    'kouchi_gari', 'ouchi_gari', 'kosoto_gari', 'osoto_gari', 'uchi_mata',
    'harai_tsurikomi_ashi', 'ashiguruma', 'okuri_ashi_harai', 'tsubame_gaeshi'
  ],
  sutemi_waza: [
    'tomoe_nage', 'sumi_gaeshi', 'hikikomi_gaeshi', 'tani_otoshi', 'yoko_otoshi',
    'yoko_wakare', 'yoko_guruma', 'uki_waza', 'soto_makikomi', 'ura_nage'
  ],
  kansetsu_waza: [
    'ude_garami', 'ude_hishigi_juji_gatame', 'ude_hishigi_ude_gatame',
    'ude_hishigi_hiza_gatame', 'ude_hishigi_waki_gatame', 'ude_hishigi_hara_gatame'
  ],
  shime_waza: [
    'nami_juji_jime', 'gyaku_juji_jime', 'kata_juji_jime', 'hadaka_jime',
    'okuri_eri_jime', 'kataha_jime', 'sankaku_jime', 'do_jime'
  ],
  osae_komi_waza: [
    'kesa_gatame', 'kata_gatame', 'kami_shiho_gatame', 'yoko_shiho_gatame',
    'tate_shiho_gatame', 'kuzure_kesa_gatame', 'kuzure_kami_shiho_gatame'
  ]
};

const ESTADISTICAS_DISPONIBLES = [
  { key: 'total_combates', label: 'Total Combates', categoria: 'general' },
  { key: 'combates_ganados', label: 'Combates Ganados', categoria: 'general' },
  { key: 'combates_perdidos', label: 'Combates Perdidos', categoria: 'general' },
  { key: 'ippon', label: 'Ippon', categoria: 'puntuacion' },
  { key: 'waza_ari', label: 'Waza-ari', categoria: 'puntuacion' },
  { key: 'total_ataques_tashi_waza', label: 'Total Ataques Tashi Waza', categoria: 'tecnicas' },
  { key: 'ataques_positivos', label: 'Ataques Positivos', categoria: 'tecnicas' },
  { key: 'ataques_negativos', label: 'Ataques Negativos', categoria: 'tecnicas' },
  { key: 'ashi_waza', label: 'Ashi Waza', categoria: 'tecnicas' },
  { key: 'koshi_waza', label: 'Koshi Waza', categoria: 'tecnicas' },
  { key: 'kata_te_waza', label: 'Kata Te Waza', categoria: 'tecnicas' },
  { key: 'sutemi_waza', label: 'Sutemi Waza', categoria: 'tecnicas' },
  { key: 'combinaciones', label: 'Combinaciones', categoria: 'tecnicas' },
  { key: 'total_acciones_ne_waza', label: 'Total Acciones Ne Waza', categoria: 'ne_waza' },
  { key: 'inmovilizaciones', label: 'Inmovilizaciones', categoria: 'ne_waza' },
  { key: 'luxaciones', label: 'Luxaciones', categoria: 'ne_waza' },
  { key: 'estrangulaciones', label: 'Estrangulaciones', categoria: 'ne_waza' },
  { key: 'shido', label: 'Shido', categoria: 'penalizaciones' },
  { key: 'hansokumake', label: 'Hansoku-make', categoria: 'penalizaciones' }
];

const COLORES_GRAFICOS = [
  '#FF6B6B', // Rojo coral
  '#4ECDC4', // Turquesa
  '#45B7D1', // Azul cielo
  '#96CEB4', // Verde menta
  '#FFEAA7', // Amarillo suave
  '#DDA0DD', // Violeta
  '#98D8C8', // Verde agua
  '#F7DC6F', // Dorado
  '#BB8FCE', // Lavanda
  '#85C1E9', // Azul claro
  '#F8C471', // Naranja suave
  '#82E0AA'  // Verde claro
];

const EstadisticasAvanzadas = () => {
  const [estadisticas, setEstadisticas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [competidoresSeleccionados, setCompetidoresSeleccionados] = useState([]);
  const [estadisticasSeleccionadas, setEstadisticasSeleccionadas] = useState(
    ESTADISTICAS_DISPONIBLES.slice(0, 8).map(est => est.key) // Por defecto las primeras 8
  );
  const [recomendacionesEditables, setRecomendacionesEditables] = useState({});
  const [modoEdicion, setModoEdicion] = useState({});
  const [modoComparacion, setModoComparacion] = useState(false);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/estadisticas/');
      
      // Manejar tanto respuesta paginada como array directo
      const estadisticasData = response.data.results || response.data;
      
      // Verificar que sea un array
      if (!Array.isArray(estadisticasData)) {
        console.error('Los datos recibidos no son un array:', response.data);
        setError('Formato de datos incorrecto recibido del servidor');
        return;
      }
      
      setEstadisticas(estadisticasData);
      
      // Inicializar recomendaciones editables
      const recomendacionesIniciales = {};
      estadisticasData.forEach(est => {
        const conclusiones = generarConclusiones(est);
        recomendacionesIniciales[est.id] = conclusiones.recomendaciones.join('\n');
      });
      setRecomendacionesEditables(recomendacionesIniciales);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      setError('Error al cargar las estadísticas avanzadas');
    } finally {
      setLoading(false);
    }
  };

  const generarConclusiones = (estadistica) => {
    const totalTecnicas = Object.values(TECNICAS_COMPLETAS).flat().length;
    const tecnicasUsadas = new Set();
    
    // Contar técnicas únicas usadas
    Object.entries(TECNICAS_COMPLETAS).forEach(([categoria, tecnicas]) => {
      tecnicas.forEach(tecnica => {
        if (estadistica[tecnica] && estadistica[tecnica] > 0) {
          tecnicasUsadas.add(tecnica);
        }
      });
    });

    const diversidadTecnica = (tecnicasUsadas.size / totalTecnicas) * 100;
    const totalPuntos = (estadistica.ippon || 0) + (estadistica.waza_ari || 0);
    const totalIntentos = Object.values(TECNICAS_COMPLETAS).flat().reduce((sum, tecnica) => {
      return sum + (estadistica[tecnica] || 0);
    }, 0);
    
    const efectividad = totalIntentos > 0 ? (totalPuntos / totalIntentos) * 100 : 0;
    
    let nivelHabilidad = 'Principiante';
    if (efectividad > 70 && diversidadTecnica > 60) {
      nivelHabilidad = 'Experto';
    } else if (efectividad > 50 && diversidadTecnica > 40) {
      nivelHabilidad = 'Avanzado';
    } else if (efectividad > 30 && diversidadTecnica > 20) {
      nivelHabilidad = 'Intermedio';
    }

    const recomendaciones = [];
    
    if (diversidadTecnica < 30) {
      recomendaciones.push('Ampliar el repertorio técnico practicando nuevas técnicas');
    }
    
    if (efectividad < 40) {
      recomendaciones.push('Mejorar la precisión y timing en la ejecución de técnicas');
    }
    
    // Analizar categorías específicas
    const categoriasMasUsadas = Object.entries(TECNICAS_COMPLETAS).map(([categoria, tecnicas]) => {
      const usoCategoria = tecnicas.reduce((sum, tecnica) => sum + (estadistica[tecnica] || 0), 0);
      return { categoria, uso: usoCategoria };
    }).sort((a, b) => b.uso - a.uso);
    
    if (categoriasMasUsadas[0]?.uso > totalIntentos * 0.6) {
      recomendaciones.push(`Diversificar más allá de ${categoriasMasUsadas[0].categoria.replace('_', ' ')}`);
    }
    
    if (estadistica.ippon < estadistica.waza_ari * 0.5) {
      recomendaciones.push('Trabajar en técnicas de finalización para conseguir más ippons');
    }
    
    if (recomendaciones.length === 0) {
      recomendaciones.push('Mantener el excelente nivel de rendimiento');
    }

    return {
      efectividad: efectividad.toFixed(1),
      diversidadTecnica: diversidadTecnica.toFixed(1),
      nivelHabilidad,
      recomendaciones
    };
  };

  const generarDatosComparacion = () => {
    if (competidoresSeleccionados.length === 0) return [];
    
    const estadisticasFiltradas = estadisticas.filter(est => 
      competidoresSeleccionados.includes(est.id.toString())
    );
    
    return estadisticasSeleccionadas.map(estadKey => {
      const estadLabel = ESTADISTICAS_DISPONIBLES.find(e => e.key === estadKey)?.label || estadKey;
      const dataPoint = { estadistica: estadLabel };
      
      estadisticasFiltradas.forEach((est) => {
        const nombreCompetidor = est.competidor_detalle?.nombre || est.competidor_nombre || `Competidor ${est.competidor}`;
        dataPoint[nombreCompetidor] = est[estadKey] || 0;
      });
      
      return dataPoint;
    });
  };

  const obtenerCompetidoresUnicos = () => {
    const competidoresMap = new Map();
    estadisticas.forEach(est => {
      if (!competidoresMap.has(est.id)) {
        const nombre = est.competidor_detalle?.nombre || est.competidor_nombre || `Competidor ${est.competidor}`;
        competidoresMap.set(est.id, {
          id: est.id,
          nombre: nombre,
          competidor_id: est.competidor
        });
      }
    });
    return Array.from(competidoresMap.values());
  };

  const guardarRecomendaciones = async (estadisticaId) => {
    try {
      setModoEdicion(prev => ({ ...prev, [estadisticaId]: false }));
      console.log('Recomendaciones guardadas localmente');
    } catch (error) {
      console.error('Error al guardar recomendaciones:', error);
    }
  };

  const toggleEdicion = (estadisticaId) => {
    setModoEdicion(prev => ({ ...prev, [estadisticaId]: !prev[estadisticaId] }));
  };

  const actualizarRecomendaciones = (estadisticaId, nuevasRecomendaciones) => {
    setRecomendacionesEditables(prev => ({
      ...prev,
      [estadisticaId]: nuevasRecomendaciones
    }));
  };

  const handleCompetidorChange = (event) => {
    const value = event.target.value;
    setCompetidoresSeleccionados(typeof value === 'string' ? value.split(',') : value);
  };

  const handleEstadisticaChange = (estadisticaKey) => {
    setEstadisticasSeleccionadas(prev => {
      if (prev.includes(estadisticaKey)) {
        return prev.filter(key => key !== estadisticaKey);
      } else {
        return [...prev, estadisticaKey];
      }
    });
  };

  const exportarAnalisisPDF = async () => {
    try {
      const competidorNombre = estadisticas.length > 0 
        ? estadisticas[0].competidor_detalle?.nombre 
        : 'Múltiples competidores';
      
      await pdfService.exportarAnalisisAvanzadoPDF(
        'analisis-avanzado-container', 
        competidorNombre,
        'analisis-avanzado.pdf'
      );
      toast.success('PDF de análisis avanzado generado correctamente');
    } catch (error) {
      toast.error('Error al generar el PDF');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <BackButton />
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  const competidoresUnicos = obtenerCompetidoresUnicos();
  const datosComparacion = generarDatosComparacion();
  const estadisticasFiltradas = competidoresSeleccionados.length > 0 
    ? estadisticas.filter(est => competidoresSeleccionados.includes(est.id.toString()))
    : estadisticas;

  return (
    <Box id="analisis-avanzado-container" p={3}>
      <BackButton />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
          <Assessment sx={{ mr: 1 }} />
          Estadísticas Avanzadas y Comparación
        </Typography>
        <Button
          variant="contained"
          startIcon={<GetApp />}
          onClick={exportarAnalisisPDF}
          color="primary"
        >
          Exportar PDF
        </Button>
      </Box>

      {/* Panel de Control */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <FilterList sx={{ mr: 1 }} />
          Panel de Control
        </Typography>
        
        <Grid container spacing={3}>
          {/* Selección de Competidores */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Seleccionar Competidores</InputLabel>
              <Select
                multiple
                value={competidoresSeleccionados}
                onChange={handleCompetidorChange}
                renderValue={(selected) => {
                  const nombres = selected.map(id => {
                    const comp = competidoresUnicos.find(c => c.id.toString() === id);
                    return comp ? comp.nombre : `ID: ${id}`;
                  });
                  return nombres.join(', ');
                }}
              >
                {competidoresUnicos.map((competidor) => (
                  <MenuItem key={competidor.id} value={competidor.id.toString()}>
                    <Checkbox checked={competidoresSeleccionados.indexOf(competidor.id.toString()) > -1} />
                    {competidor.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* Modo de Vista */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant={modoComparacion ? "outlined" : "contained"}
                onClick={() => setModoComparacion(false)}
                startIcon={<Assessment />}
              >
                Vista Individual
              </Button>
              <Button
                variant={modoComparacion ? "contained" : "outlined"}
                onClick={() => setModoComparacion(true)}
                startIcon={<Compare />}
                disabled={competidoresSeleccionados.length < 2}
              >
                Comparación
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Selección de Estadísticas para Comparación */}
        {modoComparacion && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Seleccionar Estadísticas para Comparar:
            </Typography>
            <FormGroup row>
              {ESTADISTICAS_DISPONIBLES.map((estadistica) => (
                <FormControlLabel
                  key={estadistica.key}
                  control={
                    <Checkbox
                      checked={estadisticasSeleccionadas.includes(estadistica.key)}
                      onChange={() => handleEstadisticaChange(estadistica.key)}
                    />
                  }
                  label={estadistica.label}
                  sx={{ minWidth: '200px' }}
                />
              ))}
            </FormGroup>
          </Box>
        )}
      </Paper>

      {/* Contenido Principal */}
      {estadisticasFiltradas.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          {competidoresSeleccionados.length > 0 
            ? "No hay estadísticas disponibles para los competidores seleccionados."
            : "No hay estadísticas disponibles para mostrar análisis avanzados."
          }
        </Alert>
      ) : (
        <>
          {/* Modo Comparación */}
          {modoComparacion && competidoresSeleccionados.length >= 2 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <BarChartIcon sx={{ mr: 1 }} />
                  Comparación de Competidores
                </Typography>
                
                {datosComparacion.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={datosComparacion} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="estadistica" 
                        angle={-45} 
                        textAnchor="end" 
                        height={100}
                        interval={0}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {estadisticasFiltradas.map((est, index) => {
                        const nombreCompetidor = est.competidor_detalle?.nombre || est.competidor_nombre || `Competidor ${est.competidor}`;
                        return (
                          <Bar 
                            key={est.id}
                            dataKey={nombreCompetidor}
                            name={nombreCompetidor}
                            fill={COLORES_GRAFICOS[index % COLORES_GRAFICOS.length]}
                          />
                        );
                      })}
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Alert severity="warning">
                    Selecciona al menos una estadística para comparar.
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Vista Individual */}
          {!modoComparacion && (
            <Grid container spacing={3}>
              {estadisticasFiltradas.map((estadistica) => {
                const conclusiones = generarConclusiones(estadistica);
                const enEdicion = modoEdicion[estadistica.id];
                const nombreCompetidor = estadistica.competidor_detalle?.nombre || estadistica.competidor_nombre || `Competidor ${estadistica.competidor}`;

                // Datos para gráficos individuales
                const datosBarras = estadisticasSeleccionadas.map(key => ({
                  nombre: ESTADISTICAS_DISPONIBLES.find(e => e.key === key)?.label || key,
                  valor: estadistica[key] || 0
                })).filter(item => item.valor > 0);

                return (
                  <Grid item xs={12} key={estadistica.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Análisis de {nombreCompetidor}
                        </Typography>
                        
                        {/* Métricas de Rendimiento */}
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                          <Grid item xs={12} md={4}>
                            <Card variant="outlined">
                              <CardContent>
                                <Typography variant="subtitle2" color="textSecondary">
                                  Nivel de Habilidad
                                </Typography>
                                <Chip 
                                  label={conclusiones.nivelHabilidad}
                                  color={conclusiones.nivelHabilidad === 'Experto' ? 'success' : 
                                         conclusiones.nivelHabilidad === 'Avanzado' ? 'primary' : 
                                         conclusiones.nivelHabilidad === 'Intermedio' ? 'warning' : 'default'}
                                  sx={{ mt: 1 }}
                                />
                              </CardContent>
                            </Card>
                          </Grid>
                          
                          <Grid item xs={12} md={4}>
                            <Card variant="outlined">
                              <CardContent>
                                <Typography variant="subtitle2" color="textSecondary">
                                  Efectividad
                                </Typography>
                                <Typography variant="h6" color="primary">
                                  {conclusiones.efectividad}%
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                          
                          <Grid item xs={12} md={4}>
                            <Card variant="outlined">
                              <CardContent>
                                <Typography variant="subtitle2" color="textSecondary">
                                  Diversidad Técnica
                                </Typography>
                                <Typography variant="h6" color="secondary">
                                  {conclusiones.diversidadTecnica}%
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        </Grid>

                        {/* Gráfico de Barras Individual */}
                        <Card variant="outlined" sx={{ mb: 3 }}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                              <BarChartIcon sx={{ mr: 1 }} />
                              Estadísticas Detalladas
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={datosBarras} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                  dataKey="nombre" 
                                  angle={-45} 
                                  textAnchor="end" 
                                  height={100}
                                  interval={0}
                                />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="valor" fill="#8884d8" />
                              </BarChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>

                        {/* Recomendaciones editables */}
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="h6">
                              <Compare sx={{ mr: 1, verticalAlign: 'middle' }} />
                              Recomendaciones de Entrenamiento
                              <IconButton 
                                size="small" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleEdicion(estadistica.id);
                                }}
                                sx={{ ml: 1 }}
                              >
                                {enEdicion ? <Save /> : <Edit />}
                              </IconButton>
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            {enEdicion ? (
                              <Box>
                                <TextField
                                  fullWidth
                                  multiline
                                  rows={6}
                                  value={recomendacionesEditables[estadistica.id] || ''}
                                  onChange={(e) => actualizarRecomendaciones(estadistica.id, e.target.value)}
                                  placeholder="Escribe las recomendaciones personalizadas aquí..."
                                  variant="outlined"
                                />
                                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                  <Button
                                    variant="contained"
                                    startIcon={<Save />}
                                    onClick={() => guardarRecomendaciones(estadistica.id)}
                                  >
                                    Guardar
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    onClick={() => toggleEdicion(estadistica.id)}
                                  >
                                    Cancelar
                                  </Button>
                                </Box>
                              </Box>
                            ) : (
                              <Box>
                                {recomendacionesEditables[estadistica.id] ? (
                                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                                    {recomendacionesEditables[estadistica.id]}
                                  </Typography>
                                ) : (
                                  <Box>
                                    {conclusiones.recomendaciones.map((rec, index) => (
                                      <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                                        • {rec}
                                      </Typography>
                                    ))}
                                  </Box>
                                )}
                              </Box>
                            )}
                          </AccordionDetails>
                        </Accordion>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </>
      )}
    </Box>
  );
}

export default EstadisticasAvanzadas;