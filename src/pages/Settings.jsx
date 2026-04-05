import React, { useState } from 'react'

const Settings = ({ adminData, onUpdateAdmin }) => {
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState(adminData);

    const handleSave = (e) => {
      e.preventDefault();
      onUpdateAdmin(formData);
      setEditMode(false);
      alert('Admin settings updated successfully!');
    };

    return (
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Admin Settings</h1>
        </div>
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Profile Information</h2>
            {!editMode && (
              <button className="btn btn-primary" onClick={() => setEditMode(true)}>Edit Profile</button>
            )}
          </div>
          
          <form className="settings-form" onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-input" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                disabled={!editMode}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-input" 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                disabled={!editMode}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input 
                type="text" 
                className="form-input" 
                value={formData.phone} 
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                disabled={!editMode}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <input 
                type="text" 
                className="form-input" 
                value={formData.role} 
                disabled
              />
              <small style={{color: 'var(--medium-gray)', display: 'block', marginTop: '4px'}}>Role cannot be changed directly.</small>
            </div>
            
            {editMode && (
              <div style={{display: 'flex', gap: '12px', marginTop: '30px'}}>
                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setFormData(adminData);
                  setEditMode(false);
                }} style={{padding: '12px', border: '1px solid var(--light-gray)', borderRadius: '8px', background: 'var(--white)'}}>Cancel</button>
              </div>
            )}
          </form>
        </div>
      </div>
    );
  };

export default Settings