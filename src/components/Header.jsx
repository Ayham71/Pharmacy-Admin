import React from 'react'

const Header = ({ adminData, onNavigate }) => {
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

  const username = adminData?.username || 'Admin'
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=FFD700&color=fff&size=128`

  const handleAvatarClick = () => {
    if (onNavigate) {
      onNavigate('settings')
    }
  }

  return (
    <header className="header">
      <div className="header-left">
        <h2>System</h2>
      </div>
      <div className="header-right">
        <img
          src={avatarUrl}
          alt={username}
          className="admin-avatar"
          onClick={handleAvatarClick}
          style={{ cursor: 'pointer' }}
          title="Go to Settings"
        />
      </div>
    </header>
  )
}

export default Header