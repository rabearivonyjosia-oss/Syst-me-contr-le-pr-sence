import { useEffect, useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import Login from'./login.jsx'
import Register from './register.jsx'
import Dashboard from './Dashboard.jsx'
import cours from './cours.jsx'
function App(){
    const [page, setPage] = useState("login");
    const handleLogout = () => {
    localStorage.removeItem("access_token");
    setPage("login");
    };

   return (
     <div className="App"> 
     {page === "login" && ( 
      <Login 
      goToRegister={() => setPage("register")} 
      goToDashboard={() =>setPage("Dashboard" )}/>
     )}

     {page === "register" && ( <Register 
     goToLogin={() => setPage("login")} 
      />
                                
    )} 
    {page === "Dashboard" && (<Dashboard
          onLogout={handleLogout} 
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}/>
    )}
    </div> );

}

export default App;