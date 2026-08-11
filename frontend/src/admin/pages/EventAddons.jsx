import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LuCirclePlus as PlusCircle, 
  LuSearch as Search, 
  LuPencil as Edit2, 
  LuTrash2 as Trash2, 
  LuX as X, 
  LuCheck as Check,
  LuSparkles as Sparkles,
  LuIndianRupee as IndianRupee,
  LuLayers as Layers,
  LuSave as Save
} from 'react-icons/lu'
import toast from 'react-hot-toast'

const INITIAL_ADDONS = [
  {
    id: 'ad_gas_chulha',
    name: '🔥 Gas & Chulha Booking',
    desc: 'Full outdoor kitchen burner stove and filled LPG cylinder setup.',
    priceAddon: 250,
    status: 'Active',
    items: [
      '1x Commercial Single-Burner Chulha (Stove)',
      '1x 5kg LPG Gas Cylinder (Pre-filled, ready to use)',
      'High-pressure gas regulator and safety hose pipe',
      'Gas lighter utility included'
    ]
  },
  {
    id: 'ad_cooking_kit',
    name: '🍳 Cooking Accessories Pack',
    desc: 'Complete picnic cookware, serving spoons and preparation kit.',
    priceAddon: 150,
    status: 'Active',
    items: [
      '2x Large Aluminum Cooking Pots (Dekchi with lids)',
      '1x Deep Frying Pan (Kadai) & 1x Tawa',
      'Large cooking ladles, spatula & serving spoons',
      'Heavy-duty chopping board & 2x stainless steel kitchen knives',
      'Dishwashing gel, scrubber sponge & cleaning cloth'
    ]
  },
  {
    id: 'ad_sound',
    name: '🔊 Standard Sound System',
    desc: 'Dual speakers, microphone, Bluetooth audio receiver',
    priceAddon: 150,
    status: 'Active',
    items: [
      '2x Active Sound Tower Speakers (JBL 15-inch)',
      '1x Audio Mixing Console (Yamaha 6-channel)',
      '1x Wireless Handheld Vocal Microphone',
      'Bluetooth receiver, AUX cable, and power extension leads'
    ]
  },
  {
    id: 'ad_catering',
    name: '🍽 Catering Table Setup',
    desc: 'Elegant buffet tables with satin cloth skirting',
    priceAddon: 100,
    status: 'Active',
    items: [
      '4x Buffet / food serving tables (6x3 ft metal frame)',
      'Premium white satin fabric table spreads',
      'Pleated gold border table skirtings'
    ]
  },
  {
    id: 'ad_decor',
    name: '🌸 Floral Welcome Arch',
    desc: 'Decorated entry arch with fresh seasonal flowers',
    priceAddon: 250,
    status: 'Active',
    items: [
      'Yellow/orange fresh marigolds & white lily floral decorations',
      'Sturdy welcome gate frame structure',
      'Welcome text writing board'
    ]
  },
  {
    id: 'ad_power',
    name: '⚡ Dedicated Silent Generator',
    desc: 'Uninterrupted power supply backup for event hours',
    priceAddon: 200,
    status: 'Active',
    items: [
      '1x 5 KVA Silent Diesel Generator Set',
      'Fuel included for up to 8 hours of peak load operation',
      'Safety MCB distribution box and extension cables'
    ]
  }
]

export default function EventAddons() {
  const [addons, setAddons] = useState(INITIAL_ADDONS)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDrawer, setShowDrawer] = useState(false)
  const [editingAddon, setEditingAddon] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    desc: '',
    priceAddon: 150,
    status: 'Active',
    itemsText: ''
  })

  const filteredAddons = addons.filter(addon => 
    addon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    addon.desc.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleOpenAdd = () => {
    setEditingAddon(null)
    setFormData({
      name: '',
      desc: '',
      priceAddon: 150,
      status: 'Active',
      itemsText: ''
    })
    setShowDrawer(true)
  }

  const handleOpenEdit = (addon) => {
    setEditingAddon(addon)
    setFormData({
      name: addon.name,
      desc: addon.desc,
      priceAddon: addon.priceAddon,
      status: addon.status,
      itemsText: addon.items ? addon.items.join('\n') : ''
    })
    setShowDrawer(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to remove this Custom Event Add-on?')) {
      setAddons(prev => prev.filter(a => a.id !== id))
      toast.success('Event add-on deleted!')
    }
  }

  const handleToggleStatus = (id) => {
    setAddons(prev => prev.map(a => {
      if (a.id === id) {
        const nextStatus = a.status === 'Active' ? 'Disabled' : 'Active'
        toast.success(`Add-on status changed to ${nextStatus}`)
        return { ...a, status: nextStatus }
      }
      return a
    }))
  }

  const handleSubmit = (e) => {
    if (e) e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('Add-on title is required.')
      return
    }

    const itemsArray = formData.itemsText
      ? formData.itemsText.split('\n').map(i => i.trim()).filter(Boolean)
      : ['Included with booking package']

    if (editingAddon) {
      setAddons(prev => prev.map(a => a.id === editingAddon.id ? {
        ...a,
        name: formData.name,
        desc: formData.desc,
        priceAddon: Number(formData.priceAddon),
        status: formData.status,
        items: itemsArray
      } : a))
      toast.success('Event Add-on updated!')
    } else {
      const newAddon = {
        id: `ad_${Date.now()}`,
        name: formData.name,
        desc: formData.desc,
        priceAddon: Number(formData.priceAddon),
        status: formData.status,
        items: itemsArray
      }
      setAddons(prev => [newAddon, ...prev])
      toast.success('New Custom Event Add-on created!')
    }
    setShowDrawer(false)
  }

  return (
    <div className="card glass-card" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="var(--gold)" />
            <h2 className="heading-4" style={{ margin: 0 }}>Custom Event Add-ons Manager</h2>
          </div>
          <p className="text-muted text-sm" style={{ margin: '4px 0 0' }}>Configure flat-rate add-on packages available for spots and pandals.</p>
        </div>
        <button className="btn btn-gold btn-sm flex items-center gap-1" onClick={handleOpenAdd}>
          <PlusCircle size={16} /> Add Custom Add-on
        </button>
      </div>

      {/* Search Filter */}
      <div className="admin-table-filters" style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <div className="input-with-icon" style={{ flex: 1, maxWidth: '380px' }}>
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search custom add-ons or package items..." 
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
              <th>Add-on Name & Details</th>
              <th>Description</th>
              <th>Flat Add-on Rate</th>
              <th>Included Items</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAddons.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No custom event add-ons found.
                </td>
              </tr>
            ) : (
              filteredAddons.map(addon => (
                <tr key={addon.id}>
                  <td className="bold" style={{ minWidth: '220px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{addon.name}</span>
                  </td>
                  <td style={{ maxWidth: '280px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    {addon.desc}
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--gold)', minWidth: '130px' }}>
                    + ₹{addon.priceAddon.toLocaleString()} <small style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/flat</small>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                      <strong style={{ color: 'var(--gold)', display: 'block', marginBottom: '2px' }}>{addon.items?.length || 0} items inside:</strong>
                      <ul style={{ paddingLeft: '14px', margin: 0, listStyleType: 'disc', fontSize: '11px', color: 'var(--text-muted)' }}>
                        {addon.items?.slice(0, 2).map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                        {addon.items?.length > 2 && (
                          <li style={{ color: 'var(--gold)', listStyleType: 'none' }}>+{addon.items.length - 2} more...</li>
                        )}
                      </ul>
                    </div>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleStatus(addon.id)}
                      className={`badge ${addon.status === 'Active' ? 'badge-success' : 'badge-gold'}`}
                      style={{ cursor: 'pointer', border: 'none', fontSize: '11px' }}
                      title="Click to toggle status"
                    >
                      {addon.status}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => handleOpenEdit(addon)}
                        title="Edit Add-on"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button 
                        className="btn btn-outline btn-sm" 
                        style={{ color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                        onClick={() => handleDelete(addon.id)}
                        title="Delete Add-on"
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

      {/* ── Slide-Over Right Drawer (Add / Edit Custom Event Add-on) ── */}
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
                <h3>{editingAddon ? 'Edit Custom Add-on' : 'Add Custom Event Add-on'}</h3>
                <button className="admin-map-form-close" onClick={() => setShowDrawer(false)}><X size={18} /></button>
              </div>

              <div className="admin-map-form-body">
                <div className="admin-map-form-section">
                  <h4>ADD-ON INFORMATION</h4>

                  <div className="admin-map-form-row">
                    <label>ADD-ON TITLE &amp; EMOJI *</label>
                    <input 
                      type="text" 
                      className="admin-map-input" 
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. 🔊 Standard Sound System"
                      required
                    />
                  </div>

                  <div className="admin-map-form-row">
                    <label>SHORT DESCRIPTION</label>
                    <input 
                      type="text" 
                      className="admin-map-input" 
                      value={formData.desc}
                      onChange={e => setFormData({ ...formData, desc: e.target.value })}
                      placeholder="e.g. Dual speakers, microphone, Bluetooth receiver"
                    />
                  </div>

                  <div className="admin-map-form-2col">
                    <div className="admin-map-form-row">
                      <label>FLAT RATE (₹)</label>
                      <input 
                        type="number" 
                        className="admin-map-input" 
                        value={formData.priceAddon}
                        onChange={e => setFormData({ ...formData, priceAddon: Number(e.target.value) })}
                        min={0}
                      />
                    </div>

                    <div className="admin-map-form-row">
                      <label>STATUS</label>
                      <select 
                        className="admin-map-input"
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="Active">Active</option>
                        <option value="Disabled">Disabled</option>
                      </select>
                    </div>
                  </div>

                  <div className="admin-map-form-row">
                    <label>PACKAGE ITEMS ("WHAT'S INSIDE" — 1 PER LINE)</label>
                    <textarea 
                      className="admin-map-input admin-map-textarea"
                      rows={5}
                      value={formData.itemsText}
                      onChange={e => setFormData({ ...formData, itemsText: e.target.value })}
                      placeholder={'1x Single-Burner Chulha Stove\n1x 5kg LPG Gas Cylinder\nSafety hose & lighter'}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-map-form-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowDrawer(false)}>Cancel</button>
                <button type="button" onClick={handleSubmit} className="btn btn-primary">
                  <Save size={15} /> {editingAddon ? 'Update Add-on' : 'Create Add-on'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
