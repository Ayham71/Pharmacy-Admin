import React, { useState } from 'react'

const Patients = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [newPatient, setNewPatient] = useState({
    name: '',
    birthYear: '',
    email: '',
    phone: '',
    orders: 0,
    lastOrder: new Date().toISOString().split('T')[0] // Current date
  })
  const [patients, setPatients] = useState([
    { id: 1, name: 'John Smith', age: 45, email: 'john.s@email.com', phone: '+1 234 567 100', orders: 12, lastOrder: '2024-01-15' },
    { id: 2, name: 'Emma Johnson', age: 32, email: 'emma.j@email.com', phone: '+1 234 567 101', orders: 8, lastOrder: '2024-01-14' },
    { id: 3, name: 'Michael Brown', age: 58, email: 'michael.b@email.com', phone: '+1 234 567 102', orders: 24, lastOrder: '2024-01-13' },
    { id: 4, name: 'Sarah Davis', age: 29, email: 'sarah.d@email.com', phone: '+1 234 567 103', orders: 5, lastOrder: '2024-01-12' },
    { id: 5, name: 'Robert Wilson', age: 67, email: 'robert.w@email.com', phone: '+1 234 567 104', orders: 18, lastOrder: '2024-01-11' },
  ])

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      setPatients(patients.filter(patient => patient.id !== id))
    }
  }

  const handleEdit = (patient) => {
    setEditingId(patient.id)
    setEditForm({ ...patient })
  }

  const handleSave = () => {
    setPatients(patients.map(patient => 
      patient.id === editingId ? editForm : patient
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

  const calculateAge = (birthYear) => {
    const currentYear = new Date().getFullYear()
    return currentYear - parseInt(birthYear)
  }

  const handleAddPatient = () => {
    if (newPatient.name.trim() && newPatient.email.trim() && newPatient.phone.trim() && newPatient.birthYear) {
      const age = calculateAge(newPatient.birthYear)
      const patient = {
        ...newPatient,
        age: age,
        id: Math.max(...patients.map(p => p.id)) + 1
      }
      setPatients([...patients, patient])
      setNewPatient({
        name: '',
        birthYear: '',
        email: '',
        phone: '',
        orders: 0,
        lastOrder: new Date().toISOString().split('T')[0]
      })
      setShowAddForm(false)
    } else {
      alert('Please fill in all required fields.')
    }
  }

  const handleCancelAdd = () => {
    setNewPatient({
      name: '',
      birthYear: '',
      email: '',
      phone: '',
      orders: 0,
      lastOrder: new Date().toISOString().split('T')[0]
    })
    setShowAddForm(false)
  }

  const handleNewPatientChange = (field, value) => {
    setNewPatient({ ...newPatient, [field]: value })
  }

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="page-content">
      <div className="section">
        <div className="section-header">
          <h3 className="section-title">All Patients</h3>
          <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Cancel' : '+ Add Patient'}
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
            <h4 style={{ marginBottom: '16px', color: 'var(--gray-900)' }}>Add New Patient</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Patient Name *</label>
                <input
                  type="text"
                  value={newPatient.name}
                  onChange={(e) => handleNewPatientChange('name', e.target.value)}
                  className="form-input"
                  placeholder="Enter patient name"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Year of Birth *</label>
                <input
                  type="number"
                  value={newPatient.birthYear}
                  onChange={(e) => handleNewPatientChange('birthYear', e.target.value)}
                  className="form-input"
                  placeholder="e.g. 1990"
                  min="1900"
                  max={new Date().getFullYear()}
                  style={{ width: '100%' }}
                />
                {newPatient.birthYear && (
                  <small style={{ color: 'var(--gray-600)', display: 'block', marginTop: '4px' }}>
                    Age will be: {calculateAge(newPatient.birthYear)} years old
                  </small>
                )}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Email *</label>
                <input
                  type="email"
                  value={newPatient.email}
                  onChange={(e) => handleNewPatientChange('email', e.target.value)}
                  className="form-input"
                  placeholder="Enter email address"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Phone *</label>
                <input
                  type="tel"
                  value={newPatient.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                    handleNewPatientChange('phone', value);
                  }}
                  className="form-input"
                  placeholder="Enter phone number (numbers only)"
                  pattern="[0-9]*"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button className="btn btn-primary" onClick={handleAddPatient}>
                Add Patient
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
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Age</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Total Orders</th>
                <th>Last Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.id}>
                  <td>
                    {editingId === patient.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img 
                          src={`https://ui-avatars.com/api/?name=${editForm.name?.replace(' ', '+') || patient.name.replace(' ', '+')}&background=FFD700&color=fff`} 
                          alt={editForm.name || patient.name} 
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
                          src={`https://ui-avatars.com/api/?name=${patient.name.replace(' ', '+')}&background=FFD700&color=fff`} 
                          alt={patient.name} 
                          className="driver-avatar" 
                        />
                        <span className="order-id">{patient.name}</span>
                      </div>
                    )}
                  </td>
                  <td>
                    {editingId === patient.id ? (
                      <input
                        type="number"
                        value={editForm.age || ''}
                        onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                        className="form-input"
                        min="0"
                        max="150"
                        style={{ width: '100%', padding: '8px', border: '1px solid var(--gray-300)', borderRadius: '4px' }}
                      />
                    ) : (
                      patient.age
                    )}
                  </td>
                  <td>
                    {editingId === patient.id ? (
                      <input
                        type="email"
                        value={editForm.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="form-input"
                        style={{ width: '100%', padding: '8px', border: '1px solid var(--gray-300)', borderRadius: '4px' }}
                      />
                    ) : (
                      patient.email
                    )}
                  </td>
                  <td>
                    {editingId === patient.id ? (
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
                      patient.phone
                    )}
                  </td>
                  <td>
                    {editingId === patient.id ? (
                      <input
                        type="number"
                        value={editForm.orders || ''}
                        onChange={(e) => handleInputChange('orders', parseInt(e.target.value) || 0)}
                        className="form-input"
                        min="0"
                        style={{ width: '100%', padding: '8px', border: '1px solid var(--gray-300)', borderRadius: '4px' }}
                      />
                    ) : (
                      patient.orders
                    )}
                  </td>
                  <td>
                    {editingId === patient.id ? (
                      <input
                        type="date"
                        value={editForm.lastOrder || ''}
                        onChange={(e) => handleInputChange('lastOrder', e.target.value)}
                        className="form-input"
                        style={{ width: '100%', padding: '8px', border: '1px solid var(--gray-300)', borderRadius: '4px' }}
                      />
                    ) : (
                      patient.lastOrder
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {editingId === patient.id ? (
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
                          <button className="action-btn" title="Edit" onClick={() => handleEdit(patient)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button className="action-btn delete-btn" title="Delete" onClick={() => handleDelete(patient.id)}>
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

export default Patients