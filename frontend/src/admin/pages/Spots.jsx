import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LuCirclePlus as PlusCircle, 
  LuSearch as Search, 
  LuPencil as Edit2, 
  LuTrash2 as Trash2, 
  LuX as X,
  LuMapPin as MapPin,
  LuUsers as Users,
  LuIndianRupee as IndianRupee,
  LuMap as Map,
  LuImage as Image,
  LuUpload as Upload,
  LuLink as LinkIcon,
  LuSave as Save,
  LuMove as Move,
  LuRuler as Ruler
} from 'react-icons/lu'
import toast from 'react-hot-toast'
import { useSocket } from '../../context/SocketContext'
import { buildApiUrl } from '../../services/api'

const INITIAL_SPOTS = []

const DEFAULT_MAP_ZONES = []

const BLANK_SPOT_FORM = {
  title: '',
  name: '',
  location: '',
  price: 499,
  area: '3500 sq ft',
  capacity: 100,
  category: 'Map Zone & Pandal',
  badge: 'Map Zone',
  status: 'available',
  description: '',
  facilities: '',
  mapId: 'default-master-plan',
  images: [],
  image: '',
  coordinates: { x: 30, y: 30, width: 15, height: 10 },
  distanceFromGate: '80 m',
  distanceFromCanal: '20 m',
  color: '#C9A84C',
  priority: 0
}

export default function Spots() {
  const [spots, setSpots] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMapFilter, setSelectedMapFilter] = useState('All')
  
  // Slide-over drawer modal states
  const [showDrawer, setShowDrawer] = useState(false)
  const [editingSpot, setEditingSpot] = useState(null)
  const [formData, setFormData] = useState(BLANK_SPOT_FORM)
  const [plotImgInputType, setPlotImgInputType] = useState('file') // 'file' | 'url'
  const [tempImgUrl, setTempImgUrl] = useState('')
  const [saving, setSaving] = useState(false)

  const [maps, setMaps] = useState(() => {
    try {
      const saved = localStorage.getItem('picnicutkal_admin_maps')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (e) {}
    return [
      { _id: 'default-master-plan', title: 'Barapita Master Plan (Main Ground)' },
      { _id: 'chilika-map-02', title: 'Chilika Lake Sanctuary Map' },
      { _id: 'simlipal-map-03', title: 'Simlipal Forest & Waterfall Map' }
    ]
  })

  const { socket, emitPlotStatusChange } = useSocket()

  // Load Map Management plots into Spots list dynamically
  const loadPlotsFromApi = () => {
    fetch(buildApiUrl('/api/map/plots'))
      .then(r => r.json())
      .then(d => {
        if (d.success && Array.isArray(d.data)) {
          const mapZones = d.data.map(p => ({
            id: p._id,
            name: p.title,
            title: p.title,
            location: p.mapId === 'chilika-map-02' ? 'Chilika Lake, Puri' : (p.mapId === 'simlipal-map-03' ? 'Simlipal Reserve, Mayurbhanj' : 'Barapita Ground, Deras'),
            price: p.price || 499,
            area: p.area || '3500 sq ft',
            rating: 4.8,
            reviews: 120,
            capacity: p.capacity || 100,
            category: 'Map Zone & Pandal',
            status: p.status === 'booked' ? 'Booked' : (p.status === 'maintenance' ? 'Maintenance' : 'available'),
            badge: 'Map Zone',
            isMapZone: true,
            mapId: p.mapId || 'default-master-plan',
            description: p.description || '',
            facilities: Array.isArray(p.facilities) ? p.facilities.join(', ') : (p.facilities || ''),
            images: p.images || (p.image ? [p.image] : []),
            image: p.image || '',
            coordinates: p.coordinates || { x: 30, y: 30, width: 15, height: 10 },
            distanceFromGate: p.distanceFromGate || '80 m',
            distanceFromCanal: p.distanceFromCanal || '20 m',
            color: p.color || '#C9A84C',
            priority: p.priority || 0
          }))

          setSpots(mapZones)
        }
      })
      .catch(() => {})
  }

  useEffect(() => {
    loadPlotsFromApi()
  }, [])

  // Listen to Socket.io for live updates
  useEffect(() => {
    if (!socket) return
    const handleUpdate = () => loadPlotsFromApi()
    socket.on('plots_update', handleUpdate)
    socket.on('plot_updated', handleUpdate)
    return () => {
      socket.off('plots_update', handleUpdate)
      socket.off('plot_updated', handleUpdate)
    }
  }, [socket])

  // Filter spots by Search query and Selected Map
  const filteredSpots = spots.filter(spot => {
    const sName = spot.name || spot.title || ''
    const matchesSearch = sName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          spot.location.toLowerCase().includes(searchQuery.toLowerCase())
    
    let matchesMap = true
    if (selectedMapFilter !== 'All') {
      const sMapId = spot.mapId || (spot.id === '2' ? 'chilika-map-02' : (spot.id === '3' ? 'simlipal-map-03' : 'default-master-plan'))
      if (selectedMapFilter === 'default-master-plan' || selectedMapFilter === 'default-map') {
        matchesMap = sMapId === 'default-master-plan' || sMapId === 'default-map' || !spot.mapId
      } else {
        matchesMap = sMapId === selectedMapFilter
      }
    }

    return matchesSearch && matchesMap
  })

  // Multi-image upload handlers (up to 10 photos)
  const handlePlotFileUpload = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    const currentImages = Array.isArray(formData.images) ? formData.images : (formData.image ? [formData.image] : [])
    const remainingSlots = 10 - currentImages.length
    if (remainingSlots <= 0) {
      toast.error('Maximum limit of 10 photos reached!')
      return
    }

    const filesToUpload = files.slice(0, remainingSlots)
    let processed = 0
    const newBase64s = []

    filesToUpload.forEach(file => {
      if (file.size > 8 * 1024 * 1024) {
        toast.error(`File "${file.name}" exceeds 8MB limit`)
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        newBase64s.push(reader.result)
        processed++
        if (processed === filesToUpload.length) {
          setFormData(f => {
            const existing = Array.isArray(f.images) ? f.images : (f.image ? [f.image] : [])
            const updated = [...existing, ...newBase64s].slice(0, 10)
            return {
              ...f,
              images: updated,
              image: updated[0] || ''
            }
          })
          toast.success(`Added ${newBase64s.length} photo(s)! (${Math.min(currentImages.length + newBase64s.length, 10)}/10)`)
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleAddImageUrl = () => {
    if (!tempImgUrl.trim()) return
    const currentImages = Array.isArray(formData.images) ? formData.images : (formData.image ? [formData.image] : [])
    if (currentImages.length >= 10) {
      toast.error('Maximum limit of 10 photos reached!')
      return
    }
    const updated = [...currentImages, tempImgUrl.trim()].slice(0, 10)
    setFormData(f => ({
      ...f,
      images: updated,
      image: updated[0] || ''
    }))
    setTempImgUrl('')
    toast.success(`Photo URL added! (${updated.length}/10)`)
  }

  const handleRemoveImage = (index) => {
    setFormData(f => {
      const currentImages = Array.isArray(f.images) ? f.images : (f.image ? [f.image] : [])
      const updated = currentImages.filter((_, i) => i !== index)
      return {
        ...f,
        images: updated,
        image: updated[0] || ''
      }
    })
    toast.success('Photo removed')
  }

  const handleOpenAdd = () => {
    setEditingSpot(null)
    setFormData(BLANK_SPOT_FORM)
    setShowDrawer(true)
  }

  const handleOpenEdit = (spot) => {
    setEditingSpot(spot)
    const imagesList = Array.isArray(spot.images) && spot.images.length > 0
      ? spot.images
      : (spot.image ? [spot.image] : [])

    setFormData({
      title: spot.name || spot.title || '',
      name: spot.name || spot.title || '',
      location: spot.location || 'Barapita Ground, Deras',
      price: spot.price || 499,
      area: spot.area || '3500 sq ft',
      capacity: spot.capacity || 100,
      category: spot.category || 'Map Zone & Pandal',
      badge: spot.badge || 'Map Zone',
      status: spot.status || 'available',
      description: spot.description || '',
      facilities: Array.isArray(spot.facilities) ? spot.facilities.join(', ') : (spot.facilities || ''),
      mapId: spot.mapId || 'default-master-plan',
      images: imagesList,
      image: imagesList[0] || spot.image || '',
      coordinates: spot.coordinates || { x: 30, y: 30, width: 15, height: 10 },
      distanceFromGate: spot.distanceFromGate || '80 m',
      distanceFromCanal: spot.distanceFromCanal || '20 m',
      color: spot.color || '#C9A84C',
      priority: spot.priority || 0
    })
    setShowDrawer(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this picnic spot?')) {
      try {
        await fetch(buildApiUrl(`/api/map/plots/${id}`), { method: 'DELETE' })
      } catch (e) {}
      setSpots(prev => prev.filter(s => s.id !== id))
      if (socket) socket.emit('plots_update', { plotId: id, action: 'deleted' })
      toast.success('Spot removed successfully!')
    }
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    const spotTitle = formData.title || formData.name
    if (!spotTitle.trim()) {
      toast.error('Title is required.')
      return
    }
    setSaving(true)

    const currentImages = Array.isArray(formData.images) && formData.images.length > 0
      ? formData.images.slice(0, 10)
      : (formData.image ? [formData.image] : [])

    const payload = {
      ...formData,
      title: spotTitle.trim(),
      name: spotTitle.trim(),
      price: Number(formData.price) || 0,
      capacity: Number(formData.capacity) || 0,
      priority: Number(formData.priority) || 0,
      images: currentImages,
      image: currentImages[0] || formData.image || '',
      facilities: typeof formData.facilities === 'string'
        ? formData.facilities.split(',').map(f => f.trim()).filter(Boolean)
        : formData.facilities
    }

    try {
      if (editingSpot) {
        await fetch(buildApiUrl(`/api/map/plots/${editingSpot.id}`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        setSpots(prev => prev.map(s => s.id === editingSpot.id ? { ...s, ...payload, id: editingSpot.id } : s))
        if (socket) socket.emit('plots_update', { plotId: editingSpot.id, action: 'updated' })
        toast.success('Plot / Zone updated!')
      } else {
        const newId = Date.now().toString()
        const newSpot = { id: newId, ...payload, rating: 5.0, reviews: 1 }
        await fetch(buildApiUrl('/api/map/plots'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, _id: newId })
        })
        setSpots(prev => [newSpot, ...prev])
        if (socket) socket.emit('plots_update', { plotId: newId, action: 'created' })
        toast.success('New Plot / Zone created!')
      }
    } catch {
      toast.error('Save completed locally')
    } finally {
      setSaving(false)
      setShowDrawer(false)
    }
  }

  return (
    <div className="card glass-card" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 className="heading-4" style={{ margin: 0 }}>Picnic Spots Manager</h2>
          <p className="text-muted text-sm" style={{ margin: '4px 0 0' }}>Manage picnic spot listings, Map Management zones, flat pandal rates, and availability status.</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="admin-table-filters" style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="input-with-icon" style={{ flex: 1, minWidth: '240px', maxWidth: '360px' }}>
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search by spot name, location, or zone..." 
            className="input" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Map Filter & All Spots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedMapFilter('All')}
            className={`btn btn-sm ${selectedMapFilter === 'All' ? 'btn-gold' : 'btn-outline'}`}
            style={{ fontSize: '12px', padding: '6px 16px', borderRadius: 'var(--radius-md)', fontWeight: 700 }}
          >
            All Spots &amp; Maps
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-primary)', padding: '4px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <Map size={14} style={{ color: 'var(--gold)' }} />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Select Map:</span>
            <select
              value={selectedMapFilter}
              onChange={e => setSelectedMapFilter(e.target.value)}
              className="input"
              style={{
                border: 'none',
                background: 'transparent',
                color: 'var(--gold)',
                fontWeight: 700,
                fontSize: '12px',
                padding: '2px 4px',
                cursor: 'pointer'
              }}
            >
              <option value="All">-- All Maps --</option>
              {maps.map(m => (
                <option key={m._id} value={m._id} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Spots Table */}
      <div className="admin-table-scroll-wrapper">
        <table className="admin-table-view">
          <thead>
            <tr>
              <th>Spot / Zone Name</th>
              <th>Location</th>
              <th>Category</th>
              <th>Rate (₹/Pindi)</th>
              <th>Max Capacity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSpots.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No picnic spots or map zones found matching your query.
                </td>
              </tr>
            ) : (
              filteredSpots.map(spot => (
                <tr key={spot.id}>
                  <td className="bold">
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{spot.name || spot.title}</span>
                      <small style={{ color: spot.isMapZone ? '#40C057' : 'var(--gold)', fontSize: '11px', marginTop: '2px', fontWeight: 600 }}>
                        {spot.badge || 'Map Zone'}
                      </small>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                      <MapPin size={12} color="var(--gold)" />
                      <span>{spot.location}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${spot.isMapZone ? 'badge-success' : 'badge-glass'}`} style={{ fontSize: '11px' }}>
                      {spot.category || 'Map Zone & Pandal'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--gold)' }}>
                    ₹{spot.price?.toLocaleString()} <small style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{spot.id === 'cottage-rooms' ? '/night' : '/Pindi'}</small>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                      <Users size={12} />
                      <span>{spot.capacity} guests</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${spot.status === 'Active' || spot.status === 'available' ? 'badge-success' : (spot.status === 'Booked' || spot.status === 'booked' ? 'badge-gold' : 'badge-glass')}`} style={{ fontSize: '11px' }}>
                      {spot.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link 
                        to="/admin/map" 
                        className="btn btn-outline btn-sm"
                        title="View Interactive Map"
                        style={{ color: 'var(--gold)', borderColor: 'rgba(201,168,76,0.3)' }}
                      >
                        <MapPin size={13} />
                      </Link>
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => handleOpenEdit(spot)}
                        title="Edit Spot / Zone"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button 
                        className="btn btn-outline btn-sm" 
                        style={{ color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                        onClick={() => handleDelete(spot.id)}
                        title="Delete Spot"
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

      {/* ── Slide-Over Right Drawer (Edit Plot / Zone) ── */}
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
                <h3>{editingSpot ? 'Edit Plot / Zone' : 'Add New Plot / Zone'}</h3>
                <button className="admin-map-form-close" onClick={() => setShowDrawer(false)}><X size={18} /></button>
              </div>

              <div className="admin-map-form-body">
                {/* Basic Info */}
                <div className="admin-map-form-section">
                  <h4>Basic Info</h4>
                  <div className="admin-map-form-row">
                    <label>TARGET MAP</label>
                    <select
                      className="admin-map-input"
                      value={formData.mapId || 'default-master-plan'}
                      onChange={e => setFormData(f => ({ ...f, mapId: e.target.value }))}
                      style={{ color: 'var(--gold)', fontWeight: 700 }}
                    >
                      {maps.map(m => (
                        <option key={m._id} value={m._id}>{m.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-map-form-row">
                    <label>TITLE *</label>
                    <input
                      id="admin-map-form-title"
                      className="admin-map-input"
                      placeholder="e.g. Main Gate"
                      value={formData.title || formData.name || ''}
                      onChange={e => setFormData(f => ({ ...f, title: e.target.value, name: e.target.value }))}
                    />
                  </div>

                  {/* Photo Gallery Manager (Max 10 Images) */}
                  <div className="admin-map-form-row" style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Image size={15} style={{ color: 'var(--gold)' }} />
                        <label style={{ margin: 0, fontWeight: 700, fontSize: '12px', letterSpacing: '0.05em' }}>PLOT PHOTOS GALLERY</label>
                      </div>
                      <span className="badge badge-gold" style={{ fontSize: '11px' }}>
                        {(formData.images || (formData.image ? [formData.image] : [])).length} / 10 PHOTOS
                      </span>
                    </div>

                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                      Upload local image files or paste image URLs. Add up to 10 photos per plot/zone.
                    </p>

                    {/* Inputs tab switcher */}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                      <button
                        type="button"
                        className={`btn btn-xs ${plotImgInputType === 'file' ? 'btn-gold' : 'btn-ghost'}`}
                        onClick={() => setPlotImgInputType('file')}
                        style={{ fontSize: '11px' }}
                      >
                        <Upload size={12} /> Local Multi-Upload
                      </button>
                      <button
                        type="button"
                        className={`btn btn-xs ${plotImgInputType === 'url' ? 'btn-gold' : 'btn-ghost'}`}
                        onClick={() => setPlotImgInputType('url')}
                        style={{ fontSize: '11px' }}
                      >
                        <LinkIcon size={12} /> Paste URL
                      </button>
                    </div>

                    {plotImgInputType === 'file' ? (
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="admin-map-input"
                        onChange={handlePlotFileUpload}
                        disabled={(formData.images || (formData.image ? [formData.image] : [])).length >= 10}
                        style={{ padding: '6px 10px', fontSize: '12px' }}
                      />
                    ) : (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <input
                          className="admin-map-input"
                          placeholder="https://images.unsplash.com/..."
                          value={tempImgUrl}
                          onChange={e => setTempImgUrl(e.target.value)}
                          disabled={(formData.images || (formData.image ? [formData.image] : [])).length >= 10}
                          style={{ flex: 1 }}
                        />
                        <button
                          type="button"
                          onClick={handleAddImageUrl}
                          className="btn btn-gold btn-xs"
                          disabled={!tempImgUrl.trim() || (formData.images || (formData.image ? [formData.image] : [])).length >= 10}
                        >
                          + Add
                        </button>
                      </div>
                    )}

                    {/* Thumbnail Grid for up to 10 Images */}
                    {(formData.images || (formData.image ? [formData.image] : [])).length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginTop: '12px' }}>
                        {(formData.images || (formData.image ? [formData.image] : [])).map((imgSrc, idx) => (
                          <div key={idx} style={{ position: 'relative', width: '100%', paddingTop: '75%', borderRadius: '6px', overflow: 'hidden', border: idx === 0 ? '2px solid var(--gold)' : '1px solid var(--border)' }}>
                            <img src={imgSrc} alt={`Photo ${idx + 1}`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                            {idx === 0 && (
                              <span style={{ position: 'absolute', bottom: 2, left: 2, background: 'var(--gold)', color: '#000', fontSize: '8px', fontWeight: 800, padding: '1px 3px', borderRadius: '2px' }}>COVER</span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(239,68,68,0.85)', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                              title="Remove Photo"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="admin-map-form-2col">
                    <div className="admin-map-form-row">
                      <label>PRICE (₹/PINDI)</label>
                      <input
                        type="number"
                        className="admin-map-input"
                        placeholder="499"
                        value={formData.price ?? ''}
                        onChange={e => setFormData(f => ({ ...f, price: e.target.value }))}
                      />
                    </div>
                    <div className="admin-map-form-row">
                      <label>AREA</label>
                      <input
                        className="admin-map-input"
                        placeholder="200 sq ft"
                        value={formData.area ?? ''}
                        onChange={e => setFormData(f => ({ ...f, area: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="admin-map-form-2col">
                    <div className="admin-map-form-row">
                      <label>CAPACITY</label>
                      <input
                        type="number"
                        className="admin-map-input"
                        placeholder="500"
                        value={formData.capacity ?? ''}
                        onChange={e => setFormData(f => ({ ...f, capacity: e.target.value }))}
                      />
                    </div>
                    <div className="admin-map-form-row">
                      <label>STATUS</label>
                      <select
                        className="admin-map-input"
                        value={formData.status || 'available'}
                        onChange={e => setFormData(f => ({ ...f, status: e.target.value }))}
                      >
                        <option value="available">Available</option>
                        <option value="Active">Active</option>
                        <option value="booked">Booked</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                  </div>

                  <div className="admin-map-form-row">
                    <label>DESCRIPTION</label>
                    <textarea
                      className="admin-map-input admin-map-textarea"
                      placeholder="Describe this spot or zone..."
                      rows={3}
                      value={formData.description ?? ''}
                      onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                    />
                  </div>

                  <div className="admin-map-form-row">
                    <label>FACILITIES (COMMA SEPARATED)</label>
                    <input
                      className="admin-map-input"
                      placeholder="Parking, Water, Electricity, Garden"
                      value={formData.facilities ?? ''}
                      onChange={e => setFormData(f => ({ ...f, facilities: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Position on Map */}
                <div className="admin-map-form-section">
                  <h4><Move size={14} /> POSITION ON MAP (%)</h4>
                  <p className="admin-map-form-hint">Set percentage X, Y position and size on the master plan canvas.</p>
                  <div className="admin-map-form-2col">
                    <div className="admin-map-form-row">
                      <label>X (left %)</label>
                      <input type="number" className="admin-map-input" value={formData.coordinates?.x ?? 30}
                        onChange={e => setFormData(f => ({ ...f, coordinates: { ...(f.coordinates || {}), x: Number(e.target.value) } }))} min="0" max="100" step="0.5" />
                    </div>
                    <div className="admin-map-form-row">
                      <label>Y (top %)</label>
                      <input type="number" className="admin-map-input" value={formData.coordinates?.y ?? 30}
                        onChange={e => setFormData(f => ({ ...f, coordinates: { ...(f.coordinates || {}), y: Number(e.target.value) } }))} min="0" max="100" step="0.5" />
                    </div>
                    <div className="admin-map-form-row">
                      <label>Width %</label>
                      <input type="number" className="admin-map-input" value={formData.coordinates?.width ?? 15}
                        onChange={e => setFormData(f => ({ ...f, coordinates: { ...(f.coordinates || {}), width: Number(e.target.value) } }))} min="2" max="60" step="0.5" />
                    </div>
                    <div className="admin-map-form-row">
                      <label>Height %</label>
                      <input type="number" className="admin-map-input" value={formData.coordinates?.height ?? 10}
                        onChange={e => setFormData(f => ({ ...f, coordinates: { ...(f.coordinates || {}), height: Number(e.target.value) } }))} min="2" max="60" step="0.5" />
                    </div>
                  </div>
                </div>

                {/* Distances & Appearance */}
                <div className="admin-map-form-section">
                  <h4>DISTANCES &amp; APPEARANCE</h4>
                  <div className="admin-map-form-2col">
                    <div className="admin-map-form-row">
                      <label>DISTANCE FROM GATE</label>
                      <input className="admin-map-input" placeholder="80 m"
                        value={formData.distanceFromGate ?? ''}
                        onChange={e => setFormData(f => ({ ...f, distanceFromGate: e.target.value }))} />
                    </div>
                    <div className="admin-map-form-row">
                      <label>DISTANCE FROM CANAL</label>
                      <input className="admin-map-input" placeholder="20 m"
                        value={formData.distanceFromCanal ?? ''}
                        onChange={e => setFormData(f => ({ ...f, distanceFromCanal: e.target.value }))} />
                    </div>
                    <div className="admin-map-form-row">
                      <label>COLOR</label>
                      <div className="admin-map-color-row">
                        <input type="color" className="admin-map-color-input" value={formData.color ?? '#C9A84C'}
                          onChange={e => setFormData(f => ({ ...f, color: e.target.value }))} />
                        <input className="admin-map-input" value={formData.color ?? '#C9A84C'}
                          onChange={e => setFormData(f => ({ ...f, color: e.target.value }))} />
                      </div>
                    </div>
                    <div className="admin-map-form-row">
                      <label>PRIORITY</label>
                      <input type="number" className="admin-map-input" placeholder="0" value={formData.priority ?? 0}
                        onChange={e => setFormData(f => ({ ...f, priority: e.target.value }))} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-map-form-footer">
                <button className="btn btn-outline" onClick={() => setShowDrawer(false)}>Cancel</button>
                <button
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  {saving ? 'Updating…' : <><Save size={15} /> {editingSpot ? 'Update Plot' : 'Save Plot'}</>}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
