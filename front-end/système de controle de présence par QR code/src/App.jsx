import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Spinner } from './components/ui/index.js';
import Login from './login.jsx';
import Register from './register.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import {
  ProtectedRoute,
  RedirectionApresConnexion,
} from './components/routing/ProtectedRoute.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Cours from './pages/Cours.jsx';
import CoursDetail from './pages/CoursDetail.jsx';
import Seances from './pages/Seances.jsx';
import SeanceDetail from './pages/SeanceDetail.jsx';
import PresencesSeance from './pages/PresencesSeance.jsx';
import Statistiques from './pages/Statistiques.jsx';
import Profil from './pages/Profil.jsx';
import Aide from './pages/Aide.jsx';
import AccesRefuse from './pages/AccesRefuse.jsx';
import NonTrouvee from './pages/NonTrouvee.jsx';

// La lecture de QR code et le rendu du QR embarquent des bibliothèques
// volumineuses : on les charge à la demande pour alléger le bundle initial.
const QrSeance = lazy(() => import('./pages/QrSeance.jsx'));
const Scan = lazy(() => import('./pages/Scan.jsx'));

function ChargementPage() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner label="Chargement de la page…" />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/connexion" element={<Login />} />
      <Route path="/inscription" element={<Register />} />

      <Route
        path="/acces-refuse"
        element={
          <ProtectedRoute>
            <AccesRefuse />
          </ProtectedRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/accueil" element={<Dashboard />} />
        <Route path="/cours" element={<Cours />} />
        <Route path="/cours/:id" element={<CoursDetail />} />
        <Route path="/seances" element={<Seances />} />
        <Route path="/seances/:id" element={<SeanceDetail />} />
        <Route
          path="/seances/:id/qr"
          element={
            <ProtectedRoute roles={['ENSEIGNANT', 'ADMIN']}>
              <Suspense fallback={<ChargementPage />}>
                <QrSeance />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/seances/:id/presences"
          element={
            <ProtectedRoute roles={['ENSEIGNANT', 'ADMIN']}>
              <PresencesSeance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scan"
          element={
            <ProtectedRoute roles={['ETUDIANT']}>
              <Suspense fallback={<ChargementPage />}>
                <Scan />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route path="/statistiques" element={<Statistiques />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/aide" element={<Aide />} />
      </Route>

      <Route path="/" element={<RedirectionApresConnexion />} />
      <Route path="*" element={<NonTrouvee />} />
    </Routes>
  );
}

export default App;
