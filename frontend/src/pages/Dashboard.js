import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Alert,
  CircularProgress,
  Chip,
  Button,
  Avatar
} from '@mui/material';
import {
  Person,
  EmojiEvents,
  SportsMartialArts,
  Assessment,
  Add,
  Visibility,
  History
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { estadisticasService } from '../services/estadisticasService';
import imgresAvatar from '../assets/images/imgres.webp';

const Dashboard = () => {
  const { user } = useAuth();
  const [estadisticas, setEstadisticas] = useState({
    competidores: 0,
    competiciones: 0,
    combates: 0,
    reportes: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const isEntrenador = user?.rol === 'entrenador' || user?.rol === 'administrador';
  const isCompetidor = user?.rol === 'competidor';

  // Componente de mensaje con avatar
  const MessageWithAvatar = ({ message, type = 'info' }) => (
    <Box className="message-with-avatar" sx={{ mb: 3 }}>
      <Avatar 
        src={imgresAvatar} 
        alt="Asistente Judo"
        className="avatar-assistant"
      />
      <Alert 
        severity={type} 
        sx={{ 
          flex: 1,
          background: 'transparent',
          border: 'none',
          '& .MuiAlert-message': {
            fontSize: '1.1rem',
            fontWeight: 500
          }
        }}
      >
        {message}
      </Alert>
    </Box>
  );

  useEffect(() => {
    const fetchEstadisticas = async () => {
      try {
        setLoading(true);
        const data = await estadisticasService.getEstadisticasGenerales();
        setEstadisticas(data);
        setSuccessMessage('¡Estadísticas cargadas correctamente! ');
        // Limpiar mensaje después de 5 segundos
        setTimeout(() => setSuccessMessage(''), 5000);
      } catch (err) {
        setError('Error al cargar las estadísticas. Por favor, intenta nuevamente.');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEstadisticas();
  }, []);

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="dashboard-background min-h-screen">
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <div className="content-container">
          {/* Mensajes con avatar asistente */}
          {error && (
            <MessageWithAvatar message={error} type="error" />
          )}
          {successMessage && (
            <MessageWithAvatar message={successMessage} type="success" />
          )}

          {/* Header mejorado con mejor transparencia */}
          <Box sx={{ mb: 6 }}>
            <Typography 
              variant="h2" 
              component="h1" 
              gutterBottom 
              className="dashboard-text"
              sx={{ 
                textAlign: 'center', 
                mb: 2,
                background: 'linear-gradient(45deg, #1a237e, #3f51b5)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 900,
                fontSize: { xs: '2rem', md: '3rem' }
              }}
            >
              Bienvenidos a Judo Tactico
            </Typography>
            <Typography 
              variant="h6" 
              className="dashboard-text"
              sx={{ 
                textAlign: 'center',
                fontWeight: 300
              }}
            >
              Análisis táctico profesional para competidores de élite
            </Typography>
          </Box>

          {/* Estadísticas con diseño moderno tipo Athlete Analyzer */}
          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Grid item xs={12} sm={6} lg={3}>
              <Card 
                className="card-glass" 
                sx={{ 
                  textAlign: 'center', 
                  p: 3,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '20px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ 
                    background: 'linear-gradient(45deg, #1a237e, #3f51b5)',
                    borderRadius: '50%',
                    width: 80,
                    height: 80,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto'
                  }}>
                    <Person sx={{ fontSize: 40, color: 'white' }} />
                  </Box>
                  <Typography variant="h3" component="div" sx={{ 
                    fontWeight: 900, 
                    color: '#1a237e',
                    mb: 1,
                    fontSize: '2.5rem'
                  }}>
                    {estadisticas.competidores}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: '#666',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontSize: '0.9rem'
                  }}>
                    Atletas Activos
                  </Typography>
                  <Box sx={{ mt: 2, p: 1, bgcolor: 'rgba(26,35,126,0.1)', borderRadius: '8px' }}>
                    <Typography variant="caption" sx={{ color: '#1a237e', fontWeight: 600 }}>
                      +12% este mes
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} lg={3}>
              <Card 
                className="card-glass" 
                sx={{ 
                  textAlign: 'center', 
                  p: 3,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '20px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ 
                    background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
                    borderRadius: '50%',
                    width: 80,
                    height: 80,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto'
                  }}>
                    <EmojiEvents sx={{ fontSize: 40, color: 'white' }} />
                  </Box>
                  <Typography variant="h3" component="div" sx={{ 
                    fontWeight: 900, 
                    color: '#ff6b35',
                    mb: 1,
                    fontSize: '2.5rem'
                  }}>
                    {estadisticas.competiciones}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: '#666',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontSize: '0.9rem'
                  }}>
                    Competiciones
                  </Typography>
                  <Box sx={{ mt: 2, p: 1, bgcolor: 'rgba(255,107,53,0.1)', borderRadius: '8px' }}>
                    <Typography variant="caption" sx={{ color: '#ff6b35', fontWeight: 600 }}>
                      3 activas
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} lg={3}>
              <Card 
                className="card-glass" 
                sx={{ 
                  textAlign: 'center', 
                  p: 3,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '20px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ 
                    background: 'linear-gradient(45deg, #e53e3e, #fc8181)',
                    borderRadius: '50%',
                    width: 80,
                    height: 80,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto'
                  }}>
                    <SportsMartialArts sx={{ fontSize: 40, color: 'white' }} />
                  </Box>
                  <Typography variant="h3" component="div" sx={{ 
                    fontWeight: 900, 
                    color: '#e53e3e',
                    mb: 1,
                    fontSize: '2.5rem'
                  }}>
                    {estadisticas.combates}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: '#666',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontSize: '0.9rem'
                  }}>
                    Combates Analizados
                  </Typography>
                  <Box sx={{ mt: 2, p: 1, bgcolor: 'rgba(229,62,62,0.1)', borderRadius: '8px' }}>
                    <Typography variant="caption" sx={{ color: '#e53e3e', fontWeight: 600 }}>
                      24h promedio
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} lg={3}>
              <Card 
                className="card-glass" 
                sx={{ 
                  textAlign: 'center', 
                  p: 3,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '20px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ 
                    background: 'linear-gradient(45deg, #38a169, #68d391)',
                    borderRadius: '50%',
                    width: 80,
                    height: 80,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto'
                  }}>
                    <Assessment sx={{ fontSize: 40, color: 'white' }} />
                  </Box>
                  <Typography variant="h3" component="div" sx={{ 
                    fontWeight: 900, 
                    color: '#38a169',
                    mb: 1,
                    fontSize: '2.5rem'
                  }}>
                    {estadisticas.reportes}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: '#666',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontSize: '0.9rem'
                  }}>
                    Reportes Generados
                  </Typography>
                  <Box sx={{ mt: 2, p: 1, bgcolor: 'rgba(56,161,105,0.1)', borderRadius: '8px' }}>
                    <Typography variant="caption" sx={{ color: '#38a169', fontWeight: 600 }}>
                      Actualizado hoy
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Sección principal con diseño tipo Athlete Analyzer */}
          <Grid container spacing={4}>
            {/* Panel de información del usuario mejorado */}
            <Grid item xs={12} lg={4}>
              <Card 
                className="card-glass" 
                sx={{ 
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '20px',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ 
                  background: 'linear-gradient(45deg, #1a237e, #3f51b5)',
                  p: 3,
                  color: 'white',
                  textAlign: 'center'
                }}>
                  <Avatar sx={{ 
                    width: 80, 
                    height: 80, 
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    margin: '0 auto 16px auto'
                  }}>
                    {user?.nombre?.charAt(0) || 'U'}
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    {user?.nombre}
                  </Typography>
                  <Chip 
                    label={
                      user?.rol === 'administrador' ? 'Administrador' :
                      user?.rol === 'entrenador' ? 'Entrenador' : 'Competidor'
                    }
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 600,
                      border: '1px solid rgba(255,255,255,0.3)'
                    }}
                  />
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ color: '#666', mb: 1, fontWeight: 600 }}>
                      Email
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#333', fontWeight: 500 }}>
                      {user?.email}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ color: '#666', mb: 1, fontWeight: 600 }}>
                      Estado
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        bgcolor: '#38a169' 
                      }} />
                      <Typography variant="body1" sx={{ color: '#38a169', fontWeight: 600 }}>
                        Activo
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Panel de accesos rápidos mejorado */}
            <Grid item xs={12} lg={8}>
              <Card 
                className="card-glass" 
                sx={{ 
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '20px',
                  height: '100%'
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 700, 
                    mb: 3,
                    color: '#1a237e'
                  }}>
                    Acciones Rápidas
                  </Typography>
                  <Grid container spacing={2}>
                    {isEntrenador && (
                      <>
                        <Grid item xs={12} sm={6}>
                          <Button
                            component={Link}
                            to="/competidores/nuevo"
                            variant="outlined"
                            startIcon={<Add />}
                            fullWidth
                            sx={{ 
                              p: 2,
                              borderRadius: '12px',
                              border: '2px solid #1a237e',
                              color: '#1a237e',
                              fontWeight: 600,
                              '&:hover': {
                                bgcolor: '#1a237e',
                                color: 'white',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 25px rgba(26,35,126,0.3)'
                              },
                              transition: 'all 0.3s ease'
                            }}
                          >
                            Nuevo Competidor
                          </Button>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Button
                            component={Link}
                            to="/competiciones/nueva"
                            variant="outlined"
                            startIcon={<EmojiEvents />}
                            fullWidth
                            sx={{ 
                              p: 2,
                              borderRadius: '12px',
                              border: '2px solid #ff6b35',
                              color: '#ff6b35',
                              fontWeight: 600,
                              '&:hover': {
                                bgcolor: '#ff6b35',
                                color: 'white',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 25px rgba(255,107,53,0.3)'
                              },
                              transition: 'all 0.3s ease'
                            }}
                          >
                            Nueva Competición
                          </Button>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Button
                            component={Link}
                            to="/combates/nuevo"
                            variant="outlined"
                            startIcon={<SportsMartialArts />}
                            fullWidth
                            sx={{ 
                              p: 2,
                              borderRadius: '12px',
                              border: '2px solid #e53e3e',
                              color: '#e53e3e',
                              fontWeight: 600,
                              '&:hover': {
                                bgcolor: '#e53e3e',
                                color: 'white',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 25px rgba(229,62,62,0.3)'
                              },
                              transition: 'all 0.3s ease'
                            }}
                          >
                            Iniciar Combate
                          </Button>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Button
                            component={Link}
                            to="/estadisticas/nuevo-reporte"
                            variant="outlined"
                            startIcon={<Assessment />}
                            fullWidth
                            sx={{ 
                              p: 2,
                              borderRadius: '12px',
                              border: '2px solid #38a169',
                              color: '#38a169',
                              fontWeight: 600,
                              '&:hover': {
                                bgcolor: '#38a169',
                                color: 'white',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 25px rgba(56,161,105,0.3)'
                              },
                              transition: 'all 0.3s ease'
                            }}
                          >
                            Generar Reporte
                          </Button>
                        </Grid>
                      </>
                    )}
                    {isCompetidor && (
                      <>
                        <Grid item xs={12} sm={6}>
                          <Button
                            component={Link}
                            to="/estadisticas"
                            variant="outlined"
                            startIcon={<Visibility />}
                            fullWidth
                            sx={{ 
                              p: 2,
                              borderRadius: '12px',
                              border: '2px solid #1a237e',
                              color: '#1a237e',
                              fontWeight: 600,
                              '&:hover': {
                                bgcolor: '#1a237e',
                                color: 'white',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 25px rgba(26,35,126,0.3)'
                              },
                              transition: 'all 0.3s ease'
                            }}
                          >
                            Mis Estadísticas
                          </Button>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Button
                            component={Link}
                            to="/combates"
                            variant="outlined"
                            startIcon={<History />}
                            fullWidth
                            sx={{ 
                              p: 2,
                              borderRadius: '12px',
                              border: '2px solid #38a169',
                              color: '#38a169',
                              fontWeight: 600,
                              '&:hover': {
                                bgcolor: '#38a169',
                                color: 'white',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 25px rgba(56,161,105,0.3)'
                              },
                              transition: 'all 0.3s ease'
                            }}
                          >
                            Historial de Combates
                          </Button>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </div>
      </Container>
    </div>
  );
};

export default Dashboard;