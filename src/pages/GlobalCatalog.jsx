import React, { useState } from 'react'

const GlobalCatalog = () => {
  const [searchTerm, setSearchTerm] = useState('')
  
  const categories = [
    { id: 1, name: 'Painkillers', items: 540, icon: '💊' },
    { id: 2, name: 'Chronic Meds', items: 1200, icon: '💉' },
    { id: 3, name: 'Baby Care', items: 320, icon: '🍼' },
    { id: 4, name: 'Supplements', items: 890, icon: '🌿' },
    { id: 5, name: 'Antibiotics', items: 450, icon: '🔬' },
    { id: 6, name: 'First Aid', items: 280, icon: '🩹' },
    { id: 7, name: 'Vitamins', items: 670, icon: '💪' },
    { id: 8, name: 'Skin Care', items: 520, icon: '✨' },
  ]

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="page-content">
      <div className="section">
        <div className="section-header">
          <h3 className="section-title">Global Catalog Categories</h3>
          <button className="btn btn-primary">+ Add Category</button>
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

        <div className="catalog-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {filteredCategories.map((category) => (
            <div key={category.id} className="catalog-card" style={{ cursor: 'pointer' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>{category.icon}</div>
              <h4 className="catalog-title">{category.name}</h4>
              <p className="catalog-count">{category.items} items</p>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h3 className="section-title">Recent Medications</h3>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Medication ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="order-id">#MED-4521</td>
                <td>Paracetamol 500mg</td>
                <td>Painkillers</td>
                <td>1,240 units</td>
                <td className="value-cell">$5.99</td>
              </tr>
              <tr>
                <td className="order-id">#MED-4522</td>
                <td>Amoxicillin 250mg</td>
                <td>Antibiotics</td>
                <td>890 units</td>
                <td className="value-cell">$12.50</td>
              </tr>
              <tr>
                <td className="order-id">#MED-4523</td>
                <td>Vitamin C 1000mg</td>
                <td>Vitamins</td>
                <td>2,100 units</td>
                <td className="value-cell">$8.99</td>
              </tr>
              <tr>
                <td className="order-id">#MED-4524</td>
                <td>Insulin Glargine</td>
                <td>Chronic Meds</td>
                <td>450 units</td>
                <td className="value-cell">$89.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default GlobalCatalog