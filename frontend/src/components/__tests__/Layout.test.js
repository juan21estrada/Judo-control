import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Layout from '../layout/Layout';
import { AuthContext } from '../../context/AuthContext';

// Mock del contexto de autenticación
const mockAuthContext = {
  user: {
    id: 1,
    email: 'test@example.com',
    nombre: 'Test User',
    rol: 'entrenador'
  },
  token: 'mock-token',
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  loading: false
};

// Wrapper con contexto y router
const renderWithProviders = (component) => {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={mockAuthContext}>
        {component}
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

describe('Layout Component', () => {
  test('renderiza el layout correctamente', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    // Verificar que el contenido se renderiza
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('renderiza sin children', () => {
    renderWithProviders(<Layout />);
    
    // El layout debería renderizarse sin errores
    expect(document.body).toBeInTheDocument();
  });
});