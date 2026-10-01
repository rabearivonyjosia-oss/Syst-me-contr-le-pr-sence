import { useEffect, useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import Inscription from './inscription.jsx'

function App() {
  const [page, setPage] = useState('login');
    const [email, setEmail]= useState('');
    const [password, setPassword]= useState('');

    const handleLogin = () => {   
      fetch('http://127.0.0.1:8000/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      })

      .then(reponse => response.json)
      .then(data => { 
        if (data.access) {
          setMassage('connection reussie')
        }else{
          setMessage('connection echouée')
        }
       })
       .catch(error => {
        console.error('Error:', error);
       })
     }
     if (page === 'inscription'){
      return(
        <Inscription 
        goToLogin={() => setPage('Login')}/>
      )
     }
      

  return (
    <div className="App">
      <h2>hello</h2>
      <input type="text" placeholder='email' />
      <input type="text" placeholder='password' />
      <button onClick={handleLogin}>se connecter</button>
      <button onClick={()=> setPage('inscription')}>s'incrire</button>
      


    </div>
  )
}

export default App;