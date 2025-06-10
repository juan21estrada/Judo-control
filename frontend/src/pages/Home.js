import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  Paper,
} from '@mui/material';
import {
  SportsMartialArts,
  Assessment,
  EmojiEvents,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-background">
      <Box>
        {/* Hero Section */}
        <Paper
          sx={{
            position: 'relative',
            backgroundColor: 'grey.800',
            color: '#fff',
            mb: 4,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundImage: `url('/placeholder.svg?height=400&width=800')`,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: 0,
              left: 0,
              backgroundColor: 'rgba(0,0,0,.3)',
            }}
          />
          <Container maxWidth="lg">
            <Box
              sx={{
                position: 'relative',
                p: { xs: 3, md: 6 },
                pr: { md: 0 },
              }}
            >
              <Typography component="h1" variant="h2" color="inherit" gutterBottom>
                Judo Táctico
              </Typography>
              <Typography variant="h5" color="inherit" paragraph>
                Sistema integral para el control y análisis de acciones tácticas en el judo.
                Registra, analiza y mejora el rendimiento de tus competidores.
              </Typography>
              {!isAuthenticated ? (
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    size="large"
                    component={Link}
                    to="/register"
                    sx={{ mr: 2, bgcolor: '#1a237e' }}
                  >
                    Comenzar
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    component={Link}
                    to="/login"
                    sx={{ color: 'white', borderColor: 'white' }}
                  >
                    Iniciar Sesión
                  </Button>
                </Box>
              ) : (
                <Button
                  variant="contained"
                  size="large"
                  component={Link}
                  to="/dashboard"
                  sx={{ mt: 3, bgcolor: '#1a237e' }}
                >
                  Comencemos 
                </Button>
              )}
            </Box>
          </Container>
        </Paper>

        {/* Features Section */}
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Typography variant="h3" component="h2" align="center" gutterBottom>
            Características Principales
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', textAlign: 'center' }}>
                <CardContent sx={{ p: 3 }}>
                  <SportsMartialArts sx={{ fontSize: 60, color: '#1a237e', mb: 2 }} />
                  <Typography variant="h5" component="h3" gutterBottom>
                    Control de Competidores
                  </Typography>
                  <Typography>
                    Gestiona la información completa de tus atletas y su progreso.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', textAlign: 'center' }}>
                <CardContent sx={{ p: 3 }}>
                  <EmojiEvents sx={{ fontSize: 60, color: '#1a237e', mb: 2 }} />
                  <Typography variant="h5" component="h3" gutterBottom>
                    Gestión de Competiciones
                  </Typography>
                  <Typography>
                    Organiza y administra competiciones de manera eficiente.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', textAlign: 'center' }}>
                <CardContent sx={{ p: 3 }}>
                  <Assessment sx={{ fontSize: 60, color: '#1a237e', mb: 2 }} />
                  <Typography variant="h5" component="h3" gutterBottom>
                    Análisis Estadístico
                  </Typography>
                  <Typography>
                    Obtén insights detallados del rendimiento y tácticas utilizadas.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </div>
  );
};

export default Home;