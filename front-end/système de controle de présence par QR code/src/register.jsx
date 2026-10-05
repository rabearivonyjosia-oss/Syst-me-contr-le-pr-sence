import './App.css'
import { useState,useEffect } from 'react'

function Register({ goToLogin }) { 
    const [username, setUsername] = useState(""); 
    const [email, setEmail] = useState(""); 
    const [password, setPassword] = useState(""); 
    const [password2, setPassword2] = useState(""); 
    const [role, setRole] = useState("ETUDIANT"); 
    const [niveau, setNiveau] = useState("");

    const inscription = async () => {
        if (password !== password2) { 
            alert("Les mots de passe ne sont pas identiques"); 
            return;
        }
        if (role === "ETUDIANT" && niveau === "") { 
            alert("Veuillez choisir votre niveau"); 
            return; 
        }

        try{
            const response = await fetch("http://127.0.0.1:8000/register/", { 
                method: "POST", headers: { "Content-Type": "application/json",

                headers: { "Content-Type": "application/json", 

                },
                body: JSON.stringify({ 
                    username: username, 
                    email: email, 
                    password: password, 
                    role: role, 
                    niveau: niveau, 
                }),
            }

            });
        
            const data = await response.json(); 
            if (response.ok) { alert("Inscription réussie !"); 
                goToLogin(); 
            } else { 
                console.log(data); 
                alert("Erreur lors de l'inscription"); 
            }

            } catch (error) { 
                console.log(error); 
                alert("Impossible de contacter le serveur Django"); } 
            };

     return (
        <div className="login-container"> 
        <div className="login-box"> 
            <h1>Créer un compte ✨</h1> 
            <p>Inscrivez-vous pour continuer</p>
       <div className="input-group"> 
        <label>Nom d'utilisateur</label>
        <input type="text" placeholder="Votre nom" value={username} onChange={(e) => setUsername(e.target.value)} /> 
      </div>
       <div className="input-group"> 
        <label>Email</label>
        <input type="email" placeholder="exemple@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="input-group"> <label>Je suis</label> 
        <select value={role} onChange={(e) => setRole(e.target.value)} > 
            <option value="ADMIN"> Administrateur </option> 
            <option value="ENSEIGNANT"> Enseignant </option>
            <option value="ETUDIANT">Etudiant</option>
        </select>
        </div>
        {role === "ETUDIANT" && ( <div className="input-group"> 
            <label>Mon niveau</label> 
            <select value={niveau} onChange={(e) => setNiveau(e.target.value)} >
                <option value=""> -- Choisir un niveau -- </option> 
                <option value="L1"> Licence 1 </option>
                <option value="L2">Licence 2</option>
                <option value="L3"> Licence 3 </option> 
                <option value="M1"> Master 1 </option>
                 <option value="M2"> Master 2 </option>
            </select>
        </div>
        )}
        <div className="input-group"> 
            <label>Mot de passe</label> 
            <input type="password" placeholder="Votre mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} /> 
        </div>
        <div className="input-group"> 
            <label>Confirmer le mot de passe</label> 
            <input type="password" placeholder="Confirmez votre mot de passe" value={password2} onChange={(e) => setPassword2(e.target.value)} /> 
        </div>
        <button className="btn-login" onClick={inscription} > enregisterer </button>
        <button className="btn-register" onClick={goToLogin} > Retour à la connexion </button> 
        </div> 
        </div> 
        );
}


export default Register;