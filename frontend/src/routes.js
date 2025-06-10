import { Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/UsersPage';
import { UserForm } from './components/usuarios/UserForm';
import CombateForm from './components/combates/CombateForm';
import CombateControl from './components/combates/CombateControl';
import PrivateRoute from './components/auth/PrivateRoute';
import CompetidorInscripcionForm from './components/competidores/CompetidorInscripcionForm';

const routes = [
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/dashboard',
    element: <Dashboard />
  },
  {
    path: '/users',
    element: <UsersPage />
  },
  {
    path: '/usuarios',
    element: <UsersPage />
  },
  {
    path: '/usuarios/nuevo',
    element: <PrivateRoute><UserForm /></PrivateRoute>
  },
  {
    path: '/usuarios/editar/:id',
    element: <PrivateRoute><UserForm /></PrivateRoute>
  },
  {
    path: '/combates/:id',
    element: <CombateForm />
  },
  {
    path: '/combates/:id/control',
    element: <CombateControl />
  },
  {
    path: '/competiciones/:id/inscribir',
    element: <PrivateRoute><CompetidorInscripcionForm /></PrivateRoute>
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
];

export default routes;