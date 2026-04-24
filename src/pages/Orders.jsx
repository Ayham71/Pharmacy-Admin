import React, { useState, useEffect, useCallback } from 'react'

const BASE_URL = 'http://165.22.91.187:5000/api/AdminOrder'

const getToken = () =>
  localStorage.getItem('token')       ||
  localStorage.getItem('authToken')   ||
  localStorage.getItem('accessToken') ||
  sessionStorage.getItem('token')     ||
  null

const authHeaders = () => {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

const str = (val) => (val == null ? '' : String(val))

const Orders = () => {
  const [searchTerm, setSearchTerm]               = useState('')
  const [expandedMedicines, setExpandedMedicines] = useState({})
  const [orders, setOrders]                       = useState([])
  const [success, setSuccess]                     = useState('')
  const [error, setError]                         = useState('')
  const [loading, setLoading]                     = useState(false)
  const [activeTab, setActiveTab]                 = useState('all')
  const [deleteLoadingId, setDeleteLoadingId]     = useState(null)

  // Global delivery fee — kept separately so fetchOrders can't wipe it
  const [globalDeliveryFee, setGlobalDeliveryFee] = useState(null)

  const [deliveryFeeModal, setDeliveryFeeModal]     = useState(false)
  const [deliveryFeeValue, setDeliveryFeeValue]     = useState('')
  const [deliveryFeeLoading, setDeliveryFeeLoading] = useState(false)

  const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 4000) }
  const showError   = (msg) => { setError(msg);   setTimeout(() => setError(''), 8000)  }

  // ─── Generic JSON fetch ────────────────────────────────────────────────────
  const apiFetch = useCallback(async (url, options = {}) => {
    const res  = await fetch(url, {
      ...options,
      headers: { ...authHeaders(), ...(options.headers || {}) },
    })
    const text = await res.text()
    let body   = {}
    try { body = JSON.parse(text) } catch { body = { raw: text } }

    if (res.status === 401) throw new Error('Unauthorized – please log in again.')
    if (res.status === 403) throw new Error('Forbidden – you do not have permission.')
    if (res.status === 204) return null
    if (!res.ok) {
      const errArr =
        Array.isArray(body?.errors)
          ? body.errors.join(', ')
          : typeof body?.errors === 'object' && body?.errors !== null
          ? Object.values(body.errors).flat().join(', ')
          : null
      const msg = body?.message || body?.title || errArr || `Server error: ${res.status}`
      const err = new Error(msg)
      err.status = res.status
      err.body   = body
      throw err
    }
    return body
  }, [])

  // ─── Delivery-fee PUT  (JSON string decimal — confirmed working format) ───
  const updateDeliveryFee = useCallback(async (fee) => {
    const token = getToken()
    const res   = await fetch(`${BASE_URL}/delivery-fee`, {
      method:  'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(fee.toFixed(2)),   // ✅ raw JSON string e.g. "5.00"
    })

    const text = await res.text()
    let body   = {}
    try { body = JSON.parse(text) } catch { body = { raw: text } }

    if (!res.ok) {
      throw new Error(body?.message || body?.title || `Server error: ${res.status}`)
    }
    return body   // { message, deliveryFee }
  }, [])

  // ─── Normalize ─────────────────────────────────────────────────────────────
  const normalizeOrder = useCallback((raw) => {
    const medicines = (raw.orderItems || []).map((item) => ({
      name:  str(item.medicationName || item.name),
      qty:   Number(item.quantity || item.qty || 1),
      price: str(
        item.pricePerUnit != null
          ? `$${Number(item.pricePerUnit).toFixed(2)}`
          : item.price || '$0.00'
      ),
      image: item.medicationImage || null,
      total: item.totalPrice || 0,
    }))
    return {
      id:                str(raw.id),
      pharmacy:          str(raw.pharmacyName || raw.pharmacy),
      patient:           str(raw.patientName  || raw.patient),
      driver:            str(raw.driverName   || raw.driver || 'Unassigned'),
      status:            str(raw.status).toLowerCase(),
      value:             str(raw.totalPrice != null
                           ? `$${Number(raw.totalPrice).toFixed(2)}`
                           : raw.value || '$0.00'),
      date:              str(raw.createdAt).slice(0, 10),
      deliveryFee:       Number(raw.deliveryFee ?? 0),
      subTotal:          Number(raw.subTotal   ?? 0),
      medicines,
      prescriptionImage: raw.prescriptionImage,
    }
  }, [])

  // ─── Fetch orders ──────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const urlMap = {
        all:     BASE_URL,
        active:  `${BASE_URL}/active`,
        history: `${BASE_URL}/history`,
      }
      const data    = await apiFetch(urlMap[activeTab])
      const rawList = Array.isArray(data)
        ? data
        : data?.orders || data?.data || data?.result || []

      const normalized = rawList.map(normalizeOrder)
      setOrders(normalized)

      // If we have a confirmed global fee, keep it — don't let the server
      // response overwrite it with stale data
      setGlobalDeliveryFee(prev => {
        if (prev !== null) return prev           // keep our confirmed value
        // first load: read from first order as default display
        return normalized[0]?.deliveryFee ?? 0
      })
    } catch (err) {
      showError(err.message)
    } finally {
      setLoading(false)
    }
  }, [activeTab, apiFetch, normalizeOrder])

  useEffect(() => {
    // Reset global fee when tab changes so it re-reads from server
    setGlobalDeliveryFee(null)
    fetchOrders()
  }, [activeTab])

  // ─── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return
    setDeleteLoadingId(id)
    try {
      await apiFetch(`${BASE_URL}/${id}`, { method: 'DELETE' })
      setOrders(prev => prev.filter(o => o.id !== id))
      showSuccess('Order deleted successfully!')
    } catch (err) {
      showError(err.message)
    } finally {
      setDeleteLoadingId(null)
    }
  }

  // ─── Open delivery fee modal ───────────────────────────────────────────────
  const openDeliveryFeeModal = () => {
    setDeliveryFeeValue(
      globalDeliveryFee !== null ? String(globalDeliveryFee) : ''
    )
    setDeliveryFeeModal(true)
    setError('')
  }

  // ─── Submit delivery fee ───────────────────────────────────────────────────
  const handleDeliveryFeeSubmit = async () => {
    const fee = parseFloat(deliveryFeeValue)
    if (isNaN(fee) || fee < 0) {
      showError('Please enter a valid delivery fee (0 or more).')
      return
    }

    setDeliveryFeeLoading(true)
    setError('')

    try {
      const response    = await updateDeliveryFee(fee)
      const confirmed   = typeof response?.deliveryFee === 'number'
        ? response.deliveryFee
        : fee

      // ── Persist the new fee in our separate state so re-fetches can't wipe it
      setGlobalDeliveryFee(confirmed)

      setDeliveryFeeModal(false)
      setDeliveryFeeValue('')
      showSuccess(`Global delivery fee set to $${confirmed.toFixed(2)}!`)
    } catch (err) {
      showError(`Failed to update delivery fee: ${err.message}`)
    } finally {
      setDeliveryFeeLoading(false)
    }
  }

  // ─── Toggle medicines ──────────────────────────────────────────────────────
  const toggleMedicines = (id) =>
    setExpandedMedicines(prev => ({ ...prev, [id]: !prev[id] }))

  // ─── Filter & sort ─────────────────────────────────────────────────────────
  const filteredOrders = orders
    .filter(o =>
      str(o.id).toLowerCase().includes(searchTerm.toLowerCase())       ||
      str(o.pharmacy).toLowerCase().includes(searchTerm.toLowerCase()) ||
      str(o.patient).toLowerCase().includes(searchTerm.toLowerCase())  ||
      str(o.driver).toLowerCase().includes(searchTerm.toLowerCase())   ||
      str(o.status).toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  // ─── Status colours ────────────────────────────────────────────────────────
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
      case 'out for delivery':
        return { bg: '#e3f2fd', color: '#1565c0', border: '#2196f3', label: 'Picked Up' }
      case 'pending':
      case 'ready':
      case 'ready for pickup':
      case 'processing':
        return { bg: '#fff3e0', color: '#e65100', border: '#ff9800',
                 label: s === 'ready' || s === 'ready for pickup' ? 'Ready'
                      : s === 'processing' ? 'Processing' : 'Pending' }
      case 'cancelled':
      case 'canceled':
      case 'rejected':
      case 'failed':
        return { bg: '#ffebee', color: '#b71c1c', border: '#f44336',
                 label: s === 'rejected' ? 'Rejected'
                      : s === 'failed'   ? 'Failed' : 'Cancelled' }
      default:
        return { bg: '#f5f5f5', color: '#424242', border: '#9e9e9e', label: status }
    }
  }

  const inputStyle = {
    width: '100%', padding: '6px 8px',
    border: '1px solid var(--gray-300)', borderRadius: '4px',
    fontSize: '13px', boxSizing: 'border-box',
  }
  const tabStyle = (active) => ({
    padding: '7px 18px', border: 'none', borderRadius: '20px',
    cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: 'all 0.2s',
    backgroundColor: active ? 'var(--primary, #1976d2)' : '#f3f4f6',
    color: active ? '#fff' : '#374151',
  })

  // ── display fee: prefer our confirmed global value ─────────────────────────
  const displayFee = globalDeliveryFee !== null ? globalDeliveryFee : 0

  return (
    <div className="page-content">
      <div className="section">

        {/* Header */}
        <div
          className="section-header"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}
        >
          <h3 className="section-title">All Orders</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '6px', backgroundColor: '#f3f4f6', borderRadius: '24px', padding: '4px' }}>
              {[
                { key: 'all',     label: 'All Orders' },
                { key: 'active',  label: 'Active'     },
                { key: 'history', label: 'History'    },
              ].map(t => (
                <button key={t.key} style={tabStyle(activeTab === t.key)} onClick={() => setActiveTab(t.key)}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Global delivery fee button — shows current value */}
            <button
              onClick={openDeliveryFeeModal}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px',
                backgroundColor: '#fff3e0',
                color: '#f57c00',
                border: '1px solid #f57c00',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
              }}
            >
              🚚 Delivery Fee
              <span style={{
                backgroundColor: '#f57c00',
                color: '#fff',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: '700',
              }}>
                ${displayFee.toFixed(2)}
              </span>
            </button>

            <button
              onClick={fetchOrders}
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: '#e3f2fd', color: '#1565c0', border: '1px solid #2196f3', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '600' }}
            >
              {loading ? '⏳' : '🔄'} Refresh
            </button>
          </div>
        </div>

        {/* Alerts */}
        {success && <div className="success-message"><span>✅</span><span>{success}</span></div>}
        {error   && <div className="error-message"><span>⚠️</span><span>{error}</span></div>}

        {/* Search */}
        <div className="table-controls">
          <div className="search-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search by order ID, pharmacy, patient, driver or status…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
              <div style={{ width: '36px', height: '36px', border: '4px solid #e0e0e0', borderTop: '4px solid #1976d2', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
              Loading orders…
            </div>
          )}

          {!loading && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Pharmacy</th>
                  <th>Patient</th>
                  <th>Driver</th>
                  <th>Medicines</th>
                  <th>Status</th>
                  <th>Subtotal</th>
                  <th>Delivery Fee</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="11" style={{ textAlign: 'center', padding: '40px', color: 'var(--medium-gray)' }}>
                      {searchTerm ? 'No orders match your search.' : 'No orders found.'}
                    </td>
                  </tr>
                ) : filteredOrders.map((order) => {
                  const ss = getStatusStyle(order.status)
                  return (
                    <React.Fragment key={order.id}>
                      <tr style={{ borderBottom: expandedMedicines[order.id] ? 'none' : undefined }}>

                        <td className="order-id">{order.id}</td>
                        <td>{order.pharmacy}</td>
                        <td>{order.patient}</td>

                        {/* Driver */}
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

                        {/* Medicines toggle */}
                        <td>
                          <button
                            onClick={() => toggleMedicines(order.id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '6px',
                              padding: '5px 12px',
                              backgroundColor: expandedMedicines[order.id] ? '#fff3e0' : '#f3f4f6',
                              color: expandedMedicines[order.id] ? 'var(--warning)' : '#374151',
                              border: `1px solid ${expandedMedicines[order.id] ? 'var(--warning)' : '#d1d5db'}`,
                              borderRadius: '20px', cursor: 'pointer',
                              fontSize: '12px', fontWeight: '500', whiteSpace: 'nowrap',
                            }}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
                            </svg>
                            {order.medicines?.length || 0} item{(order.medicines?.length || 0) !== 1 ? 's' : ''}
                            <span style={{ fontSize: '10px' }}>{expandedMedicines[order.id] ? '▲' : '▼'}</span>
                          </button>
                        </td>

                        {/* Status */}
                        <td>
                          <span style={{
                            display: 'inline-block', padding: '4px 12px',
                            borderRadius: '12px', fontSize: '12px', fontWeight: '600',
                            textTransform: 'capitalize',
                            backgroundColor: ss.bg, color: ss.color,
                            border: `1px solid ${ss.border}`,
                            letterSpacing: '0.3px',
                          }}>
                            {ss.label}
                          </span>
                        </td>

                        {/* Subtotal */}
                        <td style={{ color: '#555' }}>${order.subTotal.toFixed(2)}</td>

                        {/* Delivery Fee — always shows globalDeliveryFee */}
                        <td>
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            backgroundColor: '#e3f2fd',
                            color: '#1565c0',
                            fontWeight: '700',
                            fontSize: '13px',
                            borderRadius: '8px',
                            border: '1px solid #90caf9',
                          }}>
                            ${displayFee.toFixed(2)}
                          </span>
                        </td>

                        {/* Total */}
                        <td style={{ fontWeight: '700', color: 'var(--success, #2e7d32)' }}>
                          {order.value}
                        </td>

                        {/* Date */}
                        <td>{order.date}</td>

                        {/* Actions */}
                        <td>
                          <button
                            className="action-btn delete-btn"
                            title="Delete"
                            onClick={() => handleDelete(order.id)}
                            disabled={deleteLoadingId === order.id}
                            style={{ background: 'none', border: 'none', cursor: deleteLoadingId === order.id ? 'not-allowed' : 'pointer', padding: '6px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            {deleteLoadingId === order.id ? (
                              <span style={{ width: '16px', height: '16px', border: '2px solid #ccc', borderTop: '2px solid #f44336', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f44336" strokeWidth="2">
                                <path d="M3 6h18"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                <line x1="10" y1="11" x2="10" y2="17"/>
                                <line x1="14" y1="11" x2="14" y2="17"/>
                              </svg>
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded medicines */}
                      {expandedMedicines[order.id] && (
                        <tr>
                          <td colSpan="11" style={{ padding: 0, backgroundColor: '#fafafa', borderBottom: '2px solid #e0e0e0' }}>
                            <div style={{ padding: '16px 24px 20px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2">
                                  <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
                                </svg>
                                <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--warning)' }}>
                                  Medicines in Order #{order.id}
                                </span>
                              </div>

                              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                                <thead>
                                  <tr style={{ backgroundColor: '#fff3e0' }}>
                                    {['Medicine', 'Qty', 'Unit Price', 'Total'].map((h, i) => (
                                      <th key={h} style={{ textAlign: i === 0 ? 'left' : i === 1 ? 'center' : 'right', padding: '10px 14px', fontSize: '12px', fontWeight: '600', color: 'var(--warning)', borderBottom: '1px solid #ffe0b2' }}>
                                        {h}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {order.medicines?.map((med, idx) => (
                                    <tr
                                      key={idx}
                                      style={{ borderBottom: '1px solid #f5f5f5' }}
                                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fff8f0'}
                                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                      <td style={{ padding: '10px 14px', fontSize: '13px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                          {med.image && (
                                            <img
                                              src={`http://165.22.91.187:5000${med.image}`}
                                              alt={med.name}
                                              style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e0e0e0' }}
                                              onError={e => { e.target.style.display = 'none' }}
                                            />
                                          )}
                                          <span style={{ fontWeight: '500', color: '#333' }}>💊 {med.name}</span>
                                        </div>
                                      </td>
                                      <td style={{ padding: '10px 14px', textAlign: 'center', fontSize: '13px' }}>
                                        <span style={{ backgroundColor: '#f3f4f6', padding: '3px 10px', borderRadius: '12px', fontWeight: '600', color: '#374151' }}>
                                          x{med.qty}
                                        </span>
                                      </td>
                                      <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: '13px', color: '#555' }}>
                                        {med.price}
                                      </td>
                                      <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: '13px' }}>
                                        <span style={{ fontWeight: '700', color: 'var(--success)' }}>
                                          ${(parseFloat(str(med.price).replace('$', '')) * med.qty).toFixed(2)}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot>
                                  <tr style={{ backgroundColor: '#fff3e0', borderTop: '2px solid #ffe0b2' }}>
                                    <td colSpan="3" style={{ padding: '10px 14px', fontWeight: '600', fontSize: '13px', color: 'var(--warning)' }}>
                                      Subtotal ({order.medicines?.length || 0} items)
                                    </td>
                                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '700', fontSize: '14px', color: 'var(--success)' }}>
                                      ${order.medicines
                                        ?.reduce((sum, m) =>
                                          sum + (parseFloat(str(m.price).replace('$', '')) || 0) * m.qty, 0
                                        )
                                        .toFixed(2)}
                                    </td>
                                  </tr>
                                </tfoot>
                              </table>

                              {order.prescriptionImage && (
                                <div style={{ marginTop: '16px' }}>
                                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>
                                    Prescription:
                                  </div>
                                  <img
                                    src={`http://165.22.91.187:5000${order.prescriptionImage}`}
                                    alt="Prescription"
                                    style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px', border: '1px solid #e0e0e0', cursor: 'pointer' }}
                                    onClick={() => window.open(`http://165.22.91.187:5000${order.prescriptionImage}`, '_blank')}
                                  />
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delivery Fee Modal */}
      {deliveryFeeModal && (
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={e => { if (e.target === e.currentTarget) setDeliveryFeeModal(false) }}
        >
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '32px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ width: '44px', height: '44px', backgroundColor: '#fff3e0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                🚚
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Set Global Delivery Fee</h3>
                <p style={{ margin: 0, color: '#888', fontSize: '12px' }}>Applies to all orders</p>
              </div>
            </div>

            {/* Current fee display */}
            <div style={{ margin: '16px 0', padding: '12px 16px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#666' }}>Current fee</span>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#1565c0' }}>
                ${displayFee.toFixed(2)}
              </span>
            </div>

            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
              New Delivery Fee ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={deliveryFeeValue}
              onChange={e => setDeliveryFeeValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleDeliveryFeeSubmit()}
              placeholder="e.g. 5.00"
              autoFocus
              style={{ ...inputStyle, marginBottom: '24px', fontSize: '16px', padding: '10px 12px' }}
            />

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeliveryFeeModal(false)}
                disabled={deliveryFeeLoading}
                style={{ padding: '9px 20px', border: '1px solid #d1d5db', borderRadius: '8px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '14px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeliveryFeeSubmit}
                disabled={deliveryFeeLoading || deliveryFeeValue === ''}
                style={{ padding: '9px 24px', border: 'none', borderRadius: '8px', backgroundColor: '#f57c00', color: '#fff', cursor: deliveryFeeLoading ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', opacity: deliveryFeeValue === '' ? 0.6 : 1, transition: 'opacity 0.2s' }}
              >
                {deliveryFeeLoading && (
                  <span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                )}
                {deliveryFeeLoading ? 'Saving…' : 'Save Fee'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default Orders