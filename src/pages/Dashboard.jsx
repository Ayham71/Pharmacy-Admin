import React from 'react'

const Dashboard = ({ setCurrentPage }) => {
  const stats = [
    {
      label: 'Total Pharmacies',
      value: '124',
      changeType: 'positive',
      progress: 75,
      icon: 'pharmacy'
    },
    {
      label: 'Total Drivers',
      value: '150',
      changeType: 'positive',
      progress: 60,
      icon: 'driver'
    },
    {
      label: 'System Orders',
      value: '4.2k',
      changeType: 'positive',
      progress: 85,
      icon: 'orders'
    }
  ]

  const catalogItems = [
    { name: 'Painkillers', count: '540 items', icon: 'pill' },
    { name: 'Chronic Meds', count: '1.2k items', icon: 'medical' },
    { name: 'Baby Care', count: '320 items', icon: 'baby' },
    { name: 'Supplements', count: '890 items', icon: 'supplement' }
  ]

  const recentOrders = [
    { id: '#ORD-8821', pharmacy: 'Green Valley Meds', driver: 'Alex Rivera', driverAvatar: 'https://ui-avatars.com/api/?name=Alex+Rivera&background=FFD700&color=fff', status: 'delivered', value: '$42.50' },
    { id: '#ORD-8819', pharmacy: 'Central Health Hub', driver: 'Sarah Chen', driverAvatar: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=FFD700&color=fff', status: 'picked-up', value: '$118.00' },
    { id: '#ORD-8818', pharmacy: 'Sunset Pharmacy', driver: 'Mark Jenkins', driverAvatar: 'https://ui-avatars.com/api/?name=Mark+Jenkins&background=FFD700&color=fff', status: 'pending', value: '$15.20' },
    { id: '#ORD-8817', pharmacy: 'Apex Pharma Care', driver: 'Jessica Wong', driverAvatar: 'https://ui-avatars.com/api/?name=Jessica+Wong&background=FFD700&color=fff', status: 'delivered', value: '$210.44' },
  ]

  const getIcon = (type) => {
    const icons = {
      pharmacy: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>
      ),
      driver: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="16" rx="2"/>
          <circle cx="8.5" cy="12" r="1.5"/>
          <circle cx="15.5" cy="12" r="1.5"/>
        </svg>
      ),
      orders: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
      ),
      pill: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.5 20.5l10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
          <path d="M8.5 8.5l7 7"/>
        </svg>
      ),
      medical: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>
      ),
      baby: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
          <line x1="9" y1="9" x2="9.01" y2="9"/>
          <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>
      ),
      supplement: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/>
          <path d="M8.5 8.5v.01"/>
          <path d="M16 15.5v.01"/>
          <path d="M12 12v.01"/>
          <path d="M11 17v.01"/>
          <path d="M7 14v.01"/>
        </svg>
      )
    }
    return icons[type] || icons.pill
  }

  return (
    <div className="page-content">
      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-header">
              <span className="stat-label">{stat.label}</span>
              <div className="stat-icon">
                {getIcon(stat.icon)}
              </div>
            </div>
            <div className="stat-value">
              <span className="stat-number">{stat.value}</span>
              <span className={`stat-change ${stat.changeType}`}>{stat.change}</span>
            </div>
            <div className="stat-progress">
              <div 
                className="stat-progress-bar" 
                style={{ width: `${stat.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Global Catalog Section */}
      <div className="section">
        <div className="section-header">
          <h3 className="section-title">Global Catalog</h3>
          <a className="view-all-link" onClick={() => setCurrentPage('catalog')}>
            View Full Inventory →
          </a>
        </div>
        <div className="catalog-grid">
          {catalogItems.map((item, index) => (
            <div key={index} className="catalog-card">
              <div className="catalog-icon">
                {getIcon(item.icon)}
              </div>
              <h4 className="catalog-title">{item.name}</h4>
              <p className="catalog-count">{item.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="section">
        <div className="section-header">
          <h3 className="section-title">Recent Orders</h3>
          <div className="table-actions">
            <button className="action-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
            </button>
            <button className="action-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          </div>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Pharmacy</th>
                <th>Driver</th>
                <th>Status</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, index) => (
                <tr key={index}>
                  <td className="order-id">{order.id}</td>
                  <td>{order.pharmacy}</td>
                  <td>
                    <div className="driver-info">
                      <img src={order.driverAvatar} alt={order.driver} className="driver-avatar" />
                      <span>{order.driver}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${order.status}`}>
                      {order.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="value-cell">{order.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard