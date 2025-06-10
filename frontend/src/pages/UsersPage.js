import React from 'react';
import { Box } from '@mui/material';
import UserList from '../components/usuarios/UserList';
import BackButton from '../components/layout/BackButton';

const UsersPage = () => {
  return (
    <div className="users-background">
      <Box>
        <BackButton to="/dashboard" label="Volver al Dashboard" />
        <UserList />
      </Box>
    </div>
  );
};

export default UsersPage;