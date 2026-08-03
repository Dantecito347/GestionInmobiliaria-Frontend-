import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import { authService } from './services/authService';
import PersonasPage from './pages/PersonasPage';
import PropiedadesPage from './pages/PropiedadesPage';
import ContratosPage from './pages/ContratosPage';
import PagosPage from './pages/PagosPage';
import Dashboard from './components/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isLoggedIn());

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };
  
  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
  };

  const user = {
    username: localStorage.getItem('username') || 'admin',
    perfil: localStorage.getItem('perfil') || 'ADMINISTRADOR',
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={
            !isAuthenticated ? (
              <Login onLoginSuccess={handleLoginSuccess} />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />
        
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? (
              <Dashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        <Route 
          path="/personas" 
          element={
            isAuthenticated ? (
              <PersonasPage />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        <Route 
          path="/propiedades" 
          element={
            isAuthenticated ? (
              <PropiedadesPage />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        <Route 
          path="/contratos" 
          element={
            isAuthenticated ? (
              <ContratosPage />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        <Route 
          path="/pagos" 
          element={
            isAuthenticated ? (
              <PagosPage />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        <Route 
          path="*" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;