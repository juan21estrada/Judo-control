import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import CompetidoresList from './components/competidores/CompetidoresList';
import CompetidorForm from './components/competidores/CompetidorForm';
import CompeticionesList from './components/competiciones/CompeticionesList';
import CompeticionForm from './components/competiciones/CompeticionForm';
import CombatesList from './components/combates/CombatesList';
import CombateForm from './components/combates/CombateForm';
import CombateControl from './components/combates/CombateControl';
import EstadisticasList from './components/estadisticas/EstadisticasList';
import ReporteForm from './components/estadisticas/ReporteForm';
import UserList from './components/usuarios/UserList';
import { UserForm } from './components/usuarios/UserForm';
import PrivateRoute from './components/auth/PrivateRoute';
import RoleBasedRoute from './components/auth/RoleBasedRoute';
import CompetidorInscripcionForm from './components/competidores/CompetidorInscripcionForm';
import EstadisticasAvanzadas from './components/estadisticas/EstadisticasAvanzadas';
import UserDetail from './components/usuarios/UserDetail'; // Agregar esta línea

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Layout>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          
          <Route path="/competidores" element={<RoleBasedRoute allowedRoles={['administrador', 'entrenador']}><CompetidoresList /></RoleBasedRoute>} />
          <Route path="/competidores/nuevo" element={<RoleBasedRoute allowedRoles={['administrador', 'entrenador']}><CompetidorForm /></RoleBasedRoute>} />
          <Route path="/competidores/:id/editar" element={<RoleBasedRoute allowedRoles={['administrador', 'entrenador']}><CompetidorForm /></RoleBasedRoute>} />
          
          <Route path="/competiciones" element={<RoleBasedRoute allowedRoles={['administrador', 'entrenador']}><CompeticionesList /></RoleBasedRoute>} />
          <Route path="/competiciones/nueva" element={<RoleBasedRoute allowedRoles={['administrador', 'entrenador']}><CompeticionForm /></RoleBasedRoute>} />
          <Route path="/competiciones/:id/editar" element={<RoleBasedRoute allowedRoles={['administrador', 'entrenador']}><CompeticionForm /></RoleBasedRoute>} />
          
          <Route path="/combates" element={<RoleBasedRoute allowedRoles={['administrador', 'entrenador']}><CombatesList /></RoleBasedRoute>} />
          <Route path="/combates/nuevo" element={<RoleBasedRoute allowedRoles={['administrador', 'entrenador']}><CombateForm /></RoleBasedRoute>} />
          <Route path="/combates/:id/editar" element={<RoleBasedRoute allowedRoles={['administrador', 'entrenador']}><CombateForm /></RoleBasedRoute>} />
          <Route path="combates">
            <Route path=":id" element={<CombateControl />} />
          </Route>
          
          <Route path="/estadisticas" element={<PrivateRoute><EstadisticasList /></PrivateRoute>} />
          <Route path="/estadisticas/avanzadas" element={<PrivateRoute><EstadisticasAvanzadas /></PrivateRoute>} />
          <Route path="/estadisticas/nuevo-reporte" element={<PrivateRoute><ReporteForm /></PrivateRoute>} />
          <Route path="/estadisticas/editar-reporte/:id" element={<PrivateRoute><ReporteForm /></PrivateRoute>} />
          
          <Route path="/usuarios" element={<RoleBasedRoute allowedRoles={['administrador']}><UserList /></RoleBasedRoute>} />
          <Route path="/usuarios/nuevo" element={<RoleBasedRoute allowedRoles={['administrador']}><UserForm /></RoleBasedRoute>} />
          <Route path="/usuarios/editar/:id" element={<RoleBasedRoute allowedRoles={['administrador']}><UserForm /></RoleBasedRoute>} />
          <Route path="/usuarios/:id/detalle" element={<RoleBasedRoute allowedRoles={['administrador', 'entrenador']}><UserDetail /></RoleBasedRoute>} />
          
          <Route path="/combates/:id/control" element={<PrivateRoute><CombateControl /></PrivateRoute>} />
          <Route path="/perfil" element={<PrivateRoute><UserForm /></PrivateRoute>} />
          <Route path="/competiciones/:id/inscribir" element={<RoleBasedRoute allowedRoles={['administrador', 'entrenador']}><CompetidorInscripcionForm /></RoleBasedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
// Ruta no encontrada:
