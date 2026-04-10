import React, { useState, useEffect } from 'react'

const GlobalCatalog = ({ categories, setCategories }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCategories, setExpandedCategories] = useState({})
  const [addingToCategory, setAddingToCategory] = useState(null)
  const [newMedicine, setNewMedicine] = useState({ name: '', price: '', image: null, imagePreview: '' })
  const [addingCategory, setAddingCategory] = useState(false)
  const [newCategoryData, setNewCategoryData] = useState({ name: '', icon: '💊' })
  const [editingMedicine, setEditingMedicine] = useState(null)
  const [editMedicineForm, setEditMedicineForm] = useState({ name: '', price: '', image: null, imagePreview: '' })

  // Load categories from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('catalogCategories')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setCategories(parsed)
      } catch (e) {
        console.error('Failed to load catalog from localStorage:', e)
      }
    }
  }, [])

  // Save categories to localStorage whenever they change
  useEffect(() => {
    if (categories && categories.length > 0) {
      try {
        localStorage.setItem('catalogCategories', JSON.stringify(categories))
      } catch (e) {
        // localStorage might be full due to large base64 images
        console.error('Failed to save catalog to localStorage:', e)
      }
    }
  }, [categories])

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }

  const addMedicine = (categoryId) => {
    setAddingToCategory(categoryId)
    setNewMedicine({ name: '', price: '', image: null, imagePreview: '' })
  }

  const handleNewMedicineImage = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB to be saved properly.')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setNewMedicine(prev => ({ ...prev, image: file, imagePreview: reader.result }))
    }
    reader.readAsDataURL(file)
  }

  const handleEditMedicineImage = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB to be saved properly.')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setEditMedicineForm(prev => ({ ...prev, image: file, imagePreview: reader.result }))
    }
    reader.readAsDataURL(file)
  }

  const saveMedicine = (categoryId) => {
    if (!newMedicine.name.trim() || !newMedicine.price.trim()) {
      alert('Please fill in all required fields')
      return
    }

    const updatedCategories = categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          medicines: [
            ...cat.medicines,
            {
              name: newMedicine.name,
              price: `$${newMedicine.price}`,
              // Save base64 string directly - persists in localStorage
              image: newMedicine.imagePreview || null
            }
          ]
        }
      }
      return cat
    })

    setCategories(updatedCategories)
    // Immediately save to localStorage
    try {
      localStorage.setItem('catalogCategories', JSON.stringify(updatedCategories))
    } catch (e) {
      console.error('Failed to save to localStorage:', e)
    }

    setAddingToCategory(null)
    setNewMedicine({ name: '', price: '', image: null, imagePreview: '' })
  }

  const handleEditMedicine = (medicine) => {
    setEditingMedicine(medicine.name)
    setEditMedicineForm({
      name: medicine.name,
      price: medicine.price.replace('$', ''),
      image: null,
      imagePreview: medicine.image || ''
    })
  }

  const saveEditMedicine = (categoryId, medicineName) => {
    if (!editMedicineForm.name.trim() || !editMedicineForm.price.trim()) {
      alert('Please fill in all required fields')
      return
    }

    const updatedCategories = categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          medicines: cat.medicines.map(m =>
            m.name === medicineName
              ? {
                  ...m,
                  name: editMedicineForm.name,
                  price: `$${editMedicineForm.price}`,
                  // Keep old image if no new one uploaded
                  image: editMedicineForm.imagePreview || m.image
                }
              : m
          )
        }
      }
      return cat
    })

    setCategories(updatedCategories)
    // Immediately save to localStorage
    try {
      localStorage.setItem('catalogCategories', JSON.stringify(updatedCategories))
    } catch (e) {
      console.error('Failed to save to localStorage:', e)
    }

    setEditingMedicine(null)
    setEditMedicineForm({ name: '', price: '', image: null, imagePreview: '' })
  }

  const deleteMedicine = (categoryId, medicineName) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) return

    const updatedCategories = categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          medicines: cat.medicines.filter(m => m.name !== medicineName)
        }
      }
      return cat
    })

    setCategories(updatedCategories)
    try {
      localStorage.setItem('catalogCategories', JSON.stringify(updatedCategories))
    } catch (e) {
      console.error('Failed to save to localStorage:', e)
    }
  }

  const saveCategory = () => {
    if (!newCategoryData.name.trim()) {
      alert('Please enter a category name')
      return
    }

    const newCategory = {
      id: Math.max(...categories.map(c => c.id), 0) + 1,
      name: newCategoryData.name,
      icon: newCategoryData.icon,
      medicines: []
    }

    const updatedCategories = [...categories, newCategory]
    setCategories(updatedCategories)
    try {
      localStorage.setItem('catalogCategories', JSON.stringify(updatedCategories))
    } catch (e) {
      console.error('Failed to save to localStorage:', e)
    }

    setAddingCategory(false)
    setNewCategoryData({ name: '', icon: '💊' })
  }

  return (
    <div className="page-content">
      <div className="section">
        <div className="section-header">
          <h3 className="section-title">Global Catalog Categories</h3>
          <button
            className="btn btn-primary"
            onClick={() => setAddingCategory(true)}
          >
            + Add Category
          </button>
        </div>

        <div className="table-controls">
          <div className="search-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Add Category Form */}
        {addingCategory && (
          <div style={{
            padding: '16px',
            backgroundColor: '#f9f9f9',
            border: '1px solid #ddd',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>Add New Category</h4>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                  Category Name
                </label>
                <input
                  type="text"
                  placeholder="Enter category name"
                  value={newCategoryData.name}
                  onChange={(e) => setNewCategoryData({ ...newCategoryData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Icon</label>
                <select
                  value={newCategoryData.icon}
                  onChange={(e) => setNewCategoryData({ ...newCategoryData, icon: e.target.value })}
                  style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
                >
                  <option value="💊">💊</option>
                  <option value="💉">💉</option>
                  <option value="🍼">🍼</option>
                  <option value="🌿">🌿</option>
                  <option value="🔬">🔬</option>
                  <option value="🩹">🩹</option>
                  <option value="💪">💪</option>
                  <option value="✨">✨</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={saveCategory}
                  style={{ padding: '8px 16px', backgroundColor: 'var(--success)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
                >
                  Save
                </button>
                <button
                  onClick={() => { setAddingCategory(false); setNewCategoryData({ name: '', icon: '💊' }) }}
                  style={{ padding: '8px 16px', backgroundColor: '#999', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Categories List */}
        <div className="catalog-categories" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredCategories.map((category) => (
            <div key={category.id} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>

              {/* Category Header */}
              <div
                onClick={() => toggleCategory(category.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  backgroundColor: '#f5f5f5',
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e8e8e8'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <span style={{ fontSize: '24px' }}>{category.icon}</span>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>{category.name}</h4>
                    <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>{category.medicines.length} medicines</p>
                  </div>
                </div>
                <span style={{ fontSize: '18px', color: '#666' }}>
                  {expandedCategories[category.id] ? '▼' : '▶'}
                </span>
              </div>

              {/* Medicines List */}
              {expandedCategories[category.id] && (
                <div style={{ padding: '16px', backgroundColor: '#fff' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <button
                      onClick={() => addMedicine(category.id)}
                      style={{ padding: '8px 16px', backgroundColor: 'var(--success)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
                    >
                      + Add Medicine
                    </button>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                        <th style={{ textAlign: 'left', padding: '8px', fontWeight: '600', color: '#333' }}>Photo</th>
                        <th style={{ textAlign: 'left', padding: '8px', fontWeight: '600', color: '#333' }}>Medicine Name</th>
                        <th style={{ textAlign: 'left', padding: '8px', fontWeight: '600', color: '#333' }}>Price</th>
                        <th style={{ textAlign: 'center', padding: '8px', fontWeight: '600', color: '#333' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>

                      {/* Add New Medicine Row */}
                      {addingToCategory === category.id && (
                        <tr style={{ borderBottom: '1px solid #f0f0f0', backgroundColor: '#f9f9f9' }}>

                          {/* Image Upload */}
                          <td style={{ padding: '12px 8px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                              {newMedicine.imagePreview ? (
                                <img
                                  src={newMedicine.imagePreview}
                                  alt="Preview"
                                  style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ddd' }}
                                />
                              ) : (
                                <div style={{ width: '50px', height: '50px', borderRadius: '6px', border: '2px dashed #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa' }}>
                                  <span style={{ fontSize: '20px' }}>📷</span>
                                </div>
                              )}
                              <label style={{ cursor: 'pointer' }}>
                                <span style={{ fontSize: '11px', color: 'var(--primary-gold)', textDecoration: 'underline' }}>
                                  {newMedicine.imagePreview ? 'Change' : 'Upload'}
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleNewMedicineImage}
                                  style={{ display: 'none' }}
                                />
                              </label>
                              <small style={{ fontSize: '10px', color: '#999', textAlign: 'center' }}>Max 2MB</small>
                            </div>
                          </td>

                          {/* Name Input */}
                          <td style={{ padding: '12px 8px' }}>
                            <input
                              type="text"
                              placeholder="Medicine name"
                              value={newMedicine.name}
                              onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
                              style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                            />
                          </td>

                          {/* Price Input */}
                          <td style={{ padding: '12px 8px' }}>
                            <input
                              type="number"
                              placeholder="e.g. 9.99"
                              value={newMedicine.price}
                              onChange={(e) => setNewMedicine({ ...newMedicine, price: e.target.value })}
                              style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                            />
                          </td>

                          {/* Save / Cancel */}
                          <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button
                                onClick={() => saveMedicine(category.id)}
                                style={{ padding: '4px 12px', backgroundColor: 'var(--success)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                              >
                                Save
                              </button>
                              <button
                                onClick={() => { setAddingToCategory(null); setNewMedicine({ name: '', price: '', image: null, imagePreview: '' }) }}
                                style={{ padding: '4px 12px', backgroundColor: '#999', color: 'var(--white)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Existing Medicines */}
                      {category.medicines.length > 0 ? (
                        category.medicines.map((medicine) => (
                          <tr key={medicine.name} style={{ borderBottom: '1px solid #f0f0f0' }}>

                            {/* Photo */}
                            <td style={{ padding: '12px 8px' }}>
                              {editingMedicine === medicine.name ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                  {editMedicineForm.imagePreview ? (
                                    <img
                                      src={editMedicineForm.imagePreview}
                                      alt="Preview"
                                      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ddd' }}
                                    />
                                  ) : (
                                    <div style={{ width: '50px', height: '50px', borderRadius: '6px', border: '2px dashed #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa' }}>
                                      <span style={{ fontSize: '20px' }}>📷</span>
                                    </div>
                                  )}
                                  <label style={{ cursor: 'pointer' }}>
                                    <span style={{ fontSize: '11px', color: '#2196f3', textDecoration: 'underline' }}>
                                      {editMedicineForm.imagePreview ? 'Change' : 'Upload'}
                                    </span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={handleEditMedicineImage}
                                      style={{ display: 'none' }}
                                    />
                                  </label>
                                  <small style={{ fontSize: '10px', color: '#999', textAlign: 'center' }}>Max 2MB</small>
                                </div>
                              ) : (
                                medicine.image ? (
                                  <img
                                    src={medicine.image}
                                    alt={medicine.name}
                                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ddd' }}
                                  />
                                ) : (
                                  <div style={{ width: '50px', height: '50px', borderRadius: '6px', border: '2px dashed #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa' }}>
                                    <span style={{ fontSize: '20px' }}>💊</span>
                                  </div>
                                )
                              )}
                            </td>

                            {/* Medicine Name */}
                            <td style={{ padding: '12px 8px' }}>
                              {editingMedicine === medicine.name ? (
                                <input
                                  type="text"
                                  value={editMedicineForm.name}
                                  onChange={(e) => setEditMedicineForm({ ...editMedicineForm, name: e.target.value })}
                                  style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                                />
                              ) : (
                                <span style={{ fontWeight: '500' }}>{medicine.name}</span>
                              )}
                            </td>

                            {/* Price */}
                            <td style={{ padding: '12px 8px' }}>
                              {editingMedicine === medicine.name ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span style={{ color: '#666' }}>$</span>
                                  <input
                                    type="number"
                                    value={editMedicineForm.price}
                                    onChange={(e) => setEditMedicineForm({ ...editMedicineForm, price: e.target.value })}
                                    style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                                  />
                                </div>
                              ) : (
                                <span style={{ color: '#2e7d32', fontWeight: '600' }}>{medicine.price}</span>
                              )}
                            </td>

                            {/* Actions */}
                            <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                              {editingMedicine === medicine.name ? (
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                  <button
                                    onClick={() => saveEditMedicine(category.id, medicine.name)}
                                    style={{ padding: '4px 12px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => { setEditingMedicine(null); setEditMedicineForm({ name: '', price: '', image: null, imagePreview: '' }) }}
                                    style={{ padding: '4px 12px', backgroundColor: '#999', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                  <button
                                    onClick={() => handleEditMedicine(medicine)}
                                    style={{ padding: '4px 12px', backgroundColor: 'var(--primary-gold)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => deleteMedicine(category.id, medicine.name)}
                                    style={{ padding: '4px 12px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" style={{ padding: '12px', textAlign: 'center', color: '#999' }}>
                            No medicines in this category
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default GlobalCatalog