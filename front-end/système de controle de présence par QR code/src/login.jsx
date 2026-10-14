import { useState } from "react";
import { GraduationCap, Mail, Lock, Eye, EyeOff } from "lucide-react";
import "./App.css";

function Login({ goToRegister, goToDashboard }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isloading, setIsLoading] = useState(false);

  const connexion = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();
      console.log("Réponse Django :", data);

      if (response.ok) {
        // On garde le token
        localStorage.setItem("access_token", data.access);
        goToDashboard();
      } else {
        setErrorMsg(
          data.detail || "Email ou mot de passe incorrect"
        );
      }
    } catch (error) {
      console.log(error);
      setErrorMsg("Impossible de contacter le serveur. Vérifiez votre connexion.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-900 font-sans">
      {/* Panneau gauche (visible sur grand écran) */}
      <div className="hidden lg:flex lg:w-5/12 flex-col justify-between p-12 bg-gradient-to-b from-blue-950 via-blue-900 to-slate-900 text-white relative overflow-hidden border-r border-slate-800">
        {/* Motif décoratif en arrière-plan (optionnel / ambiance université) */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        <div className="relative z-10 flex items-center space-x-3">
          {/* Optionnel si tu veux un logo ou laisser vide */}
        </div>

        <div className="relative z-10 space-y-4 my-auto">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center backdrop-blur-md mb-6 shadow-lg shadow-blue-900/50">
            <GraduationCap className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Contrôle de présence<br />par QR code
          </h1>
          <p className="text-slate-300 text-base max-w-sm leading-relaxed">
            Une solution simple et moderne pour une gestion efficace des présences pour une salle de classe.
          </p>
        </div>

        <div className="relative z-10 text-xs text-slate-500">
          Système de gestion académique
        </div>
      </div>

      {/* Panneau droit : Formulaire de connexion */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-slate-900">
        <div className="w-full max-w-md space-y-8 bg-slate-900 p-8 rounded-2xl">
          
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Connexion
            </h2>
            <p className="text-sm text-slate-400">
              Connectez-vous à votre compte
            </p>
          </div>

          <form onSubmit={connexion} className="space-y-5">
            {/* Champ Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Adresse email
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-400">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="Adresse email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Champ Mot de passe */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Mot de passe
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Se souvenir de moi */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-800"
                />
                <span className="text-slate-300 text-xs">Se souvenir de moi</span>
              </label>
            </div>

            {/* Message d'erreur */}
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
                {errorMsg}
              </div>
            )}

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={isloading}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center"
            >
              {isloading ? (
                <span className="flex items-center space-x-2">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connexion...
                </span>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          {/* Lien vers l'inscription */}
          <div className="text-center text-xs text-slate-400 pt-2">
            Pas encore de compte ?{" "}
            <button
              onClick={goToRegister}
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors focus:outline-none underline ml-1"
            >
              S'inscrire
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;