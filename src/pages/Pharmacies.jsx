import React, { useState } from 'react'

const Pharmacies = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [newPharmacy, setNewPharmacy] = useState({
    name: '',
    location: '',
    status: 'active',
    orders: 0,
    revenue: '$0.00'
  })
  const [pharmacies, setPharmacies] = useState([
    { id: 1, name: 'Green Valley Meds', location: 'Downtown', status: 'active', orders: 1240, revenue: '$45,200' },
    { id: 2, name: 'Central Health Hub', location: 'Midtown', status: 'active', orders: 890, revenue: '$32,100' },
    { id: 3, name: 'Sunset Pharmacy', location: 'Westside', status: 'inactive', orders: 450, revenue: '$15,600' },
    { id: 4, name: 'Apex Pharma Care', location: 'Eastside', status: 'active', orders: 1560, revenue: '$58,400' },
    { id: 5, name: 'MedPlus Express', location: 'Northside', status: 'active', orders: 780, revenue: '$28,900' },
  ])

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this pharmacy?')) {
      setPharmacies(pharmacies.filter(pharmacy => pharmacy.id !== id))
    }
  }

  const handleEdit = (pharmacy) => {
    setEditingId(pharmacy.id)
    setEditForm({ ...pharmacy })
  }

  const handleSave = () => {
    setPharmacies(pharmacies.map(pharmacy => 
      pharmacy.id === editingId ? editForm : pharmacy
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

  const handleAddPharmacy = () => {
    if (newPharmacy.name.trim() && newPharmacy.location.trim()) {
      const pharmacy = {
        ...newPharmacy,
        id: Math.max(...pharmacies.map(p => p.id)) + 1,
        orders: parseInt(newPharmacy.orders) || 0
      }
      setPharmacies([...pharmacies, pharmacy])
      setNewPharmacy({
        name: '',
        location: '',
        status: 'active',
        orders: 0,
        revenue: ''
      })
      setShowAddForm(false)
    } else {
      alert('Please fill in at least the pharmacy name and location.')
    }
  }

  const handleCancelAdd = () => {
    setNewPharmacy({
      name: '',
      location: '',
      status: 'active',
      orders: 0,
      revenue: '$0.00'
    })
    setShowAddForm(false)
  }

  const handleNewPharmacyChange = (field, value) => {
    setNewPharmacy({ ...newPharmacy, [field]: value })
  }

  const filteredPharmacies = pharmacies.filter(pharmacy => 
    pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="page-content">
      <div className="section">
        <div className="section-header">
          <h3 className="section-title">All Pharmacies</h3>
          <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Cancel' : '+ Add Pharmacy'}
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
            <h4 style={{ marginBottom: '16px', color: 'var(--gray-900)' }}>Add New Pharmacy</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Pharmacy Name *</label>
                <input
                  type="text"
                  value={newPharmacy.name}
                  onChange={(e) => handleNewPharmacyChange('name', e.target.value)}
                  className="form-input"
                  placeholder="Enter pharmacy name"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Location *</label>
                <input
                  type="text"
                  value={newPharmacy.location}
                  onChange={(e) => handleNewPharmacyChange('location', e.target.value)}
                  className="form-input"
                  placeholder="Enter location"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button className="btn btn-primary" onClick={handleAddPharmacy}>
                Add Pharmacy
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
              placeholder="Search pharmacies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Pharmacy Name</th>
                <th>Location</th>
                <th>Total Orders</th>
                <th>Revenue</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPharmacies.map((pharmacy) => (
                <tr key={pharmacy.id}>
                  <td className="order-id">
                    {editingId === pharmacy.id ? (
                      <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="form-input"
                        style={{ width: '100%', padding: '8px', border: '1px solid var(--gray-300)', borderRadius: '4px' }}
                      />
                    ) : (
                      pharmacy.name
                    )}
                  </td>
                  <td>
                    {editingId === pharmacy.id ? (
                      <input
                        type="text"
                        value={editForm.location || ''}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="form-input"
                        style={{ width: '100%', padding: '8px', border: '1px solid var(--gray-300)', borderRadius: '4px' }}
                      />
                    ) : (
                      pharmacy.location
                    )}
                  </td>
                  <td>
                    {editingId === pharmacy.id ? (
                      <input
                        type="number"
                        value={editForm.orders || ''}
                        onChange={(e) => handleInputChange('orders', parseInt(e.target.value) || 0)}
                        className="form-input"
                        style={{ width: '100%', padding: '8px', border: '1px solid var(--gray-300)', borderRadius: '4px' }}
                      />
                    ) : (
                      pharmacy.orders
                    )}
                  </td>
                  <td className="value-cell">
                    {editingId === pharmacy.id ? (
                      <input
                        type="text"
                        value={editForm.revenue || ''}
                        onChange={(e) => handleInputChange('revenue', e.target.value)}
                        className="form-input"
                        style={{ width: '100%', padding: '8px', border: '1px solid var(--gray-300)', borderRadius: '4px' }}
                      />
                    ) : (
                      pharmacy.revenue
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {editingId === pharmacy.id ? (
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
                          <button className="action-btn" title="Edit" onClick={() => handleEdit(pharmacy)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button className="action-btn delete-btn" title="Delete" onClick={() => handleDelete(pharmacy.id)}>
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

export default Pharmacies