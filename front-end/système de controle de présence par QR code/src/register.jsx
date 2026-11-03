import { useEffect, useRef, useState } from 'react';
import { User, Mail, Lock, Hash, Eye, EyeOff } from 'lucide-react';
import AuthLayout from './components/layout/AuthLayout.jsx';
import { Alert, Button, Input, Select } from './components/ui/index.js';

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
    const [formError, setFormError] = useState("");
    const [formSuccess, setFormSuccess] = useState("");
    const redirectTimer = useRef(null);

    useEffect(() => () => {
        if (redirectTimer.current) window.clearTimeout(redirectTimer.current);
    }, []);

    const inscription = async (e) => {
        e.preventDefault();
        setFormError("");
        setFormSuccess("");

        if (password !== password2) {
            setFormError("Les deux mots de passe ne sont pas identiques.");
            return;
        }
        if (role === "ETUDIANT" && niveau === "") {
            setFormError("Veuillez choisir votre niveau.");
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
                setFormSuccess("Compte créé avec succès. Redirection vers la page de connexion…");
                redirectTimer.current = window.setTimeout(goToLogin, 1500);
            } else {
                console.log(data);
                setFormError(
                    data?.detail ||
                    (typeof data === "object" ? Object.values(data).flat().join(" ") : "") ||
                    "Erreur lors de la création du compte. Vérifiez les informations saisies."
                );
            }
        } catch (error) {
            console.log(error);
            setFormError("Impossible de contacter le serveur. Vérifiez votre connexion puis réessayez.");
        } finally {
            setIsLoading(false);
        }
    };

    const passwordToggle = (shown, setShown, label) => (
        <button
            type="button"
            onClick={() => setShown(!shown)}
            aria-label={shown ? `Masquer ${label}` : `Afficher ${label}`}
            aria-pressed={shown}
            title={shown ? `Masquer ${label}` : `Afficher ${label}`}
            className="flex h-11 w-11 items-center justify-center rounded-app text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
        >
            {shown ? (
                <EyeOff aria-hidden="true" className="h-5 w-5" />
            ) : (
                <Eye aria-hidden="true" className="h-5 w-5" />
            )}
        </button>
    );

    return (
        <AuthLayout panelTitle="Rejoignez Présence QR">
            <div className="space-y-5">
                <div className="space-y-1.5">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                        Créer un compte
                    </h2>
                    <p className="text-base text-slate-600">
                        Inscrivez-vous pour accéder à votre espace.
                    </p>
                </div>

                <form onSubmit={inscription} className="space-y-4">
                    <Input
                        id="username"
                        label="Nom d'utilisateur"
                        type="text"
                        name="username"
                        autoComplete="username"
                        required
                        placeholder="ex : amadou.ndiaye"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        leadingIcon={User}
                    />

                    <Input
                        id="email"
                        label="Adresse email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        required
                        placeholder="exemple@universite.sn"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        leadingIcon={Mail}
                    />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Select
                            id="role"
                            label="Rôle"
                            name="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="ETUDIANT">Étudiant</option>
                            <option value="ENSEIGNANT">Enseignant</option>
                            <option value="ADMIN">Administrateur</option>
                        </Select>

                        {role === "ETUDIANT" && (
                            <Select
                                id="niveau"
                                label="Niveau"
                                name="niveau"
                                required
                                value={niveau}
                                onChange={(e) => setNiveau(e.target.value)}
                            >
                                <option value="">Choisir…</option>
                                <option value="L1">Licence 1</option>
                                <option value="L2">Licence 2</option>
                                <option value="L3">Licence 3</option>
                                <option value="M1">Master 1</option>
                                <option value="M2">Master 2</option>
                            </Select>
                        )}
                    </div>

                    <Input
                        id="num_matricule"
                        label={role === "ETUDIANT" ? "Numéro matricule" : "Numéro matricule (facultatif)"}
                        type="text"
                        name="num_matricule"
                        placeholder="ex : 2025L1INF123"
                        value={num_matricule}
                        onChange={(e) => setNum_matricule(e.target.value)}
                        leadingIcon={Hash}
                    />

                    <Input
                        id="password"
                        label="Mot de passe"
                        type={showPassword ? "text" : "password"}
                        name="new-password"
                        autoComplete="new-password"
                        required
                        placeholder="Votre mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        leadingIcon={Lock}
                        trailing={passwordToggle(showPassword, setShowPassword, 'le mot de passe')}
                    />

                    <Input
                        id="password2"
                        label="Confirmer le mot de passe"
                        type={showPassword2 ? "text" : "password"}
                        name="confirm-password"
                        autoComplete="new-password"
                        required
                        placeholder="Confirmez votre mot de passe"
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        leadingIcon={Lock}
                        trailing={passwordToggle(showPassword2, setShowPassword2, 'la confirmation')}
                    />

                    {formError && (
                        <Alert variant="danger" title="Inscription impossible">
                            {formError}
                        </Alert>
                    )}
                    {formSuccess && (
                        <Alert variant="success" title="Compte créé">
                            {formSuccess}
                        </Alert>
                    )}

                    <Button type="submit" size="lg" className="w-full" loading={isLoading}>
                        {isLoading ? "Inscription en cours…" : "S'inscrire"}
                    </Button>
                </form>

                <p className="text-center text-base text-slate-600">
                    Déjà un compte ?{" "}
                    <button
                        type="button"
                        onClick={goToLogin}
                        className="font-semibold text-brand-700 underline underline-offset-2 transition-colors hover:text-brand-800"
                    >
                        Retour à la connexion
                    </button>
                </p>
            </div>
        </AuthLayout>
    );
}

export default Register;
