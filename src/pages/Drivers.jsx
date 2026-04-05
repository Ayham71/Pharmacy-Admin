import React, { useState } from 'react'

const Drivers = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [newDriver, setNewDriver] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active',
    deliveries: 0,
    rating: 1
  })
  const [drivers, setDrivers] = useState([
    { id: 1, name: 'Alex Rivera', email: 'alex.r@pharmos.com', phone: '+1 234 567 890', status: 'active', deliveries: 124, rating: 4.8 },
    { id: 2, name: 'Sarah Chen', email: 'sarah.c@pharmos.com', phone: '+1 234 567 891', status: 'active', deliveries: 98, rating: 4.9 },
    { id: 3, name: 'Mark Jenkins', email: 'mark.j@pharmos.com', phone: '+1 234 567 892', status: 'offline', deliveries: 156, rating: 4.7 },
    { id: 4, name: 'Jessica Wong', email: 'jessica.w@pharmos.com', phone: '+1 234 567 893', status: 'active', deliveries: 87, rating: 4.6 },
    { id: 5, name: 'David Miller', email: 'david.m@pharmos.com', phone: '+1 234 567 894', status: 'active', deliveries: 203, rating: 4.9 },
  ])

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      setDrivers(drivers.filter(driver => driver.id !== id))
    }
  }

  const handleEdit = (driver) => {
    setEditingId(driver.id)
    setEditForm({ ...driver })
  }

  const handleSave = () => {
    setDrivers(drivers.map(driver => 
      driver.id === editingId ? editForm : driver
    ))
    setEditingId(null)
    setEditForm({})
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleInputChange = (field, value) => {
    setEditForm({ ...editForm, [field]: value })
  }

  const handleAddDriver = () => {
    if (newDriver.name.trim() && newDriver.email.trim() && newDriver.phone.trim()) {
      const driver = {
        ...newDriver,
        id: Math.max(...drivers.map(d => d.id)) + 1
      }
      setDrivers([...drivers, driver])
      setNewDriver({
        name: '',
        email: '',
        phone: '',
        status: 'active',
        deliveries: 0,
        rating: 1
      })
      setShowAddForm(false)
    } else {
      alert('Please fill in the driver name, email, and phone.')
    }
  }

  const handleCancelAdd = () => {
    setNewDriver({
      name: '',
      email: '',
      phone: '',
      status: 'active',
      deliveries: 0,
      rating: 1
    })
    setShowAddForm(false)
  }

  const handleNewDriverChange = (field, value) => {
    setNewDriver({ ...newDriver, [field]: value })
  }

  const filteredDrivers = drivers.filter(driver => 
    driver.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="page-content">
      <div className="section">
        <div className="section-header">
          <h3 className="section-title">All Drivers</h3>
          <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Cancel' : '+ Add Driver'}
          </button>
        </div>

        {showAddForm && (
          <div style={{ 
            backgroundColor: 'var(--white)', 
            padding: '20px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            border: '1px solid var(--gray-200)'
          }}>
            <h4 style={{ marginBottom: '16px', color: 'var(--gray-900)' }}>Add New Driver</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Driver Name *</label>
                <input
                  type="text"
                  value={newDriver.name}
                  onChange={(e) => handleNewDriverChange('name', e.target.value)}
                  className="form-input"
                  placeholder="Enter driver name"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Email *</label>
                <input
                  type="email"
                  value={newDriver.email}
                  onChange={(e) => handleNewDriverChange('email', e.target.value)}
                  className="form-input"
                  placeholder="Enter email address"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Phone *</label>
                <input
                  type="tel"
                  value={newDriver.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                    handleNewDriverChange('phone', value);
                  }}
                  className="form-input"
                  placeholder="Enter phone number"
                  pattern="[0-9]*"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button className="btn btn-primary" onClick={handleAddDriver}>
                Add Driver
              </button>
              <button className="btn btn-secondary" onClick={handleCancelAdd}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="table-controls">
          <div className="search-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input 
              type="text" 
              placeholder="Search drivers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Driver</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Deliveries</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.map((driver) => (
                <tr key={driver.id}>
                  <td>
                    {editingId === driver.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img 
                          src={`https://ui-avatars.com/api/?name=${editForm.name?.replace(' ', '+') || driver.name.replace(' ', '+')}&background=FFD700&color=fff`} 
                          alt={editForm.name || driver.name} 
                          className="driver-avatar" 
                        />
                        <input
                          type="text"
                          value={editForm.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="form-input"
                          style={{ flex: 1, padding: '8px', border: '1px solid var(--gray-300)', borderRadius: '4px' }}
                        />
                      </div>
                    ) : (
                      <div className="driver-info">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${driver.name.replace(' ', '+')}&background=FFD700&color=fff`} 
                          alt={driver.name} 
                          className="driver-avatar" 
                        />
                        <span className="order-id">{driver.name}</span>
                      </div>
                    )}
                  </td>
                  <td>
                    {editingId === driver.id ? (
                      <input
                        type="email"
                        value={editForm.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="form-input"
                        style={{ width: '100%', padding: '8px', border: '1px solid var(--gray-300)', borderRadius: '4px' }}
                      />
                    ) : (
                      driver.email
                    )}
                  </td>
                  <td>
                    {editingId === driver.id ? (
                      <input
                        type="tel"
                        value={editForm.phone || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                          handleInputChange('phone', value);
                        }}
                        className="form-input"
                        placeholder="Numbers only"
                        pattern="[0-9]*"
                        style={{ width: '100%', padding: '8px', border: '1px solid var(--gray-300)', borderRadius: '4px' }}
                      />
                    ) : (
                      driver.phone
                    )}
                  </td>
                  <td>
                    {editingId === driver.id ? (
                      <select
                        value={editForm.status || ''}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        style={{ width: '100%', padding: '8px', border: '1px solid var(--gray-300)', borderRadius: '4px' }}
                      >
                        <option value="active">Active</option>
                        <option value="offline">Offline</option>
                      </select>
                    ) : (
                      <span className={`status-badge ${driver.status}`}>
                        {driver.status}
                      </span>
                    )}
                  </td>
                  <td>
                    {editingId === driver.id ? (
                      <input
                        type="number"
                        value={editForm.deliveries || ''}
                        onChange={(e) => handleInputChange('deliveries', parseInt(e.target.value) || 0)}
                        className="form-input"
                        style={{ width: '100%', padding: '8px', border: '1px solid var(--gray-300)', borderRadius: '4px' }}
                      />
                    ) : (
                      driver.deliveries
                    )}
                  </td>
                  <td>
                    {editingId === driver.id ? (
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={editForm.rating || ''}
                        onChange={(e) => handleInputChange('rating', parseFloat(e.target.value) || 0)}
                        className="form-input"
                        style={{ width: '100%', padding: '8px', border: '1px solid var(--gray-300)', borderRadius: '4px' }}
                      />
                    ) : (
                      <span style={{ color: '#FFD700', fontWeight: '600' }}>
                        {'★'.repeat(Math.floor(driver.rating))} {driver.rating}
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {editingId === driver.id ? (
                        <>
                          <button className="action-btn" title="Save" onClick={handleSave}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                              <polyline points="17 21 17 13 7 13 7 21"/>
                              <polyline points="7 3 7 8 15 8"/>
                            </svg>
                          </button>
                          <button className="action-btn delete-btn" title="Cancel" onClick={handleCancel}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18"/>
                              <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="action-btn" title="Edit" onClick={() => handleEdit(driver)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button className="action-btn delete-btn" title="Delete" onClick={() => handleDelete(driver.id)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                              <line x1="10" y1="11" x2="10" y2="17"/>
                              <line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Drivers