import { useState } from 'react'
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
  },
  {
    id: 'z7',
    label: 'Photo & Selfie Zone',
    count: '9 spots',
    color: '#C9A84C',
    href: '/spots?zone=photo',
    status: 'Active',
    order: 7
  }
]

export default function Zones() {
  const [zones, setZones] = useState(INITIAL_HOMEPAGE_ZONES)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDrawer, setShowDrawer] = useState(false)
  const [editingZone, setEditingZone] = useState(null)

  const [formData, setFormData] = useState({
    label: '',
    count: '10 spots',
    color: '#228BE6',
    href: '/spots?zone=new',
    status: 'Active',
    order: 1
  })

  const filteredZones = zones.filter(zone =>
    zone.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    zone.count.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => a.order - b.order)

  const handleOpenAdd = () => {
    setEditingZone(null)
    setFormData({
      label: '',
      count: '10 spots',
      color: '#2F9E44',
      href: '/spots?zone=custom',
      status: 'Active',
      order: zones.length + 1
    })
    setShowDrawer(true)
  }

  const handleOpenEdit = (zone) => {
    setEditingZone(zone)
    setFormData({
      label: zone.label,
      count: zone.count,
      color: zone.color,
      href: zone.href,
      status: zone.status,
      order: zone.order
    })
    setShowDrawer(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this Perfect Zone card from the Home page?')) {
      setZones(prev => prev.filter(z => z.id !== id))
      toast.success('Zone removed from Home page!')
    }
  }

  const handleToggleStatus = (id) => {
    setZones(prev => prev.map(z => {
      if (z.id === id) {
        const nextStatus = z.status === 'Active' ? 'Hidden' : 'Active'
        toast.success(`Zone status updated to ${nextStatus}`)
        return { ...z, status: nextStatus }
      }
      return z
    }))
  }

  const handleSubmit = (e) => {
    if (e) e.preventDefault()
    if (!formData.label.trim()) {
      toast.error('Zone title is required.')
      return
    }

    if (editingZone) {
      setZones(prev => prev.map(z => z.id === editingZone.id ? { ...z, ...formData } : z))
      toast.success('Home page Zone updated!')
    } else {
      const newZone = {
        id: `z_${Date.now()}`,
        ...formData
      }
      setZones(prev => [...prev, newZone])
      toast.success('New Perfect Zone added to Home page!')
    }
    setShowDrawer(false)
  }

  return (
    <div className="card glass-card" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trees size={20} color="var(--gold)" />
            <h2 className="heading-4" style={{ margin: 0 }}>Home Page Perfect Zones Manager</h2>
          </div>
          <p className="text-muted text-sm" style={{ margin: '4px 0 0' }}>Manage cards shown under "Choose Your Perfect Zone" on the Home page.</p>
        </div>
        <button className="btn btn-gold btn-sm flex items-center gap-1" onClick={handleOpenAdd}>
          <PlusCircle size={16} /> Add New Perfect Zone
        </button>
      </div>

      {/* Filter */}
      <div className="admin-table-filters" style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <div className="input-with-icon" style={{ flex: 1, maxWidth: '360px' }}>
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

      {/* Table */}
      <div className="admin-table-scroll-wrapper">
        <table className="admin-table-view">
          <thead>
            <tr>
              <th>Order</th>
              <th>Zone Title</th>
              <th>Count Subtitle</th>
              <th>Color Accent</th>
              <th>Target Link</th>
              <th>Status</th>
              <th>Actions</th>
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
                      <span style={{ 
                        width: '18px', height: '18px', borderRadius: '50%', 
                        backgroundColor: zone.color, display: 'inline-block',
                        boxShadow: '0 0 8px ' + zone.color
                      }} />
                      <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{zone.color}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--gold)' }}>
                    {zone.href}
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleStatus(zone.id)}
                      className={`badge ${zone.status === 'Active' ? 'badge-success' : 'badge-gold'}`}
                      style={{ cursor: 'pointer', border: 'none', fontSize: '11px' }}
                    >
                      {zone.status}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => handleOpenEdit(zone)}
                        title="Edit Zone Card"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button 
                        className="btn btn-outline btn-sm" 
                        style={{ color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                        onClick={() => handleDelete(zone.id)}
                        title="Delete Zone Card"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Slide-Over Right Drawer (Add / Edit Perfect Zone) ── */}
      <AnimatePresence>
        {showDrawer && (
          <>
            <motion.div
              className="admin-map-form-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDrawer(false)}
            />
            <motion.div
              className="admin-map-form-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            >
              <div className="admin-map-form-header">
                <h3>{editingZone ? 'Edit Perfect Zone' : 'Add Perfect Zone'}</h3>
                <button className="admin-map-form-close" onClick={() => setShowDrawer(false)}><X size={18} /></button>
              </div>

              <div className="admin-map-form-body">
                <div className="admin-map-form-section">
                  <h4>HOME PAGE ZONE DETAILS</h4>

                  <div className="admin-map-form-row">
                    <label>ZONE TITLE *</label>
                    <input 
                      type="text" 
                      className="admin-map-input" 
                      value={formData.label}
                      onChange={e => setFormData({ ...formData, label: e.target.value })}
                      placeholder="e.g. Swimming Zone"
                      required
                    />
                  </div>

                  <div className="admin-map-form-2col">
                    <div className="admin-map-form-row">
                      <label>COUNT SUBTITLE</label>
                      <input 
                        type="text" 
                        className="admin-map-input" 
                        value={formData.count}
                        onChange={e => setFormData({ ...formData, count: e.target.value })}
                        placeholder="e.g. 12 spots"
                      />
                    </div>

                    <div className="admin-map-form-row">
                      <label>DISPLAY ORDER</label>
                      <input 
                        type="number" 
                        className="admin-map-input" 
                        value={formData.order}
                        onChange={e => setFormData({ ...formData, order: Number(e.target.value) })}
                        min={1}
                      />
                    </div>
                  </div>

                  <div className="admin-map-form-2col">
                    <div className="admin-map-form-row">
                      <label>COLOR ACCENT</label>
                      <div className="admin-map-color-row">
                        <input type="color" className="admin-map-color-input" value={formData.color ?? '#228BE6'}
                          onChange={e => setFormData(f => ({ ...f, color: e.target.value }))} />
                        <input className="admin-map-input" value={formData.color ?? '#228BE6'}
                          onChange={e => setFormData(f => ({ ...f, color: e.target.value }))} />
                      </div>
                    </div>

                    <div className="admin-map-form-row">
                      <label>STATUS</label>
                      <select 
                        className="admin-map-input"
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="Active">Active</option>
                        <option value="Hidden">Hidden</option>
                      </select>
                    </div>
                  </div>

                  <div className="admin-map-form-row">
                    <label>TARGET LINK (URL)</label>
                    <input 
                      type="text" 
                      className="admin-map-input" 
                      value={formData.href}
                      onChange={e => setFormData({ ...formData, href: e.target.value })}
                      placeholder="e.g. /spots?zone=swimming"
                    />
                  </div>
                </div>
              </div>

              <div className="admin-map-form-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowDrawer(false)}>Cancel</button>
                <button type="button" onClick={handleSubmit} className="btn btn-primary">
                  <Save size={15} /> {editingZone ? 'Update Zone' : 'Create Zone'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
