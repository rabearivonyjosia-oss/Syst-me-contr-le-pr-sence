import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import Dashboard from './Dashboard'

function App(){
  const [setPage]=useState('dashboard')

     return(
      <div className='app'>
        <h3>LOGIN</h3>
        <input type="email" placeholder='email'  />
        <input type="password"  placeholder='password'/>
        <button  onClick={()=> setPage ('dashbord')}>connexion</button>
        <button>register</button>

      </div>
     ) 
}
   
 

export default App
