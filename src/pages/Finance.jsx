import React, { useState } from 'react'

const Finance = () => {
  const [period, setPeriod] = useState('monthly')

  const transactions = [
    { id: '#TRX-4521', type: 'income', description: 'Order Payment - Green Valley Meds', amount: '$1,240.00', date: '2024-01-15', status: 'completed' },
    { id: '#TRX-4522', type: 'income', description: 'Order Payment - Central Health Hub', amount: '$890.50', date: '2024-01-15', status: 'completed' },
    { id: '#TRX-4523', type: 'expense', description: 'Driver Payout - Alex Rivera', amount: '-$450.00', date: '2024-01-14', status: 'completed' },
    { id: '#TRX-4524', type: 'expense', description: 'Driver Payout - Sarah Chen', amount: '-$380.00', date: '2024-01-14', status: 'completed' },
    { id: '#TRX-4525', type: 'income', description: 'Order Payment - Apex Pharma Care', amount: '$2,100.00', date: '2024-01-13', status: 'pending' },
  ]

  const stats = [
    { label: 'Total Revenue', value: '$124,500', change: '+12.5%', icon: '💰' },
    { label: 'Total Expenses', value: '$45,200', change: '+5.2%', icon: '💸' },
    { label: 'Net Profit', value: '$79,300', change: '+18.3%', icon: '📈' },
    { label: 'Pending Payments', value: '$12,400', change: '+2.1%', icon: '⏳' },
  ]

  return (
    <div className="page-content">
      {/* Finance Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-header">
              <span className="stat-label">{stat.label}</span>
              <div className="stat-icon gold" style={{ fontSize: '20px' }}>
                {stat.icon}
              </div>
            </div>
            <div className="stat-value">
              <span className="stat-number">{stat.value}</span>
              <span className="stat-change positive">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Transactions */}
      <div className="section">
        <div className="section-header">
          <h3 className="section-title">Recent Transactions</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select 
              className="filter-btn"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <button className="btn btn-primary">Export Report</button>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Type</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="order-id">{transaction.id}</td>
                  <td>
                    <span style={{ 
                      textTransform: 'capitalize',
                      color: transaction.type === 'income' ? '#28A745' : '#DC3545',
                      fontWeight: '500'
                    }}>
                      {transaction.type}
                    </span>
                  </td>
                  <td>{transaction.description}</td>
                  <td className="value-cell" style={{ 
                    color: transaction.type === 'income' ? '#28A745' : '#DC3545'
                  }}>
                    {transaction.amount}
                  </td>
                  <td>{transaction.date}</td>
                  <td>
                    <span className={`status-badge ${transaction.status}`}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Finance