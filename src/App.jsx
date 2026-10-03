import React, { useState } from "react";

import { PublicUploadPage } from "./pages/PublicUploadPage";
import { AdminLogin } from "./components/AdminLogin";
import AdminPage from "./components/AdminPage";
import { ThemeProvider } from "./context/ThemeContext";
import { ThemeToggle } from "./components/ThemeToggle";

function AppContent() {
  const BASE_PATH = "/photo-event-frontend";

  const routeFromQuery = new URLSearchParams(window.location.search).get(
    "route"
  );

  const pathname = window.location.pathname.startsWith(BASE_PATH)
    ? window.location.pathname.slice(BASE_PATH.length) || "/"
    : window.location.pathname;

  const currentPath = routeFromQuery || pathname;

  const isAdminRoute =
    currentPath === "/admin" || currentPath.startsWith("/admin/");

  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("@photo-event:token")
  );

  const handleLogout = () => {
    localStorage.removeItem("@photo-event:token");
    setIsAuthenticated(false);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <>
      <ThemeToggle />

      {isAdminRoute ? (
        isAuthenticated ? (
          <AdminPage onLogout={handleLogout} />
        ) : (
          <AdminLogin onLoginSuccess={handleLoginSuccess} />
        )
      ) : (
        <PublicUploadPage />
      )}
    </>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;