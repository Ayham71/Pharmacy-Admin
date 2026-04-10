import React, { useState, useEffect } from 'react'

const BASE_URL = 'http://165.22.91.187:5000/api/Admin/Delivery'

const Drivers = () => {
  const [drivers, setDrivers] = useState([])
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

  const [newDriver, setNewDriver] = useState({
    userName: '',
    email: '',
    phoneNumber: '',
    age: '',
    password: '',
    isActive: true,
    latitude: '',
    longitude: '',
    vehicleType: '',
    vehicleNumber: ''
  })

  useEffect(() => {
    fetchDrivers()
  }, [])

  const fetchDrivers = async () => {
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
          setError(`Failed to fetch drivers. Status: ${response.status}`)
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

      console.log('Drivers API response:', data)

      const driversList = Array.isArray(data) ? data : [data]
      const normalized = driversList.map((d) => ({
        id:            d.id            || d.Id            || d.userId        || d.UserId        || Math.random(),
        userName:      d.userName      || d.UserName      || d.username      || d.name          || '',
        email:         d.email         || d.Email         || '',
        phoneNumber:   d.phoneNumber   || d.PhoneNumber   || d.phone         || '',
        age:           d.age           || d.Age           || '',
        latitude:      d.latitude      || d.Latitude      || '',
        longitude:     d.longitude     || d.Longitude     || '',
        vehicleType:   d.vehicleType   || d.VehicleType   || '',
        vehicleNumber: d.vehicleNumber || d.VehicleNumber || '',
        isActive:
          d.isActive !== undefined ? d.isActive :
          d.IsActive !== undefined ? d.IsActive : true,
      }))

      setDrivers(normalized)
    } catch (err) {
      setError('Connection error. Please check your network and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) return
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
        setError(responseData.message || `Failed to delete driver. Status: ${response.status}`)
        setDeleteLoadingId(null)
        return
      }

      setDrivers(prev => prev.filter(d => d.id !== id))
      setSuccess('Driver deleted successfully!')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(`Connection error: ${err.message}`)
    } finally {
      setDeleteLoadingId(null)
    }
  }

  const handleEdit = (driver) => {
    setEditingId(driver.id)
    setEditForm({ ...driver, password: '' })
    setShowEditPassword(false)
    setError('')
    setSuccess('')
  }

  const handleSave = async () => {
    // Validate age
    const age = parseInt(editForm.age)
    if (!editForm.age || isNaN(age) || age < 18 || age > 70) {
      setError('Age must be between 18 and 70.')
      return
    }

    setEditLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('authToken')
      const requestData = {
        userName:      editForm.userName?.trim(),
        email:         editForm.email?.trim(),
        phoneNumber:   editForm.phoneNumber?.trim() || '',
        age:           parseInt(editForm.age),
        isActive:      editForm.isActive,
        latitude:      parseFloat(editForm.latitude) || 0,
        longitude:     parseFloat(editForm.longitude) || 0,
        vehicleType:   editForm.vehicleType?.trim() || '',
        vehicleNumber: editForm.vehicleNumber?.trim() || '',
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

      let responseData = {}
      try { const text = await response.text(); if (text) responseData = JSON.parse(text) } catch {}

      if (!response.ok && response.status !== 204) {
        let errorMessage = responseData.message || responseData.error || `Server error: ${response.status}`
        if (responseData.errors) errorMessage = Object.values(responseData.errors).flat().join(', ')
        setError(`Failed to update driver: ${errorMessage}`)
        setEditLoading(false)
        return
      }

      setDrivers(prev => prev.map(d =>
        d.id === editingId ? {
          ...d,
          userName:      editForm.userName,
          email:         editForm.email,
          phoneNumber:   editForm.phoneNumber,
          age:           editForm.age,
          isActive:      editForm.isActive,
          latitude:      editForm.latitude,
          longitude:     editForm.longitude,
          vehicleType:   editForm.vehicleType,
          vehicleNumber: editForm.vehicleNumber,
        } : d
      ))
      setEditingId(null)
      setEditForm({})
      setShowEditPassword(false)
      setSuccess('Driver updated successfully!')
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

  const handleAddDriver = async () => {
    // Validate required fields
    if (!newDriver.userName?.trim())      { setError('Driver name is required.');    return }
    if (!newDriver.email?.trim())         { setError('Email is required.');           return }
    if (!newDriver.password?.trim())      { setError('Password is required.');        return }
    if (!newDriver.age)                   { setError('Age is required.');             return }
    if (!newDriver.latitude)              { setError('Latitude is required.');        return }
    if (!newDriver.longitude)             { setError('Longitude is required.');       return }
    if (!newDriver.vehicleType?.trim())   { setError('Vehicle type is required.');   return }
    if (!newDriver.vehicleNumber?.trim()) { setError('Vehicle number is required.'); return }

    // Validate age range
    const age = parseInt(newDriver.age)
    if (isNaN(age) || age < 18 || age > 70) {
      setError('Age must be between 18 and 70.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newDriver.email.trim())) {
      setError('Please enter a valid email address.')
      return
    }

    setAddLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('authToken')
      const requestData = {
        userName:      newDriver.userName.trim(),
        email:         newDriver.email.trim(),
        password:      newDriver.password,
        phoneNumber:   newDriver.phoneNumber?.trim() || '',
        age:           parseInt(newDriver.age),
        isActive:      newDriver.isActive,
        latitude:      parseFloat(newDriver.latitude),
        longitude:     parseFloat(newDriver.longitude),
        vehicleType:   newDriver.vehicleType.trim(),
        vehicleNumber: newDriver.vehicleNumber.trim(),
      }

      console.log('POST Body:', { ...requestData, password: '[HIDDEN]' })

      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      })

      const responseText = await response.text()
      console.log('Response status:', response.status)
      console.log('Response body:', responseText)

      let responseData = {}
      try { if (responseText) responseData = JSON.parse(responseText) } catch {}

      if (!response.ok) {
        let errorMessage = responseData.message || responseData.error || `Server error: ${response.status}`
        if (responseData.errors) errorMessage = Object.values(responseData.errors).flat().join(', ')
        setError(`Failed to add driver: ${errorMessage}`)
        setAddLoading(false)
        return
      }

      const newId = responseData.id || responseData.userId || Date.now()
      setDrivers(prev => [...prev, {
        id:            newId,
        userName:      newDriver.userName,
        email:         newDriver.email,
        phoneNumber:   newDriver.phoneNumber,
        age:           newDriver.age,
        isActive:      newDriver.isActive,
        latitude:      newDriver.latitude,
        longitude:     newDriver.longitude,
        vehicleType:   newDriver.vehicleType,
        vehicleNumber: newDriver.vehicleNumber,
      }])

      setNewDriver({
        userName: '', email: '', phoneNumber: '', age: '',
        password: '', isActive: true, latitude: '', longitude: '',
        vehicleType: '', vehicleNumber: ''
      })
      setShowAddForm(false)
      setShowAddPassword(false)
      setSuccess('Driver added successfully!')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(`Connection error: ${err.message}`)
    } finally {
      setAddLoading(false)
    }
  }

  const handleCancelAdd = () => {
    setNewDriver({
      userName: '', email: '', phoneNumber: '', age: '',
      password: '', isActive: true, latitude: '', longitude: '',
      vehicleType: '', vehicleNumber: ''
    })
    setShowAddForm(false)
    setShowAddPassword(false)
    setError('')
  }

  const filteredDrivers = drivers.filter(driver =>
    driver.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h3 className="section-title">All Drivers</h3>
          <button
            className="btn btn-primary"
            onClick={() => { setShowAddForm(!showAddForm); setError(''); setSuccess('') }}
          >
            {showAddForm ? 'Cancel' : '+ Add Driver'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className='error-message'>
            <span>⚠️</span><span>{error}</span>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className='success-message'>
            <span>✅</span><span>{success}</span>
          </div>
        )}

        {/* Add Driver Form */}
        {showAddForm && (
          <div style={{ backgroundColor: 'var(--white)', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--gray-200)' }}>
            <h4 style={{ marginBottom: '16px', color: 'var(--gray-900)' }}>Add New Driver</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>

              {/* Driver Name */}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Driver Name <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  value={newDriver.userName}
                  onChange={(e) => setNewDriver({ ...newDriver, userName: e.target.value })}
                  className="form-input"
                  placeholder="Enter driver name"
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
                  value={newDriver.email}
                  onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
                  className="form-input"
                  placeholder="Enter email"
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
                    value={newDriver.password}
                    onChange={(e) => setNewDriver({ ...newDriver, password: e.target.value })}
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
                  value={newDriver.phoneNumber}
                  onChange={(e) => setNewDriver({ ...newDriver, phoneNumber: e.target.value.replace(/\D/g, '') })}
                  className="form-input"
                  placeholder="Numbers only"
                  style={{ width: '100%' }}
                />
              </div>

              {/* Age */}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Age <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="number"
                  value={newDriver.age}
                  onChange={(e) => setNewDriver({ ...newDriver, age: e.target.value })}
                  className="form-input"
                  placeholder="e.g. 28"
                  min="18"
                  max="70"
                  style={{ width: '100%' }}
                />
                <small style={{ color: 'var(--medium-gray)', display: 'block', marginTop: '2px', fontSize: '11px' }}>
                  Must be between 18 and 70
                </small>
              </div>

              {/* Status */}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Status</label>
                <select
                  value={newDriver.isActive ? 'active' : 'inactive'}
                  onChange={(e) => setNewDriver({ ...newDriver, isActive: e.target.value === 'active' })}
                  className="form-input"
                  style={{ width: '100%' }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Vehicle Type */}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Vehicle Type <span style={{ color: 'red' }}>*</span>
                </label>
                <select
                  value={newDriver.vehicleType}
                  onChange={(e) => setNewDriver({ ...newDriver, vehicleType: e.target.value })}
                  className="form-input"
                  style={{ width: '100%' }}
                >
                  <option value="">Select vehicle type</option>
                  <option value="car">Car</option>
                  <option value="motorcycle">Motorcycle</option>
                </select>
              </div>

              {/* Vehicle Number */}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Vehicle Number <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  value={newDriver.vehicleNumber}
                  onChange={(e) => setNewDriver({ ...newDriver, vehicleNumber: e.target.value })}
                  className="form-input"
                  placeholder="e.g. ABC-1234"
                  style={{ width: '100%' }}
                />
              </div>

              {/* Latitude */}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Latitude <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={newDriver.latitude}
                  onChange={(e) => setNewDriver({ ...newDriver, latitude: e.target.value })}
                  className="form-input"
                  placeholder="e.g. 31.9539"
                  style={{ width: '100%' }}
                />
                <small style={{ color: 'var(--medium-gray)', display: 'block', marginTop: '2px', fontSize: '11px' }}>
                  Between -90 and 90
                </small>
              </div>

              {/* Longitude */}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Longitude <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={newDriver.longitude}
                  onChange={(e) => setNewDriver({ ...newDriver, longitude: e.target.value })}
                  className="form-input"
                  placeholder="e.g. 35.9106"
                  style={{ width: '100%' }}
                />
                <small style={{ color: 'var(--medium-gray)', display: 'block', marginTop: '2px', fontSize: '11px' }}>
                  Between -180 and 180
                </small>
              </div>

            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button className="btn btn-primary" onClick={handleAddDriver} disabled={addLoading}>
                {addLoading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '14px', height: '14px', border: '2px solid #ffffff40', borderTop: '2px solid #ffffff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                    Adding...
                  </span>
                ) : 'Add Driver'}
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
              placeholder="Search drivers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--medium-gray)' }}>
            Loading drivers...
          </div>
        ) : error && drivers.length === 0 ? (
          <div style={{ padding: '12px 16px', backgroundColor: '#ffebee', borderLeft: '4px solid #f44336', borderRadius: '4px', color: '#c62828', fontSize: '14px' }}>
            ⚠️ {error}
            <button onClick={fetchDrivers} style={{ marginLeft: '12px', padding: '4px 12px', border: '1px solid #c62828', borderRadius: '4px', background: 'transparent', color: '#c62828', cursor: 'pointer', fontSize: '12px' }}>
              Retry
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Driver</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Age</th>
                  <th>Vehicle Type</th>
                  <th>Vehicle Number</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrivers.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: 'var(--medium-gray)' }}>
                      {searchTerm ? 'No drivers match your search.' : 'No drivers found.'}
                    </td>
                  </tr>
                ) : (
                  filteredDrivers.map((driver) => (
                    <tr key={driver.id}>

                      {/* Driver Name */}
                      <td>
                        {editingId === driver.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(editForm.userName || driver.userName)}&background=FFD700&color=fff`}
                              alt=""
                              className="driver-avatar"
                            />
                            <input
                              type="text"
                              value={editForm.userName || ''}
                              onChange={(e) => handleInputChange('userName', e.target.value)}
                              className="form-input"
                              style={inputStyle}
                            />
                          </div>
                        ) : (
                          <div className="driver-info">
                            <img
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(driver.userName || 'D')}&background=FFD700&color=fff`}
                              alt={driver.userName}
                              className="driver-avatar"
                            />
                            <span className="order-id">{driver.userName}</span>
                          </div>
                        )}
                      </td>

                      {/* Email */}
                      <td>
                        {editingId === driver.id ? (
                          <input type="email" value={editForm.email || ''} onChange={(e) => handleInputChange('email', e.target.value)} className="form-input" style={inputStyle} />
                        ) : driver.email || '—'}
                      </td>

                      {/* Phone */}
                      <td>
                        {editingId === driver.id ? (
                          <input type="tel" value={editForm.phoneNumber || ''} onChange={(e) => handleInputChange('phoneNumber', e.target.value.replace(/\D/g, ''))} className="form-input" placeholder="Numbers only" style={inputStyle} />
                        ) : driver.phoneNumber || '—'}
                      </td>

                      {/* Age */}
                      <td>
                        {editingId === driver.id ? (
                          <div>
                            <input
                              type="number"
                              value={editForm.age || ''}
                              onChange={(e) => handleInputChange('age', e.target.value)}
                              className="form-input"
                              placeholder="18 - 70"
                              min="18"
                              max="70"
                              style={inputStyle}
                            />
                            {editForm.age && (parseInt(editForm.age) < 18 || parseInt(editForm.age) > 70) && (
                              <small style={{ color: 'red', display: 'block', marginTop: '2px' }}>
                                ⚠️ Must be between 18 and 70
                              </small>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontWeight: '600' }}>{driver.age || '—'}</span>
                        )}
                      </td>

                      {/* Vehicle Type */}
                      <td>
                        {editingId === driver.id ? (
                          <select value={editForm.vehicleType || ''} onChange={(e) => handleInputChange('vehicleType', e.target.value)} style={inputStyle}>
                            <option value="">Select type</option>
                            <option value="car">Car</option>
                            <option value="motorcycle">Motorcycle</option>
                          </select>
                        ) : (
                          <span style={{ padding: '4px 10px', backgroundColor: '#e3f2fd', color: '#1565c0', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>
                            {driver.vehicleType || '—'}
                          </span>
                        )}
                      </td>

                      {/* Vehicle Number */}
                      <td>
                        {editingId === driver.id ? (
                          <input type="text" value={editForm.vehicleNumber || ''} onChange={(e) => handleInputChange('vehicleNumber', e.target.value)} className="form-input" placeholder="e.g. ABC-1234" style={inputStyle} />
                        ) : driver.vehicleNumber || '—'}
                      </td>

                      {/* Location */}
                      <td>
                        {editingId === driver.id ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <input type="number" step="any" value={editForm.latitude || ''} onChange={(e) => handleInputChange('latitude', e.target.value)} className="form-input" placeholder="Latitude" style={inputStyle} />
                            <input type="number" step="any" value={editForm.longitude || ''} onChange={(e) => handleInputChange('longitude', e.target.value)} className="form-input" placeholder="Longitude" style={inputStyle} />
                          </div>
                        ) : (
                          driver.latitude && driver.longitude ? (
                            <span style={{ fontSize: '12px', color: 'var(--medium-gray)' }}>
                              {parseFloat(driver.latitude).toFixed(4)}, {parseFloat(driver.longitude).toFixed(4)}
                            </span>
                          ) : '—'
                        )}
                      </td>

                      {/* Status */}
                      <td>
                        {editingId === driver.id ? (
                          <select value={editForm.isActive ? 'active' : 'inactive'} onChange={(e) => handleInputChange('isActive', e.target.value === 'active')} style={inputStyle}>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        ) : (
                          <span className={`status-badge ${driver.isActive ? 'active' : 'offline'}`}>
                            {driver.isActive ? 'Active' : 'Inactive'}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td>
                        {editingId === driver.id ? (
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
                            <button className="action-btn" title="Edit" onClick={() => handleEdit(driver)}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            <button
                              className="action-btn delete-btn"
                              title="Delete"
                              onClick={() => handleDelete(driver.id)}
                              disabled={deleteLoadingId === driver.id}
                            >
                              {deleteLoadingId === driver.id ? (
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

export default Drivers