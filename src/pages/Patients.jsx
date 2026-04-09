import React, { useState, useEffect } from 'react'

const Patients = () => {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [deleteLoadingId, setDeleteLoadingId] = useState(null)
  const [showAddPassword, setShowAddPassword] = useState(false)
  const [showEditPassword, setShowEditPassword] = useState(false)

  const [newPatient, setNewPatient] = useState({
    userName: '',
    email: '',
    phoneNumber: '',
    address: '',
    password: ''
  })

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      setError('')
      const token = localStorage.getItem('authToken')
      if (!token) {
        setError('Authentication token not found. Please login again.')
        setLoading(false)
        return
      }

      const response = await fetch('http://165.22.91.187:5000/api/Admin/Patient', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication failed. Please login again.')
        } else {
          setError('Failed to fetch patients. Please try again.')
        }
        setLoading(false)
        return
      }

      const responseText = await response.text()
      let data
      try {
        data = JSON.parse(responseText)
      } catch {
        setError('Invalid response from server.')
        setLoading(false)
        return
      }

      const patientsList = Array.isArray(data) ? data : [data]
      const normalized = patientsList.map((p) => ({
        id: p.id || p.Id || p.userId || p.UserId || Math.random(),
        userName: p.userName || p.UserName || p.name || p.Name || '',
        email: p.email || p.Email || '',
        phoneNumber: p.phoneNumber || p.PhoneNumber || p.phone || p.Phone || '',
        address: p.address || p.Address || ''
      }))

      setPatients(normalized)
    } catch (err) {
      setError('Connection error. Please check your network and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this patient?')) return

    setDeleteLoadingId(id)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`http://165.22.91.187:5000/api/Admin/Patient/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok && response.status !== 204) {
        let responseData = {}
        try {
          const text = await response.text()
          if (text) responseData = JSON.parse(text)
        } catch {}
        setError(responseData.message || `Failed to delete patient. Status: ${response.status}`)
        setDeleteLoadingId(null)
        return
      }

      setPatients(patients.filter(patient => patient.id !== id))
      setSuccess('Patient deleted successfully!')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(`Connection error: ${err.message}`)
    } finally {
      setDeleteLoadingId(null)
    }
  }

  const handleEdit = (patient) => {
    setEditingId(patient.id)
    setEditForm({
      userName: patient.userName,
      email: patient.email,
      phoneNumber: patient.phoneNumber,
      address: patient.address,
      password: ''
    })
    setShowEditPassword(false)
    setError('')
    setSuccess('')
  }

  const handleSave = async () => {
    setEditLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('authToken')

      const requestData = {
        userName: editForm.userName?.trim(),
        email: editForm.email?.trim(),
        phoneNumber: editForm.phoneNumber?.trim() || '',
        address: editForm.address?.trim() || ''
      }

      // Only include password if user entered one
      if (editForm.password?.trim()) {
        requestData.password = editForm.password
      }

      const response = await fetch(`http://165.22.91.187:5000/api/Admin/Patient/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      })

      let responseData = {}
      try {
        const text = await response.text()
        if (text) responseData = JSON.parse(text)
      } catch {}

      if (!response.ok) {
        let errorMessage = responseData.message || responseData.error || `Server error: ${response.status}`
        if (responseData.errors) {
          errorMessage = Object.values(responseData.errors).flat().join(', ')
        }
        setError(`Failed to update patient: ${errorMessage}`)
        setEditLoading(false)
        return
      }

      setPatients(prev => prev.map(patient =>
        patient.id === editingId
          ? {
              ...patient,
              userName: editForm.userName,
              email: editForm.email,
              phoneNumber: editForm.phoneNumber,
              address: editForm.address
            }
          : patient
      ))
      setEditingId(null)
      setEditForm({})
      setShowEditPassword(false)
      setSuccess('Patient updated successfully!')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(`Connection error: ${err.message}`)
    } finally {
      setEditLoading(false)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditForm({})
    setShowEditPassword(false)
  }

  const handleInputChange = (field, value) => {
    setEditForm({ ...editForm, [field]: value })
  }

  const handleAddPatient = async () => {
    if (!newPatient.userName?.trim() || !newPatient.email?.trim() || !newPatient.password?.trim()) {
      setError('Username, Email and Password are required.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newPatient.email.trim())) {
      setError('Please enter a valid email address.')
      return
    }

    setAddLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('authToken')
      const requestData = {
        userName: newPatient.userName.trim(),
        email: newPatient.email.trim(),
        password: newPatient.password,
        phoneNumber: newPatient.phoneNumber?.trim() || '',
        address: newPatient.address?.trim() || ''
      }

      const response = await fetch('http://165.22.91.187:5000/api/Admin/Patient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      })

      let responseData = {}
      try {
        const text = await response.text()
        if (text) responseData = JSON.parse(text)
      } catch {}

      if (!response.ok) {
        let errorMessage = responseData.message || responseData.error || `Server error: ${response.status}`
        if (responseData.errors) {
          errorMessage = Object.values(responseData.errors).flat().join(', ')
        }
        setError(`Failed to add patient: ${errorMessage}`)
        setAddLoading(false)
        return
      }

      const newId = responseData.id || responseData.userId || Date.now()
      setPatients(prev => [...prev, {
        id: newId,
        userName: newPatient.userName,
        email: newPatient.email,
        phoneNumber: newPatient.phoneNumber,
        address: newPatient.address
      }])

      setNewPatient({ userName: '', email: '', phoneNumber: '', address: '', password: '' })
      setShowAddForm(false)
      setShowAddPassword(false)
      setSuccess('Patient added successfully!')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(`Connection error: ${err.message}`)
    } finally {
      setAddLoading(false)
    }
  }

  const handleCancelAdd = () => {
    setNewPatient({ userName: '', email: '', phoneNumber: '', address: '', password: '' })
    setShowAddForm(false)
    setShowAddPassword(false)
    setError('')
  }

  const handleNewPatientChange = (field, value) => {
    setNewPatient({ ...newPatient, [field]: value })
  }

  const filteredPatients = patients.filter(patient =>
    patient.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="page-content">
      <div className="section">
        <div className="section-header">
          <h3 className="section-title">All Patients</h3>
          <button
            className="btn btn-primary"
            onClick={() => { setShowAddForm(!showAddForm); setError(''); setSuccess(''); }}
          >
            {showAddForm ? 'Cancel' : '+ Add Patient'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ padding: '12px 16px', marginBottom: '16px', backgroundColor: '#ffebee', borderLeft: '4px solid #f44336', borderRadius: '4px', color: '#c62828', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚠️</span><span>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div style={{ padding: '12px 16px', marginBottom: '16px', backgroundColor: '#e8f5e9', borderLeft: '4px solid #4caf50', borderRadius: '4px', color: '#2e7d32', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>✅</span><span>{success}</span>
          </div>
        )}

        {/* Add Patient Form */}
        {showAddForm && (
          <div style={{ backgroundColor: 'var(--white)', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--gray-200)' }}>
            <h4 style={{ marginBottom: '16px', color: 'var(--gray-900)' }}>Add New Patient</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>

              {/* Username */}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Patient Name <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  value={newPatient.userName}
                  onChange={(e) => handleNewPatientChange('userName', e.target.value)}
                  className="form-input"
                  placeholder="Enter patient name"
                  style={{ width: '100%' }}
                />
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Email <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="email"
                  value={newPatient.email}
                  onChange={(e) => handleNewPatientChange('email', e.target.value)}
                  className="form-input"
                  placeholder="Enter email address"
                  style={{ width: '100%' }}
                />
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Password <span style={{ color: 'red' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showAddPassword ? 'text' : 'password'}
                    value={newPatient.password}
                    onChange={(e) => handleNewPatientChange('password', e.target.value)}
                    className="form-input"
                    placeholder="Enter password"
                    style={{ width: '100%', paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddPassword(!showAddPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--medium-gray)', padding: '0', display: 'flex', alignItems: 'center' }}
                  >
                    {showAddPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Phone</label>
                <input
                  type="tel"
                  value={newPatient.phoneNumber}
                  onChange={(e) => handleNewPatientChange('phoneNumber', e.target.value.replace(/\D/g, ''))}
                  className="form-input"
                  placeholder="Enter phone number (numbers only)"
                  style={{ width: '100%' }}
                />
              </div>

              {/* Address */}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Address</label>
                <input
                  type="text"
                  value={newPatient.address}
                  onChange={(e) => handleNewPatientChange('address', e.target.value)}
                  className="form-input"
                  placeholder="Enter address"
                  style={{ width: '100%' }}
                />
              </div>

            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button className="btn btn-primary" onClick={handleAddPatient} disabled={addLoading}>
                {addLoading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '14px', height: '14px', border: '2px solid #ffffff40', borderTop: '2px solid #ffffff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                    Adding...
                  </span>
                ) : 'Add Patient'}
              </button>
              <button className="btn btn-secondary" onClick={handleCancelAdd} disabled={addLoading}>Cancel</button>
            </div>
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
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--medium-gray)' }}>
            Loading patients...
          </div>
        ) : error && patients.length === 0 ? (
          <div style={{ padding: '12px 16px', backgroundColor: '#ffebee', borderLeft: '4px solid #f44336', borderRadius: '4px', color: '#c62828', fontSize: '14px' }}>
            ⚠️ {error}
            <button onClick={fetchPatients} style={{ marginLeft: '12px', padding: '4px 12px', border: '1px solid #c62828', borderRadius: '4px', background: 'transparent', color: '#c62828', cursor: 'pointer', fontSize: '12px' }}>
              Retry
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--medium-gray)' }}>
                      {searchTerm ? 'No patients match your search.' : 'No patients found.'}
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => (
                    <tr key={patient.id}>

                      {/* Patient Name */}
                      <td>
                        {editingId === patient.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(editForm.userName || patient.userName)}&background=FFC107&color=fff`}
                              alt={editForm.userName || patient.userName}
                              className="driver-avatar"
                            />
                            <input
                              type="text"
                              value={editForm.userName || ''}
                              onChange={(e) => handleInputChange('userName', e.target.value)}
                              className="form-input"
                              style={{ flex: 1, padding: '8px', border: '1px solid var(--gray-300)', borderRadius: '4px' }}
                            />
                          </div>
                        ) : (
                          <div className="driver-info">
                            <img
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(patient.userName)}&background=FFD700&color=fff`}
                              alt={patient.userName}
                              className="driver-avatar"
                            />
                            <span className="order-id">{patient.userName}</span>
                          </div>
                        )}
                      </td>

                      {/* Email */}
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

                      {/* Phone */}
                      <td>
                        {editingId === patient.id ? (
                          <input
                            type="tel"
                            value={editForm.phoneNumber || ''}
                            onChange={(e) => handleInputChange('phoneNumber', e.target.value.replace(/\D/g, ''))}
                            className="form-input"
                            placeholder="Numbers only"
                            style={{ width: '100%', padding: '8px', border: '1px solid var(--gray-300)', borderRadius: '4px' }}
                          />
                        ) : (
                          patient.phoneNumber || '—'
                        )}
                      </td>

                      {/* Address */}
                      <td>
                        {editingId === patient.id ? (
                          <input
                            type="text"
                            value={editForm.address || ''}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            className="form-input"
                            placeholder="Enter address"
                            style={{ width: '100%', padding: '8px', border: '1px solid var(--gray-300)', borderRadius: '4px' }}
                          />
                        ) : (
                          patient.address || '—'
                        )}
                      </td>

                      {/* Actions */}
                      <td>
                        {editingId === patient.id ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

                            {/* Optional password change toggle */}
                            <button
                              type="button"
                              onClick={() => {
                                setShowEditPassword(!showEditPassword)
                                if (showEditPassword) handleInputChange('password', '')
                              }}
                              style={{
                                padding: '5px 10px',
                                fontSize: '12px',
                                border: `1px solid ${showEditPassword ? 'var(--danger)' : 'var(--warning)'}`,
                                borderRadius: '6px',
                                background: 'transparent',
                                color: showEditPassword ? 'var(--danger)' : 'var(--gold-dark)',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {showEditPassword ? '✕ Cancel Password' : '🔑 Change Password'}
                            </button>

                            {/* Password input - only visible when toggled */}
                            {showEditPassword && (
                              <div style={{ position: 'relative' }}>
                                <input
                                  type={showEditPassword ? 'text' : 'password'}
                                  value={editForm.password || ''}
                                  onChange={(e) => handleInputChange('password', e.target.value)}
                                  className="form-input"
                                  placeholder="Enter new password"
                                  style={{ width: '100%', padding: '6px 36px 6px 8px', border: '1px solid var(--gray-300)', borderRadius: '4px', fontSize: '13px' }}
                                />
                              </div>
                            )}

                            {/* Save and Cancel buttons */}
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button className="action-btn" title="Save" onClick={handleSave} disabled={editLoading}>
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
                              <button className="action-btn delete-btn" title="Cancel" onClick={handleCancel} disabled={editLoading}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <line x1="18" y1="6" x2="6" y2="18"/>
                                  <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="action-btn" title="Edit" onClick={() => handleEdit(patient)}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            <button
                              className="action-btn delete-btn"
                              title="Delete"
                              onClick={() => handleDelete(patient.id)}
                              disabled={deleteLoadingId === patient.id}
                            >
                              {deleteLoadingId === patient.id ? (
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Patients