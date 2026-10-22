import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LuMap as Map, LuPlus as Plus, LuTrash2 as Trash2, LuPencilLine as Edit3, LuSave as Save, LuX as X, LuEye as Eye,
  LuMapPin as MapPin, LuMove as Move, LuCircleCheck as CheckCircle, LuClock as Clock,
  LuImage as Image, LuLink as LinkIcon, LuUpload as Upload, LuRefreshCw as RefreshCw, LuFolderHeart as FolderHeart,
  LuTrees as Trees, LuInfo as Info, LuSparkles as Sparkles
} from 'react-icons/lu'
import { FaHouse as HouseIcon } from 'react-icons/fa6'
import toast from 'react-hot-toast'
import masterPlanImg from '../../assets/master-plan.png'
import { useSocket } from '../../context/SocketContext'
import { buildApiUrl } from '../../services/api'
import { uploadImageToCloudinary } from '../../services/uploadService'

function resolveMapImage(imgSrc) {
  if (!imgSrc) return masterPlanImg
  if (typeof imgSrc === 'string') {
    const s = imgSrc.trim()
    if (!s) return masterPlanImg
    if (s.startsWith('/uploads')) {
      const backendOrigin = import.meta.env.VITE_API_URL 
        ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') 
        : 'http://localhost:5300'
      return `${backendOrigin}${s}`
    }
    if (s.includes('master-plan') || s.startsWith('/src/') || s.startsWith('/assets/')) {
      return masterPlanImg
    }
    return s
  }
  return masterPlanImg
}

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
  isCottage: false,
  isFree: false,
  isLandmark: false,
  image: '',
  images: [],
  mapId: ''
}

const BLANK_COTTAGE = {
  title: 'Cottage Rooms & Suite',
  price: 999,
  area: '4800 sq ft',
  capacity: 36,
  description: 'Comfortable cottage accommodation block with 3 room types — Standard (Cottage 1 ₹999/night), Deluxe (Cottage 2 ₹1499/night), and Premium Suite (Cottage 3 ₹1999/night). All rooms include AC, attached bath and scenic views.',
  facilities: 'AC Rooms, Attached Bath, Garden View, Canal View, Riverside View, TV, Kitchenette',
  status: 'available',
  coordinates: { x: 36, y: 5, width: 16, height: 18 },
  color: '#A07830',
  priority: 1,
  distanceFromGate: '140 m',
  distanceFromCanal: '15 m',
  isCottage: true,
  image: '',
  images: [
    'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&q=80',
    'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80',
    'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80'
  ],
  mapId: ''
}

const BLANK_LANDMARK = {
  title: 'Main Gate & Parking',
  price: 0,
  area: '1000 sq ft',
  capacity: 100,
  description: 'Key landmark / instruction point (Main Gate, River Shore, Parking Stand, Restrooms, Drinking Water, etc.).',
  facilities: 'Signage, Security, Free Access, Information Desk',
  status: 'available',
  coordinates: { x: 50, y: 70, width: 12, height: 8 },
  color: '#4A90E2',
  priority: 0,
  distanceFromGate: '0 m',
  distanceFromCanal: '50 m',
  isFree: true,
  isLandmark: true,
  isCottage: false,
  image: '',
  images: [],
  mapId: ''
}

const STATUS_CONFIG = {
  available:   { label: 'Available',   color: '#40C057' },
  booked:      { label: 'Booked',      color: '#FA5252' },
  maintenance: { label: 'Maintenance', color: '#FAB005' }
}

const compressImage = (dataUrl, maxDimension = 1400, quality = 0.82) => {
  return new Promise((resolve) => {
    if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image')) {
      return resolve(dataUrl)
    }
    const img = new window.Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let { width, height } = img
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width)
          width = maxDimension
        } else {
          width = Math.round((width * maxDimension) / height)
          height = maxDimension
        }
      }
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
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

  const [selectedMapId, setSelectedMapId] = useState(() => {
    try {
      const savedSel = localStorage.getItem('picnicutkal_admin_selected_map')
      if (savedSel) return savedSel
    } catch (e) {}
    return maps[0]?._id || 'default-master-plan'
  })

  useEffect(() => {
    if (selectedMapId) {
      try {
        localStorage.setItem('picnicutkal_admin_selected_map', selectedMapId)
      } catch (e) {}
    }
  }, [selectedMapId])

  const [plots, setPlots] = useState(() => {
    try {
      const saved = localStorage.getItem('picnicutkal_admin_plots')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (e) {}
    return []
  })
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

  const handlePlotFileUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    const currentImages = Array.isArray(form.images) ? form.images : (form.image ? [form.image] : [])
    const remainingSlots = 10 - currentImages.length
    if (remainingSlots <= 0) {
      toast.error('Maximum limit of 10 photos reached!')
      return
    }

    const filesToUpload = files.slice(0, remainingSlots)
    const toastId = toast.loading(`Uploading ${filesToUpload.length} plot photo(s) to Cloudinary...`)

    try {
      const uploadPromises = filesToUpload.map(f => uploadImageToCloudinary(f, 'picnicutkal/plots'))
      const cdnUrls = await Promise.all(uploadPromises)
      const validUrls = cdnUrls.filter(Boolean)

      if (validUrls.length > 0) {
        setForm(f => {
          const existing = Array.isArray(f.images) ? f.images : (f.image ? [f.image] : [])
          const updated = [...existing, ...validUrls].slice(0, 10)
          return {
            ...f,
            images: updated,
            image: updated[0] || ''
          }
        })
        toast.success(`✅ Added ${validUrls.length} photo(s) to Cloudinary!`, { id: toastId })
      }
    } catch (err) {
      toast.error(err.message || 'Plot photo upload failed', { id: toastId })
    }
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
  const { emitMapConfigUpdate, socket } = useSocket()

  // Save maps to localStorage & emit via Socket.io
  useEffect(() => {
    try {
      localStorage.setItem('picnicutkal_admin_maps', JSON.stringify(maps))
      emitMapConfigUpdate(maps)
    } catch (e) {}
  }, [maps])

  // Current active map object
  const currentMap = maps.find(m => m._id === selectedMapId) || maps[0] || DEFAULT_MAPS[0]

  const saveAndSyncPlots = (updatedPlots) => {
    setPlots(updatedPlots)
    try {
      localStorage.setItem('picnicutkal_admin_plots', JSON.stringify(updatedPlots))
    } catch (e) {}
  }

  const fetchMaps = async () => {
    try {
      const res = await fetch(buildApiUrl('/api/map/maps'))
      if (!res.ok) return
      const data = await res.json()
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setMaps(data.data)
        try {
          localStorage.setItem('picnicutkal_admin_maps', JSON.stringify(data.data))
        } catch (e) {}
        // Ensure selectedMapId is valid
        const savedSel = localStorage.getItem('picnicutkal_admin_selected_map')
        if (savedSel && data.data.some(m => m._id === savedSel)) {
          setSelectedMapId(savedSel)
        } else if (!data.data.some(m => m._id === selectedMapId)) {
          setSelectedMapId(data.data[0]._id)
        }
      }
    } catch (e) {
      console.warn('fetchMaps error:', e)
    }
  }

  const fetchPlots = async () => {
    try {
      // 1. Check SiteConfig first
      try {
        const scRes = await fetch(buildApiUrl('/api/site-config/map_plots_config'))
        if (scRes.ok) {
          const scData = await scRes.json()
          const val = scData?.value || scData?.data
          if (Array.isArray(val) && val.length > 0) {
            setPlots(prev => {
              const serverIds = new Set(val.map(p => p._id || p.id))
              const localAdditions = prev.filter(p => !serverIds.has(p._id) && !serverIds.has(p.id))
              const merged = [...val, ...localAdditions]
              try {
                localStorage.setItem('picnicutkal_admin_plots', JSON.stringify(merged))
              } catch (e) {}
              return merged
            })
            setLoading(false)
            return
          }
        }
      } catch (e) {}

      // 2. Check /api/map/plots
      const res = await fetch(buildApiUrl('/api/map/plots'))
      if (!res.ok) return
      const data = await res.json()
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setPlots(prev => {
          const serverIds = new Set(data.data.map(p => p._id || p.id))
          const localAdditions = prev.filter(p => !serverIds.has(p._id) && !serverIds.has(p.id))
          const merged = [...data.data, ...localAdditions]
          try {
            localStorage.setItem('picnicutkal_admin_plots', JSON.stringify(merged))
          } catch (e) {}
          return merged
        })
      }
    } catch {
      // Keep current state/localStorage seamlessly
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMaps()
    fetchPlots()
  }, [])

  // Filter plots strictly for current selected map (New maps start empty with 0 zones)
  const activePlots = plots.filter(p => {
    const isDefaultMasterPlan = !selectedMapId || 
      selectedMapId === 'default-master-plan' || 
      selectedMapId === 'default-map' || 
      Boolean(currentMap?.isDefault)

    if (isDefaultMasterPlan) {
      return !p.mapId || p.mapId === 'default-master-plan' || p.mapId === 'default-map' || (currentMap && p.mapId === currentMap._id)
    }
    return p.mapId === selectedMapId
  })

  // Save Plot / Zone (Optimistic local save + background backend sync)
  const handleSavePlot = async () => {
    if (!form.title) {
      toast.error('Title is required')
      return
    }
    const isFreeFacility = Boolean(form.isFree || form.isLandmark || form.price === 0 || form.price === '0')
    if (!isFreeFacility && !form.price && form.price !== 0) {
      toast.error('Price is required (or click "No Price" for landmarks like Main Gate, Pool, Trees)')
      return
    }
    setSaving(true)

    const currentImages = Array.isArray(form.images) && form.images.length > 0
      ? form.images.slice(0, 10)
      : (form.image ? [form.image] : [])

    const targetMapId = form.mapId || selectedMapId || 'default-master-plan'
    const newPlotId = editing || `plot-${Date.now()}`

    const payload = {
      ...form,
      _id: newPlotId,
      id: newPlotId,
      customId: newPlotId,
      mapId: targetMapId,
      price: isFreeFacility ? 0 : (Number(form.price) || 0),
      isFree: isFreeFacility,
      isLandmark: isFreeFacility,
      capacity: Number(form.capacity) || 0,
      priority: Number(form.priority) || 0,
      images: currentImages,
      image: currentImages[0] || form.image || '',
      facilities: typeof form.facilities === 'string'
        ? form.facilities.split(',').map(f => f.trim()).filter(Boolean)
        : form.facilities
    }

    // 1. Immediately update local state & localStorage
    let updatedPlots
    if (editing) {
      updatedPlots = plots.map(p => p._id === editing || p.id === editing ? { ...p, ...payload } : p)
    } else {
      updatedPlots = [...plots, payload]
    }
    saveAndSyncPlots(updatedPlots)
    handleCloseForm()
    toast.success(editing ? 'Plot details updated!' : 'New Plot / Cottage created!')

    // 2. Broadcast via Socket.io
    if (socket) {
      socket.emit('plots_update', { plot: payload, action: editing ? 'updated' : 'created' })
    }

    // 3. Persist to MongoDB backend and adopt real database _id
    try {
      const url    = editing ? buildApiUrl(`/api/map/plots/${editing}`) : buildApiUrl('/api/map/plots')
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        const json = await res.json()
        if (json.data && json.data._id) {
          const persistedId = json.data._id
          const syncedPlots = updatedPlots.map(p => 
            (p._id === newPlotId || p.id === newPlotId || p._id === editing)
              ? { ...p, ...json.data, _id: persistedId, id: persistedId }
              : p
          )
          saveAndSyncPlots(syncedPlots)
        }
      }

      fetch(buildApiUrl('/api/site-config/map_plots_config'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'map_plots_config', value: updatedPlots })
      }).catch(() => {})
    } catch (e) {
      console.warn('Backend sync deferred:', e)
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
    // 1. Immediately update local state & localStorage
    const updatedPlots = plots.filter(x => x._id !== id && x.id !== id)
    saveAndSyncPlots(updatedPlots)
    toast.success('Plot removed successfully')
    setDeleteConfirm(null)

    // 2. Broadcast via Socket.io
    if (socket) {
      socket.emit('plots_update', { plotId: id, action: 'deleted' })
    }

    // 3. Delete from backend in background
    try {
      fetch(buildApiUrl(`/api/map/plots/${id}`), { method: 'DELETE' }).catch(() => {})
      fetch(buildApiUrl('/api/site-config/map_plots_config'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'map_plots_config', value: updatedPlots })
      }).catch(() => {})
    } catch (e) {
      console.warn('Backend delete deferred:', e)
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

  const handleOpenAddCottage = () => {
    setShowForm(true)
    setEditing(null)
    setForm({
      ...BLANK_COTTAGE,
      mapId: selectedMapId || 'default-master-plan'
    })
    setTempImgUrl('')
    toast.success('🏡 Cottage template loaded. Configure and save!')
  }

  const handleOpenAddLandmark = () => {
    setShowForm(true)
    setEditing(null)
    setForm({
      ...BLANK_LANDMARK,
      mapId: selectedMapId || 'default-master-plan'
    })
    setTempImgUrl('')
    toast.success('📍 Instruction / Landmark template loaded. Set location and save!')
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

  const handleMapFileUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      const toastId = toast.loading('Uploading map layout to Cloudinary...')
      try {
        const cdnUrl = await uploadImageToCloudinary(file, 'picnicutkal/maps')
        setMapForm(m => ({ ...m, image: cdnUrl }))
        toast.success('✅ Map image uploaded to Cloudinary!', { id: toastId })
      } catch (err) {
        toast.error(err.message || 'Map upload failed', { id: toastId })
      }
    }
  }

  const handleSaveMap = async (e) => {
    e.preventDefault()
    if (!mapForm.title.trim() || !mapForm.image) {
      toast.error('Map Title and Map Image are required!')
      return
    }

    const payload = {
      title: mapForm.title.trim(),
      image: mapForm.image,
      description: mapForm.description.trim(),
      linkedSpot: mapForm.linkedSpot.trim(),
      googleMapUrl: mapForm.googleMapUrl.trim(),
      isDefault: false
    }

    try {
      if (editingMapId) {
        const res = await fetch(buildApiUrl(`/api/map/maps/${editingMapId}`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        const result = await res.json()
        if (result.success && result.data) {
          const updatedDoc = result.data
          setMaps(prev => {
            const next = prev.map(m => m._id === editingMapId ? updatedDoc : m)
            try { localStorage.setItem('picnicutkal_admin_maps', JSON.stringify(next)) } catch (e) {}
            return next
          })
          toast.success('✅ Map updated successfully!')
        } else {
          toast.error(result.message || 'Failed to update map')
          return
        }
      } else {
        const res = await fetch(buildApiUrl('/api/map/maps'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        const result = await res.json()
        if (result.success && result.data) {
          const savedDoc = result.data
          setMaps(prev => {
            const next = [...prev, savedDoc]
            try { localStorage.setItem('picnicutkal_admin_maps', JSON.stringify(next)) } catch (e) {}
            return next
          })
          setSelectedMapId(savedDoc._id)
          try {
            localStorage.setItem('picnicutkal_admin_selected_map', savedDoc._id)
          } catch (e) {}
          toast.success('✅ New Map created & saved to database!')
        } else {
          toast.error(result.message || 'Failed to save map')
          return
        }
      }
      setShowMapModal(false)
    } catch (e) {
      toast.error('Error saving map: ' + e.message)
    }
  }

  const handleDeleteMap = async (mapId, title) => {
    if (maps.length <= 1) {
      toast.error('At least one Map must remain in system!')
      return
    }
    if (window.confirm(`Delete Map "${title}"?`)) {
      try {
        const res = await fetch(buildApiUrl(`/api/map/maps/${mapId}`), { method: 'DELETE' })
        const result = await res.json()
        if (result.success) {
          const remaining = maps.filter(m => m._id !== mapId)
          setMaps(remaining)
          const newActive = remaining[0]?._id
          if (newActive) {
            setSelectedMapId(newActive)
            try {
              localStorage.setItem('picnicutkal_admin_selected_map', newActive)
              localStorage.setItem('picnicutkal_admin_maps', JSON.stringify(remaining))
            } catch (e) {}
          }
          const remainingPlots = plots.filter(p => p.mapId !== mapId)
          saveAndSyncPlots(remainingPlots)
          toast.success('Map removed from database')
        } else {
          toast.error(result.message || 'Failed to delete map')
        }
      } catch (e) {
        toast.error('Error deleting map: ' + e.message)
      }
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleOpenAddMap}
            className="btn btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} /> Add New Map
          </button>
          <button
            id="admin-map-add-landmark-btn"
            className="btn btn-outline"
            onClick={handleOpenAddLandmark}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', borderColor: 'var(--gold)', color: 'var(--gold)', fontWeight: 600 }}
          >
            <MapPin size={16} /> Add Instruction / Landmark
          </button>
          <button
            id="admin-map-add-cottage-btn"
            className="btn btn-gold"
            onClick={handleOpenAddCottage}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #d4af37 0%, #aa7c11 100%)', color: '#000', fontWeight: 700 }}
          >
            <HouseIcon size={16} /> Add New Cottage
          </button>
          <button
            id="admin-map-add-btn"
            className="btn btn-primary"
            onClick={() => { setShowForm(true); setEditing(null); setForm({ ...BLANK_PLOT, mapId: selectedMapId || 'default-master-plan' }) }}
          >
            <Plus size={16} /> Add Plot / Zone
          </button>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="admin-map-grid">

        {/* ── Interactive Map Preview ── */}
        <div className="admin-map-canvas-wrap">
          {/* Header Bar with Map Selector Dropdown & Live Indicators */}
          <div className="admin-map-canvas-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Map size={16} style={{ color: 'var(--gold)' }} />
              <span style={{ fontWeight: 700 }}>Map Preview:</span>
              <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{currentMap?.title}</span>
              <span style={{ fontSize: '11px', background: 'rgba(201,168,76,0.15)', color: 'var(--gold)', padding: '2px 8px', borderRadius: '10px' }}>
                {activePlots.length} zone(s)
              </span>
            </div>

            {/* Map Selection Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Switch Map:</label>
              <select
                id="admin-map-select-dropdown"
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
                className="btn btn-outline btn-xs"
                title="Edit current map details"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <Edit3 size={13} /> Edit Map
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
            <img 
              src={resolveMapImage(currentMap?.image)} 
              alt={currentMap?.title || 'Master Plan'} 
              className="admin-map-preview-img" 
              onError={(e) => {
                e.target.onerror = null
                e.target.src = masterPlanImg
              }}
            />
            
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
                        <span>
                          {plot.isFree || plot.isLandmark || !plot.price || plot.price === 0 || plot.isGate || plot.isParking
                            ? 'Free / Landmark'
                            : `₹${plot.price?.toLocaleString()} / day`}
                        </span>
                        <span>·</span>
                        <span>{plot.area || '—'}</span>
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
                <h3>{editing ? 'Edit Spot / Cottage' : 'Add New Spot / Cottage'}</h3>
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

                  {/* Instruction / Landmark Quick Presets */}
                  <div style={{ background: 'rgba(201,168,76,0.08)', padding: '12px 14px', borderRadius: '8px', border: '1px dashed rgba(201,168,76,0.35)', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gold)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <MapPin size={14} /> Landmark & Instruction Presets:
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Non-bookable map reference point</span>
                    </div>

                    {/* Dedicated Input Field */}
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        Landmark / Instruction Name (e.g. Main Gate, River, Parking):
                      </label>
                      <input
                        id="admin-map-landmark-input"
                        type="text"
                        className="admin-map-input"
                        list="landmark-preset-options"
                        placeholder="Type or select instruction (e.g. Main Gate, River Shore, Parking Stand...)"
                        value={form.title ?? ''}
                        onChange={e => {
                          const val = e.target.value
                          setForm(f => ({
                            ...f,
                            title: val,
                            isFree: true,
                            isLandmark: true
                          }))
                        }}
                        style={{ width: '100%', fontSize: '13px', background: 'var(--bg-primary)' }}
                      />
                      <datalist id="landmark-preset-options">
                        <option value="Main Gate & Welcome Arch" />
                        <option value="River Shore / Waterfront" />
                        <option value="Visitor Parking Zone" />
                        <option value="Public Washrooms & RO Water" />
                        <option value="Swimming Pool Area" />
                        <option value="Security Cabin" />
                        <option value="Dining Hall / Cafeteria" />
                        <option value="Children Play Ground" />
                        <option value="Garden Walkway" />
                      </datalist>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div>
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '5px', fontWeight: 600 }}>
                        Or Click Quick Preset:
                      </span>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {[
                          { label: '🚪 Main Gate', title: 'Main Gate & Entry Arch', desc: 'Main security check-in entrance and welcome gate.', color: '#4A90E2', fac: 'Security, CCTV, Entry Signboard' },
                          { label: '🌊 River Waterfront', title: 'River Waterfront', desc: 'Scenic riverside promenade and boating deck.', color: '#00A896', fac: 'River View, Seating Deck, Safety Railing' },
                          { label: '🚗 Parking Area', title: 'Visitor Parking Zone', desc: 'Designated 2-wheeler and 4-wheeler vehicle parking area.', color: '#F39C12', fac: 'Spacious Parking, Guard on Duty, Shade' },
                          { label: '🚻 Restrooms', title: 'Restroom & Drinking Water', desc: 'Hygienic public washrooms and filtered drinking water station.', color: '#3498DB', fac: 'Washrooms, Filtered RO Water, Handwash' },
                          { label: '🏊 Swimming Pool', title: 'Resort Swimming Pool', desc: 'Freshwater swimming pool with sunbeds and shower area.', color: '#16A085', fac: 'Filtered Pool, Sunbeds, Showers, Lifeguard' }
                        ].map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className="btn btn-ghost btn-xs"
                            style={{ fontSize: '11px', background: 'rgba(255,255,255,0.06)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', cursor: 'pointer' }}
                            onClick={() => {
                              setForm(f => ({
                                ...f,
                                title: item.title,
                                description: item.desc,
                                facilities: item.fac,
                                color: item.color,
                                price: 0,
                                isFree: true,
                                isLandmark: true
                              }))
                              toast.success(`Applied preset: ${item.label}`)
                            }}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="admin-map-form-row">
                    <label>Title *</label>
                    <input
                      id="admin-map-form-title"
                      className="admin-map-input"
                      placeholder="e.g. Main Gate, River Point, Parking Stand, Biotech Park 1"
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
                      <label>Price (₹/day)</label>
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

      {/* ── Add / Edit Interactive Map Modal ── */}
      <AnimatePresence>
        {showMapModal && (
          <div className="admin-modal-overlay" style={{ zIndex: 1100 }}>
            <motion.div
              className="admin-confirm-modal card glass-card"
              style={{ maxWidth: '600px', width: '94%', maxHeight: '90vh', overflowY: 'auto', textAlign: 'left', padding: '24px' }}
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(201,168,76,0.15)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Map size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                      {editingMapId ? 'Edit Interactive Map' : 'Add New Interactive Map'}
                    </h3>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                      Configure layout, image, and navigation details for this picnic ground
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={() => setShowMapModal(false)}
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveMap} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Map Title */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Map Title <span style={{ color: 'var(--error)' }}>*</span>
                  </label>
                  <input
                    id="admin-map-modal-title"
                    type="text"
                    className="input"
                    placeholder="e.g. Simlipal Forest Map, Deras Ground Block B"
                    value={mapForm.title || ''}
                    onChange={e => setMapForm(f => ({ ...f, title: e.target.value }))}
                    required
                    style={{ width: '100%', fontSize: '13px' }}
                  />
                </div>

                {/* Linked Spot Location */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Linked Spot Name / Location <span style={{ color: 'var(--error)' }}>*</span>
                  </label>
                  <input
                    id="admin-map-modal-spot"
                    type="text"
                    className="input"
                    placeholder="e.g. Barapita Ground, Deras or Simlipal Reserve"
                    value={mapForm.linkedSpot || ''}
                    onChange={e => setMapForm(f => ({ ...f, linkedSpot: e.target.value }))}
                    required
                    style={{ width: '100%', fontSize: '13px' }}
                  />
                </div>

                {/* Google Maps URL */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Google Maps Navigation URL
                  </label>
                  <input
                    id="admin-map-modal-gmap"
                    type="url"
                    className="input"
                    placeholder="https://maps.google.com/?q=20.311450,85.690644"
                    value={mapForm.googleMapUrl || ''}
                    onChange={e => setMapForm(f => ({ ...f, googleMapUrl: e.target.value }))}
                    style={{ width: '100%', fontSize: '13px' }}
                  />
                </div>

                {/* Description */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Map Description
                  </label>
                  <textarea
                    id="admin-map-modal-desc"
                    className="input"
                    rows={2}
                    placeholder="Brief description of the resort grounds, key landmarks, or activity sectors..."
                    value={mapForm.description || ''}
                    onChange={e => setMapForm(f => ({ ...f, description: e.target.value }))}
                    style={{ width: '100%', fontSize: '13px', resize: 'vertical' }}
                  />
                </div>

                {/* Map Layout Image */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Map Layout Image (Landscape / Blueprint) <span style={{ color: 'var(--error)' }}>*</span>
                  </label>

                  {/* Input Type Toggle */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <button
                      type="button"
                      className={`btn btn-xs ${mapImgInputType === 'file' ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => setMapImgInputType('file')}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Upload size={12} /> Upload Image File
                    </button>
                    <button
                      type="button"
                      className={`btn btn-xs ${mapImgInputType === 'url' ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => setMapImgInputType('url')}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <LinkIcon size={12} /> Image Web URL
                    </button>
                  </div>

                  {mapImgInputType === 'file' ? (
                    <div>
                      <input
                        id="admin-map-modal-file"
                        type="file"
                        accept="image/*"
                        onChange={handleMapFileUpload}
                        className="input"
                        style={{ width: '100%', fontSize: '12px', padding: '6px' }}
                      />
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                        Supports JPG, PNG, WebP up to 20MB. Automatically optimized for fast loading.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <input
                        id="admin-map-modal-url"
                        type="url"
                        className="input"
                        placeholder="https://example.com/resort-map.jpg"
                        value={mapForm.image || ''}
                        onChange={e => setMapForm(f => ({ ...f, image: e.target.value }))}
                        style={{ width: '100%', fontSize: '13px' }}
                      />
                    </div>
                  )}

                  {/* Image Preview Box */}
                  {mapForm.image && (
                    <div style={{ marginTop: '10px', position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', maxHeight: '180px', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img
                        src={resolveMapImage(mapForm.image)}
                        alt="Map Preview"
                        style={{ maxWidth: '100%', maxHeight: '180px', objectFit: 'contain' }}
                        onError={e => { e.target.onerror = null; e.target.src = masterPlanImg }}
                      />
                      <button
                        type="button"
                        onClick={() => setMapForm(f => ({ ...f, image: '' }))}
                        style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(239,68,68,0.85)', color: '#fff', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        title="Remove Image"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Modal Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowMapModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    id="admin-map-save-map-btn"
                    type="submit"
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Save size={15} /> {editingMapId ? 'Update Map' : 'Create & Save Map'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
