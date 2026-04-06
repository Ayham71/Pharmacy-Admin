import React, { useState } from 'react'

const GlobalCatalog = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCategories, setExpandedCategories] = useState({})
  const [addingToCategory, setAddingToCategory] = useState(null)
  const [newMedicine, setNewMedicine] = useState({ name: '', price: '' })
  const [addingCategory, setAddingCategory] = useState(false)
  const [newCategoryData, setNewCategoryData] = useState({ name: '', icon: '💊' })
  
  const [categories, setCategories] = useState([
    { 
      id: 1, 
      name: 'Painkillers', 
      icon: '💊',
      medicines: [
        { id: 101, name: 'Paracetamol 500mg', stock: 1240, price: '$5.99' },
        { id: 102, name: 'Ibuprofen 400mg', stock: 890, price: '$4.50' },
        { id: 103, name: 'Aspirin 100mg', stock: 2100, price: '$3.99' },
      ]
    },
    { 
      id: 2, 
      name: 'Chronic Meds', 
      icon: '💉',
      medicines: [
        { id: 201, name: 'Insulin Glargine', stock: 450, price: '$89.00' },
        { id: 202, name: 'Metformin 500mg', stock: 1100, price: '$12.99' },
      ]
    },
    { 
      id: 3, 
      name: 'Baby Care', 
      icon: '🍼',
      medicines: [
        { id: 301, name: 'Baby Powder', stock: 320, price: '$6.99' },
        { id: 302, name: 'Baby Oil', stock: 280, price: '$7.50' },
      ]
    },
    { 
      id: 4, 
      name: 'Supplements', 
      icon: '🌿',
      medicines: [
        { id: 401, name: 'Vitamin D3', stock: 890, price: '$9.99' },
      ]
    },
    { 
      id: 5, 
      name: 'Antibiotics', 
      icon: '🔬',
      medicines: [
        { id: 501, name: 'Amoxicillin 250mg', stock: 890, price: '$12.50' },
        { id: 502, name: 'Azithromycin 500mg', stock: 620, price: '$15.99' },
      ]
    },
    { 
      id: 6, 
      name: 'First Aid', 
      icon: '🩹',
      medicines: [
        { id: 601, name: 'Bandages Pack', stock: 280, price: '$2.99' },
      ]
    },
    { 
      id: 7, 
      name: 'Vitamins', 
      icon: '💪',
      medicines: [
        { id: 701, name: 'Vitamin C 1000mg', stock: 2100, price: '$8.99' },
        { id: 702, name: 'Vitamin B Complex', stock: 1500, price: '$10.50' },
      ]
    },
    { 
      id: 8, 
      name: 'Skin Care', 
      icon: '✨',
      medicines: [
        { id: 801, name: 'Face Cream SPF30', stock: 520, price: '$22.99' },
      ]
    },
  ])

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
    setNewMedicine({ name: '', price: '' })
  }

  const saveMedicine = (categoryId) => {
    if (!newMedicine.name.trim() || !newMedicine.price.trim()) {
      alert('Please fill in all fields')
      return
    }

    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          medicines: [
            ...cat.medicines,
            {
              id: Math.max(...cat.medicines.map(m => m.id), 0) + 1,
              name: newMedicine.name,
              stock: 0,
              price: `$${newMedicine.price}`
            }
          ]
        }
      }
      return cat
    }))
    
    setAddingToCategory(null)
    setNewMedicine({ name: '', price: '' })
  }

  const deleteMedicine = (categoryId, medicineId) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          medicines: cat.medicines.filter(m => m.id !== medicineId)
        }
      }
      return cat
    }))
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

    setCategories([...categories, newCategory])
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
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input 
              type="text" 
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

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
                  onChange={(e) => setNewCategoryData({...newCategoryData, name: e.target.value})}
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
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                  Icon
                </label>
                <select 
                  value={newCategoryData.icon}
                  onChange={(e) => setNewCategoryData({...newCategoryData, icon: e.target.value})}
                  style={{ 
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
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
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Save
                </button>
                <button 
                  onClick={() => {
                    setAddingCategory(false)
                    setNewCategoryData({ name: '', icon: '💊' })
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#999',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

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
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>
                      {category.name}
                    </h4>
                    <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
                      {category.medicines.length} medicines
                    </p>
                  </div>
                </div>
                <span style={{ fontSize: '18px', color: '#666', transition: 'transform 0.2s' }}>
                  {expandedCategories[category.id] ? '▼' : '▶'}
                </span>
              </div>

              {/* Medicines List */}
              {expandedCategories[category.id] && (
                <div style={{ padding: '16px', backgroundColor: '#fff' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <button 
                      onClick={() => addMedicine(category.id)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    >
                      + Add Medicine
                    </button>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                        <th style={{ textAlign: 'left', padding: '8px', fontWeight: '600', color: '#333' }}>Medicine Name</th>
                        <th style={{ textAlign: 'left', padding: '8px', fontWeight: '600', color: '#333' }}>Price</th>
                        <th style={{ textAlign: 'center', padding: '8px', fontWeight: '600', color: '#333' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {addingToCategory === category.id && (
                        <tr style={{ borderBottom: '1px solid #f0f0f0', backgroundColor: '#f9f9f9' }}>
                          <td style={{ padding: '12px 8px' }}>
                            <input 
                              type="text"
                              placeholder="Medicine name"
                              value={newMedicine.name}
                              onChange={(e) => setNewMedicine({...newMedicine, name: e.target.value})}
                              style={{ 
                                width: '100%',
                                padding: '6px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                boxSizing: 'border-box'
                              }}
                            />
                          </td>
                          <td style={{ padding: '12px 8px' }}>
                            <input 
                              type="number"
                              placeholder="e.g., $9.99"
                              value={newMedicine.price}
                              onChange={(e) => setNewMedicine({...newMedicine, price: e.target.value})}
                              style={{ 
                                width: '100%',
                                padding: '6px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                boxSizing: 'border-box'
                              }}
                            />
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button 
                              onClick={() => saveMedicine(category.id)}
                              style={{
                                padding: '4px 12px',
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Save
                            </button>
                            <button 
                              onClick={() => setAddingToCategory(null)}
                              style={{
                                padding: '4px 12px',
                                backgroundColor: '#999',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      )}
                      {category.medicines.length > 0 ? (
                        category.medicines.map((medicine) => (
                          <tr key={medicine.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                            <td style={{ padding: '12px 8px' }}>{medicine.name}</td>
                            <td style={{ padding: '12px 8px' }}>{medicine.price}</td>
                            <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                              <button 
                                onClick={() => deleteMedicine(category.id, medicine.id)}
                                style={{
                                  padding: '4px 12px',
                                  backgroundColor: '#f44336',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px'
                                }}
                              >
                                Delete
                              </button>
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