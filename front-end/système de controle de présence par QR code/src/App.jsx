import { useEffect, useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'


function App(){
  const {user, setUser} = useState([]);
     
  useEffect(() => {
    fetch('http://http://127.0.0.1:8000/login/')
      .then(response => response.json())
      .then(data => setUser(data));
  }, []);

     return(
      <div className='app'>
        
        <h3>LOGIN</h3>
        <input type="email" placeholder='email'  />
        <input type="password"  placeholder='password'/>
        <button  onClick={handlelogin}>connexion</button>
        <button>register</button>
      </div>)
        


      
      
}
   
 

export default App
