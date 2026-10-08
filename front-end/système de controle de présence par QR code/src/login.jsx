import { useState } from "react";
import "./App.css";

function Login({goToRegister, goToDashboard}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isloading, setIsLoading] = useState(false);


  const connexion = async () => {
    
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
      }else {

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
    <div className="login-container">

      <div className="login-box">

        <h1>Bienvenue 👋</h1>
        <p>Connectez-vous à votre compte</p>

        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="exemple@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Mot de passe</label>
          <input
            type="password"
            placeholder="Votre mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
         {errorMsg && (
          <p className="error-message">
            {errorMsg}
          </p>
        )}


        <button className="btn-login" onClick={connexion} disabled={isloading}>
          {isloading? "connexion...":"Connexion"}
        </button>

        <button className="btn-register" onClick={goToRegister}>
          S'inscrire
        </button>

      </div>

    </div>
  );
}

export default Login;



