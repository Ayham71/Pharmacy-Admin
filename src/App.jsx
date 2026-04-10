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

  // Load categories from localStorage first, fallback to default data
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('catalogCategories')
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (e) {
      console.error('Failed to load catalog from localStorage:', e)
    }

    // Default data if nothing saved in localStorage
    return [
      {
        id: 1,
        name: 'Painkillers',
        icon: '💊',
        medicines: [
          { name: 'Paracetamol 500mg', price: '$5.99', image: null },
          { name: 'Ibuprofen 400mg', price: '$4.50', image: null },
          { name: 'Aspirin 100mg', price: '$3.99', image: null },
        ]
      },
      {
        id: 2,
        name: 'Chronic Meds',
        icon: '💉',
        medicines: [
          { name: 'Insulin Glargine', price: '$89.00', image: null },
          { name: 'Metformin 500mg', price: '$12.99', image: null },
        ]
      },
      {
        id: 3,
        name: 'Baby Care',
        icon: '🍼',
        medicines: [
          { name: 'Baby Powder', price: '$6.99', image: null },
          { name: 'Baby Oil', price: '$7.50', image: null },
        ]
      },
      {
        id: 4,
        name: 'Supplements',
        icon: '🌿',
        medicines: [
          { name: 'Vitamin D3', price: '$9.99', image: null },
        ]
      },
      {
        id: 5,
        name: 'Antibiotics',
        icon: '🔬',
        medicines: [
          { name: 'Amoxicillin 250mg', price: '$12.50', image: null },
          { name: 'Azithromycin 500mg', price: '$15.99', image: null },
        ]
      },
      {
        id: 6,
        name: 'First Aid',
        icon: '🩹',
        medicines: [
          { name: 'Bandages Pack', price: '$2.99', image: null },
        ]
      },
      {
        id: 7,
        name: 'Vitamins',
        icon: '💪',
        medicines: [
          { name: 'Vitamin C 1000mg', price: '$8.99', image: null },
          { name: 'Vitamin B Complex', price: '$10.50', image: null },
        ]
      },
      {
        id: 8,
        name: 'Skin Care',
        icon: '✨',
        medicines: [
          { name: 'Face Cream SPF30', price: '$22.99', image: null },
        ]
      },
    ]
  })

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
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
        {isLoggedIn && (
          <Header
            adminData={adminData}
            onNavigate={(page) => setCurrentPage(page)}
          />
        )}
        {renderPage()}
      </div>
    </div>
  )
}

export default App