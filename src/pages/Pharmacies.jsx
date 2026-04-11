import React, { useState, useEffect } from 'react'

const BASE_URL = 'http://165.22.91.187:5000/api/Admin/Pharmacy'

const Pharmacies = () => {
  const [pharmacies, setPharmacies] = useState([])
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

  const [newPharmacy, setNewPharmacy] = useState({
    pharmacyName: '',
    userName: '',
    email: '',
    phoneNumber: '',
    password: '',
    address: '',
    latitude: '',
    longitude: '',
    isActive: true
  })

  useEffect(() => {
    fetchPharmacies()
  }, [])

  const fetchPharmacies = async () => {
    try {
      setLoading(true)
      setError('')
      const token = localStorage.getItem('authToken')
      if (!token) {
        setError('Authentication token not found. Please login again.')
        setLoading(false)
        return
      }

      const response = await fetch(BASE_URL, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication failed. Please login again.')
        } else {
          setError(`Failed to fetch pharmacies. Status: ${response.status}`)
        }
        setLoading(false)
        return
      }

      const responseText = await response.text()
      console.log('Pharmacy GET raw response:', responseText)

      let data
      try {
        data = JSON.parse(responseText)
      } catch {
        setError('Invalid response from server.')
        setLoading(false)
        return
      }

      const pharmaciesList = Array.isArray(data) ? data : [data]
      console.log('First pharmacy object keys:', Object.keys(pharmaciesList[0] || {}))
      console.log('First pharmacy object:', pharmaciesList[0])

      const normalized = pharmaciesList.map((p) => ({
        id:           p.id           || p.Id           || p.userId      || p.UserId      || Math.random(),
        pharmacyName: p.pharmacyName || p.PharmacyName || p.name        || p.Name        || '',
        userName:     p.userName     || p.UserName     || '',
        email:        p.email        || p.Email        || '',
        phoneNumber:  p.phoneNumber  || p.PhoneNumber  || p.phone       || p.Phone       || '',
        address:      p.address      || p.Address      || p.location    || p.Location    || '',
        latitude:     p.latitude     || p.Latitude     || '',
        longitude:    p.longitude    || p.Longitude    || '',
        isActive:
          p.isActive  !== undefined ? p.isActive  :
          p.IsActive  !== undefined ? p.IsActive  : true,
      }))

      setPharmacies(normalized)
    } catch (err) {
      setError('Connection error. Please check your network and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this pharmacy?')) return
    setDeleteLoadingId(id)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok && response.status !== 204) {
        let responseData = {}
        try { const text = await response.text(); if (text) responseData = JSON.parse(text) } catch {}
        setError(responseData.message || `Failed to delete pharmacy. Status: ${response.status}`)
        setDeleteLoadingId(null)
        return
      }

      setPharmacies(prev => prev.filter(p => p.id !== id))
      setSuccess('Pharmacy deleted successfully!')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(`Connection error: ${err.message}`)
    } finally {
      setDeleteLoadingId(null)
    }
  }

  const handleEdit = (pharmacy) => {
    setEditingId(pharmacy.id)
    setEditForm({ ...pharmacy, password: '' })
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
        pharmacyName: editForm.pharmacyName?.trim() || '',
        userName:     editForm.userName?.trim(),
        email:        editForm.email?.trim(),
        phoneNumber:  editForm.phoneNumber?.trim() || '',
        address:      editForm.address?.trim()     || '',
        isActive:     editForm.isActive,
        latitude:     editForm.latitude  ? parseFloat(editForm.latitude)  : 0,
        longitude:    editForm.longitude ? parseFloat(editForm.longitude) : 0,
      }
      if (editForm.password?.trim()) requestData.password = editForm.password

      const response = await fetch(`${BASE_URL}/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      })

      const responseText = await response.text()
      let responseData = {}
      try { if (responseText) responseData = JSON.parse(responseText) } catch {}

      if (!response.ok && response.status !== 204) {
        let errorMessage = responseData.message || responseData.error || `Server error: ${response.status}`
        if (responseData.errors) errorMessage = Object.values(responseData.errors).flat().join(', ')
        setError(`Failed to update pharmacy: ${errorMessage}`)
        setEditLoading(false)
        return
      }

      setPharmacies(prev => prev.map(p =>
        p.id === editingId ? {
          ...p,
          pharmacyName: editForm.pharmacyName,
          userName:     editForm.userName,
          email:        editForm.email,
          phoneNumber:  editForm.phoneNumber,
          address:      editForm.address,
          isActive:     editForm.isActive,
          latitude:     editForm.latitude,
          longitude:    editForm.longitude,
        } : p
      ))
      setEditingId(null)
      setEditForm({})
      setShowEditPassword(false)
      setSuccess('Pharmacy updated successfully!')
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

  const handleAddPharmacy = async () => {
    if (!newPharmacy.pharmacyName?.trim()) { setError('Pharmacy name is required.'); return }
    if (!newPharmacy.userName?.trim())     { setError('Username is required.');       return }
    if (!newPharmacy.email?.trim())        { setError('Email is required.');           return }
    if (!newPharmacy.password?.trim())     { setError('Password is required.');        return }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newPharmacy.email.trim())) {
      setError('Please enter a valid email address.')
      return
    }

    setAddLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('authToken')
      const requestData = {
        pharmacyName: newPharmacy.pharmacyName.trim(),
        userName:     newPharmacy.userName.trim(),
        email:        newPharmacy.email.trim(),
        password:     newPharmacy.password,
        phoneNumber:  newPharmacy.phoneNumber?.trim() || '',
        address:      newPharmacy.address?.trim()     || '',
        isActive:     newPharmacy.isActive,
        latitude:     newPharmacy.latitude  ? parseFloat(newPharmacy.latitude)  : 0,
        longitude:    newPharmacy.longitude ? parseFloat(newPharmacy.longitude) : 0,
      }

      console.log('POST pharmacy data:', { ...requestData, password: '[HIDDEN]' })

      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      })

      const responseText = await response.text()
      console.log('POST response status:', response.status)
      console.log('POST response body:', responseText)

      let responseData = {}
      try { if (responseText) responseData = JSON.parse(responseText) } catch {}

      if (!response.ok) {
        const deepError =
          responseData?.innerException?.innerException?.message ||
          responseData?.innerException?.message                 ||
          responseData?.InnerException?.Message                 ||
          responseData?.message                                 ||
          responseData?.Message                                 ||
          responseData?.error                                   ||
          responseText                                          ||
          `Server error: ${response.status}`

        if (responseData.errors) {
          setError(Object.values(responseData.errors).flat().join(', '))
        } else {
          setError(`Failed to add pharmacy: ${deepError}`)
        }
        setAddLoading(false)
        return
      }

      const newId = responseData.id || responseData.userId || Date.now()
      setPharmacies(prev => [...prev, {
        id:           newId,
        pharmacyName: newPharmacy.pharmacyName,
        userName:     newPharmacy.userName,
        email:        newPharmacy.email,
        phoneNumber:  newPharmacy.phoneNumber,
        address:      newPharmacy.address,
        isActive:     newPharmacy.isActive,
        latitude:     newPharmacy.latitude,
        longitude:    newPharmacy.longitude,
      }])

      setNewPharmacy({
        pharmacyName: '', userName: '', email: '', phoneNumber: '',
        password: '', address: '', latitude: '', longitude: '', isActive: true
      })
      setShowAddForm(false)
      setShowAddPassword(false)
      setSuccess('Pharmacy added successfully!')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(`Connection error: ${err.message}`)
    } finally {
      setAddLoading(false)
    }
  }

  const handleCancelAdd = () => {
    setNewPharmacy({
      pharmacyName: '', userName: '', email: '', phoneNumber: '',
      password: '', address: '', latitude: '', longitude: '', isActive: true
    })
    setShowAddForm(false)
    setShowAddPassword(false)
    setError('')
  }

  const filteredPharmacies = pharmacies.filter(pharmacy =>
    pharmacy.pharmacyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pharmacy.userName?.toLowerCase().includes(searchTerm.toLowerCase())     ||
    pharmacy.email?.toLowerCase().includes(searchTerm.toLowerCase())        ||
    pharmacy.address?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const inputStyle = {
    width: '100%',
    padding: '8px',
    border: '1px solid var(--gray-300)',
    borderRadius: '4px'
  }

  return (
    <div className="page-content">
      <div className="section">
        <div className="section-header">
          <h3 className="section-title">All Pharmacies</h3>
          <button
            className="btn btn-primary"
            onClick={() => { setShowAddForm(!showAddForm); setError(''); setSuccess('') }}
          >
            {showAddForm ? 'Cancel' : '+ Add Pharmacy'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: '12px 16px', marginBottom: '16px', backgroundColor: '#ffebee', borderLeft: '4px solid #f44336', borderRadius: '4px', color: '#c62828', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚠️</span><span>{error}</span>
          </div>
        )}

        {/* Success */}
        {success && (
          <div style={{ padding: '12px 16px', marginBottom: '16px', backgroundColor: '#e8f5e9', borderLeft: '4px solid #4caf50', borderRadius: '4px', color: '#2e7d32', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>✅</span><span>{success}</span>
          </div>
        )}

        {/* Add Pharmacy Form */}
        {showAddForm && (
          <div style={{ backgroundColor: 'var(--white)', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--gray-200)' }}>
            <h4 style={{ marginBottom: '16px', color: 'var(--gray-900)' }}>Add New Pharmacy</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>

              {/* Pharmacy Name */}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Pharmacy Name <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  value={newPharmacy.pharmacyName}
                  onChange={(e) => setNewPharmacy({ ...newPharmacy, pharmacyName: e.target.value })}
                  className="form-input"
                  placeholder="Enter pharmacy name"
                  style={{ width: '100%' }}
                />
              </div>

              {/* Username */}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Username <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  value={newPharmacy.userName}
                  onChange={(e) => setNewPharmacy({ ...newPharmacy, userName: e.target.value })}
                  className="form-input"
                  placeholder="Enter login username"
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
                  value={newPharmacy.email}
                  onChange={(e) => setNewPharmacy({ ...newPharmacy, email: e.target.value })}
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
                    value={newPharmacy.password}
                    onChange={(e) => setNewPharmacy({ ...newPharmacy, password: e.target.value })}
                    className="form-input"
                    placeholder="Enter password"
                    style={{ width: '100%', paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddPassword(!showAddPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--medium-gray)', display: 'flex', alignItems: 'center' }}
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
                  value={newPharmacy.phoneNumber}
                  onChange={(e) => setNewPharmacy({ ...newPharmacy, phoneNumber: e.target.value.replace(/\D/g, '') })}
                  className="form-input"
                  placeholder="Numbers only"
                  style={{ width: '100%' }}
                />
              </div>

              {/* Address */}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Address</label>
                <input
                  type="text"
                  value={newPharmacy.address}
                  onChange={(e) => setNewPharmacy({ ...newPharmacy, address: e.target.value })}
                  className="form-input"
                  placeholder="Enter address"
                  style={{ width: '100%' }}
                />
              </div>

              {/* Status */}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Status</label>
                <select
                  value={newPharmacy.isActive ? 'active' : 'inactive'}
                  onChange={(e) => setNewPharmacy({ ...newPharmacy, isActive: e.target.value === 'active' })}
                  className="form-input"
                  style={{ width: '100%' }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Latitude */}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={newPharmacy.latitude}
                  onChange={(e) => setNewPharmacy({ ...newPharmacy, latitude: e.target.value })}
                  className="form-input"
                  placeholder="e.g. 31.9539"
                  style={{ width: '100%' }}
                />
              </div>

              {/* Longitude */}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={newPharmacy.longitude}
                  onChange={(e) => setNewPharmacy({ ...newPharmacy, longitude: e.target.value })}
                  className="form-input"
                  placeholder="e.g. 35.9106"
                  style={{ width: '100%' }}
                />
              </div>

            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button className="btn btn-primary" onClick={handleAddPharmacy} disabled={addLoading}>
                {addLoading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '14px', height: '14px', border: '2px solid #ffffff40', borderTop: '2px solid #ffffff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                    Adding...
                  </span>
                ) : 'Add Pharmacy'}
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
              placeholder="Search pharmacies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--medium-gray)' }}>
            Loading pharmacies...
          </div>
        ) : error && pharmacies.length === 0 ? (
          <div style={{ padding: '12px 16px', backgroundColor: '#ffebee', borderLeft: '4px solid #f44336', borderRadius: '4px', color: '#c62828', fontSize: '14px' }}>
            ⚠️ {error}
            <button onClick={fetchPharmacies} style={{ marginLeft: '12px', padding: '4px 12px', border: '1px solid #c62828', borderRadius: '4px', background: 'transparent', color: '#c62828', cursor: 'pointer', fontSize: '12px' }}>
              Retry
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Pharmacy Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPharmacies.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--medium-gray)' }}>
                      {searchTerm ? 'No pharmacies match your search.' : 'No pharmacies found.'}
                    </td>
                  </tr>
                ) : (
                  filteredPharmacies.map((pharmacy) => (
                    <tr key={pharmacy.id}>

                      {/* Pharmacy Name */}
                      <td>
                        {editingId === pharmacy.id ? (
                          <input
                            type="text"
                            value={editForm.pharmacyName || ''}
                            onChange={(e) => handleInputChange('pharmacyName', e.target.value)}
                            className="form-input"
                            placeholder="Pharmacy name"
                            style={inputStyle}
                          />
                        ) : (
                          <div className="driver-info">
                            <img
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(pharmacy.pharmacyName || pharmacy.userName || 'P')}&background=FFD700&color=fff`}
                              alt={pharmacy.pharmacyName || pharmacy.userName}
                              className="driver-avatar"
                            />
                            <span className="order-id">{pharmacy.pharmacyName || '—'}</span>
                          </div>
                        )}
                      </td>

                      {/* Username */}
                      <td>
                        {editingId === pharmacy.id ? (
                          <input
                            type="text"
                            value={editForm.userName || ''}
                            onChange={(e) => handleInputChange('userName', e.target.value)}
                            className="form-input"
                            placeholder="Login username"
                            style={inputStyle}
                          />
                        ) : (
                          <span style={{ fontSize: '13px', color: 'var(--medium-gray)', fontFamily: 'monospace' }}>
                            @{pharmacy.userName || '—'}
                          </span>
                        )}
                      </td>

                      {/* Email */}
                      <td>
                        {editingId === pharmacy.id ? (
                          <input
                            type="email"
                            value={editForm.email || ''}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="form-input"
                            style={inputStyle}
                          />
                        ) : pharmacy.email || '—'}
                      </td>

                      {/* Phone */}
                      <td>
                        {editingId === pharmacy.id ? (
                          <input
                            type="tel"
                            value={editForm.phoneNumber || ''}
                            onChange={(e) => handleInputChange('phoneNumber', e.target.value.replace(/\D/g, ''))}
                            className="form-input"
                            placeholder="Numbers only"
                            style={inputStyle}
                          />
                        ) : pharmacy.phoneNumber || '—'}
                      </td>

                      {/* Address */}
                      <td>
                        {editingId === pharmacy.id ? (
                          <input
                            type="text"
                            value={editForm.address || ''}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            className="form-input"
                            style={inputStyle}
                          />
                        ) : pharmacy.address || '—'}
                      </td>

                      {/* Location */}
                      <td>
                        {editingId === pharmacy.id ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <input
                              type="number"
                              step="any"
                              value={editForm.latitude || ''}
                              onChange={(e) => handleInputChange('latitude', e.target.value)}
                              className="form-input"
                              placeholder="Latitude"
                              style={inputStyle}
                            />
                            <input
                              type="number"
                              step="any"
                              value={editForm.longitude || ''}
                              onChange={(e) => handleInputChange('longitude', e.target.value)}
                              className="form-input"
                              placeholder="Longitude"
                              style={inputStyle}
                            />
                          </div>
                        ) : (
                          pharmacy.latitude && pharmacy.longitude ? (
                            <span style={{ fontSize: '12px', color: 'var(--medium-gray)' }}>
                              {parseFloat(pharmacy.latitude).toFixed(4)}, {parseFloat(pharmacy.longitude).toFixed(4)}
                            </span>
                          ) : '—'
                        )}
                      </td>

                      {/* Status */}
                      <td>
                        {editingId === pharmacy.id ? (
                          <select
                            value={editForm.isActive ? 'active' : 'inactive'}
                            onChange={(e) => handleInputChange('isActive', e.target.value === 'active')}
                            style={inputStyle}
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        ) : (
                          <span className={`status-badge ${pharmacy.isActive ? 'active' : 'offline'}`}>
                            {pharmacy.isActive ? 'Active' : 'Inactive'}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td>
                        {editingId === pharmacy.id ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => { setShowEditPassword(!showEditPassword); if (showEditPassword) handleInputChange('password', '') }}
                              style={{ padding: '5px 10px', fontSize: '12px', border: `1px solid ${showEditPassword ? '#f44336' : '#2196f3'}`, borderRadius: '6px', background: 'transparent', color: showEditPassword ? '#f44336' : '#2196f3', cursor: 'pointer', whiteSpace: 'nowrap' }}
                            >
                              {showEditPassword ? '✕ Cancel Password' : '🔑 Change Password'}
                            </button>
                            {showEditPassword && (
                              <input
                                type="text"
                                value={editForm.password || ''}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                className="form-input"
                                placeholder="New password"
                                style={{ ...inputStyle, fontSize: '13px' }}
                              />
                            )}
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
                            <button className="action-btn" title="Edit" onClick={() => handleEdit(pharmacy)}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            <button
                              className="action-btn delete-btn"
                              title="Delete"
                              onClick={() => handleDelete(pharmacy.id)}
                              disabled={deleteLoadingId === pharmacy.id}
                            >
                              {deleteLoadingId === pharmacy.id ? (
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

export default Pharmacies