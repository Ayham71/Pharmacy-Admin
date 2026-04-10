import React, { useState } from 'react'

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState('')

  const orders = [
    { id: '#ORD-8821', pharmacy: 'Green Valley Meds', patient: 'John Smith', driver: 'Alex Rivera', status: 'delivered', value: '$42.50', date: '2024-01-15' },
    { id: '#ORD-8820', pharmacy: 'Central Health Hub', patient: 'Emma Johnson', driver: 'Sarah Chen', status: 'delivered', value: '$65.00', date: '2024-01-15' },
    { id: '#ORD-8819', pharmacy: 'Central Health Hub', patient: 'Michael Brown', driver: 'Sarah Chen', status: 'picked-up', value: '$118.00', date: '2024-01-14' },
    { id: '#ORD-8818', pharmacy: 'Sunset Pharmacy', patient: 'Sarah Davis', driver: 'Mark Jenkins', status: 'pending', value: '$15.20', date: '2024-01-14' },
    { id: '#ORD-8817', pharmacy: 'Apex Pharma Care', patient: 'Robert Wilson', driver: 'Jessica Wong', status: 'delivered', value: '$210.44', date: '2024-01-13' },
    { id: '#ORD-8816', pharmacy: 'MedPlus Express', patient: 'Lisa Anderson', driver: 'David Miller', status: 'delivered', value: '$89.99', date: '2024-01-13' },
  ]

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.pharmacy.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="page-content">
      <div className="section">
        <div className="section-header">
          <h3 className="section-title">All Orders</h3>
        </div>

        <div className="table-controls">
          <div className="search-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input 
              type="text" 
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Pharmacy</th>
                <th>Patient</th>
                <th>Driver</th>
                <th>Status</th>
                <th>Value</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="order-id">{order.id}</td>
                  <td>{order.pharmacy}</td>
                  <td>{order.patient}</td>
                  <td>
                    <div className="driver-info">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${order.driver.replace(' ', '+')}&background=FFD700&color=fff`} 
                        alt={order.driver} 
                        className="driver-avatar" 
                      />
                      <span>{order.driver}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${order.status}`}>
                      {order.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="value-cell">{order.value}</td>
                  <td>{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Orders