import { useState } from 'react'
import Login from './login.jsx'
import Register from './register.jsx'
import Dashboard from './Dashboard.jsx'

const ESPACE_PAGES = ['dashboard', 'Dashboard', 'cours', 'seances', 'etudiants', 'profil'];

function App() {
  const [page, setPage] = useState("login");
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setPage("login");
  };

  // Une seule coquille (AppLayout) pour tout l'espace connecté :
  // navigation identique sur toutes les pages, page courante indiquée.
  const dansEspace = ESPACE_PAGES.includes(page);

  return (
    <div className="App">
      {page === "login" && (
        <Login
          goToRegister={() => setPage("register")}
          goToDashboard={() => setPage("dashboard")}
        />
      )}

      {page === "register" && (
        <Register
          goToLogin={() => setPage("login")}
        />
      )}

      {dansEspace && (
        <Dashboard
          currentPage={page === "Dashboard" ? "dashboard" : page}
          setCurrentPage={setPage}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;
