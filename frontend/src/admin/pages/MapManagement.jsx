import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LuMap as Map, LuPlus as Plus, LuTrash2 as Trash2, LuPencilLine as Edit3, LuSave as Save, LuX as X, LuEye as Eye,
  LuMapPin as MapPin, LuMove as Move, LuCircleCheck as CheckCircle, LuClock as Clock,
  LuImage as Image, LuLink as LinkIcon, LuUpload as Upload, LuRefreshCw as RefreshCw, LuFolderHeart as FolderHeart
} from 'react-icons/lu'
import toast from 'react-hot-toast'
import masterPlanImg from '../../assets/master-plan.png'
import { useSocket } from '../../context/SocketContext'
import { buildApiUrl } from '../../services/api'

const DEFAULT_MAPS = [
  {
    _id: 'default-master-plan',
    title: 'Barapita Master Plan (Main Ground)',
    image: masterPlanImg,
    description: 'Central master plan containing Biotech parks, Riverside Pandals, and Main Gate.',
    spotId: '1',
    linkedSpot: 'Barapita Ground, Deras',
    googleMapUrl: 'https://maps.google.com/?q=20.311450,85.690644',
    isDefault: true
  },
  {
    _id: 'chilika-map-02',
    title: 'Chilika Lake Sanctuary Map',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
    description: 'Waterfront camping pandals, boating docks, and island picnic spots.',
    spotId: '2',
    linkedSpot: 'Chilika Lake Sanctuary, Puri',
    googleMapUrl: 'https://maps.google.com/?q=19.7042,85.3218',
    isDefault: false
  },
  {
    _id: 'simlipal-map-03',
    title: 'Simlipal Forest & Waterfall Map',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80',
    description: 'Deep forest camping zones, safari trails, and canopy watchtowers.',
    spotId: '3',
    linkedSpot: 'Simlipal Forest Reserve, Mayurbhanj',
    googleMapUrl: 'https://maps.google.com/?q=21.9333,86.3333',
    isDefault: false
  }
]

const DEFAULT_SPOTS = [
  { id: '1', name: 'Nandankanan & Barapita Grounds' },
  { id: '2', name: 'Chilika Lake Sanctuary' },
  { id: '3', name: 'Simlipal Forest Reserve' },
  { id: '4', name: 'Dhauli Hillside Park' }
]

const BLANK_PLOT = {
  title: '',
  price: '',
  area: '',
  capacity: '',
  description: '',
  facilities: '',
  status: 'available',
  coordinates: { x: 10, y: 10, width: 15, height: 10 },
  color: '#C9A84C',
  priority: 0,
  distanceFromGate: '',
  distanceFromCanal: '',
  image: '',
  mapId: ''
}

const DEFAULT_PLOTS = [
  {
    _id: 'main-gate',
    mapId: 'default-master-plan',
    title: 'Main Gate',
    price: 0,
    area: '200 sq ft',
    capacity: 500,
    description: 'Grand entrance to Barapita Picnic Utkal. Security cabin, welcome arch and directional signage.',
    facilities: ['Security', 'CCTV', 'Signage', 'Entry Pass'],
    status: 'available',
    coordinates: { x: 54, y: 74, width: 9, height: 7 },
    color: '#C9A84C',
    distanceFromGate: '0 m',
    distanceFromCanal: '180 m'
  },
  {
    _id: 'parking',
    mapId: 'default-master-plan',
    title: 'Parking Zone',
    price: 0,
    area: '3200 sq ft',
    capacity: 80,
    description: 'Spacious secure parking with CCTV surveillance. Accommodates cars, buses and two-wheelers.',
    facilities: ['CCTV', 'Security Guard', 'Lighting', '24x7 Open', 'Free'],
    status: 'available',
    coordinates: { x: 62, y: 61, width: 32, height: 18 },
    color: '#6B7280',
    distanceFromGate: '40 m',
    distanceFromCanal: '160 m'
  },
  {
    _id: 'pandal-1',
    mapId: 'default-master-plan',
    title: 'Pandal — Upper Block',
    price: 499,
    area: '3500 sq ft',
    capacity: 120,
    description: 'Shaded pandal structure near the canal with cool breeze and scenic water views.',
    facilities: ['Shade', 'Seating', 'Lighting', 'Riverside View'],
    status: 'available',
    coordinates: { x: 46, y: 29, width: 18, height: 9 },
    color: '#52B788',
    distanceFromGate: '120 m',
    distanceFromCanal: '20 m'
  },
  {
    _id: 'pandal-2',
    mapId: 'default-master-plan',
    title: 'Pandal — Center Block',
    price: 499,
    area: '3200 sq ft',
    capacity: 100,
    description: 'Central pandal with easy access to restroom facilities.',
    facilities: ['Shade', 'Seating', 'Lighting', 'DJ Point'],
    status: 'booked',
    coordinates: { x: 37, y: 48, width: 6, height: 10 },
    color: '#52B788',
    distanceFromGate: '85 m',
    distanceFromCanal: '70 m'
  },
  {
    _id: 'pandal-3',
    mapId: 'default-master-plan',
    title: 'Pandal — West Block',
    price: 399,
    area: '2800 sq ft',
    capacity: 90,
    description: 'Cozy west-side pandal nestled among trees, perfect for intimate family picnics.',
    facilities: ['Shade', 'Seating', 'BBQ Area', 'Garden View'],
    status: 'available',
    coordinates: { x: 30, y: 62, width: 9, height: 10 },
    color: '#52B788',
    distanceFromGate: '130 m',
    distanceFromCanal: '30 m'
  },
  {
    _id: 'pandal-4',
    mapId: 'default-master-plan',
    title: 'Pandal — East Block',
    price: 449,
    area: '3000 sq ft',
    capacity: 95,
    description: 'East-side pandal with direct parking access, ideal for large group events.',
    facilities: ['Shade', 'Seating', 'Parking Access', 'Electricity'],
    status: 'available',
    coordinates: { x: 68, y: 50, width: 13, height: 10 },
    color: '#52B788',
    distanceFromGate: '55 m',
    distanceFromCanal: '150 m'
  },
  {
    _id: 'biotech-1',
    mapId: 'default-master-plan',
    title: 'Biotech Park 1',
    price: 799,
    area: '6200 sq ft',
    capacity: 200,
    description: 'Premium open-air event space with manicured lawns, elegant lighting, and riverside ambience.',
    facilities: ['Parking', 'Water', 'Electricity', 'Garden', 'Restrooms', 'Stage'],
    status: 'available',
    coordinates: { x: 45, y: 28, width: 20, height: 15 },
    color: '#2D6A4F',
    distanceFromGate: '90 m',
    distanceFromCanal: '60 m'
  },
  {
    _id: 'biotech-2',
    mapId: 'default-master-plan',
    title: 'Biotech Park 2',
    price: 699,
    area: '5800 sq ft',
    capacity: 180,
    description: 'Versatile event ground ideal for cultural programs, corporate outings, and family gatherings.',
    facilities: ['Parking', 'Water', 'Electricity', 'Garden', 'Restrooms'],
    status: 'available',
    coordinates: { x: 27, y: 47, width: 25, height: 27 },
    color: '#1B4332',
    distanceFromGate: '110 m',
    distanceFromCanal: '40 m'
  },
  {
    _id: 'chilika-zone-1',
    mapId: 'chilika-map-02',
    title: 'Nalaban Bird Island Viewpoint Pandal',
    price: 899,
    area: '4000 sq ft',
    capacity: 150,
    description: 'Waterfront picnic gazebo overlooking the migratory bird sanctuary.',
    facilities: ['Binoculars', 'Boat Pier', 'Shade', 'Restrooms'],
    status: 'available',
    coordinates: { x: 25, y: 35, width: 20, height: 18 },
    color: '#228BE6',
    distanceFromGate: '20 m',
    distanceFromCanal: '0 m'
  },
  {
    _id: 'simlipal-zone-1',
    mapId: 'simlipal-map-03',
    title: 'Barehipani Waterfall Overlook Pandal',
    price: 1099,
    area: '4500 sq ft',
    capacity: 120,
    description: 'Tiered waterfall view camping site surrounded by sal forest.',
    facilities: ['Trekking Trail', 'Watchtower', 'Campfire', 'Security Guard'],
    status: 'available',
    coordinates: { x: 35, y: 40, width: 22, height: 20 },
    color: '#2D6A4F',
    distanceFromGate: '100 m',
    distanceFromCanal: '15 m'
  }
]

const STATUS_CONFIG = {
  available:   { label: 'Available',   color: '#40C057' },
  booked:      { label: 'Booked',      color: '#FA5252' },
  maintenance: { label: 'Maintenance', color: '#FAB005' }
}

export default function AdminMapManagement() {
  const [maps, setMaps] = useState(() => {
    try {
      const saved = localStorage.getItem('picnicutkal_admin_maps')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (e) {}
    return DEFAULT_MAPS
  })

  const [selectedMapId, setSelectedMapId] = useState(() => maps[0]?._id || 'default-master-plan')
  const [plots, setPlots] = useState(DEFAULT_PLOTS)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(BLANK_PLOT)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [previewPlot, setPreviewPlot] = useState(null)
  
  const [showMapModal, setShowMapModal] = useState(false)
  const [editingMapId, setEditingMapId] = useState(null)
  const [mapForm, setMapForm] = useState({ title: '', image: '', description: '', linkedSpot: '', googleMapUrl: '' })
  const [mapImgInputType, setMapImgInputType] = useState('url') // 'url' | 'file'
  const [plotImgInputType, setPlotImgInputType] = useState('file') // 'url' | 'file'
  const [tempImgUrl, setTempImgUrl] = useState('')

  const handlePlotFileUpload = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    const currentImages = Array.isArray(form.images) ? form.images : (form.image ? [form.image] : [])
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
          setForm(f => {
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
    const currentImages = Array.isArray(form.images) ? form.images : (form.image ? [form.image] : [])
    if (currentImages.length >= 10) {
      toast.error('Maximum limit of 10 photos reached!')
      return
    }
    const updated = [...currentImages, tempImgUrl.trim()].slice(0, 10)
    setForm(f => ({
      ...f,
      images: updated,
      image: updated[0] || ''
    }))
    setTempImgUrl('')
    toast.success(`Photo URL added! (${updated.length}/10)`)
  }

  const handleRemoveImage = (index) => {
    setForm(f => {
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

  const mapRef = useRef(null)
  const { emitMapConfigUpdate } = useSocket()

  // Save maps to localStorage & emit via Socket.io
  useEffect(() => {
    try {
      localStorage.setItem('picnicutkal_admin_maps', JSON.stringify(maps))
      emitMapConfigUpdate(maps)
    } catch (e) {}
  }, [maps])

  // Current active map object
  const currentMap = maps.find(m => m._id === selectedMapId) || maps[0] || DEFAULT_MAPS[0]

  const fetchPlots = async () => {
    try {
      const res = await fetch(buildApiUrl('/api/map/plots'))
      const data = await res.json()
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setPlots(data.data)
      } else {
        setPlots(DEFAULT_PLOTS)
      }
    } catch {
      setPlots(DEFAULT_PLOTS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPlots() }, [])

  // Filter plots for current selected map
  const isDefaultMapSelected = selectedMapId === 'default-master-plan' || selectedMapId === 'default-map'

  const activePlots = plots.filter(p => {
    const pMapId = p.mapId || 'default-master-plan'
    if (isDefaultMapSelected) {
      return pMapId === 'default-master-plan' || pMapId === 'default-map' || !p.mapId
    }
    return pMapId === selectedMapId
  })

  // Save Plot / Zone
  const handleSavePlot = async () => {
    if (!form.title || !form.price) {
      toast.error('Title and Price are required')
      return
    }
    setSaving(true)
    try {
      const currentImages = Array.isArray(form.images) && form.images.length > 0
        ? form.images.slice(0, 10)
        : (form.image ? [form.image] : [])

      const payload = {
        ...form,
        mapId: form.mapId || selectedMapId,
        price: Number(form.price),
        capacity: Number(form.capacity) || 0,
        priority: Number(form.priority) || 0,
        images: currentImages,
        image: currentImages[0] || form.image || '',
        facilities: typeof form.facilities === 'string'
          ? form.facilities.split(',').map(f => f.trim()).filter(Boolean)
          : form.facilities
      }
      const url    = editing ? buildApiUrl(`/api/map/plots/${editing}`) : buildApiUrl('/api/map/plots')
      const method = editing ? 'PUT' : 'POST'
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (data.success) {
        toast.success(editing ? 'Plot updated!' : 'Plot created!')
        await fetchPlots()
        handleCloseForm()
      } else {
        toast.error(data.message || 'Save failed')
      }
    } catch {
      toast.error('Network error saving plot')
    } finally {
      setSaving(false)
    }
  }

  const handleEditPlot = (plot) => {
    const imagesList = Array.isArray(plot.images) && plot.images.length > 0
      ? plot.images
      : (plot.image ? [plot.image] : [])

    setForm({
      ...plot,
      facilities: Array.isArray(plot.facilities) ? plot.facilities.join(', ') : (plot.facilities || ''),
      images: imagesList,
      image: imagesList[0] || plot.image || ''
    })
    setEditing(plot._id)
    setShowForm(true)
  }

  const handleDeletePlot = async (id) => {
    try {
      const res = await fetch(buildApiUrl(`/api/map/plots/${id}`), { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Plot deleted')
        setPlots(p => p.filter(x => x._id !== id))
      } else {
        toast.error(data.message || 'Delete failed')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setDeleteConfirm(null)
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditing(null)
    setForm(BLANK_PLOT)
  }

  const handleMapClick = (e) => {
    if (!showForm) return
    const rect = mapRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1)
    const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1)
    setForm(f => ({ ...f, coordinates: { ...f.coordinates, x: Number(x), y: Number(y) } }))
    toast.success(`Position set: ${x}%, ${y}%`, { icon: '📍', duration: 1500 })
  }

  const updateCoord = (key, val) => {
    setForm(f => ({ ...f, coordinates: { ...f.coordinates, [key]: Number(val) } }))
  }

  // ── MAP MODAL HANDLERS ──
  const handleOpenAddMap = () => {
    setEditingMapId(null)
    setMapForm({
      title: '',
      image: '',
      description: '',
      linkedSpot: 'Barapita Ground, Deras',
      googleMapUrl: 'https://maps.google.com/?q=20.311450,85.690644'
    })
    setMapImgInputType('url')
    setShowMapModal(true)
  }

  const handleOpenEditMap = (mapObj) => {
    setEditingMapId(mapObj._id)
    setMapForm({
      title: mapObj.title || '',
      image: mapObj.image || '',
      description: mapObj.description || '',
      linkedSpot: mapObj.linkedSpot || mapObj.spotId || '',
      googleMapUrl: mapObj.googleMapUrl || 'https://maps.google.com/?q=20.311450,85.690644'
    })
    setMapImgInputType('url')
    setShowMapModal(true)
  }

  const handleMapFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        toast.error('File size must be under 8MB')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setMapForm(m => ({ ...m, image: reader.result }))
        toast.success('Map image selected!')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveMap = (e) => {
    e.preventDefault()
    if (!mapForm.title.trim() || !mapForm.image) {
      toast.error('Map Title and Map Image are required!')
      return
    }

    if (editingMapId) {
      setMaps(prev => prev.map(m => m._id === editingMapId ? { ...m, ...mapForm, title: mapForm.title.trim() } : m))
      toast.success('✅ Map updated & broadcast live!')
    } else {
      const newMap = {
        _id: `map-${Date.now()}`,
        title: mapForm.title.trim(),
        image: mapForm.image,
        description: mapForm.description.trim(),
        linkedSpot: mapForm.linkedSpot.trim(),
        googleMapUrl: mapForm.googleMapUrl.trim(),
        isDefault: false
      }
      setMaps(prev => [newMap, ...prev])
      setSelectedMapId(newMap._id)
      toast.success('✅ New Map created & broadcast live!')
    }
    setShowMapModal(false)
  }

  const handleDeleteMap = (mapId, title) => {
    if (maps.length <= 1) {
      toast.error('At least one Map must remain in system!')
      return
    }
    if (window.confirm(`Delete Map "${title}"?`)) {
      setMaps(prev => prev.filter(m => m._id !== mapId))
      const remaining = maps.filter(m => m._id !== mapId)
      setSelectedMapId(remaining[0]._id)
      toast.success('Map removed')
    }
  }

  return (
    <div className="admin-map-page">
      {/* ── Page Header ── */}
      <div className="admin-map-page-header">
        <div>
          <h1 className="admin-map-title">
            <Map size={22} /> Map Management
          </h1>
          <p className="admin-map-sub">Manage interactive resort maps, plots, and zones for all picnic spots</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handleOpenAddMap}
            className="btn btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} /> Add New Map
          </button>
          <button
            id="admin-map-add-btn"
            className="btn btn-primary"
            onClick={() => { setShowForm(true); setEditing(null); setForm(BLANK_PLOT) }}
          >
            <Plus size={16} /> Add Plot / Zone
          </button>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="admin-map-grid">

        {/* ── Interactive Map Preview ── */}
        <div className="admin-map-canvas-wrap">
          {/* Header Bar with Map Selector Dropdown */}
          <div className="admin-map-canvas-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Map size={16} style={{ color: 'var(--gold)' }} />
              <span style={{ fontWeight: 700 }}>Master Plan Preview</span>
            </div>

            {/* Map Selection Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Select Map:</label>
              <select
                value={selectedMapId}
                onChange={e => setSelectedMapId(e.target.value)}
                className="input"
                style={{ width: 'auto', padding: '4px 12px', fontSize: '12px', background: 'var(--bg-primary)', color: 'var(--gold)', fontWeight: 700 }}
              >
                {maps.map(m => (
                  <option key={m._id} value={m._id}>{m.title}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => handleOpenEditMap(currentMap)}
                className="btn btn-ghost btn-xs"
                title="Edit current map"
              >
                <Edit3 size={14} />
              </button>
              {maps.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeleteMap(currentMap._id, currentMap.title)}
                  className="btn btn-ghost btn-xs"
                  style={{ color: 'var(--error)' }}
                  title="Delete current map"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Map Image Canvas */}
          <div className="admin-map-canvas" ref={mapRef} onClick={handleMapClick}>
            <img src={currentMap?.image || masterPlanImg} alt={currentMap?.title || 'Master Plan'} className="admin-map-preview-img" />
            
            {/* Hotspots for Active Map */}
            {activePlots.map(plot => {
              const sc = STATUS_CONFIG[plot.status] || STATUS_CONFIG.available
              return (
                <div
                  key={plot._id}
                  className={`admin-map-hotspot-overlay ${previewPlot?._id === plot._id ? 'preview-active' : ''}`}
                  style={{
                    left: `${plot.coordinates.x}%`,
                    top: `${plot.coordinates.y}%`,
                    width: `${plot.coordinates.width}%`,
                    height: `${plot.coordinates.height}%`,
                    borderColor: sc.color,
                    background: `${sc.color}22`
                  }}
                  onMouseEnter={() => setPreviewPlot(plot)}
                  onMouseLeave={() => setPreviewPlot(null)}
                  onClick={e => { e.stopPropagation(); handleEditPlot(plot) }}
                >
                  <span className="admin-map-hotspot-lbl">{plot.title}</span>
                  <span className="admin-map-hotspot-status" style={{ background: sc.color }} />
                </div>
              )
            })}
            
            {/* New plot preview while form is open */}
            {showForm && (
              <div
                className="admin-map-new-plot-overlay"
                style={{
                  left: `${form.coordinates.x}%`,
                  top: `${form.coordinates.y}%`,
                  width: `${form.coordinates.width}%`,
                  height: `${form.coordinates.height}%`,
                  borderColor: form.color
                }}
              >
                <span className="admin-map-hotspot-lbl">{form.title || 'New Zone'}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Plots Table for Selected Map ── */}
        <div className="admin-map-table-wrap">
          <div className="admin-map-table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{activePlots.length} Zones in {currentMap?.title || 'Map'}</span>
            <small style={{ color: 'var(--gold)', fontSize: '11px' }}>Showing selected map plots</small>
          </div>
          {loading ? (
            <div className="admin-map-loading">Loading plots…</div>
          ) : activePlots.length === 0 ? (
            <div className="admin-map-empty">No plots yet on this map. Click &quot;Add Plot / Zone&quot; to configure.</div>
          ) : (
            <div className="admin-map-table-list">
              {activePlots.map(plot => {
                const sc = STATUS_CONFIG[plot.status] || STATUS_CONFIG.available
                return (
                  <motion.div
                    key={plot._id}
                    className="admin-map-plot-row"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div
                      className="admin-map-plot-color-swatch"
                      style={{ background: plot.color || '#C9A84C' }}
                    />
                    <div className="admin-map-plot-info">
                      <span className="admin-map-plot-name">{plot.title}</span>
                      <div className="admin-map-plot-meta">
                        <span>₹{plot.price?.toLocaleString()} / Pindi</span>
                        <span>·</span>
                        <span>{plot.area}</span>
                        <span>·</span>
                        <span style={{ color: sc.color }}>{sc.label}</span>
                      </div>
                    </div>
                    <div className="admin-map-plot-coords">
                      x:{plot.coordinates.x}% y:{plot.coordinates.y}%
                    </div>
                    <div className="admin-map-plot-actions">
                      <button
                        className="admin-map-action-btn admin-map-action-btn--edit"
                        onClick={() => handleEditPlot(plot)}
                        title="Edit Plot"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        className="admin-map-action-btn admin-map-action-btn--delete"
                        onClick={() => setDeleteConfirm(plot._id)}
                        title="Delete Plot"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── MAP MODAL (Add New Map / Edit Map) ── */}
      <AnimatePresence>
        {showMapModal && (
          <div className="admin-modal-overlay">
            <motion.div
              className="card glass-card"
              style={{ width: '100%', maxWidth: '520px', padding: '28px' }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(201,168,76,0.15)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Map size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700 }}>
                      {editingMapId ? 'Edit Map' : 'Add New Map'}
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Configure interactive resort &amp; sanctuary map</p>
                  </div>
                </div>
                <button type="button" className="btn btn-ghost btn-xs" onClick={() => setShowMapModal(false)}><X size={18} /></button>
              </div>

              <form onSubmit={handleSaveMap} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="input-wrapper">
                  <label className="input-label">Map Title / Name *</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Chilika Sanctuary Resort Map"
                    value={mapForm.title}
                    onChange={e => setMapForm(m => ({ ...m, title: e.target.value }))}
                    required
                  />
                </div>

                <div className="input-wrapper">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="input-label" style={{ margin: 0 }}>Map Image Source *</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        className={`btn btn-xs ${mapImgInputType === 'url' ? 'btn-gold' : 'btn-ghost'}`}
                        onClick={() => { setMapImgInputType('url'); setMapForm(m => ({ ...m, image: '' })); }}
                        style={{ padding: '2px 8px', fontSize: '11px' }}
                      >
                        <LinkIcon size={12} /> URL
                      </button>
                      <button
                        type="button"
                        className={`btn btn-xs ${mapImgInputType === 'file' ? 'btn-gold' : 'btn-ghost'}`}
                        onClick={() => { setMapImgInputType('file'); setMapForm(m => ({ ...m, image: '' })); }}
                        style={{ padding: '2px 8px', fontSize: '11px' }}
                      >
                        <Upload size={12} /> Local File
                      </button>
                    </div>
                  </div>

                  {mapImgInputType === 'url' ? (
                    <input
                      type="url"
                      className="input"
                      placeholder="https://images.unsplash.com/..."
                      value={mapForm.image}
                      onChange={e => setMapForm(m => ({ ...m, image: e.target.value }))}
                      required
                    />
                  ) : (
                    <input
                      type="file"
                      accept="image/*"
                      className="input"
                      onChange={handleMapFileUpload}
                      style={{ padding: '6px 12px' }}
                      required={!mapForm.image}
                    />
                  )}
                </div>

                {mapForm.image && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <img src={mapForm.image} alt="Map Preview" style={{ width: '80px', height: '48px', objectFit: 'cover', borderRadius: '4px' }} />
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Image ready</span>
                  </div>
                )}

                <div className="input-wrapper">
                  <label className="input-label">Linked Picnic Spot</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Barapita Picnic Ground, Odisha"
                    value={mapForm.linkedSpot || ''}
                    onChange={e => setMapForm(m => ({ ...m, linkedSpot: e.target.value }))}
                  />
                </div>

                <div className="input-wrapper">
                  <label className="input-label">Google Map Location / URL</label>
                  <input
                    type="url"
                    className="input"
                    placeholder="e.g. https://maps.google.com/?q=20.311450,85.690644"
                    value={mapForm.googleMapUrl || ''}
                    onChange={e => setMapForm(m => ({ ...m, googleMapUrl: e.target.value }))}
                  />
                </div>

                <div className="input-wrapper">
                  <label className="input-label">Description</label>
                  <textarea
                    className="input"
                    rows={2}
                    placeholder="Short description of this resort ground or map zone..."
                    value={mapForm.description}
                    onChange={e => setMapForm(m => ({ ...m, description: e.target.value }))}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                  <button type="button" onClick={() => setShowMapModal(false)} className="btn btn-outline btn-sm">Cancel</button>
                  <button type="submit" className="btn btn-gold btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Save size={16} /> {editingMapId ? 'Update Map' : 'Create Map'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── PLOT FORM (Add / Edit Plot) ── */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              className="admin-map-form-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseForm}
            />
            <motion.div
              className="admin-map-form-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            >
              <div className="admin-map-form-header">
                <h3>{editing ? 'Edit Plot / Zone' : 'Add New Plot / Zone'}</h3>
                <button className="admin-map-form-close" onClick={handleCloseForm}><X size={18} /></button>
              </div>

              <div className="admin-map-form-body">
                {/* Basic Info */}
                <div className="admin-map-form-section">
                  <h4>Basic Info</h4>
                  <div className="admin-map-form-row">
                    <label>Target Map</label>
                    <select
                      className="admin-map-input"
                      value={form.mapId || selectedMapId}
                      onChange={e => setForm(f => ({ ...f, mapId: e.target.value }))}
                      style={{ color: 'var(--gold)', fontWeight: 700 }}
                    >
                      {maps.map(m => (
                        <option key={m._id} value={m._id}>{m.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-map-form-row">
                    <label>Title *</label>
                    <input
                      id="admin-map-form-title"
                      className="admin-map-input"
                      placeholder="e.g. Biotech Park 1"
                      value={form.title ?? ''}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    />
                  </div>

                  {/* Photo Gallery Manager (Max 10 Images) */}
                  <div className="admin-map-form-row" style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Image size={15} style={{ color: 'var(--gold)' }} />
                        <label style={{ margin: 0, fontWeight: 700, fontSize: '13px' }}>Plot Photos Gallery</label>
                      </div>
                      <span className="badge badge-gold" style={{ fontSize: '11px' }}>
                        {(form.images || (form.image ? [form.image] : [])).length} / 10 Photos
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
                        disabled={(form.images || (form.image ? [form.image] : [])).length >= 10}
                        style={{ padding: '6px 10px', fontSize: '12px' }}
                      />
                    ) : (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <input
                          className="admin-map-input"
                          placeholder="https://images.unsplash.com/..."
                          value={tempImgUrl}
                          onChange={e => setTempImgUrl(e.target.value)}
                          disabled={(form.images || (form.image ? [form.image] : [])).length >= 10}
                          style={{ flex: 1 }}
                        />
                        <button
                          type="button"
                          onClick={handleAddImageUrl}
                          className="btn btn-gold btn-xs"
                          disabled={!tempImgUrl.trim() || (form.images || (form.image ? [form.image] : [])).length >= 10}
                        >
                          + Add
                        </button>
                      </div>
                    )}

                    {/* Thumbnail Grid for up to 10 Images */}
                    {(form.images || (form.image ? [form.image] : [])).length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginTop: '12px' }}>
                        {(form.images || (form.image ? [form.image] : [])).map((imgSrc, idx) => (
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
                      <label>Price (₹/Pindi)</label>
                      <input
                        id="admin-map-form-price"
                        type="number"
                        className="admin-map-input"
                        placeholder="499"
                        value={form.price ?? ''}
                        onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      />
                    </div>
                    <div className="admin-map-form-row">
                      <label>Area</label>
                      <input
                        id="admin-map-form-area"
                        className="admin-map-input"
                        placeholder="4500 sq ft"
                        value={form.area ?? ''}
                        onChange={e => setForm(f => ({ ...f, area: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="admin-map-form-2col">
                    <div className="admin-map-form-row">
                      <label>Capacity</label>
                      <input
                        id="admin-map-form-capacity"
                        type="number"
                        className="admin-map-input"
                        placeholder="150"
                        value={form.capacity ?? ''}
                        onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))}
                      />
                    </div>
                    <div className="admin-map-form-row">
                      <label>Status</label>
                      <select
                        id="admin-map-form-status"
                        className="admin-map-input"
                        value={form.status ?? 'available'}
                        onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                      >
                        <option value="available">Available</option>
                        <option value="booked">Booked</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                  </div>
                  <div className="admin-map-form-row">
                    <label>Description</label>
                    <textarea
                      id="admin-map-form-desc"
                      className="admin-map-input admin-map-textarea"
                      placeholder="Describe this zone..."
                      value={form.description ?? ''}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    />
                  </div>
                  <div className="admin-map-form-row">
                    <label>Facilities (comma separated)</label>
                    <input
                      id="admin-map-form-facilities"
                      className="admin-map-input"
                      placeholder="Parking, Water, Electricity, Garden"
                      value={form.facilities ?? ''}
                      onChange={e => setForm(f => ({ ...f, facilities: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Position */}
                <div className="admin-map-form-section">
                  <h4><Move size={14} /> Position on Map (%)</h4>
                  <p className="admin-map-form-hint">Click on the map preview to set X,Y position, or type manually.</p>
                  <div className="admin-map-form-2col">
                    <div className="admin-map-form-row">
                      <label>X (left %)</label>
                      <input type="number" className="admin-map-input" value={form.coordinates?.x ?? 0}
                        onChange={e => updateCoord('x', e.target.value)} min="0" max="100" step="0.5" />
                    </div>
                    <div className="admin-map-form-row">
                      <label>Y (top %)</label>
                      <input type="number" className="admin-map-input" value={form.coordinates?.y ?? 0}
                        onChange={e => updateCoord('y', e.target.value)} min="0" max="100" step="0.5" />
                    </div>
                    <div className="admin-map-form-row">
                      <label>Width %</label>
                      <input type="number" className="admin-map-input" value={form.coordinates?.width ?? 10}
                        onChange={e => updateCoord('width', e.target.value)} min="2" max="60" step="0.5" />
                    </div>
                    <div className="admin-map-form-row">
                      <label>Height %</label>
                      <input type="number" className="admin-map-input" value={form.coordinates?.height ?? 10}
                        onChange={e => updateCoord('height', e.target.value)} min="2" max="60" step="0.5" />
                    </div>
                  </div>
                </div>

                {/* Distances & Visual */}
                <div className="admin-map-form-section">
                  <h4>Distances &amp; Appearance</h4>
                  <div className="admin-map-form-2col">
                    <div className="admin-map-form-row">
                      <label>Distance from Gate</label>
                      <input className="admin-map-input" placeholder="80 m"
                        value={form.distanceFromGate ?? ''}
                        onChange={e => setForm(f => ({ ...f, distanceFromGate: e.target.value }))} />
                    </div>
                    <div className="admin-map-form-row">
                      <label>Distance from Canal</label>
                      <input className="admin-map-input" placeholder="20 m"
                        value={form.distanceFromCanal ?? ''}
                        onChange={e => setForm(f => ({ ...f, distanceFromCanal: e.target.value }))} />
                    </div>
                    <div className="admin-map-form-row">
                      <label>Color</label>
                      <div className="admin-map-color-row">
                        <input type="color" className="admin-map-color-input" value={form.color ?? '#C9A84C'}
                          onChange={e => setForm(f => ({ ...f, color: e.target.value }))} />
                        <input className="admin-map-input" value={form.color ?? '#C9A84C'}
                          onChange={e => setForm(f => ({ ...f, color: e.target.value }))} />
                      </div>
                    </div>
                    <div className="admin-map-form-row">
                      <label>Priority</label>
                      <input type="number" className="admin-map-input" placeholder="0" value={form.priority ?? 0}
                        onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-map-form-footer">
                <button className="btn btn-outline" onClick={handleCloseForm}>Cancel</button>
                <button
                  id="admin-map-save-btn"
                  className="btn btn-primary"
                  onClick={handleSavePlot}
                  disabled={saving}
                >
                  {saving ? 'Saving…' : <><Save size={15} /> {editing ? 'Update Plot' : 'Save Plot'}</>}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Delete Plot Confirm Modal ── */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="admin-modal-overlay">
            <motion.div
              className="admin-confirm-modal card glass-card"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="admin-confirm-icon-box">
                <Trash2 size={32} />
              </div>
              <h3>Delete Plot?</h3>
              <p>This will permanently remove this zone from the map. This action cannot be undone.</p>
              <div className="admin-confirm-actions">
                <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={() => handleDeletePlot(deleteConfirm)}>
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
