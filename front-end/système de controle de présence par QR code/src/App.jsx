import { useEffect, useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import Login from'./login.jsx'
import Register from './register.jsx'

function App(){
    const [page, setPage] = useState("login");

   return (
     <div className="App"> {page === "login" && ( <Login goToRegister={() => setPage("register")} /> )} 
     {page === "register" && ( <Register goToLogin={() => setPage("Login")} /> )} 

     </div> );

}

export default App;