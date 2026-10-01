import { useState} from 'react';
import './App.css';

function Inscription() {
    const [nom, setNom]= useState('');
    const [email, setEmail]= useState('');
    const [role, setRole]= useState('');
    const [matiere, setMatiere]= useState('');
    const [num_matricule, setNumMatricule]= useState('');
    const [password, setPassword]= useState('');
    const [message, setMessage]= useState('');


  const handleRegister = () => {

    fetch('http://127.0.0.1:8000/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nom: nom,
        email: email,
        role: role,
        matiere: matiere,
        num_matricule: num_matricule,
        password: password
      })
    })
  }

  return (
    <div>
      <h2> INSCRIPTION</h2>
      <input type="text" placeholder='nom' />
      <input type="email" placeholder='email' />
      <select value={role} onChange={(e) => setRole(e.target.value)} >
         <option value=""> Choisir un rôle </option> 
         <option value="ETUDIANT"> Étudiant </option> 
         <option value="ENSEIGNANT"> Enseignant </option>
          <option value="ADMIN"> Administrateur </option>
      </select>
      <input type="text" placeholder='matiere'/>
      <input type="text" placeholder='num_matricule' />
      <input type="password" placeholder='password' />

      <button onClick={handleRegister}>
        S'inscrire
      </button>
    </div>
  )
}

export default Inscription;