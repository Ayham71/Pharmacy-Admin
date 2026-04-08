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

  // Check if user is logged in on app startup
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');
    
    if (token && userRole === 'admin') {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      setCurrentPage('login');
    }
  }, []);
  const [categories, setCategories] = useState([
    { 
      id: 1, 
      name: 'Painkillers', 
      icon: '💊',
      medicines: [
        { id: 101, name: 'Paracetamol 500mg', stock: 1240, price: '$5.99' },
        { id: 102, name: 'Ibuprofen 400mg', stock: 890, price: '$4.50' },
        { id: 103, name: 'Aspirin 100mg', stock: 2100, price: '$3.99' },
      ]
    },
    { 
      id: 2, 
      name: 'Chronic Meds', 
      icon: '💉',
      medicines: [
        { id: 201, name: 'Insulin Glargine', stock: 450, price: '$89.00' },
        { id: 202, name: 'Metformin 500mg', stock: 1100, price: '$12.99' },
      ]
    },
    { 
      id: 3, 
      name: 'Baby Care', 
      icon: '🍼',
      medicines: [
        { id: 301, name: 'Baby Powder', stock: 320, price: '$6.99' },
        { id: 302, name: 'Baby Oil', stock: 280, price: '$7.50' },
      ]
    },
    { 
      id: 4, 
      name: 'Supplements', 
      icon: '🌿',
      medicines: [
        { id: 401, name: 'Vitamin D3', stock: 890, price: '$9.99' },
      ]
    },
    { 
      id: 5, 
      name: 'Antibiotics', 
      icon: '🔬',
      medicines: [
        { id: 501, name: 'Amoxicillin 250mg', stock: 890, price: '$12.50' },
        { id: 502, name: 'Azithromycin 500mg', stock: 620, price: '$15.99' },
      ]
    },
    { 
      id: 6, 
      name: 'First Aid', 
      icon: '🩹',
      medicines: [
        { id: 601, name: 'Bandages Pack', stock: 280, price: '$2.99' },
      ]
    },
    { 
      id: 7, 
      name: 'Vitamins', 
      icon: '💪',
      medicines: [
        { id: 701, name: 'Vitamin C 1000mg', stock: 2100, price: '$8.99' },
        { id: 702, name: 'Vitamin B Complex', stock: 1500, price: '$10.50' },
      ]
    },
    { 
      id: 8, 
      name: 'Skin Care', 
      icon: '✨',
      medicines: [
        { id: 801, name: 'Face Cream SPF30', stock: 520, price: '$22.99' },
      ]
    },
  ])

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    // Clear authentication data from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    
    setIsLoggedIn(false);
    setCurrentPage('login');
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
        return <Dashboard setCurrentPage={setCurrentPage} categories={categories} />
      case 'catalog':
        return <GlobalCatalog categories={categories} setCategories={setCategories} />
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
        return <Dashboard setCurrentPage={setCurrentPage} categories={categories} />
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