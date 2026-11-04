import { useState, useEffect } from "react";
import { User, Mail, Hash, Award, Shield, ChevronRight, Key, LogOut, Loader2 } from "lucide-react";

function Profil({ onLogout }) {
  // 1. États pour stocker les données de l'utilisateur, le chargement et les erreurs
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Appel API au chargement du composant pour récupérer les données de CustomUser
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("access_token"); // Récupération du token JWT

        // Remplace cette URL par ton endpoint Django REST Framework (ex: /api/users/me/ ou /api/profil/)
        const response = await fetch("http://127.0.0.1:8000/register/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // Authentification par Token JWT
          }
        });

        if (!response.ok) {
          throw new Error("Impossible de récupérer les informations du profil.");
        }

        const data = await response.json();
        setUser(data); // Stocke les données reçues de ton CustomUser
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Affichage pendant le chargement
  if (loading) {
    return (
      <div className="flex-1 bg-gray-100 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  // Affichage en cas d'erreur
  if (error) {
    return (
      <div className="flex-1 bg-gray-100 p-8 flex items-center justify-center min-h-screen">
        <p className="text-red-500 font-medium">Erreur : {error}</p>
      </div>
    );
  }

  return (
    <main className="flex-1 bg-gray-100 p-8 overflow-y-auto min-h-screen">
      {/* En-tête */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mon profil</h1>

      <div className="max-w-2xl space-y-6">
        {/* Carte principale d'identité */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md">
            <User className="w-8 h-8" />
          </div>
          <div>
            {/* Adaptation selon les champs de ton CustomUser (ex: first_name, last_name ou username) */}
            <h2 className="text-xl font-bold text-gray-900">
              {user?.nom || user?.username || `${user?.first_name || ''} ${user?.last_name || ''}`}
            </h2>
            <span className="inline-block mt-1 px-3 py-0.5 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-full border border-emerald-200">
              {user?.role || "Étudiant"} 💻
            </span>
          </div>
        </div>

        {/* Détails des informations */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100 text-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3 text-gray-500">
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </div>
            <span className="font-medium text-gray-900">{user?.email}</span>
          </div>

          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3 text-gray-500">
              <Hash className="w-4 h-4" />
              <span>Numéro matricule</span>
            </div>
            {/* Adapte 'matricule' selon le nom du champ dans ton modèle CustomUser (ex: user.numero_matricule) */}
            <span className="font-medium text-gray-900">{user?.matricule || user?.numero_matricule || "N/A"}</span>
          </div>

          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3 text-gray-500">
              <Award className="w-4 h-4" />
              <span>Niveau</span>
            </div>
            {/* Adapte 'niveau' selon ton modèle */}
            <span className="font-medium text-gray-900">{user?.niveau || "N/A"}</span>
          </div>

          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3 text-gray-500">
              <Shield className="w-4 h-4" />
              <span>Rôle</span>
            </div>
            <span className="font-medium text-gray-900">{user?.role || "Utilisateur"}</span>
          </div>
        </div>

        {/* Section Paramètres */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
            Paramètres
          </h3>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
            <button className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors rounded-t-2xl">
              <div className="flex items-center gap-3 text-gray-700">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium">Modifier mon profil</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            <button className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors rounded-b-2xl">
              <div className="flex items-center gap-3 text-gray-700">
                <Key className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium">Changer de mot de passe</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Bouton de déconnexion */}
        <div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-2 p-4 bg-white border border-red-100 rounded-2xl text-red-600 hover:bg-red-50 transition-colors shadow-sm font-medium text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </main>
  );
}

export default Profil;