import './App.css';
import { useState } from 'react';
import {
  GraduationCap, 
  Home, 
  BookOpen, 
  Calendar, 
  Users, 
  User, 
  LogOut,
  Bell, 
  Clock
} from "lucide-react";

function Dashboard({ onLogout, currentPage, setCurrentPage }) {
  const stats = [
    { label: "Mes cours", value: 3, icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Séances aujourd'hui", value: 1, icon: Calendar, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Étudiants présents", value: 12, icon: Users, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { label: "Total étudiants", value: 45, icon: Users, color: "text-pink-500", bg: "bg-pink-500/10" },
  ];

  const upcomingSessions = [
    { id: 1, title: "Développement Web", niveau: "L1 - Informatique", date: "14 oct. 2025 • 08:00 - 10:00", iconBg: "bg-blue-600/20 text-blue-400" },
    { id: 2, title: "Base de données", niveau: "L2 - Informatique", date: "14 oct. 2025 • 10:00 - 12:00", iconBg: "bg-indigo-600/20 text-indigo-400" },
    { id: 3, title: "Mathématiques", niveau: "L1 - MIAGE", date: "14 oct. 2025 • 14:00 - 16:00", iconBg: "bg-purple-600/20 text-purple-400" },
  ];

  return (
    <div className="flex min-h-screen w-full bg-slate-950 font-sans text-slate-100 pb-20 md:pb-0">

      {/* 1. Barre de navigation latérale (Desktop) */}
      <aside className="hidden md:flex md:w-64 flex-col justify-between bg-slate-900 border-r border-slate-800 p-4 sticky top-0 h-screen">
        <div className="space-y-6">
          <div className="flex items-center space-x-3 px-2 py-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-blue-400" />
            </div>
            <span className="font-bold tracking-tight text-white text-base">Présence QR</span>
          </div>

          <nav className="space-y-1">
            <button 
              onClick={() => setCurrentPage("dashboard")} 
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors ${currentPage === "dashboard" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-400 hover:text-white hover:bg-slate-800/60"}`}
            >
              <Home className="w-4 h-4" />
              <span>Accueil</span>
            </button>
            <button 
              onClick={() => setCurrentPage("cours")} 
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors ${currentPage === "cours" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-400 hover:text-white hover:bg-slate-800/60"}`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Cours</span>
            </button>
            <button 
              onClick={() => setCurrentPage("seances")} 
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors ${currentPage === "seances" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-400 hover:text-white hover:bg-slate-800/60"}`}
            >
              <Calendar className="w-4 h-4" />
              <span>Séances</span>
            </button>
            <button 
              onClick={() => setCurrentPage("etudiants")} 
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors ${currentPage === "etudiants" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-400 hover:text-white hover:bg-slate-800/60"}`}
            >
              <Users className="w-4 h-4" />
              <span>Étudiants</span>
            </button>
            <button 
              onClick={() => setCurrentPage("profil")} 
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors ${currentPage === "profil" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-400 hover:text-white hover:bg-slate-800/60"}`}
            >
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

      {/* 2. Contenu principal du Tableau de bord */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center space-x-3 md:hidden">
            <GraduationCap className="w-6 h-6 text-blue-400" />
            <span className="font-bold text-white">Présence QR</span>
          </div>
          <div className="hidden md:block">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tableau de bord Enseignant</span>
          </div>

          <div className="flex items-center space-x-4 ml-auto">
            <button className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></span>
            </button>

            <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
              <div className="w-9 h-9 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-sm">
                MR
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-white leading-tight">M. Rakoto</p>
                <p className="text-xs text-slate-400">Utilisateur</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 sm:p-8 space-y-8 max-w-6xl w-full mx-auto">
          
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Bonjour👋
            </h1>
            <p className="text-sm text-slate-400">
              Voici un aperçu de votre activité d'aujourd'hui.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-400">{stat.label}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white tracking-tight">Prochaines séances</h2>
              <button className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                Voir tout
              </button>
            </div>

            <div className="space-y-3">
              {upcomingSessions.map((session) => (
                <div 
                  key={session.id} 
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${session.iconBg}`}>
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{session.title}</h3>
                      <p className="text-xs text-slate-400">{session.niveau}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-800">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{session.date}</span>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-xl transition-colors shadow-md shadow-blue-600/20">
                      Voir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* 3. Barre de navigation inférieure (Mobile uniquement) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 px-4 py-2 flex items-center justify-around z-30">
        <button onClick={() => setCurrentPage("dashboard")} className={`flex flex-col items-center py-1 px-2 ${currentPage === "dashboard" ? "text-blue-500" : "text-slate-400"}`}>
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-1">Accueil</span>
        </button>
        <button onClick={() => setCurrentPage("cours")} className={`flex flex-col items-center py-1 px-2 ${currentPage === "cours" ? "text-blue-500" : "text-slate-400"}`}>
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] mt-1">Cours</span>
        </button>
        <button onClick={() => setCurrentPage("seances")} className={`flex flex-col items-center py-1 px-2 ${currentPage === "seances" ? "text-blue-500" : "text-slate-400"}`}>
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] mt-1">Séances</span>
        </button>
        <button onClick={() => setCurrentPage("etudiants")} className={`flex flex-col items-center py-1 px-2 ${currentPage === "etudiants" ? "text-blue-500" : "text-slate-400"}`}>
          <Users className="w-5 h-5" />
          <span className="text-[10px] mt-1">Étudiants</span>
        </button>
        <button onClick={() => setCurrentPage("profil")} className={`flex flex-col items-center py-1 px-2 ${currentPage === "profil" ? "text-blue-500" : "text-slate-400"}`}>
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-1">Profil</span>
        </button>
      </nav>

    </div>
  );
}

export default Dashboard;