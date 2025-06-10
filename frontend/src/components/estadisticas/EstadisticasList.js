import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  MenuItem,
  IconButton,
  Avatar,
  Tooltip,
  TableSortLabel,
  Divider
} from '@mui/material';
import { 
  Add, 
  Assessment, 
  Visibility, 
  Edit, 
  Delete, 
  Compare, 
  Analytics,
  TrendingUp, 
  TrendingDown, 
  EmojiEvents, 
  SportsMartialArts,
  GetApp
} from '@mui/icons-material';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import BackButton from '../layout/BackButton';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import pdfService from '../../services/pdfService';

// ============================================================================
// CONSTANTES Y CONFIGURACIONES
// ============================================================================

const TECNICAS_COMPLETAS = {
  tashi_waza: ['ashi_waza', 'koshi_waza', 'kata_te_waza', 'sutemi_waza'],
  ne_waza: ['inmovilizaciones', 'luxaciones', 'estrangulaciones']
};

const COLUMNAS_TABLA = [
  { id: 'competidor', label: '👤 Competidor', sortable: false },
  { id: 'combates', label: '🥋 Combates', sortable: true },
  { id: 'victorias', label: '🏆 Victorias', sortable: true },
  { id: 'porcentaje_victorias', label: '📊 % Victorias', sortable: true },
  { id: 'ataques_tashi', label: '⚔️ Ataques Tashi', sortable: false },
  { id: 'efectividad', label: '🎯 Efectividad %', sortable: true },
  { id: 'diversidad', label: '📊 Diversidad %', sortable: true },
  { id: 'ippon', label: '🥇 Ippon', sortable: true },
  { id: 'wazari', label: '🥈 Waza-ari', sortable: false },
  { id: 'shido', label: '⚠️ Shido', sortable: false },
  { id: 'ataques_negativos', label: '❌ Ataques Negativos', sortable: false },
  { id: 'ataques_combinados', label: '🔗 Ataques Combinados', sortable: false },
  { id: 'tecnicas_positivas', label: '✅ Técnicas Positivas', sortable: false },
  { id: 'tecnicas_negativas', label: '❌ Técnicas Negativas', sortable: false }
];

// ============================================================================
// FUNCIONES UTILITARIAS
// ============================================================================

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES');
};

const calcularEfectividad = (estadistica) => {
  if (!estadistica.total_ataques_tashi_waza || estadistica.total_ataques_tashi_waza === 0) return 0;
  const ataques_positivos = estadistica.ataques_positivos || 0;
  return ((ataques_positivos / estadistica.total_ataques_tashi_waza) * 100).toFixed(1);
};

const calcularPorcentajeVictorias = (estadistica) => {
  if (!estadistica.total_combates || estadistica.total_combates === 0) return 0;
  return ((estadistica.combates_ganados / estadistica.total_combates) * 100).toFixed(1);
};

const calcularDiversidadTecnica = (estadistica) => {
  const totalTecnicas = Object.values(TECNICAS_COMPLETAS).flat().length;
  const tecnicasUsadas = new Set();
  
  Object.entries(TECNICAS_COMPLETAS).forEach(([categoria, tecnicas]) => {
    tecnicas.forEach(tecnica => {
      if (estadistica[tecnica] && estadistica[tecnica] > 0) {
        tecnicasUsadas.add(tecnica);
      }
    });
  });
  
  return ((tecnicasUsadas.size / totalTecnicas) * 100).toFixed(1);
};

const getEfectividadColor = (efectividad) => {
  if (efectividad >= 70) return 'success';
  if (efectividad >= 50) return 'warning';
  if (efectividad >= 30) return 'info';
  return 'error';
};

const getVictoriasColor = (porcentaje) => {
  if (porcentaje >= 70) return 'success';
  if (porcentaje >= 50) return 'warning';
  return 'error';
};

const getDiversidadColor = (diversidad) => {
  if (diversidad >= 60) return 'success';
  if (diversidad >= 40) return 'warning';
  if (diversidad >= 20) return 'info';
  return 'error';
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const EstadisticasList = () => {
  // Estados
  const [reportes, setReportes] = useState([]);
  const [estadisticas, setEstadisticas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReporte, setSelectedReporte] = useState('');
  const [orderBy, setOrderBy] = useState('efectividad');
  const [order, setOrder] = useState('desc');
  
  // Hooks
  const { isEntrenador, isCompetidor, user } = useAuth();
  const navigate = useNavigate();

  // ============================================================================
  // EFECTOS
  // ============================================================================

  useEffect(() => {
    fetchReportes();
    if (isCompetidor) {
      fetchMisEstadisticas();
    }
  }, [isCompetidor]);

  useEffect(() => {
    if (selectedReporte) {
      fetchEstadisticasReporte(selectedReporte);
    }
  }, [selectedReporte]);

  // ============================================================================
  // FUNCIONES DE API
  // ============================================================================

  const fetchReportes = async () => {
    try {
      setLoading(true);
      const response = await api.get('reportes/');
      setReportes(response.data.results || response.data);
    } catch (err) {
      setError('Error al cargar los reportes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMisEstadisticas = async () => {
    try {
      const response = await api.get('estadisticas/');
      setEstadisticas(response.data.results || response.data);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('No tienes permisos para ver las estadísticas o tu sesión ha expirado.');
      } else {
        setError('Error al cargar las estadísticas. Por favor, intenta de nuevo.');
      }
    }
  };

  const fetchEstadisticasReporte = async (reporteId) => {
    try {
      const response = await api.get(`reportes/${reporteId}/`);
      setEstadisticas(response.data.estadisticas || []);
    } catch (err) {
      console.error('Error al cargar estadísticas del reporte:', err);
    }
  };

  const handleDeleteReporte = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este reporte?')) {
      try {
        await api.delete(`reportes/${id}/`);
        toast.success('Reporte eliminado correctamente');
        fetchReportes();
      } catch (error) {
        toast.error('Error al eliminar el reporte');
      }
    }
  };

  const exportarEstadisticasPDF = async () => {
    try {
      await pdfService.exportarEstadisticasPDF(
        'estadisticas-container',
        selectedReporte ? `Reporte ${selectedReporte}` : 'Estadísticas Generales',
        'estadisticas.pdf'
      );
      toast.success('PDF de estadísticas generado correctamente');
    } catch (error) {
      toast.error('Error al generar el PDF');
      console.error(error);
    }
  };

  // ============================================================================
  // FUNCIONES DE ORDENAMIENTO
  // ============================================================================

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedEstadisticas = estadisticas.sort((a, b) => {
    let aValue, bValue;
    
    switch (orderBy) {
      case 'efectividad':
        aValue = parseFloat(calcularEfectividad(a));
        bValue = parseFloat(calcularEfectividad(b));
        break;
      case 'victorias':
        aValue = parseFloat(calcularPorcentajeVictorias(a));
        bValue = parseFloat(calcularPorcentajeVictorias(b));
        break;
      case 'diversidad':
        aValue = parseFloat(calcularDiversidadTecnica(a));
        bValue = parseFloat(calcularDiversidadTecnica(b));
        break;
      case 'combates':
        aValue = a.total_combates || 0;
        bValue = b.total_combates || 0;
        break;
      case 'ippon':
        aValue = a.ippon || 0;
        bValue = b.ippon || 0;
        break;
      default:
        aValue = a[orderBy] || 0;
        bValue = b[orderBy] || 0;
    }
    
    if (order === 'desc') {
      return bValue - aValue;
    }
    return aValue - bValue;
  });

  // ============================================================================
  // COMPONENTES DE RENDERIZADO
  // ============================================================================

  const renderTableHeader = () => (
    <TableHead sx={{ bgcolor: '#f8f9fa' }}>
      <TableRow>
        {COLUMNAS_TABLA.map((columna) => (
          <TableCell 
            key={columna.id}
            align={columna.id === 'competidor' ? 'left' : 'center'} 
            sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}
          >
            {columna.sortable ? (
              <TableSortLabel
                active={orderBy === columna.id}
                direction={orderBy === columna.id ? order : 'asc'}
                onClick={() => handleRequestSort(columna.id)}
              >
                {columna.label}
              </TableSortLabel>
            ) : (
              columna.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );

  const renderEstadisticaRow = (estadistica, index) => {
    const efectividad = calcularEfectividad(estadistica);
    const porcentajeVictorias = calcularPorcentajeVictorias(estadistica);
    const diversidadTecnica = calcularDiversidadTecnica(estadistica);
    
    return (
      <TableRow 
        key={estadistica.id}
        sx={{ 
          '&:nth-of-type(odd)': { bgcolor: '#fafafa' },
          '&:hover': { bgcolor: '#e3f2fd' },
          transition: 'background-color 0.2s ease'
        }}
      >
        {/* Competidor */}
        <TableCell component="th" scope="row">
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: '#1a237e' }}>
              {estadistica.competidor_detalle?.nombre?.charAt(0) || '?'}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight="bold">
                {estadistica.competidor_detalle?.nombre}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Posición #{index + 1}
              </Typography>
            </Box>
          </Box>
        </TableCell>

        {/* Combates */}
        <TableCell align="center">
          <Chip
            label={estadistica.total_combates || 0}
            size="small"
            variant="outlined"
            color="primary"
          />
        </TableCell>

        {/* Victorias */}
        <TableCell align="center">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {porcentajeVictorias >= 50 ? <TrendingUp color="success" /> : <TrendingDown color="error" />}
            <Typography variant="body2" sx={{ ml: 0.5 }}>
              {estadistica.combates_ganados || 0}
            </Typography>
          </Box>
        </TableCell>

        {/* Porcentaje Victorias */}
        <TableCell align="center">
          <Chip
            label={`${porcentajeVictorias}%`}
            color={getVictoriasColor(porcentajeVictorias)}
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
        </TableCell>

        {/* Ataques Tashi */}
        <TableCell align="center">
          <Typography variant="body2" fontWeight="bold">
            {estadistica.total_ataques_tashi_waza || 0}
          </Typography>
        </TableCell>

        {/* Efectividad */}
        <TableCell align="center">
          <Chip
            label={`${efectividad}%`}
            color={getEfectividadColor(efectividad)}
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
        </TableCell>

        {/* Diversidad Técnica */}
        <TableCell align="center">
          <Chip
            label={`${diversidadTecnica}%`}
            color={getDiversidadColor(diversidadTecnica)}
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
        </TableCell>

        {/* Ippon */}
        <TableCell align="center">
          <Chip
            label={estadistica.ippon || 0}
            color="warning"
            size="small"
            sx={{ bgcolor: '#ff9800', color: 'white', fontWeight: 'bold' }}
          />
        </TableCell>

        {/* Waza-ari */}
        <TableCell align="center">
          <Chip
            label={estadistica.wazari || 0}
            color="info"
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
        </TableCell>

        {/* Shido */}
        <TableCell align="center">
          <Chip
            label={estadistica.shido || 0}
            color={estadistica.shido > 2 ? 'error' : 'default'}
            size="small"
            variant={estadistica.shido > 0 ? 'filled' : 'outlined'}
          />
        </TableCell>

        {/* Ataques Negativos */}
        <TableCell align="center">
          <Chip
            label={estadistica.ataques_negativos || 0}
            color="error"
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
        </TableCell>

        {/* Ataques Combinados */}
        <TableCell align="center">
          <Chip
            label={estadistica.ataques_combinados || 0}
            color="secondary"
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
        </TableCell>

        {/* Técnicas Positivas */}
        <TableCell align="center">
          <Chip
            label={estadistica.tecnicas_positivas_combinadas || 0}
            color="success"
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
        </TableCell>

        {/* Técnicas Negativas */}
        <TableCell align="center">
          <Chip
            label={estadistica.tecnicas_negativas_combinadas || 0}
            color="error"
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
        </TableCell>
      </TableRow>
    );
  };

  const renderReporteCard = (reporte) => (
    <Grid item xs={12} md={6} lg={4} key={reporte.id}>
      <Card sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
        }
      }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <EmojiEvents sx={{ mr: 1, color: '#ff9800' }} />
            {reporte.titulo}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            📅 {formatDate(reporte.fecha_creacion)}
          </Typography>
          <Typography variant="body2" gutterBottom sx={{ mb: 2 }}>
            {reporte.descripcion}
          </Typography>
          <Chip 
            label={`${reporte.estadisticas_count || 0} estadísticas`}
            size="small"
            color="primary"
            icon={<Assessment />}
          />
        </CardContent>
        <Divider />
        <Box sx={{ p: 2, display: 'flex', gap: 1, justifyContent: 'space-between' }}>
          <Button
            size="small"
            startIcon={<Visibility />}
            onClick={() => setSelectedReporte(reporte.id)}
            variant="contained"
            sx={{ flexGrow: 1 }}
          >
            Ver Estadísticas
          </Button>
          <Tooltip title="Editar reporte">
            <IconButton
              size="small"
              onClick={() => navigate(`/estadisticas/editar-reporte/${reporte.id}`)}
              color="primary"
            >
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar reporte">
            <IconButton
              size="small"
              onClick={() => handleDeleteReporte(reporte.id)}
              color="error"
            >
              <Delete />
            </IconButton>
          </Tooltip>
        </Box>
      </Card>
    </Grid>
  );

  const renderResumenEstadisticas = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ bgcolor: '#e3f2fd', textAlign: 'center' }}>
          <CardContent>
            <Typography variant="h4" color="primary" fontWeight="bold">
              {estadisticas.length}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              👥 Total Competidores
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ bgcolor: '#f3e5f5', textAlign: 'center' }}>
          <CardContent>
            <Typography variant="h4" color="secondary" fontWeight="bold">
              {estadisticas.reduce((sum, est) => sum + (est.total_combates || 0), 0)}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              🥋 Total Combates
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ bgcolor: '#fff3e0', textAlign: 'center' }}>
          <CardContent>
            <Typography variant="h4" sx={{ color: '#ff9800' }} fontWeight="bold">
              {estadisticas.reduce((sum, est) => sum + (est.ippon || 0), 0)}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              🥇 Total Ippons
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ bgcolor: '#e8f5e8', textAlign: 'center' }}>
          <CardContent>
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {estadisticas.length > 0 ? 
                (estadisticas.reduce((sum, est) => sum + parseFloat(calcularEfectividad(est)), 0) / estadisticas.length).toFixed(1) 
                : 0}%
            </Typography>
            <Typography variant="body2" color="textSecondary">
              📈 Efectividad Promedio
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // ============================================================================
  // RENDER PRINCIPAL
  // ============================================================================

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box id="estadisticas-container">
      <BackButton to="/dashboard" label="Volver al Dashboard" />
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
          <Assessment sx={{ mr: 2, color: '#1a237e' }} />
          Estadísticas
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<GetApp />}
            onClick={exportarEstadisticasPDF}
            color="primary"
          >
            Exportar PDF
          </Button>
          <Button
            variant="outlined"
            startIcon={<Analytics />}
            onClick={() => navigate('/estadisticas/avanzadas')}
            sx={{ 
              bgcolor: '#2e7d32', 
              color: 'white',
              '&:hover': { bgcolor: '#1b5e20' }
            }}
          >
            Análisis Avanzado
          </Button>
          {isEntrenador && (
            <Button
              variant="contained"
              startIcon={<Add />}
              component={Link}
              to="/estadisticas/nuevo-reporte"
              sx={{ 
                bgcolor: '#1a237e',
                '&:hover': { bgcolor: '#0d47a1' }
              }}
            >
              Nuevo Reporte
            </Button>
          )}
        </Box>
      </Box>

      {/* Error Alert */}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Selector de reporte para entrenadores */}
      {isEntrenador && (
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #f5f5f5 0%, #e8eaf6 100%)' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Visibility sx={{ mr: 1 }} />
              Seleccionar Reporte
            </Typography>
            <TextField
              select
              label="Reporte"
              value={selectedReporte}
              onChange={(e) => setSelectedReporte(e.target.value)}
              fullWidth
              variant="outlined"
              sx={{ mb: 2 }}
            >
              <MenuItem value="">
                <em>Selecciona un reporte</em>
              </MenuItem>
              {reportes.map((reporte) => (
                <MenuItem key={reporte.id} value={reporte.id}>
                  {reporte.titulo} - {formatDate(reporte.fecha_creacion)}
                </MenuItem>
              ))}
            </TextField>
          </CardContent>
        </Card>
      )}

      {/* Lista de reportes para entrenadores */}
      {isEntrenador && !selectedReporte && (
        <>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <EmojiEvents sx={{ mr: 1, color: '#ff9800' }} />
            Reportes Disponibles
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {reportes.map(renderReporteCard)}
          </Grid>
        </>
      )}

      {/* Estadísticas */}
      {estadisticas.length > 0 && (
        <>
          {/* Resumen de estadísticas */}
          {renderResumenEstadisticas()}

          {/* Tabla de estadísticas */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <SportsMartialArts sx={{ mr: 1 }} />
                Estadísticas Detalladas
              </Typography>
              <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                <Table stickyHeader>
                  {renderTableHeader()}
                  <TableBody>
                    {sortedEstadisticas.map((estadistica, index) => 
                      renderEstadisticaRow(estadistica, index)
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}

      {/* Mensaje cuando no hay estadísticas */}
      {estadisticas.length === 0 && !loading && (
        <Alert severity="info" sx={{ mt: 3 }}>
          {isCompetidor 
            ? "No tienes estadísticas disponibles aún. Participa en combates para generar datos."
            : "No hay estadísticas disponibles. Selecciona un reporte o crea uno nuevo."
          }
        </Alert>
      )}
    </Box>
  );
};

export default EstadisticasList;