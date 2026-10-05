import { useState } from "react";
import "./App.css";

function Login(goToRegister) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const connexion = async () => {
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
        // On garde le token
        localStorage.setItem("access_token", data.access);

        alert("Connexion réussie !");

        console.log("Token :", data.access);
      } else {
        alert("Email ou mot de passe incorrect");
        console.log(data);
      }
    } catch (error) {
      console.log(error);
      alert("Impossible de contacter le serveur Django");
    }
  };

  const inscription = () => {
    alert("Page d'inscription");
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

        <button className="btn-login" onClick={connexion}>
          Connexion
        </button>

        <button className="btn-register" onClick={goToRegister}>
          S'inscrire
        </button>

      </div>

    </div>
  );
}

export default Login;



