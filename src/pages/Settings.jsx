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

  const getLoggedInUserInfo = () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return null;
      const payload = token.split('.')[1];
      if (!payload) return null;
      const decoded = JSON.parse(atob(payload));
      console.log('Decoded JWT payload:', decoded);
      const email =
        decoded.email ||
        decoded.Email ||
        decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
        decoded.sub ||
        null;
      const id =
        decoded.id ||
        decoded.Id ||
        decoded.userId ||
        decoded.UserId ||
        decoded.adminId ||
        decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
        null;
      const username =
        decoded.username ||
        decoded.Username ||
        decoded.unique_name ||
        decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
        null;
      return { email, id, username };
    } catch (e) {
      console.error('Failed to decode JWT:', e);
      return null;
    }
  };

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('Authentication token not found. Please login again.');
          setFetchLoading(false);
          return;
        }

        const loggedInUser = getLoggedInUserInfo();
        console.log('Logged in user from JWT:', loggedInUser);

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

        console.log('All admins data:', data);
        const adminsList = Array.isArray(data) ? data : [data];
        let currentAdmin = null;

        if (loggedInUser) {
          if (loggedInUser.id) {
            currentAdmin = adminsList.find(a =>
              String(a.id) === String(loggedInUser.id) ||
              String(a.Id) === String(loggedInUser.id) ||
              String(a.adminId) === String(loggedInUser.id) ||
              String(a.userId) === String(loggedInUser.id)
            );
          }
          if (!currentAdmin && loggedInUser.email) {
            currentAdmin = adminsList.find(a =>
              (a.email || a.Email || '')?.toLowerCase() === loggedInUser.email.toLowerCase()
            );
          }
          if (!currentAdmin && loggedInUser.username) {
            currentAdmin = adminsList.find(a =>
              (a.username || a.userName || a.Username || '')?.toLowerCase() === loggedInUser.username.toLowerCase()
            );
          }
        }

        if (!currentAdmin) {
          const storedEmail = localStorage.getItem('userEmail');
          if (storedEmail) {
            currentAdmin = adminsList.find(a =>
              (a.email || a.Email || '')?.toLowerCase() === storedEmail.toLowerCase()
            );
          }
        }

        if (!currentAdmin) {
          console.warn('Could not match logged-in user, using first admin as fallback');
          currentAdmin = adminsList[0];
        }

        console.log('Matched current admin:', currentAdmin);

        const username =
          currentAdmin.username || currentAdmin.userName || currentAdmin.UserName ||
          currentAdmin.Username || currentAdmin.user_name || '';
        const email =
          currentAdmin.email || currentAdmin.Email ||
          currentAdmin.emailAddress || currentAdmin.EmailAddress || '';
        const phone =
          currentAdmin.phone || currentAdmin.Phone ||
          currentAdmin.phoneNumber || currentAdmin.PhoneNumber ||
          currentAdmin.phone_number || '';
        const role =
          currentAdmin.role || currentAdmin.Role ||
          currentAdmin.userRole || currentAdmin.UserRole || 'System Administrator';
        const id =
          currentAdmin.id || currentAdmin.Id ||
          currentAdmin.adminId || currentAdmin.AdminId ||
          currentAdmin.userId || currentAdmin.UserId || null;

        const fetchedData = { email, username, phone, role, password: '' };
        setAdminId(id);
        setFormData(fetchedData);
        setOriginalData(fetchedData);
        onUpdateAdmin({ email, username, phone, role });

      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError('Connection error. Please check your network and try again.');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchAdminData();
  }, []);

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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Admin Settings</h1>
      </div>

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
    </div>
  );
};

export default Settings;