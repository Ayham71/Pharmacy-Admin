import React, { useState, useEffect } from 'react'

const ADMIN_URL = 'http://165.22.91.187:5000/api/Admin'
const ORDERS_URL = 'http://165.22.91.187:5000/api/AdminOrder'

const getToken = () =>
  localStorage.getItem('token')       ||
  localStorage.getItem('authToken')   ||
  localStorage.getItem('accessToken') ||
  sessionStorage.getItem('token')     ||
  null

const str = (val) => (val == null ? '' : String(val))

const Dashboard = ({ setCurrentPage, categories }) => {
  const [stats, setStats] = useState({
    pharmacies: '—',
    drivers:    '—',
    patients:   '—',
    orders:     '—',
  })
  const [recentOrders, setRecentOrders]   = useState([])
  const [topPatients, setTopPatients]     = useState([])
  const [topDrivers, setTopDrivers]       = useState([])
  const [topPharmacies, setTopPharmacies] = useState([])
  
  const [loadingStats, setLoadingStats]     = useState(true)
  const [loadingOrders, setLoadingOrders]   = useState(true)
  const [loadingTop, setLoadingTop]         = useState(true)

  useEffect(() => {
    fetchStats()
    fetchRecentOrders()
    fetchTopPerformers()
  }, [])

  // ─── Auth header ───────────────────────────────────────────────────────────
  const authHeader = () => {
    const token = getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // ─── Safe JSON fetch ───────────────────────────────────────────────────────
  const safeFetch = async (url) => {
    const res = await fetch(url, { headers: authHeader() })
    if (!res.ok) return null
    const text = await res.text()
    try { return JSON.parse(text) } catch { return null }
  }

  // ─── Stats ─────────────────────────────────────────────────────────────────
  const fetchStats = async () => {
    setLoadingStats(true)
    try {
      const [pharmaciesData, driversData, patientsData, ordersData] =
        await Promise.all([
          safeFetch(`${ADMIN_URL}/Pharmacy`),
          safeFetch(`${ADMIN_URL}/Delivery`),
          safeFetch(`${ADMIN_URL}/Patient`),
          safeFetch(`${ORDERS_URL}`),
        ])

      setStats({
        pharmacies: pharmaciesData != null
          ? String(Array.isArray(pharmaciesData) ? pharmaciesData.length : 0)
          : '—',
        drivers: driversData != null
          ? String(Array.isArray(driversData) ? driversData.length : 0)
          : '—',
        patients: patientsData != null
          ? String(Array.isArray(patientsData) ? patientsData.length : 0)
          : '—',
        orders: ordersData != null
          ? String(
              Array.isArray(ordersData)
                ? ordersData.length
                : ordersData?.orders?.length  ||
                  ordersData?.data?.length    ||
                  ordersData?.result?.length  ||
                  ordersData?.total           ||
                  0
            )
          : '—',
      })
    } catch (err) {
      console.error('fetchStats error:', err)
    } finally {
      setLoadingStats(false)
    }
  }

  // ─── Normalize one raw order ───────────────────────────────────────────────
  const normalizeOrder = (raw) => ({
    id:         str(raw.id || raw.orderId || '—'),
    pharmacy:   str(raw.pharmacyName || raw.pharmacy || '—'),
    pharmacyId: str(raw.pharmacyId || raw.pharmacy_id || ''),
    patient:    str(raw.patientName || raw.patient || raw.userName || '—'),
    patientId:  str(raw.patientId || raw.patient_id || raw.userId || ''),
    driver:     str(raw.driverName || raw.driver || 'Unassigned'),
    driverId:   str(raw.driverId || raw.driver_id || ''),
    status:     str(raw.status || 'pending').toLowerCase(),
    value:      raw.totalPrice != null
                  ? Number(raw.totalPrice)
                  : 0,
    date:       str(raw.createdAt || raw.date || '').slice(0, 10),
  })

  // ─── Recent orders ─────────────────────────────────────────────────────────
  const fetchRecentOrders = async () => {
    setLoadingOrders(true)
    try {
      const data = await safeFetch(ORDERS_URL)
      if (!data) { setLoadingOrders(false); return }

      const rawList = Array.isArray(data)
        ? data
        : data?.orders || data?.data || data?.result || []

      const normalized = rawList.map(normalizeOrder)

      const sorted = normalized
        .filter(o => o.date)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)

      setRecentOrders(sorted)
    } catch (err) {
      console.error('fetchRecentOrders error:', err)
    } finally {
      setLoadingOrders(false)
    }
  }

  // ─── Top Performers (Patients, Drivers, Pharmacies) ───────────────────────
  const fetchTopPerformers = async () => {
    setLoadingTop(true)
    try {
      const data = await safeFetch(ORDERS_URL)
      if (!data) { setLoadingTop(false); return }

      const rawList = Array.isArray(data)
        ? data
        : data?.orders || data?.data || data?.result || []

      const normalized = rawList.map(normalizeOrder)

      // ── Top Patients (by order count) ──
      const patientMap = {}
      normalized.forEach(o => {
        if (o.patientId && o.patient !== '—') {
          if (!patientMap[o.patientId]) {
            patientMap[o.patientId] = { name: o.patient, count: 0, total: 0 }
          }
          patientMap[o.patientId].count++
          patientMap[o.patientId].total += o.value
        }
      })
      const topPatientsData = Object.values(patientMap)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map((p, idx) => ({
          rank: idx + 1,
          name: p.name,
          orders: p.count,
          total: `$${p.total.toFixed(2)}`
        }))
      setTopPatients(topPatientsData)

      // ── Top Drivers (by delivery count, only delivered orders) ──
      const driverMap = {}
      normalized
        .filter(o => ['delivered', 'done', 'completed'].includes(o.status))
        .forEach(o => {
          if (o.driverId && o.driver !== 'Unassigned' && o.driver !== '—') {
            if (!driverMap[o.driverId]) {
              driverMap[o.driverId] = { name: o.driver, count: 0 }
            }
            driverMap[o.driverId].count++
          }
        })
      const topDriversData = Object.values(driverMap)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map((d, idx) => ({
          rank: idx + 1,
          name: d.name,
          deliveries: d.count
        }))
      setTopDrivers(topDriversData)

      // ── Top Pharmacies (by sales value) ──
      const pharmacyMap = {}
      normalized.forEach(o => {
        if (o.pharmacyId && o.pharmacy !== '—') {
          if (!pharmacyMap[o.pharmacyId]) {
            pharmacyMap[o.pharmacyId] = { name: o.pharmacy, count: 0, total: 0 }
          }
          pharmacyMap[o.pharmacyId].count++
          pharmacyMap[o.pharmacyId].total += o.value
        }
      })
      const topPharmaciesData = Object.values(pharmacyMap)
        .sort((a, b) => b.total - a.total)
        .slice(0, 5)
        .map((p, idx) => ({
          rank: idx + 1,
          name: p.name,
          orders: p.count,
          sales: `$${p.total.toFixed(2)}`
        }))
      setTopPharmacies(topPharmaciesData)

    } catch (err) {
      console.error('fetchTopPerformers error:', err)
    } finally {
      setLoadingTop(false)
    }
  }

  // ─── Status badge style ────────────────────────────────────────────────────
  const getStatusStyle = (status) => {
    const s = str(status).toLowerCase().trim()
    switch (s) {
      case 'delivered':
      case 'done':
      case 'completed':
        return { bg: '#e8f5e9', color: '#2e7d32', border: '#4caf50',
                 label: s === 'done' ? 'Done' : s === 'completed' ? 'Completed' : 'Delivered' }
      case 'picked-up':
      case 'picked up':
      case 'in transit':
        return { bg: '#e3f2fd', color: '#1565c0', border: '#2196f3', label: 'Picked Up' }
      case 'pending':
      case 'ready':
      case 'processing':
        return { bg: '#fff3e0', color: '#e65100', border: '#ff9800',
                 label: s === 'ready' ? 'Ready' : s === 'processing' ? 'Processing' : 'Pending' }
      case 'cancelled':
      case 'canceled':
      case 'rejected':
      case 'failed':
        return { bg: '#ffebee', color: '#b71c1c', border: '#f44336',
                 label: s === 'rejected' ? 'Rejected' : s === 'failed' ? 'Failed' : 'Cancelled' }
      default:
        return { bg: '#f5f5f5', color: '#424242', border: '#9e9e9e', label: status || 'Unknown' }
    }
  }

  // ─── Medal color for ranking ───────────────────────────────────────────────
  const getMedalColor = (rank) => {
    switch(rank) {
      case 1: return '#FFD700' // Gold
      case 2: return '#C0C0C0' // Silver
      case 3: return '#CD7F32' // Bronze
      default: return '#E0E0E0' // Gray
    }
  }

  // ─── Stat cards ────────────────────────────────────────────────────────────
  const statCards = [
    {
      label:    'Total Pharmacies',
      value:    loadingStats ? '...' : stats.pharmacies,
      progress: 75,
      icon:     'pharmacy',
      color:    '#FFD700',
      bg:       '#fffbcf',
      page:     'pharmacies',
    },
    {
      label:    'Total Drivers',
      value:    loadingStats ? '...' : stats.drivers,
      progress: 60,
      icon:     'driver',
      color:    'var(--info)',
      bg:       '#e3f2fd',
      page:     'drivers',
    },
    {
      label:    'Total Patients',
      value:    loadingStats ? '...' : stats.patients,
      progress: 70,
      icon:     'patient',
      color:    'var(--success)',
      bg:       '#e8f5e9',
      page:     'patients',
    },
    {
      label:    'System Orders',
      value:    loadingStats ? '...' : stats.orders,
      progress: 85,
      icon:     'orders',
      color:    'var(--warning)',
      bg:       '#fff3e0',
      page:     'orders',
    },
  ]

  const catalogItems = categories.slice(0, 4).map(cat => ({
    name:  cat.name,
    count: `${cat.medicines.length} item${cat.medicines.length !== 1 ? 's' : ''}`,
    icon:  cat.icon,
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

  return (
    <div className="page-content">

      {/* ── 4 Stat Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '28px',
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
              overflow: 'hidden',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform  = 'translateY(-4px)'
              e.currentTarget.style.boxShadow  = '0 8px 20px rgba(0,0,0,0.12)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform  = 'translateY(0)'
              e.currentTarget.style.boxShadow  = '0 2px 8px rgba(0,0,0,0.07)'
            }}
          >
            <div style={{
              position: 'absolute', top: 0, right: 0,
              width: '80px', height: '80px',
              backgroundColor: stat.bg,
              borderRadius: '0 12px 0 80px',
              zIndex: 0,
            }} />

            <div style={{
              position: 'absolute', top: '14px', right: '14px',
              width: '40px', height: '40px',
              backgroundColor: stat.bg,
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: stat.color,
              zIndex: 1,
            }}>
              {getIcon(stat.icon)}
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ fontSize: '13px', color: 'var(--medium-gray)', fontWeight: '500', marginBottom: '8px' }}>
                {stat.label}
              </p>
              <p style={{ fontSize: '30px', fontWeight: '700', color: 'var(--dark-gray)', marginBottom: '12px', lineHeight: 1 }}>
                {loadingStats && stat.value === '...' ? (
                  <span style={{ fontSize: '18px', color: '#bbb' }}>loading…</span>
                ) : stat.value}
              </p>

              <div style={{ height: '4px', backgroundColor: '#f0f0f0', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${stat.progress}%`,
                  backgroundColor: stat.color,
                  borderRadius: '2px',
                  transition: 'width 0.8s ease',
                }} />
              </div>

              <p style={{ fontSize: '11px', color: stat.color, marginTop: '8px', fontWeight: '500' }}>
                View all →
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Global Catalog ── */}
      <div className="section">
        <div className="section-header">
          <h3 className="section-title">Global Catalog</h3>
          <a className="view-all-link" onClick={() => setCurrentPage('catalog')} style={{ cursor: 'pointer' }}>
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
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)'
              }}
              onMouseLeave={e => {
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

      {/* ── Recent Orders ── */}
      <div className="section">
        <div className="section-header">
          <h3 className="section-title">Recent Orders</h3>
          <a className="view-all-link" onClick={() => setCurrentPage('orders')} style={{ cursor: 'pointer' }}>
            View All Orders →
          </a>
        </div>

        {loadingOrders ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--medium-gray)' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid #e0e0e0', borderTop: '3px solid #1976d2', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            Loading recent orders…
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
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--medium-gray)' }}>
                      No orders found.
                    </td>
                  </tr>
                ) : recentOrders.map((order, index) => {
                  const ss = getStatusStyle(order.status)
                  return (
                    <tr
                      key={index}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setCurrentPage('orders')}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
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
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          textTransform: 'capitalize',
                          backgroundColor: ss.bg,
                          color:           ss.color,
                          border:          `1px solid ${ss.border}`,
                        }}>
                          {ss.label}
                        </span>
                      </td>
                      <td className="value-cell">${order.value.toFixed(2)}</td>
                      <td style={{ fontSize: '13px', color: 'var(--medium-gray)' }}>
                        {order.date
                          ? new Date(order.date).toLocaleDateString('en-GB', {
                              day:   '2-digit',
                              month: 'short',
                              year:  'numeric',
                            })
                          : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── TOP PERFORMERS (3 Tables) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        marginTop: '28px',
      }}>

        {/* ── TOP 5 PATIENTS ── */}
        <div className="section">
          <div className="section-header">
            <h3 className="section-title" style={{ fontSize: '16px' }}>🏆 Top Patients</h3>
            <a className="view-all-link" onClick={() => setCurrentPage('patients')} style={{ cursor: 'pointer', fontSize: '12px' }}>
              View All →
            </a>
          </div>
          {loadingTop ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--medium-gray)' }}>
              <div style={{ width: '24px', height: '24px', border: '2px solid #e0e0e0', borderTop: '2px solid #1976d2', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 8px' }} />
              <small>Loading...</small>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>Rank</th>
                    <th>Patient</th>
                    <th style={{ textAlign: 'center' }}>Orders</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {topPatients.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--medium-gray)', fontSize: '13px' }}>
                        No data available
                      </td>
                    </tr>
                  ) : topPatients.map((p) => (
                    <tr key={p.rank}>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: getMedalColor(p.rank),
                          color: p.rank <= 3 ? '#fff' : '#666',
                          fontSize: '13px',
                          fontWeight: '700',
                        }}>
                          {p.rank}
                        </span>
                      </td>
                      <td>
                        <div className="driver-info">
                          <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=FFC107&color=fff&size=64`}
                            alt={p.name}
                            className="driver-avatar"
                          />
                          <span style={{ fontSize: '13px', fontWeight: '500' }}>{p.name}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#1976d2' }}>
                        {p.orders}
                      </td>
                      <td style={{ textAlign: 'right', fontSize: '13px', fontWeight: '700', color: '#2e7d32' }}>
                        {p.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── TOP 5 DRIVERS ── */}
        <div className="section">
          <div className="section-header">
            <h3 className="section-title" style={{ fontSize: '16px' }}>🚚 Top Drivers</h3>
            <a className="view-all-link" onClick={() => setCurrentPage('drivers')} style={{ cursor: 'pointer', fontSize: '12px' }}>
              View All →
            </a>
          </div>
          {loadingTop ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--medium-gray)' }}>
              <div style={{ width: '24px', height: '24px', border: '2px solid #e0e0e0', borderTop: '2px solid #1976d2', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 8px' }} />
              <small>Loading...</small>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>Rank</th>
                    <th>Driver</th>
                    <th style={{ textAlign: 'center' }}>Deliveries</th>
                  </tr>
                </thead>
                <tbody>
                  {topDrivers.length === 0 ? (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', padding: '30px', color: 'var(--medium-gray)', fontSize: '13px' }}>
                        No data available
                      </td>
                    </tr>
                  ) : topDrivers.map((d) => (
                    <tr key={d.rank}>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: getMedalColor(d.rank),
                          color: d.rank <= 3 ? '#fff' : '#666',
                          fontSize: '13px',
                          fontWeight: '700',
                        }}>
                          {d.rank}
                        </span>
                      </td>
                      <td>
                        <div className="driver-info">
                          <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(d.name)}&background=FFD700&color=fff&size=64`}
                            alt={d.name}
                            className="driver-avatar"
                          />
                          <span style={{ fontSize: '13px', fontWeight: '500' }}>{d.name}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#1976d2' }}>
                        {d.deliveries}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── TOP 5 PHARMACIES ── */}
        <div className="section">
          <div className="section-header">
            <h3 className="section-title" style={{ fontSize: '16px' }}>🏥 Top Pharmacies</h3>
            <a className="view-all-link" onClick={() => setCurrentPage('pharmacies')} style={{ cursor: 'pointer', fontSize: '12px' }}>
              View All →
            </a>
          </div>
          {loadingTop ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--medium-gray)' }}>
              <div style={{ width: '24px', height: '24px', border: '2px solid #e0e0e0', borderTop: '2px solid #1976d2', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 8px' }} />
              <small>Loading...</small>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>Rank</th>
                    <th>Pharmacy</th>
                    <th style={{ textAlign: 'center' }}>Orders</th>
                    <th style={{ textAlign: 'right' }}>Sales</th>
                  </tr>
                </thead>
                <tbody>
                  {topPharmacies.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--medium-gray)', fontSize: '13px' }}>
                        No data available
                      </td>
                    </tr>
                  ) : topPharmacies.map((p) => (
                    <tr key={p.rank}>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: getMedalColor(p.rank),
                          color: p.rank <= 3 ? '#fff' : '#666',
                          fontSize: '13px',
                          fontWeight: '700',
                        }}>
                          {p.rank}
                        </span>
                      </td>
                      <td>
                        <div className="driver-info">
                          <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=4CAF50&color=fff&size=64`}
                            alt={p.name}
                            className="driver-avatar"
                          />
                          <span style={{ fontSize: '13px', fontWeight: '500' }}>{p.name}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#1976d2' }}>
                        {p.orders}
                      </td>
                      <td style={{ textAlign: 'right', fontSize: '13px', fontWeight: '700', color: '#2e7d32' }}>
                        {p.sales}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default Dashboard