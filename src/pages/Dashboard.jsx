import React, { useState, useEffect } from 'react'

const BASE_URL = 'http://165.22.91.187:5000/api/Admin'

const Dashboard = ({ setCurrentPage, categories }) => {
  const [stats, setStats] = useState({
    pharmacies: '—',
    drivers: '—',
    patients: '—',
    orders: '—'
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => {
    fetchStats()
    fetchRecentOrders()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      const headers = { 'Authorization': `Bearer ${token}` }

      // Fetch all in parallel
      const [pharmaciesRes, driversRes, patientsRes] = await Promise.allSettled([
        fetch(`${BASE_URL}/Pharmacy`, { headers }),
        fetch(`${BASE_URL}/Delivery`, { headers }),
        fetch(`${BASE_URL}/Patient`, { headers }),
      ])

      // Pharmacies count
      if (pharmaciesRes.status === 'fulfilled' && pharmaciesRes.value.ok) {
        const text = await pharmaciesRes.value.text()
        try {
          const data = JSON.parse(text)
          const list = Array.isArray(data) ? data : [data]
          setStats(prev => ({ ...prev, pharmacies: list.length.toString() }))
        } catch {}
      }

      // Drivers count
      if (driversRes.status === 'fulfilled' && driversRes.value.ok) {
        const text = await driversRes.value.text()
        try {
          const data = JSON.parse(text)
          const list = Array.isArray(data) ? data : [data]
          setStats(prev => ({ ...prev, drivers: list.length.toString() }))
        } catch {}
      }

      // Patients count
      if (patientsRes.status === 'fulfilled' && patientsRes.value.ok) {
        const text = await patientsRes.value.text()
        try {
          const data = JSON.parse(text)
          const list = Array.isArray(data) ? data : [data]
          setStats(prev => ({ ...prev, patients: list.length.toString() }))
        } catch {}
      }

    } catch (err) {
      console.error('Failed to fetch stats:', err)
    } finally {
      setLoadingStats(false)
    }
  }

  const fetchRecentOrders = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      const response = await fetch(`${BASE_URL}/Order`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        setLoadingOrders(false)
        return
      }

      const text = await response.text()
      let data
      try { data = JSON.parse(text) } catch {
        setLoadingOrders(false)
        return
      }

      const list = Array.isArray(data) ? data : [data]

      const normalized = list.map(o => ({
        id:       o.id          || o.Id          || o.orderId    || o.OrderId    || '—',
        pharmacy: o.pharmacy    || o.Pharmacy    || o.pharmacyName || o.PharmacyName || '—',
        patient:  o.patient     || o.Patient     || o.patientName  || o.PatientName  || o.userName || '—',
        driver:   o.driver      || o.Driver      || o.driverName   || o.DriverName   || '—',
        status:   o.status      || o.Status      || 'pending',
        value:    o.value       || o.Value       || o.total       || o.Total       || o.amount || '—',
        date:     o.date        || o.Date        || o.createdAt   || o.CreatedAt   || o.orderDate || '',
      }))

      // Sort by newest date and take top 5
      const sorted = normalized
        .filter(o => o.date)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)

      setRecentOrders(sorted)
    } catch (err) {
      console.error('Failed to fetch orders:', err)
    } finally {
      setLoadingOrders(false)
    }
  }

  const statCards = [
    {
      label: 'Total Pharmacies',
      value: loadingStats ? '...' : stats.pharmacies,
      progress: 75,
      icon: 'pharmacy',
      color: '#FFD700',
      bg: '#fffbcf',
      page: 'pharmacies'
    },
    {
      label: 'Total Drivers',
      value: loadingStats ? '...' : stats.drivers,
      progress: 60,
      icon: 'driver',
      color: 'var(--info)',
      bg: '#e3f2fd',
      page: 'drivers'
    },
    {
      label: 'Total Patients',
      value: loadingStats ? '...' : stats.patients,
      progress: 70,
      icon: 'patient',
      color: 'var(--success)',
      bg: '#e8f5e9',
      page: 'patients'
    },
    {
      label: 'System Orders',
      value: loadingStats ? '...' : stats.orders,
      progress: 85,
      icon: 'orders',
      color: 'var(--warning)',
      bg: '#fff3e0',
      page: 'orders'
    }
  ]

  const catalogItems = categories.slice(0, 4).map(cat => ({
    name: cat.name,
    count: `${cat.medicines.length} item${cat.medicines.length !== 1 ? 's' : ''}`,
    icon: cat.icon
  }))

  const getIcon = (type) => {
    const icons = {
      pharmacy: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
      driver: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="3" width="15" height="13"/>
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
          <circle cx="5.5" cy="18.5" r="2.5"/>
          <circle cx="18.5" cy="18.5" r="2.5"/>
        </svg>
      ),
      patient: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
      orders: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      ),
    }
    return icons[type] || icons.orders
  }

  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase()
    if (s === 'delivered')  return 'delivered'
    if (s === 'picked-up' || s === 'pickedup') return 'picked-up'
    if (s === 'pending')    return 'pending'
    if (s === 'cancelled')  return 'cancelled'
    return 'pending'
  }

  return (
    <div className="page-content">

      {/* ── 4 Stats Cards in one row ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '28px'
      }}>
        {statCards.map((stat, index) => (
          <div
            key={index}
            onClick={() => setCurrentPage(stat.page)}
            style={{
              backgroundColor: 'var(--white)',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
              border: '1px solid var(--gray-200)',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)'
            }}
          >
            {/* Background accent */}
            <div style={{
              position: 'absolute', top: 0, right: 0,
              width: '80px', height: '80px',
              backgroundColor: stat.bg,
              borderRadius: '0 12px 0 80px',
              zIndex: 0
            }} />

            {/* Icon */}
            <div style={{
              position: 'absolute', top: '14px', right: '14px',
              width: '40px', height: '40px',
              backgroundColor: stat.bg,
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: stat.color,
              zIndex: 1
            }}>
              {getIcon(stat.icon)}
            </div>

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ fontSize: '13px', color: 'var(--medium-gray)', fontWeight: '500', marginBottom: '8px' }}>
                {stat.label}
              </p>
              <p style={{ fontSize: '30px', fontWeight: '700', color: 'var(--dark-gray)', marginBottom: '12px', lineHeight: 1 }}>
                {stat.value}
              </p>

              {/* Progress bar */}
              <div style={{ height: '4px', backgroundColor: '#f0f0f0', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${stat.progress}%`,
                  backgroundColor: stat.color,
                  borderRadius: '2px',
                  transition: 'width 0.8s ease'
                }} />
              </div>

              {/* Click hint */}
              <p style={{ fontSize: '11px', color: stat.color, marginTop: '8px', fontWeight: '500' }}>
                View all →
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Global Catalog Section ── */}
      <div className="section">
        <div className="section-header">
          <h3 className="section-title">Global Catalog</h3>
          <a
            className="view-all-link"
            onClick={() => setCurrentPage('catalog')}
            style={{ cursor: 'pointer' }}
          >
            View Full Inventory →
          </a>
        </div>
        <div className="catalog-grid">
          {catalogItems.map((item, index) => (
            <div
              key={index}
              className="catalog-card"
              onClick={() => setCurrentPage('catalog')}
              style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = ''
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>{item.icon}</div>
              <h4 className="catalog-title">{item.name}</h4>
              <p className="catalog-count">{item.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent Orders Section ── */}
      <div className="section">
        <div className="section-header">
          <h3 className="section-title">Recent Orders</h3>
          <a
            className="view-all-link"
            onClick={() => setCurrentPage('orders')}
            style={{ cursor: 'pointer' }}
          >
            View All Orders →
          </a>
        </div>

        {loadingOrders ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--medium-gray)' }}>
            Loading recent orders...
          </div>
        ) : recentOrders.length === 0 ? (
          // Fallback static orders if API has no orders endpoint
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Pharmacy</th>
                  <th>Patient</th>
                  <th>Driver</th>
                  <th>Status</th>
                  <th>Value</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: '#ORD-8821', pharmacy: 'Green Valley Meds',  patient: 'John Smith',    driver: 'Alex Rivera',   status: 'delivered', value: '$42.50',  date: '2024-01-15' },
                  { id: '#ORD-8820', pharmacy: 'Central Health Hub', patient: 'Emma Johnson',  driver: 'Sarah Chen',    status: 'delivered', value: '$65.00',  date: '2024-01-15' },
                  { id: '#ORD-8819', pharmacy: 'Central Health Hub', patient: 'Michael Brown', driver: 'Sarah Chen',    status: 'picked-up', value: '$118.00', date: '2024-01-14' },
                  { id: '#ORD-8818', pharmacy: 'Sunset Pharmacy',    patient: 'Sarah Davis',   driver: 'Mark Jenkins',  status: 'pending',   value: '$15.20',  date: '2024-01-14' },
                  { id: '#ORD-8817', pharmacy: 'Apex Pharma Care',   patient: 'Robert Wilson', driver: 'Jessica Wong',  status: 'delivered', value: '$210.44', date: '2024-01-13' },
                ]
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((order, index) => (
                    <tr
                      key={index}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setCurrentPage('orders')}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                    >
                      <td className="order-id">{order.id}</td>
                      <td>{order.pharmacy}</td>
                      <td>{order.patient}</td>
                      <td>
                        <div className="driver-info">
                          <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(order.driver)}&background=FFD700&color=fff`}
                            alt={order.driver}
                            className="driver-avatar"
                          />
                          <span>{order.driver}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusColor(order.status)}`}>
                          {order.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="value-cell">{order.value}</td>
                      <td style={{ fontSize: '13px', color: 'var(--medium-gray)' }}>{order.date}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Pharmacy</th>
                  <th>Patient</th>
                  <th>Driver</th>
                  <th>Status</th>
                  <th>Value</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, index) => (
                  <tr
                    key={index}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setCurrentPage('orders')}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                  >
                    <td className="order-id">{order.id}</td>
                    <td>{order.pharmacy}</td>
                    <td>{order.patient}</td>
                    <td>
                      <div className="driver-info">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(order.driver || 'D')}&background=FFD700&color=fff`}
                          alt={order.driver}
                          className="driver-avatar"
                        />
                        <span>{order.driver || '—'}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusColor(order.status)}`}>
                        {(order.status || 'pending').replace('-', ' ')}
                      </span>
                    </td>
                    <td className="value-cell">{order.value}</td>
                    <td style={{ fontSize: '13px', color: 'var(--medium-gray)' }}>
                      {order.date ? new Date(order.date).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard