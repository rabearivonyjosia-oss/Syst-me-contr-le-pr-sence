import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import AuthLayout from "./components/layout/AuthLayout.jsx";
import { Alert, Button, Input } from "./components/ui/index.js";

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

      if (response.ok) {
        localStorage.setItem("access_token", data.access);
        goToDashboard();
      } else {
        setErrorMsg(data.detail || "Adresse email ou mot de passe incorrect.");
      }
    } catch (error) {
      console.log(error);
      setErrorMsg("Impossible de contacter le serveur. Vérifiez votre connexion puis réessayez.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Connexion
          </h2>
          <p className="text-base text-slate-600">
            Connectez-vous à votre compte pour accéder à votre espace.
          </p>
        </div>

        <form onSubmit={connexion} className="space-y-5">
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

          <Input
            id="password"
            label="Mot de passe"
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            required
            placeholder="Votre mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leadingIcon={Lock}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                aria-pressed={showPassword}
                title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                className="flex h-11 w-11 items-center justify-center rounded-app text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
              >
                {showPassword ? (
                  <EyeOff aria-hidden="true" className="h-5 w-5" />
                ) : (
                  <Eye aria-hidden="true" className="h-5 w-5" />
                )}
              </button>
            }
          />

          <div className="flex items-center justify-between">
            <label htmlFor="remember" className="flex min-h-[44px] cursor-pointer items-center gap-2 text-base text-slate-700">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-5 w-5 rounded border-slate-300 text-brand-700 focus:ring-brand-600"
              />
              <span>Se souvenir de moi</span>
            </label>
          </div>

          {errorMsg && <Alert variant="danger" title="Connexion impossible">{errorMsg}</Alert>}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={isloading}
          >
            {isloading ? "Connexion en cours…" : "Se connecter"}
          </Button>
        </form>

        <p className="text-center text-base text-slate-600">
          Pas encore de compte ?{" "}
          <button
            type="button"
            onClick={goToRegister}
            className="font-semibold text-brand-700 underline underline-offset-2 transition-colors hover:text-brand-800"
          >
            S'inscrire
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}

export default Login;
