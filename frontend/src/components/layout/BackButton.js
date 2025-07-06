import React from 'react';
import { Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ to, label = 'Volver', variant = 'outlined', sx = {} }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1); // Volver a la página anterior
    }
  };

  return (
    <Button
      variant={variant}
      startIcon={<ArrowBack />}
      onClick={handleBack}
      sx={{ 
        mb: 2, 
        backgroundColor: '#1565c0', // Azul más fuerte
        color: 'white', // Letras blancas
        border: variant === 'outlined' ? '2px solid #1565c0' : 'none',
        '&:hover': {
          backgroundColor: '#0d47a1', // Azul aún más oscuro al hacer hover
          border: variant === 'outlined' ? '2px solid #0d47a1' : 'none',
        },
        ...sx 
      }}
    >
      {label}
    </Button>
  );
};

export default BackButton;