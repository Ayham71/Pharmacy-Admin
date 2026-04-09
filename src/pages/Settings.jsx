import React, { useState, useEffect } from 'react'

const Settings = ({ adminData, onUpdateAdmin }) => {
  const [editMode, setEditMode] = useState(false);
  const [adminId, setAdminId] = useState(null);
  const [formData, setFormData] = useState({
    email: adminData.email || '',
    username: adminData.username || '',
    phone: adminData.phone || adminData.phoneNumber || '',
    role: adminData.role || '',
    password: ''
  });
  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Admins table states
  const [admins, setAdmins] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [adminsError, setAdminsError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAdminId, setEditingAdminId] = useState(null);
  const [editAdminForm, setEditAdminForm] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    role: ''
  });
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [tableSuccess, setTableSuccess] = useState('');
  const [tableError, setTableError] = useState('');

  // Fetch profile admin data
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('Authentication token not found. Please login again.');
          setFetchLoading(false);
          return;
        }

        const response = await fetch('http://165.22.91.187:5000/api/Admin', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError('Authentication failed. Please login again.');
          } else {
            setError('Failed to fetch admin data. Please try again.');
          }
          setFetchLoading(false);
          return;
        }

        const responseText = await response.text();
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          setError('Invalid response from server.');
          setFetchLoading(false);
          return;
        }

        const adminInfo = Array.isArray(data) ? data[0] : data;

        const username =
          adminInfo.username || adminInfo.userName || adminInfo.UserName ||
          adminInfo.Username || adminInfo.user_name || '';

        const email =
          adminInfo.email || adminInfo.Email ||
          adminInfo.emailAddress || adminInfo.EmailAddress || '';

        const phone =
          adminInfo.phone || adminInfo.Phone ||
          adminInfo.phoneNumber || adminInfo.PhoneNumber ||
          adminInfo.phone_number || '';

        const role =
          adminInfo.role || adminInfo.Role ||
          adminInfo.userRole || adminInfo.UserRole || 'System Administrator';

        const id =
          adminInfo.id || adminInfo.Id ||
          adminInfo.adminId || adminInfo.AdminId ||
          adminInfo.userId || adminInfo.UserId || null;

        const fetchedData = { email, username, phone, role, password: '' };

        setAdminId(id);
        setFormData(fetchedData);
        setOriginalData(fetchedData);
        onUpdateAdmin({ email, username, phone, role });

      } catch (err) {
        setError('Connection error. Please check your network and try again.');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  // Fetch all admins for table
  useEffect(() => {
    fetchAllAdmins();
  }, []);

  const fetchAllAdmins = async () => {
    try {
      setAdminsLoading(true);
      setAdminsError('');
      const token = localStorage.getItem('authToken');
      if (!token) {
        setAdminsError('Authentication token not found.');
        setAdminsLoading(false);
        return;
      }

      const response = await fetch('http://165.22.91.187:5000/api/Admin', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        setAdminsError('Failed to fetch admins list.');
        setAdminsLoading(false);
        return;
      }

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        setAdminsError('Invalid response from server.');
        setAdminsLoading(false);
        return;
      }

      // Normalize to array
      const adminsList = Array.isArray(data) ? data : [data];

      const normalized = adminsList.map((a) => ({
        id: a.id || a.Id || a.adminId || a.AdminId || a.userId || a.UserId || Math.random(),
        username: a.username || a.userName || a.UserName || a.Username || '',
        email: a.email || a.Email || a.emailAddress || '',
        phone: a.phone || a.Phone || a.phoneNumber || a.PhoneNumber || '',
        role: a.role || a.Role || 'System Administrator',
      }));

      setAdmins(normalized);
    } catch (err) {
      setAdminsError('Connection error while fetching admins.');
    } finally {
      setAdminsLoading(false);
    }
  };

  // Profile save handler
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const hasChanges =
      formData.email !== originalData.email ||
      formData.username !== originalData.username ||
      formData.phone !== originalData.phone ||
      formData.password.trim() !== '';

    if (!hasChanges) {
      setError('No changes detected. Please modify at least one field before saving.');
      setLoading(false);
      return;
    }

    if (formData.email !== originalData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        setError('Please enter a valid email address.');
        setLoading(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) { setError('Authentication token not found.'); setLoading(false); return; }
      if (!adminId) { setError('Admin ID not found. Please refresh.'); setLoading(false); return; }

      const requestData = {
        email: formData.email.trim(),
        username: formData.username.trim() || originalData.username,
        phoneNumber: formData.phone.trim() || originalData.phone,
      };
      if (formData.password.trim()) requestData.password = formData.password;

      const response = await fetch(`http://165.22.91.187:5000/api/Admin/${adminId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
        body: JSON.stringify(requestData)
      });

      let responseData = {};
      try {
        const text = await response.text();
        if (text) responseData = JSON.parse(text);
      } catch {
        if (response.status === 200 || response.status === 204) { handleSuccessUpdate(); return; }
      }

      if (!response.ok) {
        let errorMessage = responseData.message || responseData.error || responseData.Message || `Server error: ${response.status}`;
        if (responseData.errors && typeof responseData.errors === 'object') {
          errorMessage = Object.values(responseData.errors).flat().join(', ');
        }
        setError(`Failed to update: ${errorMessage}`);
        setLoading(false);
        return;
      }

      handleSuccessUpdate();
    } catch (err) {
      setError(`Connection error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessUpdate = () => {
    const updatedData = { email: formData.email, username: formData.username, phone: formData.phone, role: formData.role, password: '' };
    setOriginalData(updatedData);
    setFormData(updatedData);
    onUpdateAdmin(updatedData);
    setEditMode(false);
    setSuccess('Admin settings updated successfully!');
    setTimeout(() => setSuccess(''), 4000);
    fetchAllAdmins();
  };

  const handleCancel = () => {
    setFormData({ ...originalData, password: '' });
    setEditMode(false);
    setError('');
    setSuccess('');
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const isFieldChanged = (field) => {
    if (!originalData) return false;
    if (field === 'password') return formData.password.trim() !== '';
    return formData[field] !== originalData[field];
  };

  // Table handlers
  const handleEditAdmin = (admin) => {
    setEditingAdminId(admin.id);
    setEditAdminForm({ ...admin, password: '' });
    setTableError('');
    setTableSuccess('');
  };

  const handleCancelEditAdmin = () => {
    setEditingAdminId(null);
    setEditAdminForm({});
  };

  const handleSaveAdmin = async (adminToSave) => {
    setEditLoading(true);
    setTableError('');
    setTableSuccess('');

    try {
      const token = localStorage.getItem('authToken');
      const requestData = {
        email: editAdminForm.email?.trim() || adminToSave.email,
        username: editAdminForm.username?.trim() || adminToSave.username,
        phoneNumber: editAdminForm.phone?.trim() || adminToSave.phone,
      };
      if (editAdminForm.password?.trim()) requestData.password = editAdminForm.password;

      const response = await fetch(`http://165.22.91.187:5000/api/Admin/${adminToSave.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(requestData)
      });

      let responseData = {};
      try {
        const text = await response.text();
        if (text) responseData = JSON.parse(text);
      } catch { }

      if (!response.ok && response.status !== 204) {
        let errorMessage = responseData.message || responseData.error || `Server error: ${response.status}`;
        if (responseData.errors) errorMessage = Object.values(responseData.errors).flat().join(', ');
        setTableError(`Failed to update admin: ${errorMessage}`);
        setEditLoading(false);
        return;
      }

      // Update local state
      setAdmins(prev => prev.map(a =>
        a.id === adminToSave.id
          ? { ...a, email: editAdminForm.email || a.email, username: editAdminForm.username || a.username, phone: editAdminForm.phone || a.phone }
          : a
      ));
      setEditingAdminId(null);
      setEditAdminForm({});
      setTableSuccess('Admin updated successfully!');
      setTimeout(() => setTableSuccess(''), 4000);
    } catch (err) {
      setTableError(`Connection error: ${err.message}`);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) return;
    setDeleteLoadingId(id);
    setTableError('');
    setTableSuccess('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://165.22.91.187:5000/api/Admin/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok && response.status !== 204) {
        let responseData = {};
        try { const text = await response.text(); if (text) responseData = JSON.parse(text); } catch { }
        setTableError(responseData.message || `Failed to delete admin. Status: ${response.status}`);
        setDeleteLoadingId(null);
        return;
      }

      setAdmins(prev => prev.filter(a => a.id !== id));
      setTableSuccess('Admin deleted successfully!');
      setTimeout(() => setTableSuccess(''), 4000);
    } catch (err) {
      setTableError(`Connection error: ${err.message}`);
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdmin.username.trim() || !newAdmin.email.trim() || !newAdmin.password.trim()) {
      setTableError('Username, Email and Password are required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newAdmin.email.trim())) {
      setTableError('Please enter a valid email address.');
      return;
    }

    setAddLoading(true);
    setTableError('');
    setTableSuccess('');

    try {
      const token = localStorage.getItem('authToken');
      const requestData = {
        username: newAdmin.username.trim(),
        email: newAdmin.email.trim(),
        password: newAdmin.password,
        phoneNumber: newAdmin.phone.trim(),
      };

      const response = await fetch('http://165.22.91.187:5000/api/Admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(requestData)
      });

      let responseData = {};
      try {
        const text = await response.text();
        if (text) responseData = JSON.parse(text);
      } catch { }

      if (!response.ok) {
        let errorMessage = responseData.message || responseData.error || `Server error: ${response.status}`;
        if (responseData.errors) errorMessage = Object.values(responseData.errors).flat().join(', ');
        setTableError(`Failed to add admin: ${errorMessage}`);
        setAddLoading(false);
        return;
      }

      setNewAdmin({ username: '', email: '', phone: '', password: '', role: '' });
      setShowAddForm(false);
      setTableSuccess('Admin added successfully!');
      setTimeout(() => setTableSuccess(''), 4000);
      fetchAllAdmins();
    } catch (err) {
      setTableError(`Connection error: ${err.message}`);
    } finally {
      setAddLoading(false);
    }
  };

  const handleCancelAdd = () => {
    setNewAdmin({ username: '', email: '', phone: '', password: '', role: '' });
    setShowAddForm(false);
    setTableError('');
  };

  const filteredAdmins = admins.filter(admin =>
    admin.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Admin Settings</h1>
      </div>

      {/* ── Profile Section ── */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Profile Information</h2>
          {!editMode && !fetchLoading && (
            <button className="btn btn-primary" onClick={() => { setEditMode(true); setError(''); setSuccess(''); }}>
              Edit Profile
            </button>
          )}
        </div>

        {fetchLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ color: 'var(--medium-gray)', fontSize: '16px' }}>Loading admin data...</div>
          </div>
        ) : (
          <form className="settings-form" onSubmit={handleSave}>
            {error && (
              <div className='error-message'>
                <span>⚠️</span><span>{error}</span>
              </div>
            )}
            {success && (
              <div className='success-message'>
                <span>✅</span><span>{success}</span>
              </div>
            )}
            {editMode && (
              <div style={{ padding: '10px 16px', marginBottom: '20px', backgroundColor: '#e3f2fd', borderLeft: '4px solid #2196f3', borderRadius: '4px', color: '#1565c0', fontSize: '13px' }}>
                💡 You can edit one or more fields. Only changed fields will be updated.
              </div>
            )}

            {/* Username */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Username
                {editMode && isFieldChanged('username') && (
                  <span style={{ fontSize: '11px', backgroundColor: 'var(--white)', color: 'var(--gold-dark)', padding: '2px 8px', borderRadius: '10px', fontWeight: '500' }}>Modified</span>
                )}
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.username}
                onChange={(e) => handleFieldChange('username', e.target.value)}
                disabled={!editMode}
                placeholder="Enter username"
                style={{ borderColor: editMode && isFieldChanged('username') ? '#ff9800' : undefined, transition: 'border-color 0.2s', backgroundColor: !editMode ? '#fafafa' : undefined }}
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Email Address
                {editMode && isFieldChanged('email') && (
                  <span style={{ fontSize: '11px', backgroundColor: 'var(--white)', color: 'var(--gold-dark)', padding: '2px 8px', borderRadius: '10px', fontWeight: '500' }}>Modified</span>
                )}
              </label>
              <input
                type="email"
                className="form-input"
                value={editMode ? formData.email : originalData ? originalData.email : formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                disabled={!editMode}
                placeholder="Enter email address"
                style={{ borderColor: editMode && isFieldChanged('email') ? '#ff9800' : undefined, transition: 'border-color 0.2s', backgroundColor: !editMode ? '#fafafa' : undefined }}
              />
              {editMode && isFieldChanged('email') && (
                <small style={{ color: '#e65100', display: 'block', marginTop: '4px' }}>
                  ⚠️ Once saved, your old email will be replaced with the new one.
                </small>
              )}
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Phone Number
                {editMode && isFieldChanged('phone') && (
                  <span style={{ fontSize: '11px', backgroundColor: 'var(--white)', color: 'var(--gold-dark)', padding: '2px 8px', borderRadius: '10px', fontWeight: '500' }}>Modified</span>
                )}
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                disabled={!editMode}
                placeholder="Enter phone number"
                style={{ borderColor: editMode && isFieldChanged('phone') ? '#ff9800' : undefined, transition: 'border-color 0.2s', backgroundColor: !editMode ? '#fafafa' : undefined }}
              />
            </div>

            {/* Password */}
            {editMode && (
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  New Password
                  <span style={{ fontSize: '11px', backgroundColor: 'var(--white)', color: 'var(--info)', padding: '2px 8px', borderRadius: '10px', fontWeight: '500' }}>Optional</span>
                  {isFieldChanged('password') && (
                    <span style={{ fontSize: '11px', backgroundColor: 'var(--white)', color: 'var(--gold-dark)', padding: '2px 8px', borderRadius: '10px', fontWeight: '500' }}>Modified</span>
                  )}
                </label>
                <input
                  type="password"
                  className="form-input"
                  value={formData.password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  placeholder="Leave blank to keep current password"
                  style={{ borderColor: isFieldChanged('password') ? '#ff9800' : undefined, transition: 'border-color 0.2s' }}
                />
                <small style={{ color: 'var(--medium-gray)', display: 'block', marginTop: '4px' }}>
                  Leave blank if you don't want to change your password.
                </small>
              </div>
            )}

            {/* Role */}
            <div className="form-group">
              <label className="form-label">Role</label>
              <input type="text" className="form-input" value={formData.role} disabled style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }} />
              <small style={{ color: 'var(--medium-gray)', display: 'block', marginTop: '4px' }}>Role cannot be changed directly.</small>
            </div>

            {editMode && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: '130px' }}>
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                      <span style={{ width: '14px', height: '14px', border: '2px solid #ffffff40', borderTop: '2px solid #ffffff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                      Saving...
                    </span>
                  ) : 'Save Changes'}
                </button>
                <button type="button" onClick={handleCancel} disabled={loading} style={{ padding: '10px 20px', border: '1px solid var(--light-gray)', borderRadius: '8px', background: 'var(--white)', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '14px', color: 'var(--dark-gray)', opacity: loading ? 0.6 : 1 }}>
                  Cancel
                </button>
              </div>
            )}
          </form>
        )}
      </div>

      {/* ── All Admins Table Section ── */}
      <div className="section" style={{ marginTop: '32px' }}>
        <div className="section-header">
          <h2 className="section-title">All Admins</h2>
          <button className="btn btn-primary" onClick={() => { setShowAddForm(!showAddForm); setTableError(''); setTableSuccess(''); }}>
            {showAddForm ? 'Cancel' : '+ Add Admin'}
          </button>
        </div>

        {/* Table Success */}
        {tableSuccess && (
          <div className="success-message">
            <span>✅</span><span>{tableSuccess}</span>
          </div>
        )}

        {/* Table Error */}
        {tableError && (
          <div className='error-message'>
            <span>⚠️</span><span>{tableError}</span>
          </div>
        )}

        {/* Add Admin Form */}
        {showAddForm && (
          <div style={{ backgroundColor: 'var(--white)', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--gray-200)' }}>
            <h4 style={{ marginBottom: '16px', color: 'var(--gray-900)' }}>Add New Admin</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Username <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  value={newAdmin.username}
                  onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                  className="form-input"
                  placeholder="Enter username"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Email <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  className="form-input"
                  placeholder="Enter email address"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Phone</label>
                <input
                  type="text"
                  value={newAdmin.phone}
                  onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value.replace(/\D/g, '') })}
                  className="form-input"
                  placeholder="Numbers only"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Password <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  className="form-input"
                  placeholder="Enter password"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button className="btn btn-primary" onClick={handleAddAdmin} disabled={addLoading}>
                {addLoading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '14px', height: '14px', border: '2px solid #ffffff40', borderTop: '2px solid var(--white)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                    Adding...
                  </span>
                ) : 'Add Admin'}
              </button>
              <button className="btn btn-secondary" onClick={handleCancelAdd} disabled={addLoading}>Cancel</button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="table-controls">
          <div className="search-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search by username or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        {adminsLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--medium-gray)' }}>
            Loading admins...
          </div>
        ) : adminsError ? (
          <div className='error-message'>
            ⚠️ {adminsError}
            <button onClick={fetchAllAdmins} style={{ marginLeft: '12px', padding: '4px 12px', border: '1px solid #c62828', borderRadius: '4px', background: 'transparent', color: '#c62828', cursor: 'pointer', fontSize: '12px' }}>
              Retry
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--medium-gray)' }}>
                      {searchTerm ? 'No admins match your search.' : 'No admins found.'}
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map((admin) => (
                    <tr key={admin.id}>

                      {/* Username */}
                      <td>
                        {editingAdminId === admin.id ? (
                          <input
                            type="text"
                            value={editAdminForm.username || ''}
                            onChange={(e) => setEditAdminForm({ ...editAdminForm, username: e.target.value })}
                            className="form-input"
                            style={{ width: '100%', padding: '8px', border: '1px solid var(--gray-300)', borderRadius: '4px' }}
                          />
                        ) : (
                          <div className="driver-info">
                            <img
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(admin.username || 'A')}&background=FFC107&color=fff`}
                              alt={admin.username}
                              className="driver-avatar"
                            />
                            <span className="order-id">{admin.username}</span>
                          </div>
                        )}
                      </td>

                      {/* Email */}
                      <td>
                        {editingAdminId === admin.id ? (
                          <input
                            type="email"
                            value={editAdminForm.email || ''}
                            onChange={(e) => setEditAdminForm({ ...editAdminForm, email: e.target.value })}
                            className="form-input"
                            style={{ width: '100%', padding: '8px', border: '1px solid var(--gray-300)', borderRadius: '4px' }}
                          />
                        ) : (
                          admin.email
                        )}
                      </td>

                      {/* Phone */}
                      <td>
                        {editingAdminId === admin.id ? (
                          <input
                            type="text"
                            value={editAdminForm.phone || ''}
                            onChange={(e) => setEditAdminForm({ ...editAdminForm, phone: e.target.value.replace(/\D/g, '') })}
                            className="form-input"
                            placeholder="Numbers only"
                            style={{ width: '100%', padding: '8px', border: '1px solid var(--gray-300)', borderRadius: '4px' }}
                          />
                        ) : (
                          admin.phone || '—'
                        )}
                      </td>

                      {/* Role */}
                      <td>
                        <span style={{ padding: '4px 10px', backgroundColor: 'var(--gray-200)', color: 'var(--info)', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>
                          {admin.role}
                        </span>
                      </td>

                      {/* Password field only when editing */}
                      {editingAdminId === admin.id && (
                        <td colSpan="0" style={{ display: 'none' }} />
                      )}

                      {/* Actions */}
                      <td>
                        {editingAdminId === admin.id ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div>
                              <input
                                type="password"
                                value={editAdminForm.password || ''}
                                onChange={(e) => setEditAdminForm({ ...editAdminForm, password: e.target.value })}
                                className="form-input"
                                placeholder="New password (optional)"
                                style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--gray-300)', borderRadius: '4px', marginBottom: '6px', fontSize: '13px' }}
                              />
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                className="action-btn"
                                title="Save"
                                onClick={() => handleSaveAdmin(admin)}
                                disabled={editLoading}
                              >
                                {editLoading ? (
                                  <span style={{ width: '14px', height: '14px', border: '2px solid #ccc', borderTop: '2px solid #333', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                                ) : (
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                    <polyline points="17 21 17 13 7 13 7 21" />
                                    <polyline points="7 3 7 8 15 8" />
                                  </svg>
                                )}
                              </button>
                              <button className="action-btn delete-btn" title="Cancel" onClick={handleCancelEditAdmin} disabled={editLoading}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="action-btn" title="Edit" onClick={() => handleEditAdmin(admin)}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button
                              className="action-btn delete-btn"
                              title="Delete"
                              onClick={() => handleDeleteAdmin(admin.id)}
                              disabled={deleteLoadingId === admin.id}
                            >
                              {deleteLoadingId === admin.id ? (
                                <span style={{ width: '14px', height: '14px', border: '2px solid #ccc', borderTop: '2px solid #f44336', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                              ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M3 6h18" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  <line x1="10" y1="11" x2="10" y2="17" />
                                  <line x1="14" y1="11" x2="14" y2="17" />
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
  );
};

export default Settings;