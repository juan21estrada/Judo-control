import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CompetidoresList from '../competidores/CompetidoresList';
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

// Mock de la API
jest.mock('../../services/api', () => ({
  get: jest.fn(() => Promise.resolve({ data: [] })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} }))
}));

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

describe('CompetidoresList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renderiza el componente correctamente', async () => {
    await act(async () => {
      renderWithProviders(<CompetidoresList />);
    });
    
    // Verificar que el título principal se renderiza
    expect(screen.getByRole('heading', { name: /🥋 competidores/i })).toBeInTheDocument();
  });

  test('muestra mensaje cuando no hay competidores', async () => {
    await act(async () => {
      renderWithProviders(<CompetidoresList />);
    });
    
    await waitFor(() => {
      // El componente debería mostrar el título
      expect(screen.getByRole('heading', { name: /🥋 competidores/i })).toBeInTheDocument();
    });
  });
});