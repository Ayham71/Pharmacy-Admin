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
import Admins from './pages/Admins'

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

  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('catalogCategories')
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error('Failed to load catalog from localStorage:', e)
    }
    return [
      {
        id: 1, name: 'Painkillers', icon: '💊',
        medicines: [
          { name: 'Paracetamol 500mg', price: '$5.99', image: null },
          { name: 'Ibuprofen 400mg',   price: '$4.50', image: null },
          { name: 'Aspirin 100mg',     price: '$3.99', image: null },
        ]
      },
      {
        id: 2, name: 'Chronic Meds', icon: '💉',
        medicines: [
          { name: 'Insulin Glargine', price: '$89.00', image: null },
          { name: 'Metformin 500mg',  price: '$12.99', image: null },
        ]
      },
      {
        id: 3, name: 'Baby Care', icon: '🍼',
        medicines: [
          { name: 'Baby Powder', price: '$6.99', image: null },
          { name: 'Baby Oil',    price: '$7.50', image: null },
        ]
      },
      {
        id: 4, name: 'Supplements', icon: '🌿',
        medicines: [
          { name: 'Vitamin D3', price: '$9.99', image: null },
        ]
      },
      {
        id: 5, name: 'Antibiotics', icon: '🔬',
        medicines: [
          { name: 'Amoxicillin 250mg',  price: '$12.50', image: null },
          { name: 'Azithromycin 500mg', price: '$15.99', image: null },
        ]
      },
      {
        id: 6, name: 'First Aid', icon: '🩹',
        medicines: [
          { name: 'Bandages Pack', price: '$2.99', image: null },
        ]
      },
      {
        id: 7, name: 'Vitamins', icon: '💪',
        medicines: [
          { name: 'Vitamin C 1000mg',  price: '$8.99',  image: null },
          { name: 'Vitamin B Complex', price: '$10.50', image: null },
        ]
      },
      {
        id: 8, name: 'Skin Care', icon: '✨',
        medicines: [
          { name: 'Face Cream SPF30', price: '$22.99', image: null },
        ]
      },
    ]
  })

  const handleLogin = () => {
    setIsLoggedIn(true)
    setCurrentPage('dashboard')
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

  // Debug - log every page change
  useEffect(() => {
    console.log('Current page changed to:', currentPage)
  }, [currentPage])

  const renderPage = () => {
    console.log('Rendering page:', currentPage)

    if (!isLoggedIn) {
      return <Login onLogin={handleLogin} />
    }

    if (currentPage === 'dashboard') 
       return <Dashboard setCurrentPage={setCurrentPage} categories={categories} />
    if (currentPage === 'catalog')    
      return <GlobalCatalog categories={categories} setCategories={setCategories} />
    if (currentPage === 'pharmacies') 
      return <Pharmacies />
    if (currentPage === 'drivers')    
      return <Drivers />
    if (currentPage === 'patients')   
      return <Patients />
    if (currentPage === 'admins')     
      return <Admins />
    if (currentPage === 'orders')     
      return <Orders />
    if (currentPage === 'finance')    
      return <Finance />
    if (currentPage === 'settings')   
      return <Settings adminData={adminData} onUpdateAdmin={handleUpdateAdmin} />

    return <Dashboard setCurrentPage={setCurrentPage} categories={categories} />
  }

  return (
    <div className="app-container">
      {isLoggedIn && (
        <Sidebar
          currentPage={currentPage}
          setCurrentPage={(page) => {
            console.log('Sidebar setting page to:', page)
            setCurrentPage(page)
          }}
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