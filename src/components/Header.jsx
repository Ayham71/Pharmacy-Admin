import React from 'react'

const Header = ({ adminData }) => {
  const getPageTitle = () => {
    const path = window.location.hash || 'dashboard'
    const titles = {
      dashboard: 'System',
      catalog: 'Global Catalog',
      pharmacies: 'Pharmacies',
      drivers: 'Drivers',
      patients: 'Patients',
      orders: 'Orders',
      finance: 'Finance',
      settings: 'Settings',
    }
    return titles[path.replace('#', '')] || 'System'
  }

  return (
    <header className="header">
      <div className="header-left">
        <h2>System</h2>
      </div>
      <div className="header-right">
        <img 
          src={adminData.avatar} 
          alt="Admin" 
          className="admin-avatar"
        />
      </div>
    </header>
  )
}

export default Header