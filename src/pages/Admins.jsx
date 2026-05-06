import React, { useState, useEffect } from 'react'

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [adminsError, setAdminsError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAdminId, setEditingAdminId] = useState(null);
  const [editAdminForm, setEditAdminForm] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    username: '', email: '', phone: '', password: '', role: ''
  });
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [tableSuccess, setTableSuccess] = useState('');
  const [tableError, setTableError] = useState('');

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

      const adminsList = Array.isArray(data) ? data : [data];
      const normalized = adminsList.map((a) => ({
        id:       a.id       || a.Id       || a.adminId || a.AdminId || a.userId || a.UserId || Math.random(),
        username: a.username || a.userName || a.UserName || a.Username || '',
        email:    a.email    || a.Email    || a.emailAddress || '',
        phone:    a.phone    || a.Phone    || a.phoneNumber  || a.PhoneNumber || '',
        role:     a.role     || a.Role     || 'System Administrator',
      }));

      setAdmins(normalized);
    } catch (err) {
      setAdminsError('Connection error while fetching admins.');
    } finally {
      setAdminsLoading(false);
    }
  };

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
        email:       editAdminForm.email?.trim()    || adminToSave.email,
        username:    editAdminForm.username?.trim() || adminToSave.username,
        phoneNumber: editAdminForm.phone?.trim()    || adminToSave.phone,
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
        username:    newAdmin.username.trim(),
        email:       newAdmin.email.trim(),
        password:    newAdmin.password,
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

  const inputStyle = {
    width: '100%',
    padding: '8px',
    border: '1px solid var(--gray-300)',
    borderRadius: '4px'
  };

  return (
    <div className="page-content">
      <div className="section">
        <div className="section-header">
          <h3 className="section-title">All Admins</h3>
          <button
            className="btn btn-primary"
            onClick={() => { setShowAddForm(!showAddForm); setTableError(''); setTableSuccess(''); }}
          >
            {showAddForm ? 'Cancel' : '+ Add Admin'}
          </button>
        </div>

        {/* Success */}
        {tableSuccess && (
          <div style={{ padding: '12px 16px', marginBottom: '16px', backgroundColor: '#e8f5e9', borderLeft: '4px solid #4caf50', borderRadius: '4px', color: '#2e7d32', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>✅</span><span>{tableSuccess}</span>
          </div>
        )}

        {/* Error */}
        {tableError && (
          <div style={{ padding: '12px 16px', marginBottom: '16px', backgroundColor: '#ffebee', borderLeft: '4px solid #f44336', borderRadius: '4px', color: '#c62828', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚠️</span><span>{tableError}</span>
          </div>
        )}

        {/* Add Admin Form */}
        {showAddForm && (
          <div style={{ backgroundColor: 'var(--white)', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--gray-200)' }}>
            <h4 style={{ marginBottom: '16px', color: 'var(--gray-900)' }}>Add New Admin</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Username <span style={{ color: 'red' }}>*</span>
                </label>
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
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Email <span style={{ color: 'red' }}>*</span>
                </label>
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
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Password <span style={{ color: 'red' }}>*</span>
                </label>
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
                    <span style={{ width: '14px', height: '14px', border: '2px solid #ffffff40', borderTop: '2px solid #ffffff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
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
          <div style={{ padding: '12px 16px', backgroundColor: '#ffebee', borderLeft: '4px solid #f44336', borderRadius: '4px', color: 'var(--danger)', fontSize: '14px' }}>
            ⚠️ {adminsError}
            <button onClick={fetchAllAdmins} style={{ marginLeft: '12px', padding: '4px 12px', border: '1px solid var(--danger)', borderRadius: '4px', background: 'transparent', color: 'var(--danger)', cursor: 'pointer', fontSize: '12px' }}>
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
                            style={inputStyle}
                          />
                        ) : (
                          <div className="driver-info">
                            <img
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(admin.username || 'A')}&background=FFD700&color=fff`}
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
                            style={inputStyle}
                          />
                        ) : admin.email}
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
                            style={inputStyle}
                          />
                        ) : admin.phone || '—'}
                      </td>

                      {/* Role */}
                      <td>
                        <span style={{ padding: '4px 10px', backgroundColor: 'var(--gray-200)', color: 'var(--info)', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>
                          {admin.role}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        {editingAdminId === admin.id ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <input
                              type="password"
                              value={editAdminForm.password || ''}
                              onChange={(e) => setEditAdminForm({ ...editAdminForm, password: e.target.value })}
                              className="form-input"
                              placeholder="New password (optional)"
                              style={{ ...inputStyle, fontSize: '13px', marginBottom: '4px' }}
                            />
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button className="action-btn" title="Save" onClick={() => handleSaveAdmin(admin)} disabled={editLoading}>
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

export default Admins;