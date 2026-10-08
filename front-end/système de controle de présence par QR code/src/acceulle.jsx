import './App.css'
import { useState } from 'react'

function Dashboard(){
      
  return(

         <div className='Dashboard'>
            <aside className='Sidebar'>
         <nav>
          <button>🏠 Accueil</button>
          <button>📚 Mes cours</button>
          <button>📅 Séances</button>
          <button>📷 Scanner QR</button>
          <button>📊 Présences</button>
          <button>👤 Mon profil</button>
        </nav>

              <button className='logout'>Déconnexion</button>

            </aside>
           <main className="dashboard-content">

        <header className="dashboard-header">
          <div>
            <h1>Bienvenue 👋</h1>
            <p>Voici votre tableau de bord.</p>
          </div>

          <div className="user-info">
            👤 Utilisateur
          </div>
        </header>
        </main>
         </div>

  )


}


export default Dashboard;