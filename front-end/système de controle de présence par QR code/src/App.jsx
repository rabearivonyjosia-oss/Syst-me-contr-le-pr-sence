import { Route, Routes, useNavigate } from 'react-router-dom';
import Login from './login.jsx';
import Register from './register.jsx';
import Dashboard from './Dashboard.jsx';
import { AccesRefuse, PageNonTrouvee } from './pages/Placeholder.jsx';
import { ProtectedRoute, RedirectionApresConnexion } from './components/routing/ProtectedRoute.jsx';

/*
 * Routes (Phase 2, frontend uniquement — backend inchangé).
 * - /connexion et /inscription : formulaires (fetch direct inchangé, appels
 *   relatifs /login/ et /register/ côté service api.js).
 * - Espace connecté : un seul gabarit (AppLayout) avec navigation identique.
 * - /accès-refusé et page 404 explicites.
 * - Les écrans de Phase 3/4 (profil, scan, QR enseignant, statistiques) sont
 *   déclarés en Placeholder pour garder une navigation qui ne casse pas.
 */

function PageConnexion() {
  const navigate = useNavigate();
  return (
    <Login
      goToRegister={() => navigate('/inscription')}
      goToDashboard={() => navigate('/accueil')}
    />
  );
}

function PageInscription() {
  const navigate = useNavigate();
  return <Register goToLogin={() => navigate('/connexion')} />;
}

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/connexion" element={<PageConnexion />} />
        <Route path="/inscription" element={<PageInscription />} />
        <Route path="/accès-refusé" element={<AccesRefuse />} />

        {/*
          Dashboard historique : sens actuel (accueil enseignant).
          ProtectedRoute exige un token ; sinon retour à /connexion.
        */}
        <Route
          path="/accueil"
          element={
            <ProtectedRoute roles={['ENSEIGNANT']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/cours" element={<ProtectedRoute roles={['ENSEIGNANT']}><Dashboard page="cours" /></ProtectedRoute>} />
        <Route path="/seances" element={<ProtectedRoute roles={['ENSEIGNANT']}><Dashboard page="seances" /></ProtectedRoute>} />
      
        <Route path="/profil" element={<ProtectedRoute><Dashboard page="profil" /></ProtectedRoute>} />
        <Route path="/scan" element={<ProtectedRoute roles={['ETUDIANT']}><Dashboard page="scan" /></ProtectedRoute>} />
        <Route path="/statistiques" element={<ProtectedRoute roles={['ENSEIGNANT']}><Dashboard page="statistiques" /></ProtectedRoute>} />

        <Route path="/" element={<RedirectionApresConnexion />} />
        <Route path="*" element={<PageNonTrouvee />} />
      </Routes>
    </div>
  );
}

export default App;
