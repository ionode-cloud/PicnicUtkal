import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LuCirclePlus as PlusCircle, 
  LuSearch as Search, 
  LuPencil as Edit2, 
  LuTrash2 as Trash2, 
  LuX as X, 
  LuTrees as Trees,
  LuSparkles as Sparkles,
  LuEye as Eye,
  LuCircleCheck as CheckCircle,
  LuSave as Save
} from 'react-icons/lu'
import toast from 'react-hot-toast'
import { useSocket } from '../../context/SocketContext'
import { buildApiUrl } from '../../services/api'

const INITIAL_HOMEPAGE_ZONES = [
  {
    id: 'z1',
    label: 'Swimming Zone',
    count: '12 spots',
    color: '#228BE6',
    href: '/spots?zone=swimming',
    status: 'Active',
    order: 1
  },
  {
    id: 'z2',
    label: 'BBQ & Cooking Zone',
    count: '18 spots',
    color: '#FA5252',
    href: '/spots?zone=cooking',
    status: 'Active',
    order: 2
  },
  {
    id: 'z3',
    label: 'Music & Stage Zone',
    count: '8 spots',
    color: '#BE4BDB',
    href: '/spots?zone=music',
    status: 'Active',
    order: 3
  },
  {
    id: 'z4',
    label: 'Camping & Tent Zone',
    count: '15 spots',
    color: '#F76707',
    href: '/spots?zone=camping',
    status: 'Active',
    order: 4
  },
  {
    id: 'z5',
    label: 'Adventure Zone',
    count: '10 spots',
    color: '#E8590C',
    href: '/spots?zone=adventure',
    status: 'Active',
    order: 5
  },
  {
    id: 'z6',
    label: 'Family & Garden Zone',
    count: '22 spots',
    color: '#2F9E44',
    href: '/spots?zone=family',
    status: 'Active',
    order: 6
  }
]

export const getStoredZones = () => {
  try {
    const saved = localStorage.getItem('picnicutkal_admin_zones')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) return parsed
    }
  } catch (e) {}
  return INITIAL_HOMEPAGE_ZONES
}

export default function Zones() {
  const [zones, setZones] = useState(getStoredZones)
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingZone, setEditingZone] = useState(null)

  const [formData, setFormData] = useState({
    label: '',
    count: '',
    color: '#228BE6',
    href: '/spots',
    status: 'Active',
    order: 1
  })

  const { socket } = useSocket()

  // Fetch zones from MongoDB database on mount
  useEffect(() => {
    fetch(buildApiUrl('/api/site-config/admin_zones'))
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d && d.success && Array.isArray(d.data)) {
          setZones(d.data)
          try {
            localStorage.setItem('picnicutkal_admin_zones', JSON.stringify(d.data))
          } catch (e) {}
        }
      })
      .catch(() => {})
  }, [])

  // Save to localStorage & MongoDB & emit Socket.io event for real-time Home page update
  const saveAndBroadcast = (updatedZones) => {
    setZones(updatedZones)
    try {
      localStorage.setItem('picnicutkal_admin_zones', JSON.stringify(updatedZones))
    } catch (e) {}

    try {
      fetch(buildApiUrl('/api/site-config/admin_zones'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: updatedZones })
      })
    } catch (e) {}

    if (socket) {
      socket.emit('zones_config_update', { zones: updatedZones, timestamp: new Date() })
    }
  }

  const handleOpenAdd = () => {
    setEditingZone(null)
    setFormData({
      label: '',
      count: '10 spots',
      color: '#228BE6',
      href: '/spots',
      status: 'Active',
      order: zones.length + 1
    })
    setShowForm(true)
    setTimeout(() => {
      document.getElementById('zone-form-top')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 50)
  }

  const handleOpenEdit = (zone) => {
    setEditingZone(zone)
    setFormData({
      label: zone.label,
      count: zone.count || '',
      color: zone.color || '#228BE6',
      href: zone.href || '/spots',
      status: zone.status || 'Active',
      order: zone.order || 1
    })
    setShowForm(true)
    setTimeout(() => {
      document.getElementById('zone-form-top')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 50)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to remove this homepage zone?')) {
      const updated = zones.filter(z => z.id !== id)
      saveAndBroadcast(updated)
      toast.success('Zone removed.')
    }
  }

  const handleSubmit = (e) => {
    if (e) e.preventDefault()
    if (!formData.label.trim()) {
      toast.error('Please enter a zone title.')
      return
    }

    if (editingZone) {
      const updated = zones.map(z => z.id === editingZone.id ? { ...z, ...formData } : z)
      saveAndBroadcast(updated)
      toast.success('Homepage zone updated successfully!')
    } else {
      const newZone = {
        id: `z_${Date.now()}`,
        ...formData
      }
      saveAndBroadcast([...zones, newZone])
      toast.success('New homepage zone added!')
    }
    setShowForm(false)
  }

  const filteredZones = zones.filter(z => 
    z.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (z.count && z.count.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="admin-page-container">
      {/* Top Header & Search Card */}
      <div className="card glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Trees size={22} style={{ color: 'var(--gold)' }} />
              <h1 className="heading-3" style={{ margin: 0, color: 'var(--text-primary)' }}>Home Page Perfect Zones Manager</h1>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px', margin: '4px 0 0' }}>
              Manage cards shown under "Choose Your Perfect Zone" on the Home page.
            </p>
          </div>

          <button className="btn btn-gold btn-sm" onClick={handleOpenAdd} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <PlusCircle size={16} /> Add New Perfect Zone
          </button>
        </div>

        {/* Filter Search */}
        <div className="admin-table-filters" style={{ display: 'flex', gap: '16px' }}>
          <div className="input-with-icon" style={{ flex: 1, maxWidth: '420px' }}>
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search zones by name..." 
              className="input" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Inline Form Card AT THE TOP (Right below Header) ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            id="zone-form-top"
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="card glass-card"
            style={{ padding: '24px', marginBottom: '24px', border: '1px solid var(--gold)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 className="heading-4" style={{ margin: 0, color: 'var(--text-primary)' }}>
                {editingZone ? '✏️ Edit Perfect Zone' : '➕ Add New Perfect Zone'}
              </h3>
              <button className="btn-icon" onClick={() => setShowForm(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label style={{ fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>ZONE TITLE *</label>
                  <input 
                    type="text" 
                    className="input" 
                    value={formData.label}
                    onChange={e => setFormData({ ...formData, label: e.target.value })}
                    placeholder="e.g. Swimming Zone"
                    required
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>COUNT SUBTITLE</label>
                  <input 
                    type="text" 
                    className="input" 
                    value={formData.count}
                    onChange={e => setFormData({ ...formData, count: e.target.value })}
                    placeholder="e.g. 12 spots"
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>DISPLAY ORDER</label>
                  <input 
                    type="number" 
                    className="input" 
                    value={formData.order}
                    onChange={e => setFormData({ ...formData, order: Number(e.target.value) })}
                    min={1}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '16px' }}>
                <div className="form-group">
                  <label style={{ fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>COLOR ACCENT</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input 
                      type="color" 
                      style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                      value={formData.color ?? '#228BE6'}
                      onChange={e => setFormData(f => ({ ...f, color: e.target.value }))} 
                    />
                    <input 
                      className="input" 
                      value={formData.color ?? '#228BE6'}
                      onChange={e => setFormData(f => ({ ...f, color: e.target.value }))} 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>STATUS</label>
                  <select 
                    className="input"
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Hidden">Hidden</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>TARGET LINK (URL)</label>
                  <input 
                    type="text" 
                    className="input" 
                    value={formData.href}
                    onChange={e => setFormData({ ...formData, href: e.target.value })}
                    placeholder="e.g. /spots?zone=swimming"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Save size={16} /> {editingZone ? 'Update Zone' : 'Create Zone'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zones Table Card */}
      <div className="card glass-card" style={{ padding: '24px' }}>
        <div className="admin-table-scroll-wrapper">
          <table className="admin-table-view">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Order</th>
                <th>Zone Title</th>
                <th>Count Subtitle</th>
                <th>Color Accent</th>
                <th>Target Link</th>
                <th style={{ width: '120px' }}>Status</th>
                <th style={{ width: '140px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredZones.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No zones found.
                  </td>
                </tr>
              ) : (
                filteredZones.map(zone => (
                  <tr key={zone.id}>
                    <td style={{ fontWeight: 700, color: 'var(--gold)' }}>
                      #{zone.order}
                    </td>

                    <td className="bold">
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{zone.label}</span>
                    </td>

                    <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {zone.count}
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ display: 'inline-block', width: '16px', height: '16px', borderRadius: '50%', background: zone.color, border: '1px solid rgba(255,255,255,0.2)' }} />
                        <code style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{zone.color}</code>
                      </div>
                    </td>

                    <td style={{ fontSize: '13px', color: 'var(--gold-dark)', fontWeight: 600 }}>
                      {zone.href}
                    </td>

                    <td>
                      <span className="badge" style={{ 
                        background: zone.status === 'Active' ? 'rgba(82, 183, 136, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                        color: zone.status === 'Active' ? '#52B788' : 'var(--text-muted)',
                        fontSize: '12px',
                        fontWeight: 700
                      }}>
                        {zone.status || 'Active'}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button 
                          className="btn btn-outline btn-sm" 
                          onClick={() => handleOpenEdit(zone)}
                          style={{ padding: '5px 10px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          title="Edit Zone"
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button 
                          className="btn btn-sm" 
                          onClick={() => handleDelete(zone.id)}
                          style={{ padding: '5px 10px', fontSize: '12px', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          title="Delete Zone"
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
