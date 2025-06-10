import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem, Avatar, Box } from '@mui/material';
import { Menu as MenuIcon, Person, ExitToApp, Dashboard, EmojiEvents, SportsMartialArts, Assessment } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin, isEntrenador, isCompetidor } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenu = (event) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMobileClose = () => {
    setMobileMenuAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
    handleMobileClose();
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#1a237e' }}>
      <Toolbar>
        <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'white' }}>
          Judo Táctico
        </Typography>

        {/* Menú para móviles */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={handleMobileMenu}
          sx={{ display: { xs: 'block', md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Menu
          anchorEl={mobileMenuAnchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(mobileMenuAnchorEl)}
          onClose={handleMobileClose}
        >
          {isAuthenticated ? (
            <>
              <MenuItem component={Link} to="/dashboard" onClick={handleMobileClose}>
                <Dashboard fontSize="small" sx={{ mr: 1 }} /> Dashboard
              </MenuItem>
              {(isAdmin || isEntrenador) && (
                <>
                  <MenuItem component={Link} to="/competidores" onClick={handleMobileClose}>
                    <Person fontSize="small" sx={{ mr: 1 }} /> Competidores
                  </MenuItem>
                  <MenuItem component={Link} to="/competiciones" onClick={handleMobileClose}>
                    <EmojiEvents fontSize="small" sx={{ mr: 1 }} /> Competiciones
                  </MenuItem>
                  <MenuItem component={Link} to="/combates" onClick={handleMobileClose}>
                    <SportsMartialArts fontSize="small" sx={{ mr: 1 }} /> Combates
                  </MenuItem>
                  {isAdmin && (
                    <MenuItem component={Link} to="/usuarios" onClick={handleMobileClose}>
                      <Person fontSize="small" sx={{ mr: 1 }} /> Usuarios
                    </MenuItem>
                  )}
                </>
              )}
              <MenuItem component={Link} to="/estadisticas" onClick={handleMobileClose}>
                <Assessment fontSize="small" sx={{ mr: 1 }} /> Estadísticas
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ExitToApp fontSize="small" sx={{ mr: 1 }} /> Cerrar sesión
              </MenuItem>
            </>
          ) : (
            <>
              <MenuItem component={Link} to="/login" onClick={handleMobileClose}>
                Iniciar sesión
              </MenuItem>
              <MenuItem component={Link} to="/register" onClick={handleMobileClose}>
                Registrarse
              </MenuItem>
            </>
          )}
        </Menu>

        {/* Menú para escritorio */}
        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
          {isAuthenticated ? (
            <>
              <Button color="inherit" component={Link} to="/dashboard" startIcon={<Dashboard />}>
                Dashboard
              </Button>
              {(isAdmin || isEntrenador) && (
                <>
                  <Button color="inherit" component={Link} to="/competidores" startIcon={<Person />}>
                    Competidores
                  </Button>
                  <Button color="inherit" component={Link} to="/competiciones" startIcon={<EmojiEvents />}>
                    Competiciones
                  </Button>
                  <Button color="inherit" component={Link} to="/combates" startIcon={<SportsMartialArts />}>
                    Combates
                  </Button>
                  {isAdmin && (
                    <Button color="inherit" component={Link} to="/usuarios" startIcon={<Person />}>
                      Usuarios
                    </Button>
                  )}
                </>
              )}
              <Button color="inherit" component={Link} to="/estadisticas" startIcon={<Assessment />}>
                Estadísticas
              </Button>
              <IconButton
                size="large"
                aria-label="cuenta del usuario"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#f5f5f5', color: '#1a237e' }}>
                  {user?.nombre?.charAt(0) || 'U'}
                </Avatar>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleClose} component={Link} to="/perfil">
                  Mi Perfil
                </MenuItem>
                <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Iniciar sesión
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Registrarse
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;