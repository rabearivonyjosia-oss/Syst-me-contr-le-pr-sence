import { useState } from 'react';
import { GraduationCap, User, Mail, Lock, Hash, ChevronDown, Eye, EyeOff } from 'lucide-react';
import './App.css';

function Register({ goToLogin }) { 
    const [username, setUsername] = useState(""); 
    const [email, setEmail] = useState(""); 
    const [password, setPassword] = useState(""); 
    const [password2, setPassword2] = useState(""); 
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [role, setRole] = useState("ETUDIANT"); 
    const [niveau, setNiveau] = useState("");
    const [num_matricule, setNum_matricule] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const inscription = async (e) => {
        e.preventDefault();

        if (password !== password2) { 
            alert("Les mots de passe ne sont pas identiques"); 
            return;
        }
        if (role === "ETUDIANT" && niveau === "") { 
            alert("Veuillez choisir votre niveau"); 
            return; 
        }

        setIsLoading(true);

        try {
            const response = await fetch("http://127.0.0.1:8000/register/", { 
                method: "POST", 
                headers: { 
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                    username: username, 
                    email: email, 
                    password: password, 
                    role: role, 
                    niveau: niveau, 
                    num_matricule: num_matricule,
                }),
            });

            const data = await response.json(); 
            if (response.ok) { 
                alert("Inscription réussie !"); 
                goToLogin(); 
            } else { 
                console.log(data); 
                alert("Erreur lors de l'inscription"); 
            }
        } catch (error) { 
            console.log(error); 
            alert("Impossible de contacter le serveur Django"); 
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-slate-900 font-sans">
            {/* Panneau gauche (visible sur grand écran) */}
            <div className="hidden lg:flex lg:w-5/12 flex-col justify-between p-12 bg-gradient-to-b from-blue-950 via-blue-900 to-slate-900 text-white relative overflow-hidden border-r border-slate-800">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

                <div className="relative z-10 flex items-center space-x-3"></div>

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

            {/* Panneau droit : Formulaire d'inscription */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-slate-900 overflow-y-auto">
                <div className="w-full max-w-md space-y-6 bg-slate-900 p-4 sm:p-8 rounded-2xl my-auto">
                    
                    <div className="space-y-1">
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                            Créer un compte
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-400">
                            Inscrivez-vous pour accéder à votre espace
                        </p>
                    </div>

                    <form onSubmit={inscription} className="space-y-4">
                        {/* Nom d'utilisateur */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                Nom d'utilisateur
                            </label>
                            <div className="relative flex items-center">
                                <span className="absolute left-3.5 text-slate-400">
                                    <User className="w-5 h-5" />
                                </span>
                                <input
                                    type="text"
                                    required
                                    placeholder="Nom d'utilisateur"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-11 pr-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                Email
                            </label>
                            <div className="relative flex items-center">
                                <span className="absolute left-3.5 text-slate-400">
                                    <Mail className="w-5 h-5" />
                                </span>
                                <input
                                    type="email"
                                    required
                                    placeholder="exemple@gmail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Grille Rôle & Niveau */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                    Rôle
                                </label>
                                <div className="relative flex items-center">
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-all cursor-pointer"
                                    >
                                        <option value="ETUDIANT" className="bg-slate-900 text-white">Étudiant</option>
                                        <option value="ENSEIGNANT" className="bg-slate-900 text-white">Enseignant</option>
                                        <option value="ADMIN" className="bg-slate-900 text-white">Administrateur</option>
                                    </select>
                                    <span className="absolute right-3.5 text-slate-400 pointer-events-none">
                                        <ChevronDown className="w-4 h-4" />
                                    </span>
                                </div>
                            </div>

                            {role === "ETUDIANT" && (
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                        Niveau
                                    </label>
                                    <div className="relative flex items-center">
                                        <select
                                            value={niveau}
                                            onChange={(e) => setNiveau(e.target.value)}
                                            className="w-full px-3 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-all cursor-pointer"
                                        >
                                            <option value="" className="bg-slate-900 text-slate-400">Choisir...</option>
                                            <option value="L1" className="bg-slate-900 text-white">Licence 1</option>
                                            <option value="L2" className="bg-slate-900 text-white">Licence 2</option>
                                            <option value="L3" className="bg-slate-900 text-white">Licence 3</option>
                                            <option value="M1" className="bg-slate-900 text-white">Master 1</option>
                                            <option value="M2" className="bg-slate-900 text-white">Master 2</option>
                                        </select>
                                        <span className="absolute right-3.5 text-slate-400 pointer-events-none">
                                            <ChevronDown className="w-4 h-4" />
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Numéro de matricule (Optionnel ou visible selon préférence) */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                Numéro matricule {role === "ETUDIANT" && "(pour les étudiants)"}
                            </label>
                            <div className="relative flex items-center">
                                <span className="absolute left-3.5 text-slate-400">
                                    <Hash className="w-5 h-5" />
                                </span>
                                <input
                                    type="text"
                                    placeholder="ex: 2025L1INF123"
                                    value={num_matricule}
                                    onChange={(e) => setNum_matricule(e.target.value)}
                                    className="w-full pl-11 pr-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Mot de passe */}
                        <div className="space-y-1">
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
                                    className="w-full pl-11 pr-12 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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

                        {/* Confirmer le mot de passe */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                Confirmer le mot de passe
                            </label>
                            <div className="relative flex items-center">
                                <span className="absolute left-3.5 text-slate-400">
                                    <Lock className="w-5 h-5" />
                                </span>
                                <input
                                    type={showPassword2 ? "text" : "password"}
                                    required
                                    placeholder="Confirmez votre mot de passe"
                                    value={password2}
                                    onChange={(e) => setPassword2(e.target.value)}
                                    className="w-full pl-11 pr-12 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword2(!showPassword2)}
                                    className="absolute right-3.5 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
                                >
                                    {showPassword2 ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Bouton d'inscription */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center mt-2"
                        >
                            {isLoading ? "Inscription en cours..." : "S'inscrire"}
                        </button>
                    </form>

                    {/* Retour vers la connexion */}
                    <div className="text-center text-xs text-slate-400 pt-1">
                        Déjà un compte ?{" "}
                        <button
                            onClick={goToLogin}
                            className="text-blue-400 hover:text-blue-300 font-semibold transition-colors focus:outline-none underline ml-1"
                        >
                            Retour au login
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Register;