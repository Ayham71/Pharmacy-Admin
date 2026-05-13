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

  const stats = [
    {
      label: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      ),
      change: '+12.5%',
      changeType: 'positive',
      progress: 75,
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
      change: '-3.2%',
      changeType: 'negative',
      progress: 45,
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
      change: '+8.1%',
      changeType: 'positive',
      progress: 60,
    },
    {
      label: 'Pending Payments',
      value: `$${pendingPayments.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      change: '5 pending',
      changeType: 'positive',
      progress: 30,
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

  