import{  useState, useEffect, useRef } from "react";
import{ ArrowLeft,  Code, Calendar, Clock, Download, QrCode } from "lucide-react";

function Seance({essionData, onBack}){
   // Données de la séance (tu peux les passer en props depuis ton tableau de bord)
  const session = sessionData || {
    title: "Développement Web",
    level: "L1 - Informatique",
    date: "2026-06-06", // Format Date (YYYY-MM-DD) pour faciliter la comparaison
    displayDate: "14 oct. 2025",
    startTime: "08:00",
    endTime: "10:00",
  };

  // État pour vérifier si le QR code est disponible (selon la date/heure de la séance)
  const [isQrAvailable, setIsQrAvailable] = useState(true);

  useEffect(() => {
    // Logique optionnelle pour vérifier automatiquement si on est le jour de la séance
    const checkAvailability = () => {
      const today = new Date().toISOString().split('T')[0];
      // Tu peux activer cette condition stricte si tu veux lier la dispo à la date réelle :
      // setIsQrAvailable(session.date === today);
    };
    checkAvaiLability();
}, [session.date]);

    return (
        <main className= "flex-1 bg-gray-100 p-8 overflow-y-auto min-h-screen">
            {/* En-tête avec bouton retour */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={onBack}
          className="p-2 bg-white rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Détails de la séance</h1>
      </div>

      {/* Carte principale de la séance */}
      <div className="max-w-xl bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
        
        {/* Informations du cours */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white bg-[#1d63ed] shadow-sm">
              <Code className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-base">
                {session.title}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {session.level}
              </p>
            </div>
          </div>
          {/* Badge statut */}
          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-medium rounded-full border border-emerald-200">
            En cours
          </span>
        </div>

        {/* Date et Horaires de la séance */}
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{session.displayDate || session.date} • {session.startTime} - {session.endTime}</span>
        </div>

        {/* Section QR Code (Disponible uniquement à la date/heure de la séance) */}
        <div className="flex flex-col items-center justify-center pt-2 pb-2">
          <h4 className="font-bold text-gray-900 text-base mb-1">QR Code de présence</h4>
          <p className="text-xs text-gray-500 mb-6">
            Valide jusqu'à {session.endTime} (30 min)
          </p>

          {isQrAvailable ? (
            <div className="flex flex-col items-center space-y-6 w-full">
              {/* Cadre du QR Code */}
              <div className="p-4 bg-white border-2 border-gray-900 rounded-2xl shadow-inner flex items-center justify-center">
                <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center text-black p-2 border border-gray-200">
                  <QrCode className="w-40 h-40 text-gray-900" />
                </div>
              </div>

              {/* Bouton de téléchargement */}
              <button className="flex items-center justify-center gap-2 w-full bg-[#1d63ed] text-white py-3 px-4 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
                <Download className="w-4 h-4" />
                <span>Télécharger le QR code...</span>
              </button>
            </div>
          ) : (
            // Message si le cours n'est pas encore ou n'est plus à la date prévue
            <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl text-center text-amber-800 text-sm w-full">
              Le QR code ne sera disponible qu'à la date du cours désignée ({session.displayDate || session.date} de {session.startTime} à {session.endTime}).
            </div>
          )}
        </div>

        {/* Note d'information au bas de la carte */}
        <div className="flex items-start gap-3 bg-blue-50/60 border border-blue-100 p-3.5 rounded-xl text-blue-900 text-xs">
          <Clock className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <span>Le QR code est temporaire et expire automatiquement après la durée de la séance.</span>
        </div>
       </div>

        </main>
        
    )
    
       

}

export default Seance;


