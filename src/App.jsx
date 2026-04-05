import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import GlobalCatalog from './pages/GlobalCatalog'
import Pharmacies from './pages/Pharmacies'
import Drivers from './pages/Drivers'
import Patients from './pages/Patients'
import Orders from './pages/Orders'
import Finance from './pages/Finance'
import Settings from './pages/Settings'
import Login from './pages/Login'

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [adminData, setAdminData] = useState({
    name: 'Network Admin',
    email: 'admin@pharmos.com',
    phone: '+962 79 999 9999',
    role: 'System Administrator',
    avatar: 'https://ui-avatars.com/api/?name=Admin&background=FFD700&color=fff'
  })

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentPage('login')
  }

  const handleUpdateAdmin = (updatedData) => {
    setAdminData(updatedData)
  }

  const renderPage = () => {
    if (!isLoggedIn) {
      return <Login onLogin={handleLogin} />
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard setCurrentPage={setCurrentPage} />
      case 'catalog':
        return <GlobalCatalog />
      case 'pharmacies':
        return <Pharmacies />
      case 'drivers':
        return <Drivers />
      case 'patients':
        return <Patients />
      case 'orders':
        return <Orders />
      case 'finance':
        return <Finance />
      case 'settings':
        return <Settings adminData={adminData} onUpdateAdmin={handleUpdateAdmin} />
      default:
        return <Dashboard setCurrentPage={setCurrentPage} />
    }
  }

  return (
    <div className="app-container">
      {isLoggedIn && (
        <Sidebar 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          onLogout={handleLogout}
        />
      )}
      <div className={`main-content ${!isLoggedIn ? 'full-width' : ''}`}>
        {isLoggedIn && <Header adminData={adminData} />}
        {renderPage()}
      </div>
    </div>
  )
}

export default App