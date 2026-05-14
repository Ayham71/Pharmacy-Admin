import React, { useState, useEffect } from 'react'

const API_URL = 'http://165.22.91.187:5000/api/AdminSettlement'

const Finance = () => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    type: 'income',
    status: 'pending',
    date: new Date().toISOString().split('T')[0],
  })

  // ─── Calculated Stats ─────────────────────────────────────────────────────
  const totalRevenue = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount) || 0), 0)

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount) || 0), 0)

  const netProfit = totalRevenue - totalExpenses

  const pendingPayments = transactions
    .filter((t) => t.status === 'pending')
    .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount) || 0), 0)

  const pendingCount = transactions.filter((t) => t.status === 'pending').length

  // ─── Dynamic Change Calculation ───────────────────────────────────────────
  // Split transactions into current and previous half to compare trends
  const midPoint = Math.floor(transactions.length / 2)
  const recentTransactions = transactions.slice(midPoint)
  const olderTransactions = transactions.slice(0, midPoint)

  const calcChange = (recent, older, type) => {
    // If no transactions at all, return neutral
    if (transactions.length === 0) return { label: '—', changeType: 'neutral' }

    const recentTotal = recent
      .filter((t) => t.type === type)
      .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount) || 0), 0)

    const olderTotal = older
      .filter((t) => t.type === type)
      .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount) || 0), 0)

    // Not enough data to compare yet
    if (olderTotal === 0 && recentTotal === 0) return { label: '—', changeType: 'neutral' }

    // First batch of transactions, no older data to compare
    if (olderTotal === 0) return { label: 'New', changeType: 'positive' }

    const percent = (((recentTotal - olderTotal) / olderTotal) * 100).toFixed(1)
    const isPositive = parseFloat(percent) >= 0

    return {
      label: `${isPositive ? '+' : ''}${percent}%`,
      // For expenses, an increase is bad (negative), decrease is good (positive)
      changeType: type === 'expense'
        ? isPositive ? 'negative' : 'positive'
        : isPositive ? 'positive' : 'negative',
    }
  }

  const revenueChange = calcChange(recentTransactions, olderTransactions, 'income')
  const expenseChange = calcChange(recentTransactions, olderTransactions, 'expense')

  // Net profit change
  const calcNetChange = () => {
    if (transactions.length === 0) return { label: '—', changeType: 'neutral' }

    const recentNet =
      recentTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount) || 0), 0) -
      recentTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount) || 0), 0)

    const olderNet =
      olderTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount) || 0), 0) -
      olderTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount) || 0), 0)

    if (olderNet === 0 && recentNet === 0) return { label: '—', changeType: 'neutral' }
    if (olderNet === 0) return { label: 'New', changeType: recentNet >= 0 ? 'positive' : 'negative' }

    const percent = (((recentNet - olderNet) / Math.abs(olderNet)) * 100).toFixed(1)
    const isPositive = parseFloat(percent) >= 0

    return {
      label: `${isPositive ? '+' : ''}${percent}%`,
      changeType: isPositive ? 'positive' : 'negative',
    }
  }

  const netProfitChange = calcNetChange()

  // Pending change label
  const pendingChange = () => {
    if (pendingCount === 0) return { label: '—', changeType: 'neutral' }
    return {
      label: `${pendingCount} pending`,
      changeType: 'positive',
    }
  }

  const pendingInfo = pendingChange()

  // ─── Progress bar percentages (relative to max value) ────────────────────
  const maxValue = Math.max(totalRevenue, totalExpenses, 1)
  const revenueProgress = Math.round((totalRevenue / maxValue) * 100)
  const expenseProgress = Math.round((totalExpenses / maxValue) * 100)
  const netProfitProgress = netProfit > 0 ? Math.round((netProfit / totalRevenue) * 100) || 0 : 0
  const pendingProgress = totalRevenue > 0 ? Math.round((pendingPayments / totalRevenue) * 100) || 0 : 0

  const stats = [
    {
      label: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      ),
      change: revenueChange.label,
      changeType: revenueChange.changeType,
      progress: revenueProgress,
    },
    {
      label: 'Total Expenses',
      value: `$${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
          <path d="M20 12V22H4V12" /><path d="M22 7H2v5h20V7z" /><path d="M12 22V7" />
          <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
          <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
        </svg>
      ),
      change: expenseChange.label,
      changeType: expenseChange.changeType,
      progress: expenseProgress,
    },
    {
      label: 'Net Profit',
      value: `$${netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      ),
      change: netProfitChange.label,
      changeType: netProfitChange.changeType,
      progress: netProfitProgress,
    },
    {
      label: 'Pending Payments',
      value: `$${pendingPayments.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      change: pendingInfo.label,
      changeType: pendingInfo.changeType,
      progress: pendingProgress,
    },
  ]

  // ─── Filtered Transactions ────────────────────────────────────────────────
  const filteredTransactions = transactions.filter((t) => {
    const matchSearch =
      t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(t.id).includes(searchTerm)
    const matchType = filterType === 'all' || t.type === filterType
    return matchSearch && matchType
  })

  // ─── GET ──────────────────────────────────────────────────────────────────
  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(API_URL)

      // 404 means no data yet, not a real error
      if (response.status === 404) {
        setTransactions([])
        return
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setTransactions(Array.isArray(data) ? data : [])

    } catch (err) {
      console.error('GET Error:', err)
      // Only show error for real failures, not empty data
      if (response?.status !== 404) {
        setError('Failed to load transactions. Please try again.')
      }
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  // ─── POST ─────────────────────────────────────────────────────────────────
  const handleAddTransaction = async (e) => {
    e.preventDefault()
    try {
      setSubmitLoading(true)
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTransaction),
      })
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      setTransactions((prev) => [...prev, data])
      setShowAddModal(false)
      setNewTransaction({
        description: '',
        amount: '',
        type: 'income',
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
      })
      showSuccess('Transaction added successfully!')
    } catch (err) {
      setError('Failed to add transaction. Please try again.')
      console.error('POST Error:', err)
    } finally {
      setSubmitLoading(false)
    }
  }

  // ─── PUT ──────────────────────────────────────────────────────────────────
  const handleEditTransaction = async (e) => {
    e.preventDefault()
    try {
      setSubmitLoading(true)
      const response = await fetch(`${API_URL}/${selectedTransaction.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedTransaction),
      })
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const updated = await response.json()
      setTransactions((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      )
      setShowEditModal(false)
      setSelectedTransaction(null)
      showSuccess('Transaction updated successfully!')
    } catch (err) {
      setError('Failed to update transaction. Please try again.')
      console.error('PUT Error:', err)
    } finally {
      setSubmitLoading(false)
    }
  }

  const showSuccess = (msg) => {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(''), 3500)
  }

  const openEditModal = (transaction) => {
    setSelectedTransaction({ ...transaction })
    setShowEditModal(true)
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  // ─── Form Fields ──────────────────────────────────────────────────────────
  const renderFormFields = (data, setData) => (
    <>
      <div className="form-group">
        <label className="form-label">Description</label>
        <input
          className="form-input"
          type="text"
          placeholder="e.g. Order Payment - Pharmacy Name"
          value={data.description}
          onChange={(e) => setData({ ...data, description: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Amount ($)</label>
        <input
          className="form-input"
          type="number"
          placeholder="0.00"
          min="0"
          step="0.01"
          value={data.amount}
          onChange={(e) => setData({ ...data, amount: e.target.value })}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Type</label>
          <select
            className="form-input"
            value={data.type}
            onChange={(e) => setData({ ...data, type: e.target.value })}
          >
            <option value="income">💚 Income</option>
            <option value="expense">🔴 Expense</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Status</label>
          <select
            className="form-input"
            value={data.status}
            onChange={(e) => setData({ ...data, status: e.target.value })}
          >
            <option value="pending">⏳ Pending</option>
            <option value="completed">✅ Completed</option>
            <option value="failed">❌ Failed</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Date</label>
        <input
          className="form-input"
          type="date"
          value={data.date}
          onChange={(e) => setData({ ...data, date: e.target.value })}
          required
        />
      </div>
    </>
  )

  // ─── Modal Component ──────────────────────────────────────────────────────
  const Modal = ({ title, onClose, onSubmit, children }) => (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        className="settings-card"
        style={{ width: '100%', maxWidth: '500px', margin: '20px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '1px solid var(--gray-200)',
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--gray-900)', margin: 0 }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--gray-500)',
              fontSize: '20px',
              lineHeight: 1,
              padding: '4px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={onSubmit}>
          {children}
          <div className="form-actions" style={{ marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitLoading}>
              {submitLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid #fff',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                      display: 'inline-block',
                    }}
                  />
                  Saving...
                </span>
              ) : title.includes('Add') ? '✅ Add Transaction' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="page-content">

      {/* ── Page Header ── */}
      <div className="section-header" style={{ marginBottom: '28px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--gray-900)', margin: 0 }}>
            Finance & Settlements
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--gray-500)', marginTop: '4px' }}>
            Manage all financial transactions and settlements
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="btn btn-secondary"
            onClick={fetchTransactions}
            disabled={loading}
            style={{ padding: '8px 16px', fontSize: '14px' }}
          >
            🔄 Refresh
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Transaction
          </button>
        </div>
      </div>

      {/* ── Success Message ── */}
      {successMessage && (
        <div className="success-message" style={{ borderLeft: '4px solid var(--success)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {successMessage}
        </div>
      )}

      {/* ── Error Message ── */}
      {error && (
        <div className="error-message">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
          <button
            onClick={() => setError(null)}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--danger)',
              fontWeight: '700',
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Stats Grid ── */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {stats.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="stat-header">
              <span className="stat-label">{stat.label}</span>
              <div className="stat-icon gold">{stat.icon}</div>
            </div>
            <div className="stat-value">
              <span className="stat-number" style={{ fontSize: '24px' }}>{stat.value}</span>
              {/* Only render the change badge if there is actual data */}
              {transactions.length > 0 && (
                <span className={`stat-change ${stat.changeType}`}>{stat.change}</span>
              )}
            </div>
            <div className="stat-progress">
              <div className="stat-progress-bar" style={{ width: `${stat.progress}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Transactions Section ── */}
      <div className="section">

        {/* Section Header */}
        <div className="section-header">
          <h3 className="section-title">Recent Transactions</h3>
          <span style={{ fontSize: '13px', color: 'var(--gray-500)', fontWeight: '500' }}>
            {filteredTransactions.length} of {transactions.length} records
          </span>
        </div>

        {/* Search and Filter */}
        <div className="table-controls">
          <div className="search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="filter-btn"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ cursor: 'pointer' }}
          >
            <option value="all">All Types</option>
            <option value="income">💚 Income</option>
            <option value="expense">🔴 Expense</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', gap: '16px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                border: '4px solid var(--gray-200)',
                borderTop: '4px solid var(--primary-gold)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <span style={{ color: 'var(--gray-500)', fontWeight: '500' }}>Loading transactions...</span>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="page-placeholder" style={{ padding: '60px' }}>
            <div className="page-placeholder-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="36" height="36">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <h2>No Transactions Found</h2>
            <p>
              {searchTerm || filterType !== 'all'
                ? 'Try adjusting your search or filter.'
                : 'Click "Add Transaction" to create your first record.'}
            </p>
          </div>
        ) : (
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t) => (
                  <tr key={t.id}>
                    {/* ID */}
                    <td className="order-id">#{t.id}</td>

                    {/* Type */}
                    <td>
                      <span
                        style={{
                          fontWeight: '600',
                          textTransform: 'capitalize',
                          color: t.type === 'income' ? 'var(--success)' : 'var(--danger)',
                        }}
                      >
                        {t.type === 'income' ? '💚' : '🔴'} {t.type}
                      </span>
                    </td>

                    {/* Description */}
                    <td>{t.description}</td>

                    {/* Amount */}
                    <td
                      className="value-cell"
                      style={{ color: t.type === 'income' ? 'var(--success)' : 'var(--danger)' }}
                    >
                      {t.type === 'expense' ? '-' : '+'}$
                      {Math.abs(parseFloat(t.amount) || 0).toFixed(2)}
                    </td>

                    {/* Date */}
                    <td>{t.date}</td>

                    {/* Status */}
                    <td>
                      <span
                        className={`status-badge ${
                          t.status === 'completed'
                            ? 'delivered'
                            : t.status === 'pending'
                            ? 'pending'
                            : 'picked-up'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="table-actions">
                        <button
                          className="action-btn"
                          onClick={() => openEditModal(t)}
                          title="Edit Transaction"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ══════ ADD MODAL ══════ */}
      {showAddModal && (
        <Modal
          title="➕ Add New Transaction"
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddTransaction}
        >
          {renderFormFields(newTransaction, setNewTransaction)}
        </Modal>
      )}

      {/* ══════ EDIT MODAL ══════ */}
      {showEditModal && selectedTransaction && (
        <Modal
          title={`✏️ Edit Transaction #${selectedTransaction.id}`}
          onClose={() => { setShowEditModal(false); setSelectedTransaction(null) }}
          onSubmit={handleEditTransaction}
        >
          {renderFormFields(selectedTransaction, setSelectedTransaction)}
        </Modal>
      )}
    </div>
  )
}

export default Finance