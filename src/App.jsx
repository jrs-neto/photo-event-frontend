import React, { useState } from 'react';
import { PublicUploadPage } from './pages/PublicUploadPage';
import { AdminLogin } from './components/AdminLogin';
import AdminPage from './components/AdminPage';

export function App() {
  // Verifica se o usuário está tentando acessar a área /admin
  const pathname = window.location.pathname;
  const pathFromQuery = new URLSearchParams(window.location.search).get("route");

  const currentPath = pathFromQuery || window.location.pathname;

  const isAdminRoute = currentPath.startsWith("/admin");

  // Estado de autenticação do administrador
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('@photo-event:token')
  );

  const handleLogout = () => {
    localStorage.removeItem('@photo-event:token');
    setIsAuthenticated(false);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // Se a rota for /admin, gerencia a exibição entre Login e Painel
  if (isAdminRoute) {
    return isAuthenticated ? (
      <AdminPage onLogout={handleLogout} />
    ) : (
      <AdminLogin onLoginSuccess={handleLoginSuccess} />
    );
  }

  // Qualquer outra rota carrega exclusivamente a página pública original
  return <PublicUploadPage />;
}

export default App;