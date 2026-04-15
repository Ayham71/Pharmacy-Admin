import React, { useState, useEffect } from 'react'

const API_BASE_URL = 'http://165.22.91.187:5000/api/Admin'
const BASE_URL = 'http://165.22.91.187:5000' // Base URL for serving images (adjust if needed)

const GlobalCatalog = ({ categories, setCategories }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCategories, setExpandedCategories] = useState({})
  const [addingToCategory, setAddingToCategory] = useState(null)
  const [newMedicine, setNewMedicine] = useState({ name: '', activeIngredient: '', price: '', image: null, imagePreview: '' })
  const [addingCategory, setAddingCategory] = useState(false)
  const [newCategoryData, setNewCategoryData] = useState({ name: '', icon: '💊' })
  const [editingMedicine, setEditingMedicine] = useState(null)
  const [editMedicineForm, setEditMedicineForm] = useState({ name: '', activeIngredient: '', price: '', image: null, imagePreview: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Helper function to get auth token
  const getAuthToken = () => {
    return localStorage.getItem('authToken')
  }

  // Headers for JSON requests (Categories)
  const getJsonHeaders = () => {
    const token = getAuthToken()
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    }
  }

  // Headers for FormData requests (Medicines)
  const getFormDataHeaders = () => {
    const token = getAuthToken()
    return {
      'Accept': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
      // DO NOT SET Content-Type! Browser sets it with boundary.
    }
  }

  // Check if user is logged in as admin
  const isLoggedIn = () => {
    const token = getAuthToken()
    const role = localStorage.getItem('userRole')
    return !!(token && role === 'Admin')
  }

  // Fetch categories on mount
  useEffect(() => {
    if (isLoggedIn()) {
      fetchCategories()
    }
  }, [])

  // Fetch all categories with medicines
  const fetchCategories = async () => {
    if (!isLoggedIn()) {
      setError('Please login to access the catalog')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/Category/with-medicines`, {
        method: 'GET',
        headers: getJsonHeaders(),
      })

      if (response.status === 401) {
        setError('Session expired. Please login again.')
        return
      }

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      
      console.log('📦 RAW API RESPONSE:', JSON.stringify(data, null, 2))

      const transformedData = data.map(cat => {
        const medicationsArray = cat.medications || cat.centralMedicines || cat.medicines || []
        
        console.log(`📂 Category: ${cat.categoryName || cat.name} (ID: ${cat.id})`)

        return {
          id: cat.id,
          name: cat.categoryName || cat.name,
          icon: cat.icon || '💊',
          medicines: medicationsArray.map(med => {
            // 🔍 Log the entire medicine object to see ALL fields
            console.log(`🔍 FULL Medicine Object for "${med.medicationName || med.name}":`, med)
            
            // Check ALL possible image field variations (case-insensitive)
            let imagePath = null
            const imageFields = [
              'image', 'imageUrl', 'imagePath', 'imageURL', 
              'Image', 'ImageUrl', 'ImagePath', 'ImageURL',
              'url', 'URL', 'filePath', 'FilePath', 'path', 'Path',
              'photo', 'Photo', 'picture', 'Picture',
              'fileName', 'FileName', 'file', 'File'
            ]
            
            for (const field of imageFields) {
              if (med[field]) {
                imagePath = med[field]
                console.log(`✅ Found image in field: "${field}" = "${imagePath}"`)
                break
              }
            }

            // If no image field found, log all available fields
            if (!imagePath) {
              console.warn(`⚠️ NO IMAGE FIELD FOUND! Available fields:`, Object.keys(med))
            }

            // Construct full URL if path exists
            if (imagePath) {
              // Remove any leading/trailing whitespace
              imagePath = imagePath.trim()
              
              // If it's already a full URL or base64, use as-is
              if (imagePath.startsWith('http://') || 
                  imagePath.startsWith('https://') || 
                  imagePath.startsWith('data:')) {
                console.log(`📌 Using absolute path: ${imagePath}`)
              } else {
                // It's a relative path - construct full URL
                // Remove leading slash if present, we'll add it
                const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath
                
                // Try multiple URL construction methods
                const possibleUrls = [
                  `${BASE_URL}/${cleanPath}`,                    // http://server/path/image.jpg
                  `${BASE_URL}/uploads/${cleanPath}`,             // http://server/uploads/image.jpg
                  `${BASE_URL}/images/${cleanPath}`,              // http://server/images/image.jpg
                  `${BASE_URL}/api/images/${cleanPath}`,          // http://server/api/images/image.jpg
                ]
                
                imagePath = possibleUrls[0] // Use first one by default
                console.log(`🔗 Constructed URL: ${imagePath}`)
                console.log(`🔗 Alternative URLs to try:`, possibleUrls)
              }
            }

            console.log(`🖼️ Final Image Path: ${imagePath || 'NULL'}`)

            return {
              id: med.id,
              name: med.medicationName || med.name || med.medicineName,
              activeIngredient: med.activeIngredient || '',
              price: `$${parseFloat(med.price || 0).toFixed(2)}`,
              image: imagePath
            }
          })
        }
      })
      
      setCategories(transformedData)
      localStorage.setItem('catalogCategories', JSON.stringify(transformedData))
      
    } catch (err) {
      console.error('❌ Error fetching categories:', err)
      setError(err.message)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

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
    setNewMedicine({ name: '', activeIngredient: '', price: '', image: null, imagePreview: '' })
  }

  const handleNewMedicineImage = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB')
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

    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setEditMedicineForm(prev => ({ ...prev, image: file, imagePreview: reader.result }))
    }
    reader.readAsDataURL(file)
  }

  // Save new medicine (POST)
  const saveMedicine = async (categoryId) => {
    if (!newMedicine.name.trim() || !newMedicine.activeIngredient.trim() || !newMedicine.price.trim()) {
      alert('Please fill in all required fields')
      return
    }

    if (!isLoggedIn()) {
      alert('Please login to add medicines')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const category = categories.find(cat => cat.id === categoryId)
      if (!category) throw new Error('Category not found')

      const formData = new FormData()
      formData.append('MedicationName', newMedicine.name.trim())
      formData.append('CategoryName', category.name)
      formData.append('ActiveIngredient', newMedicine.activeIngredient.trim())
      formData.append('Price', parseFloat(newMedicine.price))
      formData.append('CategoryId', categoryId)
      
      if (newMedicine.image) {
        // Try different parameter names the API might expect
        formData.append('Image', newMedicine.image)      // Capital I
        formData.append('image', newMedicine.image)      // lowercase i
        formData.append('ImageFile', newMedicine.image)  // Alternative name
        formData.append('file', newMedicine.image)       // Generic name
        
        console.log('📤 Uploading image:', {
          name: newMedicine.image.name,
          size: newMedicine.image.size,
          type: newMedicine.image.type
        })
      } else {
        console.warn('⚠️ No image selected')
      }

      // 🔍 DEBUG: Log FormData contents
      console.log('📤 FormData contents:')
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `FILE: ${value.name}` : value)
      }

      const response = await fetch(`${API_BASE_URL}/CentralMedicine`, {
        method: 'POST',
        headers: getFormDataHeaders(),
        body: formData
      })

      if (response.status === 401) {
        setError('Session expired. Please login again.')
        return
      }

      if (response.status === 400) {
        const errorData = await response.json()
        console.log('❌ Validation Error Response:', errorData)
        const errorMessages = Object.values(errorData.errors || {}).flat().join(', ')
        throw new Error(`Validation error: ${errorMessages}`)
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.log('❌ Error Response:', errorText)
        throw new Error(`Failed to add medicine: ${errorText}`)
      }

      const responseText = await response.text()
      console.log('📥 RAW Response (POST):', responseText)
      
      let createdData = null
      try {
        createdData = JSON.parse(responseText)
        console.log('✅ Created Medicine Response:', createdData)
        console.log('🔍 ALL Response Fields:', Object.keys(createdData))
        
        // Check for image in response
        const imageFields = Object.keys(createdData).filter(key => 
          key.toLowerCase().includes('image') || 
          key.toLowerCase().includes('url') ||
          key.toLowerCase().includes('path') ||
          key.toLowerCase().includes('file')
        )
        console.log('🖼️ Possible image fields in response:', imageFields)
        imageFields.forEach(field => {
          console.log(`  ${field}:`, createdData[field])
        })
      } catch (e) {
        console.log('⚠️ Response is not JSON')
      }

      // Wait longer for server to process image
      await new Promise(resolve => setTimeout(resolve, 1500))
      await fetchCategories()

      setExpandedCategories(prev => ({ ...prev, [categoryId]: true }))
      setAddingToCategory(null)
      setNewMedicine({ name: '', activeIngredient: '', price: '', image: null, imagePreview: '' })
      
      alert('Medicine added successfully!')
    } catch (err) {
      console.error('❌ Error adding medicine:', err)
      setError(err.message)
      alert(`Failed to add medicine: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleEditMedicine = (medicine) => {
    setEditingMedicine(medicine.id)
    setEditMedicineForm({
      name: medicine.name,
      activeIngredient: medicine.activeIngredient || '',
      price: medicine.price.replace('$', ''),
      image: null,
      imagePreview: medicine.image || '' // Show existing image in preview
    })
  }

  // Save edited medicine (PUT)
  const saveEditMedicine = async (categoryId, medicineId) => {
    if (!editMedicineForm.name.trim() || !editMedicineForm.activeIngredient.trim() || !editMedicineForm.price.trim()) {
      alert('Please fill in all required fields')
      return
    }

    if (!isLoggedIn()) {
      alert('Please login to edit medicines')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const category = categories.find(cat => cat.id === categoryId)
      if (!category) throw new Error('Category not found')

      const formData = new FormData()
      formData.append('MedicationName', editMedicineForm.name.trim())
      formData.append('CategoryName', category.name)
      formData.append('ActiveIngredient', editMedicineForm.activeIngredient.trim())
      formData.append('Price', parseFloat(editMedicineForm.price))
      formData.append('CategoryId', categoryId)
      
      // Only append image if a NEW file was selected
      if (editMedicineForm.image) {
        formData.append('Image', editMedicineForm.image)
        formData.append('image', editMedicineForm.image)
        formData.append('ImageFile', editMedicineForm.image)
        formData.append('file', editMedicineForm.image)
        console.log('📤 Updating image:', editMedicineForm.image.name)
      }

      console.log('💾 Updating medicine with FormData...')

      const response = await fetch(`${API_BASE_URL}/CentralMedicine/${medicineId}`, {
        method: 'PUT',
        headers: getFormDataHeaders(),
        body: formData
      })

      if (response.status === 401) {
        setError('Session expired. Please login again.')
        return
      }

      if (response.status === 400) {
        const errorData = await response.json()
        console.log('❌ Validation Error Response:', errorData)
        const errorMessages = Object.values(errorData.errors || {}).flat().join(', ')
        throw new Error(`Validation error: ${errorMessages}`)
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.log('❌ Error Response:', errorText)
        throw new Error(`Failed to update medicine: ${errorText}`)
      }

      // 🔍 DEBUG: Check PUT response
      const responseText = await response.text()
      console.log('📥 RAW Response (PUT):', responseText)
      try {
        const updatedData = JSON.parse(responseText)
        console.log('✅ Updated Medicine Response:', updatedData)
      } catch {}

      await new Promise(resolve => setTimeout(resolve, 1500))
      await fetchCategories()

      setExpandedCategories(prev => ({ ...prev, [categoryId]: true }))
      setEditingMedicine(null)
      setEditMedicineForm({ name: '', activeIngredient: '', price: '', image: null, imagePreview: '' })
      
      alert('Medicine updated successfully!')
    } catch (err) {
      console.error('❌ Error updating medicine:', err)
      setError(err.message)
      alert(`Failed to update medicine: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Delete medicine
  const deleteMedicine = async (categoryId, medicineId) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) return

    if (!isLoggedIn()) {
      alert('Please login to delete medicines')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/CentralMedicine/${medicineId}`, {
        method: 'DELETE',
        headers: getJsonHeaders(),
      })

      if (response.status === 401) {
        setError('Session expired. Please login again.')
        return
      }

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to delete medicine: ${errorText}`)
      }

      await new Promise(resolve => setTimeout(resolve, 500))
      await fetchCategories()

      setExpandedCategories(prev => ({ ...prev, [categoryId]: true }))
      alert('Medicine deleted successfully!')
    } catch (err) {
      console.error('❌ Error deleting medicine:', err)
      setError(err.message)
      alert(`Failed to delete medicine: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Save new category
  const saveCategory = async () => {
    if (!newCategoryData.name.trim()) {
      alert('Please enter a category name')
      return
    }

    if (!isLoggedIn()) {
      alert('Please login to add categories')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/Category`, {
        method: 'POST',
        headers: getJsonHeaders(),
        body: JSON.stringify({
          categoryName: newCategoryData.name.trim(),
          icon: newCategoryData.icon
        })
      })

      if (response.status === 401) {
        setError('Session expired. Please login again.')
        return
      }

      if (response.status === 400) {
        const errorData = await response.json()
        console.log('❌ Validation Error Response:', errorData)
        const errorMessages = Object.values(errorData.errors || {}).flat().join(', ')
        throw new Error(`Validation error: ${errorMessages}`)
      }

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to create category: ${errorText}`)
      }

      await fetchCategories()
      setAddingCategory(false)
      setNewCategoryData({ name: '', icon: '💊' })
      alert('Category created successfully!')
    } catch (err) {
      console.error('❌ Error creating category:', err)
      setError(err.message)
      alert(`Failed to create category: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Delete category
  const deleteCategory = async (categoryId) => {
    const categoryToDelete = categories.find(c => c.id === categoryId)
    
    if (!categoryToDelete) return
    
    const medicineCount = categoryToDelete.medicines.length
    const confirmMessage = medicineCount > 0
      ? `Are you sure you want to delete "${categoryToDelete.name}"? This will also delete ${medicineCount} medicine(s) in this category.`
      : `Are you sure you want to delete "${categoryToDelete.name}"?`
    
    if (!window.confirm(confirmMessage)) return

    if (!isLoggedIn()) {
      alert('Please login to delete categories')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/Category/${categoryId}`, {
        method: 'DELETE',
        headers: getJsonHeaders(),
      })

      if (response.status === 401) {
        setError('Session expired. Please login again.')
        return
      }

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to delete category: ${errorText}`)
      }

      await fetchCategories()
      alert('Category deleted successfully!')
    } catch (err) {
      console.error('❌ Error deleting category:', err)
      setError(err.message)
      alert(`Failed to delete category: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-content">
      <div className="section">
        {/* Header */}
        <div className="section-header">
          <h3 className="section-title">Global Catalog Categories</h3>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              className="btn btn-secondary"
              onClick={fetchCategories}
              disabled={loading}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              🔄 Refresh
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setAddingCategory(true)}
              disabled={loading}
            >
              + Add Category
            </button>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div style={{ padding: '16px', textAlign: 'center', color: '#666', backgroundColor: '#f0f8ff', border: '1px solid #b3d9ff', borderRadius: '4px', marginBottom: '16px' }}>
            ⏳ Loading...
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{ padding: '16px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px', color: '#c00', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <strong>⚠️ Error:</strong>
              <div style={{ marginTop: '8px', whiteSpace: 'pre-wrap' }}>{error}</div>
            </div>
            <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#c00', cursor: 'pointer', fontSize: '20px', padding: '0 8px', fontWeight: 'bold' }}>×</button>
          </div>
        )}

        {/* Search Box */}
        <div className="table-controls">
          <div className="search-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input type="text" placeholder="Search categories..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        {/* Add Category Form */}
        {addingCategory && (
          <div style={{ padding: '16px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>Add New Category</h4>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Category Name</label>
                <input type="text" placeholder="Enter category name" value={newCategoryData.name} onChange={(e) => setNewCategoryData({ ...newCategoryData, name: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', fontSize: '14px' }} disabled={loading} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Icon</label>
                <select value={newCategoryData.icon} onChange={(e) => setNewCategoryData({ ...newCategoryData, icon: e.target.value })} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }} disabled={loading}>
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
                <button onClick={saveCategory} style={{ padding: '8px 16px', backgroundColor: 'var(--success)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }} disabled={loading}>
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => { setAddingCategory(false); setNewCategoryData({ name: '', icon: '💊' }) }} style={{ padding: '8px 16px', backgroundColor: '#999', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }} disabled={loading}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Categories List */}
        <div className="catalog-categories" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredCategories.length === 0 && !loading && (
            <div style={{ padding: '32px', textAlign: 'center', color: '#999', border: '2px dashed #ddd', borderRadius: '8px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
              <p style={{ margin: '0', fontSize: '16px' }}>No categories found</p>
              <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                {searchTerm ? 'Try a different search term' : 'Click "Add Category" to create your first category'}
              </p>
            </div>
          )}

          {filteredCategories.map((category) => (
            <div key={category.id} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>

              {/* Category Header */}
              <div
                onClick={() => toggleCategory(category.id)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: '#f5f5f5', cursor: 'pointer', userSelect: 'none', transition: 'background-color 0.2s' }}
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
                <span style={{ fontSize: '18px', color: '#666', marginRight: '20px' }}>
                  {expandedCategories[category.id] ? '▼' : '▶'}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteCategory(category.id); }}
                    style={{ padding: '10px', backgroundColor: 'transparent', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--danger)'; e.currentTarget.style.color = 'white' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--danger)' }}
                    title="Delete Category"
                    disabled={loading}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Medicines List */}
              {expandedCategories[category.id] && (
                <div style={{ padding: '16px', backgroundColor: '#fff' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <button onClick={() => addMedicine(category.id)} style={{ padding: '8px 16px', backgroundColor: 'var(--success)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }} disabled={loading}>
                      + Add Medicine
                    </button>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                        <th style={{ textAlign: 'left', padding: '8px', fontWeight: '600', color: '#333' }}>Photo</th>
                        <th style={{ textAlign: 'left', padding: '8px', fontWeight: '600', color: '#333' }}>Medicine Name</th>
                        <th style={{ textAlign: 'left', padding: '8px', fontWeight: '600', color: '#333', width: '40%' }}>Active Ingredient</th>
                        <th style={{ textAlign: 'left', padding: '8px', fontWeight: '600', color: '#333' }}>Price</th>
                        <th style={{ textAlign: 'center', padding: '8px', fontWeight: '600', color: '#333' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>

                      {/* Add New Medicine Row */}
                      {addingToCategory === category.id && (
                        <tr style={{ borderBottom: '1px solid #f0f0f0', backgroundColor: '#f9f9f9' }}>
                          <td style={{ padding: '12px 8px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                              {newMedicine.imagePreview ? (
                                <img src={newMedicine.imagePreview} alt="Preview" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ddd' }} />
                              ) : (
                                <div style={{ width: '50px', height: '50px', borderRadius: '6px', border: '2px dashed #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa' }}>
                                  <span style={{ fontSize: '20px' }}>📷</span>
                                </div>
                              )}
                              <label style={{ cursor: 'pointer' }}>
                                <span style={{ fontSize: '11px', color: 'var(--primary-gold)', textDecoration: 'underline' }}>
                                  {newMedicine.imagePreview ? 'Change' : 'Upload'}
                                </span>
                                <input type="file" accept="image/*" onChange={handleNewMedicineImage} style={{ display: 'none' }} disabled={loading} />
                              </label>
                            </div>
                          </td>
                          <td style={{ padding: '12px 8px' }}>
                            <input type="text" placeholder="Medicine name *" value={newMedicine.name} onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })} style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} disabled={loading} />
                          </td>
                          <td style={{ padding: '12px 8px' }}>
                            <textarea placeholder="Active ingredient *" value={newMedicine.activeIngredient} onChange={(e) => setNewMedicine({ ...newMedicine, activeIngredient: e.target.value })} rows={3} style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', resize: 'vertical', fontSize: '13px', fontFamily: 'inherit', minHeight: '60px' }} disabled={loading} />
                          </td>
                          <td style={{ padding: '12px 8px' }}>
                            <input type="number" placeholder="Price *" value={newMedicine.price} onChange={(e) => setNewMedicine({ ...newMedicine, price: e.target.value })} style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} disabled={loading} />
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button onClick={() => saveMedicine(category.id)} style={{ padding: '4px 12px', backgroundColor: 'var(--success)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }} disabled={loading}>Save</button>
                              <button onClick={() => { setAddingToCategory(null); setNewMedicine({ name: '', activeIngredient: '', price: '', image: null, imagePreview: '' }) }} style={{ padding: '4px 12px', backgroundColor: '#999', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }} disabled={loading}>Cancel</button>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Existing Medicines */}
                      {category.medicines.length > 0 ? (
                        category.medicines.map((medicine) => (
                          <tr key={medicine.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                            <td style={{ padding: '12px 8px' }}>
                              {editingMedicine === medicine.id ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                  {editMedicineForm.imagePreview ? (
                                    <img src={editMedicineForm.imagePreview} alt="Preview" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ddd' }} />
                                  ) : (
                                    <div style={{ width: '50px', height: '50px', borderRadius: '6px', border: '2px dashed #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa' }}>
                                      <span style={{ fontSize: '20px' }}>📷</span>
                                    </div>
                                  )}
                                  <label style={{ cursor: 'pointer' }}>
                                    <span style={{ fontSize: '11px', color: '#2196f3', textDecoration: 'underline' }}>{editMedicineForm.imagePreview ? 'Change' : 'Upload'}</span>
                                    <input type="file" accept="image/*" onChange={handleEditMedicineImage} style={{ display: 'none' }} disabled={loading} />
                                  </label>
                                </div>
                              ) : (
                                medicine.image ? (
                                  <img 
                                    src={medicine.image} 
                                    alt={medicine.name} 
                                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ddd' }} 
                                    onLoad={(e) => {
                                      console.log(`✅ Image loaded successfully: ${medicine.image}`)
                                    }}
                                    onError={(e) => { 
                                      console.error(`❌ Image failed to load: ${medicine.image}`)
                                      console.log('Trying alternative paths...')
                                      
                                      // Try alternative paths
                                      const alternatives = [
                                        `${BASE_URL}/${medicine.image.split('/').pop()}`,
                                        `${BASE_URL}/uploads/${medicine.image.split('/').pop()}`,
                                        `${BASE_URL}/images/${medicine.image.split('/').pop()}`,
                                      ]
                                      
                                      console.log('Alternative URLs:', alternatives)
                                      
                                      e.target.onerror = null
                                      e.target.src = 'https://via.placeholder.com/50?text=No+Image'
                                    }} 
                                  />
                                ) : (
                                  <div style={{ width: '50px', height: '50px', borderRadius: '6px', border: '2px dashed #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa' }}>
                                    <span style={{ fontSize: '20px' }}>💊</span>
                                  </div>
                                )
                              )}
                            </td>
                            <td style={{ padding: '12px 8px' }}>
                              {editingMedicine === medicine.id ? (
                                <input type="text" value={editMedicineForm.name} onChange={(e) => setEditMedicineForm({ ...editMedicineForm, name: e.target.value })} style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} disabled={loading} />
                              ) : (
                                <span style={{ fontWeight: '500' }}>{medicine.name}</span>
                              )}
                            </td>
                            <td style={{ padding: '12px 8px' }}>
                              {editingMedicine === medicine.id ? (
                                <textarea value={editMedicineForm.activeIngredient} onChange={(e) => setEditMedicineForm({ ...editMedicineForm, activeIngredient: e.target.value })} rows={3} style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', resize: 'vertical', fontSize: '13px', fontFamily: 'inherit', minHeight: '60px' }} disabled={loading} />
                              ) : (
                                <span style={{ color: '#555', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }}>{medicine.activeIngredient || '-'}</span>
                              )}
                            </td>
                            <td style={{ padding: '12px 8px' }}>
                              {editingMedicine === medicine.id ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span style={{ color: '#666' }}>$</span>
                                  <input type="number" value={editMedicineForm.price} onChange={(e) => setEditMedicineForm({ ...editMedicineForm, price: e.target.value })} style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} disabled={loading} />
                                </div>
                              ) : (
                                <span style={{ color: '#2e7d32', fontWeight: '600' }}>{medicine.price}</span>
                              )}
                            </td>
                            <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                              {editingMedicine === medicine.id ? (
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                  <button onClick={() => saveEditMedicine(category.id, medicine.id)} style={{ padding: '4px 12px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }} disabled={loading}>Save</button>
                                  <button onClick={() => { setEditingMedicine(null); setEditMedicineForm({ name: '', activeIngredient: '', price: '', image: null, imagePreview: '' }) }} style={{ padding: '4px 12px', backgroundColor: '#999', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }} disabled={loading}>Cancel</button>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                  <button onClick={() => handleEditMedicine(medicine)} style={{ padding: '4px 12px', backgroundColor: 'var(--primary-gold)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }} disabled={loading}>Edit</button>
                                  <button onClick={() => deleteMedicine(category.id, medicine.id)} style={{ padding: '4px 12px', backgroundColor: 'var(--danger)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }} disabled={loading}>Delete</button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" style={{ padding: '12px', textAlign: 'center', color: '#999' }}>
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