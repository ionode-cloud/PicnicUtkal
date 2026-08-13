import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LuCirclePlus as PlusCircle, 
  LuSearch as Search, 
  LuPencil as Edit2, 
  LuTrash2 as Trash2, 
  LuX as X, 
  LuCheck as Check,
  LuTriangleAlert as AlertTriangle,
  LuFileText as FileText,
  LuShieldAlert as ShieldAlert,
  LuSave as Save,
  LuRotateCcw as RotateCcw,
  LuCircleCheck as CheckCircle
} from 'react-icons/lu'
import toast from 'react-hot-toast'
import { useSocket } from '../../context/SocketContext'

export const DEFAULT_GUIDELINES = [
  {
    id: 'rule-1',
    text: 'Alcohol consumption is strictly prohibited inside the sanctuary picnic campus',
    category: 'Safety & Conduct',
    status: 'Active',
    icon: 'AlertTriangle'
  },
  {
    id: 'rule-2',
    text: 'Littering is an offense; please dispose of plastic trash in colored bins only',
    category: 'Environment',
    status: 'Active',
    icon: 'ShieldAlert'
  },
  {
    id: 'rule-3',
    text: 'Fires or self-organized BBQ must be restricted within designated brick fire pits',
    category: 'Fire Safety',
    status: 'Active',
    icon: 'AlertTriangle'
  },
  {
    id: 'rule-4',
    text: 'Decorations using cello tape or nails on trees/walls are strictly banned',
    category: 'Property Rules',
    status: 'Active',
    icon: 'ShieldAlert'
  }
]

export const getStoredGuidelines = () => {
  try {
    const saved = localStorage.getItem('picnicutkal_guidelines_rules')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {}
  return DEFAULT_GUIDELINES
}

export default function GuidelinesRules() {
  const [rules, setRules] = useState(getStoredGuidelines)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editingRule, setEditingRule] = useState(null)

  const [formData, setFormData] = useState({
    text: '',
    category: 'Safety & Conduct',
    status: 'Active',
    icon: 'AlertTriangle'
  })

  const { socket } = useSocket()

  // Sync to localStorage and broadcast live Socket.io event on update
  const saveAndBroadcast = (updatedRules) => {
    setRules(updatedRules)
    try {
      localStorage.setItem('picnicutkal_guidelines_rules', JSON.stringify(updatedRules))
    } catch (e) {}

    if (socket) {
      socket.emit('guidelines_rules_update', { rules: updatedRules, timestamp: new Date() })
    }
  }

  const handleOpenAddForm = () => {
    setEditingRule(null)
    setFormData({
      text: '',
      category: 'Safety & Conduct',
      status: 'Active',
      icon: 'AlertTriangle'
    })
    setShowForm(true)
    setTimeout(() => {
      document.getElementById('guideline-form-top')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 50)
  }

  const handleOpenEditForm = (rule) => {
    setEditingRule(rule)
    setFormData({
      text: rule.text,
      category: rule.category || 'Safety & Conduct',
      status: rule.status || 'Active',
      icon: rule.icon || 'AlertTriangle'
    })
    setShowForm(true)
    setTimeout(() => {
      document.getElementById('guideline-form-top')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 50)
  }

  const handleSaveForm = (e) => {
    e.preventDefault()
    if (!formData.text.trim()) {
      toast.error('Please enter the guideline text')
      return
    }

    if (editingRule) {
      const updated = rules.map(r => r.id === editingRule.id ? { ...r, ...formData } : r)
      saveAndBroadcast(updated)
      toast.success('Guideline rule updated successfully!')
    } else {
      const newRule = {
        id: `rule-${Date.now()}`,
        ...formData
      }
      saveAndBroadcast([...rules, newRule])
      toast.success('New guideline rule added!')
    }

    setShowForm(false)
  }

  const handleDeleteRule = (id) => {
    if (window.confirm('Are you sure you want to delete this guideline rule?')) {
      const updated = rules.filter(r => r.id !== id)
      saveAndBroadcast(updated)
      toast.success('Rule deleted.')
    }
  }

  const handleToggleStatus = (id) => {
    const updated = rules.map(r => {
      if (r.id === id) {
        const nextStatus = r.status === 'Active' ? 'Disabled' : 'Active'
        return { ...r, status: nextStatus }
      }
      return r
    })
    saveAndBroadcast(updated)
    toast.success('Status updated.')
  }

  const handleResetDefaults = () => {
    if (window.confirm('Reset all Guidelines & Rules to system defaults?')) {
      saveAndBroadcast(DEFAULT_GUIDELINES)
      toast.success('Reset to default guidelines.')
    }
  }

  const filteredRules = rules.filter(r => {
    const matchesSearch = r.text.toLowerCase().includes(search.toLowerCase()) ||
                          r.category.toLowerCase().includes(search.toLowerCase())
    const matchesCat = categoryFilter === 'All' || r.category === categoryFilter
    return matchesSearch && matchesCat
  })

  const categories = ['All', ...new Set(rules.map(r => r.category || 'Safety & Conduct'))]

  return (
    <div className="admin-page-container">
      {/* Top Header Card */}
      <div className="card glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={22} style={{ color: 'var(--gold)' }} />
              <h1 className="heading-3" style={{ margin: 0, color: 'var(--text-primary)' }}>Plot Details Guidelines & Rules</h1>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px', margin: '4px 0 0' }}>
              Manage safety rules, campus policies, and rules displayed on plot details.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-outline btn-sm" onClick={handleResetDefaults} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RotateCcw size={15} /> Reset Defaults
            </button>
            <button className="btn btn-gold btn-sm" onClick={handleOpenAddForm} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <PlusCircle size={16} /> Add Guideline
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="admin-table-filters" style={{ display: 'flex', gap: '16px', marginTop: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="input-with-icon" style={{ flex: 1, minWidth: '260px', maxWidth: '420px' }}>
            <Search size={16} />
            <input
              type="text"
              className="input"
              placeholder="Search rules, policy keywords or categories..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Category:</span>
            <select
              className="input"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              style={{ width: '180px' }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Inline Form Card AT THE TOP (Right below Header) ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            id="guideline-form-top"
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="card glass-card"
            style={{ padding: '24px', marginBottom: '24px', border: '1px solid var(--gold)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 className="heading-4" style={{ margin: 0, color: 'var(--text-primary)' }}>
                {editingRule ? '✏️ Edit Guideline Rule' : '➕ Add New Guideline Rule'}
              </h3>
              <button className="btn-icon" onClick={() => setShowForm(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveForm} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label style={{ fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>Guideline / Rule Description *</label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Enter explicit rule or guideline description..."
                  value={formData.text}
                  onChange={e => setFormData({ ...formData, text: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label style={{ fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>Category</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Safety & Conduct"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>Status</label>
                  <select
                    className="input"
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Disabled">Disabled</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>Rule Icon Style</label>
                  <select
                    className="input"
                    value={formData.icon}
                    onChange={e => setFormData({ ...formData, icon: e.target.value })}
                  >
                    <option value="AlertTriangle">⚠️ Alert Triangle (Gold)</option>
                    <option value="ShieldAlert">🛡️ Shield Alert (Security)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Save size={16} /> {editingRule ? 'Update Guideline' : 'Save New Guideline'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rules Table Card */}
      <div className="card glass-card" style={{ padding: '24px' }}>
        <div className="admin-table-scroll-wrapper">
          <table className="admin-table-view">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>#</th>
                <th>Guideline / Rule Description</th>
                <th style={{ width: '160px' }}>Category</th>
                <th style={{ width: '130px' }}>Icon Style</th>
                <th style={{ width: '120px' }}>Status</th>
                <th style={{ width: '140px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRules.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    <FileText size={32} style={{ color: 'var(--gold)', margin: '0 auto 8px', opacity: 0.6 }} />
                    <p style={{ margin: 0, fontWeight: 600 }}>No guideline rules found matching criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredRules.map((rule, idx) => (
                  <tr key={rule.id}>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '13px' }}>
                      {idx + 1}
                    </td>

                    <td style={{ minWidth: '300px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(201, 168, 76, 0.15)', color: 'var(--gold)', marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {rule.icon === 'ShieldAlert' ? <ShieldAlert size={16} /> : <AlertTriangle size={16} />}
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: '1.5' }}>
                          {rule.text}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className="badge" style={{ background: 'rgba(201, 168, 76, 0.15)', color: 'var(--gold)', border: '1px solid rgba(201, 168, 76, 0.3)', fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {rule.category || 'General'}
                      </span>
                    </td>

                    <td style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>
                      {rule.icon === 'ShieldAlert' ? '🛡️ Shield Alert' : '⚠️ Warning Triangle'}
                    </td>

                    <td>
                      <button
                        onClick={() => handleToggleStatus(rule.id)}
                        style={{
                          border: 'none',
                          background: rule.status === 'Active' ? 'rgba(82, 183, 136, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                          color: rule.status === 'Active' ? '#52B788' : 'var(--text-muted)',
                          padding: '4px 12px',
                          borderRadius: '999px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {rule.status === 'Active' ? '✓ Active' : '✕ Disabled'}
                      </button>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleOpenEditForm(rule)}
                          style={{ padding: '5px 10px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          title="Edit Rule"
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          className="btn btn-sm"
                          onClick={() => handleDeleteRule(rule.id)}
                          style={{ padding: '5px 10px', fontSize: '12px', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          title="Delete Rule"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
