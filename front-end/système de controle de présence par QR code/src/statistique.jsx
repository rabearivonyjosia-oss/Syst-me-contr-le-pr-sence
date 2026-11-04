import { useState, useEffect } from "react";
import { 
  BookOpen, 
  Calendar, 
  Users, 
  GraduationCap, 
  TrendingUp, 
  RefreshCw 
} from "lucide-react";

function Statistiques() {
  // État pour stocker les données statistiques (récupérées depuis l'API ou par défaut)
  const [stats, setStats] = useState({
    mes_cours: 3,
    seances_aujourdhui: 1,
    etudiants_presents: 12,
    total_etudiants: 45,
  });

  const [loading, setLoading] = useState(false);

  // Exemple d'appel API pour charger les vraies statistiques dynamiques depuis ton backend Django
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch("http://127.0.0.1:8000/api/statistiques/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data); // Met à jour avec les données de la base de données
        }
      } catch (err) {
        console.error("Erreur lors du chargement des statistiques :", err);
      } finally {
        setLoading(false);
      }
    };

    // fetchStats(); // Décommente cette ligne lorsque ton endpoint API statistique est prêt
  }, []);

  return (
    <main className="flex-1 bg-gray-100 p-8 overflow-y-auto min-h-screen">
      {/* En-tête de la page */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Statistiques globales</h1>
          <p className="text-sm text-gray-500 mt-1">Aperçu analytique des présences et de l'activité académique.</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Actualiser</span>
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-center py-10">Chargement des statistiques...</p>
      ) : (
        <div className="space-y-6">
          {/* Grille des 4 cartes statistiques principales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Carte 1 : Mes cours */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Mes cours</span>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <h2 className="text-3xl font-bold text-gray-900">{stats.mes_cours}</h2>
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Actifs ce semestre
                </span>
              </div>
            </div>

            {/* Carte 2 : Séances aujourd'hui */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Séances aujourd'hui</span>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <h2 className="text-3xl font-bold text-gray-900">{stats.seances_aujourdhui}</h2>
                <span className="text-xs text-gray-400 mt-1 block">Prévues pour ce jour</span>
              </div>
            </div>

            {/* Carte 3 : Étudiants présents */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Étudiants présents</span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <h2 className="text-3xl font-bold text-gray-900">{stats.etudiants_presents}</h2>
                <span className="text-xs text-emerald-600 font-medium mt-1 block">Enregistrés via QR code</span>
              </div>
            </div>

            {/* Carte 4 : Total étudiants */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Total étudiants</span>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <h2 className="text-3xl font-bold text-gray-900">{stats.total_etudiants}</h2>
                <span className="text-xs text-gray-400 mt-1 block">Inscrits dans les filières</span>
              </div>
            </div>

          </div>

          {/* Section Supplémentaire : Résumé ou Graphique indicatif */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">Taux de présence global</h3>
            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-[#1d63ed] h-full rounded-full transition-all duration-500" 
                style={{ width: `${(stats.etudiants_presents / stats.total_etudiants) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
              <span>{Math.round((stats.etudiants_presents / stats.total_etudiants) * 100)}% de participation active</span>
              <span>Objectif : 90%</span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Statistiques;