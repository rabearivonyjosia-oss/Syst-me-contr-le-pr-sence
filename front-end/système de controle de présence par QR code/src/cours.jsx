import './App.css'
import { useState, useEffect } from "react";
import { 
  GraduationCap, Home, BookOpen, Calendar, Users, User, LogOut, 
  Search, Plus, MoreVertical, Code, Database, Calculator, Network 
} from "lucide-react";

function Cours({ onLogout, activeTab, setActiveTab }) {
  const [cours, setCours] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 1. Appel API Backend Django
  useEffect(() => {
    const fetchCours = async () => {
      try {
        const token = localStorage.getItem("access_token"); // Récupère le token JWT
        const response = await fetch("http://127.0.0.1:8000/cours", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, // Si ton API est sécurisée avec JWT
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCours(data);
        } else {
          setError("Impossible de charger les cours.");
        }
      } catch (err) {
        console.error(err);
        setError("Erreur de connexion avec le serveur.");
      } finally {
        setLoading(false);
      }
    };

    fetchCours();
  }, []);

  // Association des icônes par défaut selon le titre ou le domaine
  const getCourseIcon = (title) => {
    const lower = title?.toLowerCase() || "";
    if (lower.includes("web") || lower.includes("dev")) return Code;
    if (lower.includes("base") || lower.includes("data")) return Database;
    if (lower.includes("math")) return Calculator;
    return Network;
  };

  // Filtrage selon la recherche
  const filteredCourses = cours.filter(cours => 
    cours.nom_cours?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cours.niveau?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen w-full bg-slate-950 font-sans text-slate-100 pb-20 md:pb-0">
      
      {/* 1. Sidebar PC */}
      <aside className="hidden md:flex md:w-64 flex-col justify-between bg-slate-900 border-r border-slate-800 p-4 sticky top-0 h-screen">
        <div className="space-y-6">
          <div className="flex items-center space-x-3 px-2 py-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-blue-400" />
            </div>
            <span className="font-bold tracking-tight text-white text-base">Présence QR</span>
          </div>

          <nav className="space-y-1">
            <button onClick={() => setActiveTab("accueil")} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors ${activeTab === "accueil" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-400 hover:text-white hover:bg-slate-800/60"}`}>
              <Home className="w-4 h-4" />
              <span>Accueil</span>
            </button>
            <button onClick={() => setActiveTab("cours")} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors ${activeTab === "cours" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-400 hover:text-white hover:bg-slate-800/60"}`}>
              <BookOpen className="w-4 h-4" />
              <span>Mes cours</span>
            </button>
            <button onClick={() => setActiveTab("seances")} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors ${activeTab === "seances" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-400 hover:text-white hover:bg-slate-800/60"}`}>
              <Calendar className="w-4 h-4" />
              <span>Mes séances</span>
            </button>
            <button onClick={() => setActiveTab("etudiants")} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors ${activeTab === "etudiants" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-400 hover:text-white hover:bg-slate-800/60"}`}>
              <Users className="w-4 h-4" />
              <span>Étudiants</span>
            </button>
            <button onClick={() => setActiveTab("profil")} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors ${activeTab === "profil" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-400 hover:text-white hover:bg-slate-800/60"}`}>
              <User className="w-4 h-4" />
              <span>Profil</span>
            </button>
          </nav>
        </div>

        <div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 font-medium text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* 2. Contenu principal */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center space-x-3 md:hidden">
            <GraduationCap className="w-6 h-6 text-blue-400" />
            <span className="font-bold text-white">Présence QR</span>
          </div>
          <div className="hidden md:block">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Gestion des cours</span>
          </div>

          <div className="flex items-center space-x-3 ml-auto">
            <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-xs">
              MR
            </div>
            <span className="text-sm font-semibold text-white hidden sm:inline">M. Rakoto</span>
          </div>
        </header>

        <div className="p-6 sm:p-8 space-y-6 max-w-5xl w-full mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Mes cours</h1>
              <p className="text-sm text-slate-400">Gérez vos matières et suivez le nombre de séances associées.</p>
            </div>
            <button className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer">
              <Plus className="w-4 h-4" />
              <span>Ajouter un cours</span>
            </button>
          </div>

          {/* Recherche */}
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Rechercher un cours..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Affichage pendant le chargement / erreur */}
          {loading && <p className="text-center text-slate-400 py-8">Chargement des cours...</p>}
          {error && <p className="text-center text-red-400 py-8">{error}</p>}

          {/* Liste dynamique venue du backend Django */}
          {!loading && !error && (
            <div className="space-y-3">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => {
                  const IconComponent = getCourseIcon(course.nom_cours);
                  return (
                    <div 
                      key={course.id}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center justify-between hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-600/20 text-blue-400">
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-white">{course.nom_cours || course.title}</h2>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {course.niveau} <span className="mx-1.5">•</span> <span className="text-slate-300 font-medium">{course.seances_count || 0} séances</span>
                          </p>
                        </div>
                      </div>

                      <button className="w-9 h-9 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-slate-500 text-sm">
                  Aucun cours trouvé.
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* 3. Navigation mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 px-4 py-2 flex items-center justify-around z-30">
        <button onClick={() => setActiveTab("accueil")} className={`flex flex-col items-center py-1 px-2 ${activeTab === "accueil" ? "text-blue-500" : "text-slate-400"}`}>
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-1">Accueil</span>
        </button>
        <button onClick={() => setActiveTab("cours")} className={`flex flex-col items-center py-1 px-2 ${activeTab === "cours" ? "text-blue-500" : "text-slate-400"}`}>
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] mt-1">Cours</span>
        </button>
        <button onClick={() => setActiveTab("seances")} className={`flex flex-col items-center py-1 px-2 ${activeTab === "seances" ? "text-blue-500" : "text-slate-400"}`}>
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] mt-1">Séances</span>
        </button>
        <button onClick={() => setActiveTab("etudiants")} className={`flex flex-col items-center py-1 px-2 ${activeTab === "etudiants" ? "text-blue-500" : "text-slate-400"}`}>
          <Users className="w-5 h-5" />
          <span className="text-[10px] mt-1">Étudiants</span>
        </button>
        <button onClick={() => setActiveTab("profil")} className={`flex flex-col items-center py-1 px-2 ${activeTab === "profil" ? "text-blue-500" : "text-slate-400"}`}>
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-1">Profil</span>
        </button>
      </nav>
    </div>
  );
}

export default Cours;