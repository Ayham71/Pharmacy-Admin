import React, { useState, useEffect } from 'react'

const API_URL = 'http://165.22.91.187:5000/api/AdminSettlement'

const Finance = () => {
  const [period, setPeriod] = useState('monthly')
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    type: 'income',
    status: 'pending',
    date: new Date().toISOString().split('T')[0],
  })

  // ─── Stats calculated from transactions ───────────────────────────────────
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

  const stats = [
    {
      label: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: '💰',
      color: '#c8a951',
    },
    {
      label: 'Total Expenses',
      value: `$${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: '💸',
      color: '#e74c3c',
    },
    {
      label: 'Net Profit',
      value: `$${netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: '📈',
      color: '#27ae60',
    },
    {
      label: 'Pending Payments',
      value: `$${pendingPayments.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: '⏳',
      color: '#f39c12',
    },
  ]

  // ─── GET ──────────────────────────────────────────────────────────────────
  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(API_URL)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      setTransactions(data)
    } catch (err) {
      setError('Failed to load transactions. Please try again.')
      console.error('GET Error:', err)
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
      showSuccess('Transaction added successfully! ✅')
    } catch (err) {
      console.error('POST Error:', err)
      setError('Failed to add transaction.')
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
      showSuccess('Transaction updated successfully! ✅')
    } catch (err) {
      console.error('PUT Error:', err)
      setError('Failed to update transaction.')
    } finally {
      setSubmitLoading(false)
    }
  }

  const showSuccess = (msg) => {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const openEditModal = (transaction) => {
    setSelectedTransaction({ ...transaction })
    setShowEditModal(true)
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  // ─── Styles ───────────────────────────────────────────────────────────────
  const styles = {
    // ── Page ──
    page: {
      backgroundColor: '#ffffff',
      minHeight: '100vh',
      padding: '24px',
      fontFamily: "'Segoe UI', sans-serif",
    },

    // ── Header ──
    pageHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '28px',
    },
    pageTitle: {
      fontSize: '26px',
      fontWeight: '700',
      color: '#1a1a2e',
      margin: 0,
    },
    pageSub: {
      fontSize: '13px',
      color: '#888',
      marginTop: '4px',
    },

    // ── Success / Error Banners ──
    successBanner: {
      backgroundColor: '#d4edda',
      color: '#155724',
      border: '1px solid #c3e6cb',
      borderRadius: '10px',
      padding: '12px 20px',
      marginBottom: '20px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    errorBanner: {
      backgroundColor: '#fff3cd',
      color: '#856404',
      border: '1px solid #ffeeba',
      borderRadius: '10px',
      padding: '12px 20px',
      marginBottom: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    // ── Stats ──
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '20px',
      marginBottom: '30px',
    },
    statCard: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '22px',
      boxShadow: '0 2px 12px rgba(200,169,81,0.15)',
      border: '1px solid rgba(200,169,81,0.2)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'default',
    },
    statLabel: {
      fontSize: '13px',
      color: '#888',
      fontWeight: '500',
      marginBottom: '10px',
    },
    statValue: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#1a1a2e',
    },
    statIcon: {
      fontSize: '28px',
      marginBottom: '12px',
    },
    statBar: {
      height: '4px',
      borderRadius: '4px',
      marginTop: '12px',
      background: 'linear-gradient(90deg, #c8a951, #e8c97a)',
    },

    // ── Section ──
    section: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '1px solid rgba(200,169,81,0.2)',
      boxShadow: '0 2px 12px rgba(200,169,81,0.1)',
      overflow: 'hidden',
    },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 24px',
      borderBottom: '1px solid rgba(200,169,81,0.15)',
      backgroundColor: '#fffdf5',
    },
    sectionTitle: {
      fontSize: '17px',
      fontWeight: '700',
      color: '#1a1a2e',
      margin: 0,
    },

    // ── Buttons ──
    addBtn: {
      background: 'linear-gradient(135deg, #c8a951, #e8c97a)',
      color: '#fff',
      border: 'none',
      borderRadius: '10px',
      padding: '10px 20px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      boxShadow: '0 3px 10px rgba(200,169,81,0.3)',
      transition: 'opacity 0.2s',
    },
    refreshBtn: {
      backgroundColor: '#f8f9fa',
      color: '#555',
      border: '1px solid #ddd',
      borderRadius: '10px',
      padding: '10px 16px',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'background 0.2s',
    },
    editBtn: {
      background: 'linear-gradient(135deg, #c8a951, #e8c97a)',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      padding: '6px 14px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '600',
      transition: 'opacity 0.2s',
    },

    // ── Table ──
    tableContainer: {
      overflowX: 'auto',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      padding: '14px 20px',
      textAlign: 'left',
      fontSize: '12px',
      fontWeight: '700',
      color: '#c8a951',
      textTransform: 'uppercase',
      letterSpacing: '0.8px',
      backgroundColor: '#fffdf5',
      borderBottom: '1px solid rgba(200,169,81,0.15)',
    },
    td: {
      padding: '16px 20px',
      fontSize: '14px',
      color: '#333',
      borderBottom: '1px solid #f5f5f5',
      verticalAlign: 'middle',
    },

    // ── Badge ──
    badge: (status) => ({
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      backgroundColor:
        status === 'completed'
          ? '#d4edda'
          : status === 'pending'
          ? '#fff3cd'
          : '#f8d7da',
      color:
        status === 'completed'
          ? '#155724'
          : status === 'pending'
          ? '#856404'
          : '#721c24',
    }),

    // ── Loading ──
    loadingWrapper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px',
      gap: '16px',
    },
    spinner: {
      width: '44px',
      height: '44px',
      border: '4px solid rgba(200,169,81,0.2)',
      borderTop: '4px solid #c8a951',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    },

    // ── Modal Overlay ──
    overlay: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
    },
    modal: {
      backgroundColor: '#ffffff',
      borderRadius: '20px',
      padding: '32px',
      width: '100%',
      maxWidth: '480px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      border: '1px solid rgba(200,169,81,0.2)',
    },
    modalTitle: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#1a1a2e',
      marginBottom: '24px',
      paddingBottom: '12px',
      borderBottom: '2px solid rgba(200,169,81,0.3)',
    },

    // ── Form ──
    formGroup: {
      marginBottom: '18px',
    },
    label: {
      display: 'block',
      fontSize: '13px',
      fontWeight: '600',
      color: '#555',
      marginBottom: '6px',
    },
    input: {
      width: '100%',
      padding: '11px 14px',
      border: '1.5px solid #e0e0e0',
      borderRadius: '10px',
      fontSize: '14px',
      color: '#333',
      outline: 'none',
      transition: 'border-color 0.2s',
      boxSizing: 'border-box',
    },
    select: {
      width: '100%',
      padding: '11px 14px',
      border: '1.5px solid #e0e0e0',
      borderRadius: '10px',
      fontSize: '14px',
      color: '#333',
      outline: 'none',
      backgroundColor: '#fff',
      cursor: 'pointer',
      boxSizing: 'border-box',
    },
    modalActions: {
      display: 'flex',
      gap: '12px',
      marginTop: '24px',
    },
    cancelBtn: {
      flex: 1,
      padding: '12px',
      border: '1.5px solid #ddd',
      borderRadius: '10px',
      backgroundColor: '#fff',
      color: '#555',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '14px',
    },
    submitBtn: {
      flex: 2,
      padding: '12px',
      border: 'none',
      borderRadius: '10px',
      background: 'linear-gradient(135deg, #c8a951, #e8c97a)',
      color: '#fff',
      cursor: 'pointer',
      fontWeight: '700',
      fontSize: '14px',
      boxShadow: '0 3px 10px rgba(200,169,81,0.3)',
    },
  }

  // ─── Shared Form Fields ────────────────────────────────────────────────────
  const renderFormFields = (data, setData) => (
    <>
      <div style={styles.formGroup}>
        <label style={styles.label}>Description</label>
        <input
          style={styles.input}
          type="text"
          placeholder="e.g. Order Payment - Pharmacy Name"
          value={data.description}
          onChange={(e) => setData({ ...data, description: e.target.value })}
          required
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Amount ($)</label>
        <input
          style={styles.input}
          type="number"
          placeholder="0.00"
          value={data.amount}
          onChange={(e) => setData({ ...data, amount: e.target.value })}
          required
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Type</label>
          <select
            style={styles.select}
            value={data.type}
            onChange={(e) => setData({ ...data, type: e.target.value })}
          >
            <option value="income">💚 Income</option>
            <option value="expense">🔴 Expense</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Status</label>
          <select
            style={styles.select}
            value={data.status}
            onChange={(e) => setData({ ...data, status: e.target.value })}
          >
            <option value="pending">⏳ Pending</option>
            <option value="completed">✅ Completed</option>
            <option value="failed">❌ Failed</option>
          </select>
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Date</label>
        <input
          style={styles.input}
          type="date"
          value={data.date}
          onChange={(e) => setData({ ...data, date: e.target.value })}
          required
        />
      </div>
    </>
  )

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* Spinner keyframes */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={styles.page}>

        {/* ── Page Header ── */}
        <div style={styles.pageHeader}>
          <div>
            <h2 style={styles.pageTitle}>💰 Finance & Settlements</h2>
            <p style={styles.pageSub}>Manage all financial transactions and settlements</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button style={styles.refreshBtn} onClick={fetchTransactions}>
              🔄 Refresh
            </button>
            <button className='btn btn-primary' onClick={() => setShowAddModal(true)}>
              ＋ Add Transaction
            </button>
          </div>
        </div>

        {/* ── Success Banner ── */}
        {successMessage && (
          <div style={styles.successBanner}>
            {successMessage}
          </div>
        )}

        {/* ── Error Banner ── */}
        {error && (
          <div style={styles.errorBanner}>
            <span>⚠️ {error}</span>
            <button
              onClick={() => setError(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '16px' }}
            >✕</button>
          </div>
        )}

        {/* ── Stats Grid ── */}
        <div style={styles.statsGrid}>
          {stats.map((stat, i) => (
            <div key={i} style={styles.statCard}>
              <div style={styles.statIcon}>{stat.icon}</div>
              <div style={styles.statLabel}>{stat.label}</div>
              <div style={{ ...styles.statValue, color: stat.color }}>{stat.value}</div>
              <div style={styles.statBar} />
            </div>
          ))}
        </div>

        {/* ── Transactions Table ── */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>📋 Recent Transactions</h3>
            <span style={{ fontSize: '13px', color: '#888' }}>
              {transactions.length} records
            </span>
          </div>

          {loading ? (
            <div style={styles.loadingWrapper}>
              <div style={styles.spinner} />
              <span style={{ color: '#c8a951', fontWeight: '600' }}>Loading transactions...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div style={styles.loadingWrapper}>
              <span style={{ fontSize: '40px' }}>📭</span>
              <span style={{ color: '#888', fontWeight: '500' }}>No transactions found</span>
            </div>
          ) : (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {['Transaction ID', 'Type', 'Description', 'Amount', 'Date', 'Status', 'Action'].map((h) => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t, i) => (
                    <tr
                      key={t.id}
                      style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#fffdf5' }}
                    >
                      <td style={{ ...styles.td, fontWeight: '600', color: '#c8a951' }}>
                        #{t.id}
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          fontWeight: '600',
                          color: t.type === 'income' ? '#27ae60' : '#e74c3c',
                          textTransform: 'capitalize',
                        }}>
                          {t.type === 'income' ? '💚' : '🔴'} {t.type}
                        </span>
                      </td>
                      <td style={styles.td}>{t.description}</td>
                      <td style={{
                        ...styles.td,
                        fontWeight: '700',
                        color: t.type === 'income' ? '#27ae60' : '#e74c3c',
                      }}>
                        {t.type === 'expense' ? '-' : '+'}${Math.abs(parseFloat(t.amount) || 0).toFixed(2)}
                      </td>
                      <td style={styles.td}>{t.date}</td>
                      <td style={styles.td}>
                        <span style={styles.badge(t.status)}>{t.status}</span>
                      </td>
                      <td style={styles.td}>
                        <button style={styles.editBtn} onClick={() => openEditModal(t)}>
                          ✏️ Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════ ADD MODAL ══════════════ */}
      {showAddModal && (
        <div style={styles.overlay} onClick={() => setShowAddModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>➕ Add New Transaction</h3>
            <form onSubmit={handleAddTransaction}>
              {renderFormFields(newTransaction, setNewTransaction)}
              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.submitBtn} disabled={submitLoading}>
                  {submitLoading ? 'Adding...' : '✅ Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════ EDIT MODAL ══════════════ */}
      {showEditModal && selectedTransaction && (
        <div style={styles.overlay} onClick={() => setShowEditModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>✏️ Edit Transaction #{selectedTransaction.id}</h3>
            <form onSubmit={handleEditTransaction}>
              {renderFormFields(selectedTransaction, setSelectedTransaction)}
              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.submitBtn} disabled={submitLoading}>
                  {submitLoading ? 'Saving...' : '💾 Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default Finance