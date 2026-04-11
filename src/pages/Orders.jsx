import React, { useState } from 'react'

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedMedicines, setExpandedMedicines] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [deleteLoadingId, setDeleteLoadingId] = useState(null)
  const [editLoading, setEditLoading] = useState(false)
  const [orders, setOrders] = useState([
    {
      id: '#ORD-8821',
      pharmacy: 'Green Valley Meds',
      patient: 'John Smith',
      driver: 'Alex Rivera',
      status: 'delivered',
      value: '$42.50',
      date: '2024-01-15',
      medicines: [
        { name: 'Paracetamol 500mg', qty: 2, price: '$5.99' },
        { name: 'Vitamin C 1000mg',  qty: 1, price: '$8.99' },
        { name: 'Aspirin 100mg',     qty: 3, price: '$3.99' },
      ]
    },
    {
      id: '#ORD-8820',
      pharmacy: 'Central Health Hub',
      patient: 'Emma Johnson',
      driver: 'Sarah Chen',
      status: 'delivered',
      value: '$65.00',
      date: '2024-01-15',
      medicines: [
        { name: 'Ibuprofen 400mg',  qty: 1, price: '$4.50' },
        { name: 'Metformin 500mg',  qty: 2, price: '$12.99' },
      ]
    },
    {
      id: '#ORD-8819',
      pharmacy: 'Central Health Hub',
      patient: 'Michael Brown',
      driver: 'Sarah Chen',
      status: 'picked-up',
      value: '$118.00',
      date: '2024-01-14',
      medicines: [
        { name: 'Insulin Glargine',    qty: 1, price: '$89.00' },
        { name: 'Amoxicillin 250mg',   qty: 2, price: '$12.50' },
      ]
    },
    {
      id: '#ORD-8818',
      pharmacy: 'Sunset Pharmacy',
      patient: 'Sarah Davis',
      driver: 'Mark Jenkins',
      status: 'pending',
      value: '$15.20',
      date: '2024-01-14',
      medicines: [
        { name: 'Bandages Pack', qty: 2, price: '$2.99' },
        { name: 'Baby Powder',   qty: 1, price: '$6.99' },
      ]
    },
    {
      id: '#ORD-8817',
      pharmacy: 'Apex Pharma Care',
      patient: 'Robert Wilson',
      driver: 'Jessica Wong',
      status: 'delivered',
      value: '$210.44',
      date: '2024-01-13',
      medicines: [
        { name: 'Azithromycin 500mg', qty: 1, price: '$15.99' },
        { name: 'Vitamin B Complex',  qty: 3, price: '$10.50' },
        { name: 'Face Cream SPF30',   qty: 2, price: '$22.99' },
        { name: 'Insulin Glargine',   qty: 1, price: '$89.00' },
      ]
    },
    {
      id: '#ORD-8816',
      pharmacy: 'MedPlus Express',
      patient: 'Lisa Anderson',
      driver: 'David Miller',
      status: 'delivered',
      value: '$89.99',
      date: '2024-01-13',
      medicines: [
        { name: 'Vitamin D3',      qty: 2, price: '$9.99'  },
        { name: 'Ibuprofen 400mg', qty: 1, price: '$4.50'  },
        { name: 'Baby Oil',        qty: 1, price: '$7.50'  },
      ]
    },
  ])

  const [success, setSuccess] = useState('')
  const [error, setError]     = useState('')

  const statusOptions = ['pending', 'picked-up', 'delivered', 'cancelled']

  const filteredOrders = orders
  .filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase())       ||
    order.pharmacy.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.patient.toLowerCase().includes(searchTerm.toLowerCase())  ||
    order.driver.toLowerCase().includes(searchTerm.toLowerCase())   ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase())
  )
  .sort((a, b) => new Date(b.date) - new Date(a.date))

  const toggleMedicines = (orderId) => {
    setExpandedMedicines(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }))
  }

  const handleEdit = (order) => {
    setEditingId(order.id)
    setEditForm({ ...order })
    setError('')
    setSuccess('')
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditForm({})
    setError('')
  }

  const handleSave = async () => {
    if (!editForm.pharmacy?.trim() || !editForm.patient?.trim() || !editForm.driver?.trim()) {
      setError('Pharmacy, Patient and Driver fields are required.')
      return
    }

    setEditLoading(true)
    setError('')
    setSuccess('')

    try {
      // Simulate API call - replace with real API
      await new Promise(resolve => setTimeout(resolve, 600))

      setOrders(prev => prev.map(o =>
        o.id === editingId ? { ...editForm } : o
      ))
      setEditingId(null)
      setEditForm({})
      setSuccess('Order updated successfully!')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(`Failed to update order: ${err.message}`)
    } finally {
      setEditLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return
    setDeleteLoadingId(id)
    setError('')
    setSuccess('')

    try {
      // Simulate API call - replace with real API
      await new Promise(resolve => setTimeout(resolve, 600))

      setOrders(prev => prev.filter(o => o.id !== id))
      setSuccess('Order deleted successfully!')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(`Failed to delete order: ${err.message}`)
    } finally {
      setDeleteLoadingId(null)
    }
  }

  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...(editForm.medicines || [])]
    updatedMedicines[index] = { ...updatedMedicines[index], [field]: value }
    setEditForm({ ...editForm, medicines: updatedMedicines })
  }

  const handleAddMedicineRow = () => {
    setEditForm({
      ...editForm,
      medicines: [...(editForm.medicines || []), { name: '', qty: 1, price: '' }]
    })
  }

  const handleRemoveMedicineRow = (index) => {
    const updatedMedicines = (editForm.medicines || []).filter((_, i) => i !== index)
    setEditForm({ ...editForm, medicines: updatedMedicines })
  }

  const inputStyle = {
    width: '100%',
    padding: '6px 8px',
    border: '1px solid var(--gray-300)',
    borderRadius: '4px',
    fontSize: '13px',
    boxSizing: 'border-box'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':  return { bg: '#e8f5e9', color: '#2e7d32', border: '#4caf50' }
      case 'picked-up':  return { bg: '#e3f2fd', color: '#1565c0', border: '#2196f3' }
      case 'pending':    return { bg: '#fff8e1', color: '#f57f17', border: '#ffc107' }
      case 'cancelled':  return { bg: '#ffebee', color: '#c62828', border: '#f44336' }
      default:           return { bg: '#f5f5f5', color: '#616161', border: '#9e9e9e' }
    }
  }

  return (
    <div className="page-content">
      <div className="section">
        <div className="section-header">
          <h3 className="section-title">All Orders</h3>
        </div>

        {/* Success */}
        {success && (
          <div className='success-message'>
            <span>✅</span><span>{success}</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className='error-message'>
            <span>⚠️</span><span>{error}</span>
          </div>
        )}

        {/* Search */}
        <div className="table-controls">
          <div className="search-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search by order ID, pharmacy, patient, driver or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Pharmacy</th>
                <th>Patient</th>
                <th>Driver</th>
                <th>Medicines</th>
                <th>Status</th>
                <th>Value</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: 'var(--medium-gray)' }}>
                    {searchTerm ? 'No orders match your search.' : 'No orders found.'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <React.Fragment key={order.id}>
                    <tr style={{ borderBottom: expandedMedicines[order.id] ? 'none' : undefined }}>

                      {/* Order ID */}
                      <td className="order-id">
                        {editingId === order.id ? (
                          <input
                            type="text"
                            value={editForm.id || ''}
                            onChange={(e) => setEditForm({ ...editForm, id: e.target.value })}
                            style={inputStyle}
                          />
                        ) : order.id}
                      </td>

                      {/* Pharmacy */}
                      <td>
                        {editingId === order.id ? (
                          <input
                            type="text"
                            value={editForm.pharmacy || ''}
                            onChange={(e) => setEditForm({ ...editForm, pharmacy: e.target.value })}
                            style={inputStyle}
                            placeholder="Pharmacy name"
                          />
                        ) : order.pharmacy}
                      </td>

                      {/* Patient */}
                      <td>
                        {editingId === order.id ? (
                          <input
                            type="text"
                            value={editForm.patient || ''}
                            onChange={(e) => setEditForm({ ...editForm, patient: e.target.value })}
                            style={inputStyle}
                            placeholder="Patient name"
                          />
                        ) : order.patient}
                      </td>

                      {/* Driver */}
                      <td>
                        {editingId === order.id ? (
                          <input
                            type="text"
                            value={editForm.driver || ''}
                            onChange={(e) => setEditForm({ ...editForm, driver: e.target.value })}
                            style={inputStyle}
                            placeholder="Driver name"
                          />
                        ) : (
                          <div className="driver-info">
                            <img
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(order.driver)}&background=FFD700&color=fff`}
                              alt={order.driver}
                              className="driver-avatar"
                            />
                            <span>{order.driver}</span>
                          </div>
                        )}
                      </td>

                      {/* Medicines */}
                      <td>
                        <button
                          onClick={() => toggleMedicines(order.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '5px 12px',
                            backgroundColor: expandedMedicines[order.id] ? '#fff3e0' : '#f3f4f6',
                            color: expandedMedicines[order.id] ? 'var(--warning)' : '#374151',
                            border: `1px solid ${expandedMedicines[order.id] ? 'var(--warning)' : '#d1d5db'}`,
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s'
                          }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
                          </svg>
                          {order.medicines?.length || 0} item{(order.medicines?.length || 0) !== 1 ? 's' : ''}
                          <span style={{ fontSize: '10px' }}>
                            {expandedMedicines[order.id] ? '▲' : '▼'}
                          </span>
                        </button>
                      </td>

                      {/* Status */}
                      <td>
                        {editingId === order.id ? (
                          <select
                            value={editForm.status || ''}
                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                            style={inputStyle}
                          >
                            {statusOptions.map(s => (
                              <option key={s} value={s}>{s.replace('-', ' ')}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={`status-badge ${order.status}`}>
                            {order.status.replace('-', ' ')}
                          </span>
                        )}
                      </td>

                      {/* Value */}
                      <td className="value-cell">
                        {editingId === order.id ? (
                          <input
                            type="text"
                            value={editForm.value || ''}
                            onChange={(e) => setEditForm({ ...editForm, value: e.target.value })}
                            style={inputStyle}
                            placeholder="$0.00"
                          />
                        ) : order.value}
                      </td>

                      {/* Date */}
                      <td>
                        {editingId === order.id ? (
                          <input
                            type="date"
                            value={editForm.date || ''}
                            onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                            style={inputStyle}
                          />
                        ) : order.date}
                      </td>

                      {/* Actions */}
                      <td>
                        {editingId === order.id ? (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="action-btn"
                              title="Save"
                              onClick={handleSave}
                              disabled={editLoading}
                            >
                              {editLoading ? (
                                <span style={{ width: '14px', height: '14px', border: '2px solid #ccc', borderTop: '2px solid #333', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                              ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                                  <polyline points="17 21 17 13 7 13 7 21"/>
                                  <polyline points="7 3 7 8 15 8"/>
                                </svg>
                              )}
                            </button>
                            <button
                              className="action-btn delete-btn"
                              title="Cancel"
                              onClick={handleCancel}
                              disabled={editLoading}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="action-btn"
                              title="Edit"
                              onClick={() => handleEdit(order)}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            <button
                              className="action-btn delete-btn"
                              title="Delete"
                              onClick={() => handleDelete(order.id)}
                              disabled={deleteLoadingId === order.id}
                            >
                              {deleteLoadingId === order.id ? (
                                <span style={{ width: '14px', height: '14px', border: '2px solid #ccc', borderTop: '2px solid #f44336', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                              ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M3 6h18"/>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                  <line x1="10" y1="11" x2="10" y2="17"/>
                                  <line x1="14" y1="11" x2="14" y2="17"/>
                                </svg>
                              )}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>

                    {/* Medicines Expanded Row */}
                    {expandedMedicines[order.id] && (
                      <tr>
                        <td colSpan="9" style={{ padding: '0', backgroundColor: '#fafafa', borderBottom: '2px solid #e0e0e0' }}>
                          <div style={{ padding: '16px 24px 20px 24px' }}>

                            {/* Header */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2">
                                  <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
                                </svg>
                                <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--warning)' }}>
                                  Medicines in {order.id}
                                </span>
                              </div>

                              {/* Add medicine row button when editing */}
                              {editingId === order.id && (
                                <button
                                  onClick={handleAddMedicineRow}
                                  style={{ padding: '4px 12px', backgroundColor: 'var(--success)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}
                                >
                                  + Add Medicine
                                </button>
                              )}
                            </div>

                            {/* Medicines Table */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                              <thead>
                                <tr style={{ backgroundColor: '#fff3e0' }}>
                                  <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: '12px', fontWeight: '600', color: 'var(--warning)', borderBottom: '1px solid #ffe0b2' }}>Medicine Name</th>
                                  <th style={{ textAlign: 'center', padding: '10px 14px', fontSize: '12px', fontWeight: '600', color: 'var(--warning)', borderBottom: '1px solid #ffe0b2' }}>Quantity</th>
                                  <th style={{ textAlign: 'right', padding: '10px 14px', fontSize: '12px', fontWeight: '600', color: 'var(--warning)', borderBottom: '1px solid #ffe0b2' }}>Unit Price</th>
                                  <th style={{ textAlign: 'right', padding: '10px 14px', fontSize: '12px', fontWeight: '600', color: 'var(--warning)', borderBottom: '1px solid #ffe0b2' }}>Subtotal</th>
                                  {editingId === order.id && (
                                    <th style={{ textAlign: 'center', padding: '10px 14px', fontSize: '12px', fontWeight: '600', color: 'var(--warning)', borderBottom: '1px solid #ffe0b2' }}>Remove</th>
                                  )}
                                </tr>
                              </thead>
                              <tbody>
                                {(editingId === order.id ? editForm.medicines : order.medicines)?.map((med, index) => {
                                  const unitPrice = parseFloat((med.price || '$0').replace('$', '')) || 0
                                  const subtotal  = (unitPrice * (parseInt(med.qty) || 0)).toFixed(2)
                                  return (
                                    <tr
                                      key={index}
                                      style={{ borderBottom: '1px solid #f5f5f5', transition: 'background 0.15s' }}
                                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fff8f0'}
                                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                      {/* Medicine Name */}
                                      <td style={{ padding: '10px 14px', fontSize: '13px' }}>
                                        {editingId === order.id ? (
                                          <input
                                            type="text"
                                            value={med.name || ''}
                                            onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                                            style={{ ...inputStyle, minWidth: '160px' }}
                                            placeholder="Medicine name"
                                          />
                                        ) : (
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '16px' }}>💊</span>
                                            <span style={{ fontWeight: '500', color: '#333' }}>{med.name}</span>
                                          </div>
                                        )}
                                      </td>

                                      {/* Quantity */}
                                      <td style={{ padding: '10px 14px', textAlign: 'center', fontSize: '13px' }}>
                                        {editingId === order.id ? (
                                          <input
                                            type="number"
                                            min="1"
                                            value={med.qty || ''}
                                            onChange={(e) => handleMedicineChange(index, 'qty', e.target.value)}
                                            style={{ ...inputStyle, width: '70px', textAlign: 'center' }}
                                          />
                                        ) : (
                                          <span style={{ backgroundColor: '#f3f4f6', padding: '3px 10px', borderRadius: '12px', fontWeight: '600', color: '#374151' }}>
                                            x{med.qty}
                                          </span>
                                        )}
                                      </td>

                                      {/* Unit Price */}
                                      <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: '13px' }}>
                                        {editingId === order.id ? (
                                          <input
                                            type="text"
                                            value={med.price || ''}
                                            onChange={(e) => handleMedicineChange(index, 'price', e.target.value)}
                                            style={{ ...inputStyle, width: '90px', textAlign: 'right' }}
                                            placeholder="$0.00"
                                          />
                                        ) : (
                                          <span style={{ color: '#555' }}>{med.price}</span>
                                        )}
                                      </td>

                                      {/* Subtotal */}
                                      <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: '13px' }}>
                                        <span style={{ fontWeight: '700', color: 'var(--success)' }}>
                                          ${subtotal}
                                        </span>
                                      </td>

                                      {/* Remove button (edit mode only) */}
                                      {editingId === order.id && (
                                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                                          <button
                                            onClick={() => handleRemoveMedicineRow(index)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}
                                            title="Remove medicine"
                                          >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                              <path d="M3 6h18"/>
                                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                              <line x1="10" y1="11" x2="10" y2="17"/>
                                              <line x1="14" y1="11" x2="14" y2="17"/>
                                            </svg>
                                          </button>
                                        </td>
                                      )}
                                    </tr>
                                  )
                                })}
                              </tbody>

                              {/* Total Footer */}
                              <tfoot>
                                <tr style={{ backgroundColor: '#fff3e0', borderTop: '2px solid #ffe0b2' }}>
                                  <td colSpan={editingId === order.id ? 3 : 3} style={{ padding: '10px 14px', fontWeight: '600', fontSize: '13px', color: 'var(--warning)' }}>
                                    Total ({(editingId === order.id ? editForm.medicines : order.medicines)?.length || 0} items)
                                  </td>
                                  <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '700', fontSize: '14px', color: 'var(--success)' }}>
                                    ${(editingId === order.id ? editForm.medicines : order.medicines)
                                      ?.reduce((sum, m) => {
                                        const price = parseFloat((m.price || '$0').replace('$', '')) || 0
                                        return sum + price * (parseInt(m.qty) || 0)
                                      }, 0)
                                      .toFixed(2)
                                    }
                                  </td>
                                  {editingId === order.id && <td />}
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Orders