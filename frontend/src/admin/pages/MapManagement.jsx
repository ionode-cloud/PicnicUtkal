import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Map, Plus, Trash2, Edit3, Save, X, Eye, EyeOff,
  MapPin, Move, CheckCircle, AlertCircle, Clock,
  IndianRupee, Ruler, Users, Image, Tag, Star
} from 'lucide-react'
import toast from 'react-hot-toast'
import masterPlanImg from '../../assets/master-plan.png'

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
  distanceFromCanal: ''
}

const STATUS_CONFIG = {
  available:   { label: 'Available',   color: '#40C057' },
  booked:      { label: 'Booked',      color: '#FA5252' },
  maintenance: { label: 'Maintenance', color: '#FAB005' }
}

export default function AdminMapManagement() {
  const [plots, setPlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(BLANK_PLOT)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [previewPlot, setPreviewPlot] = useState(null)
  const [dragging, setDragging] = useState(null)
  const mapRef = useRef(null)

  const fetchPlots = async () => {
    try {
      const res = await fetch('/api/map/plots')
      const data = await res.json()
      if (data.success) setPlots(data.data)
    } catch {
      toast.error('Failed to load plots')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPlots() }, [])

  const handleSave = async () => {
    if (!form.title || !form.price) {
      toast.error('Title and Price are required')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        capacity: Number(form.capacity) || 0,
        priority: Number(form.priority) || 0,
        facilities: typeof form.facilities === 'string'
          ? form.facilities.split(',').map(f => f.trim()).filter(Boolean)
          : form.facilities
      }
      const url    = editing ? `/api/map/plots/${editing}` : '/api/map/plots'
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
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (plot) => {
    setForm({
      ...plot,
      facilities: Array.isArray(plot.facilities) ? plot.facilities.join(', ') : plot.facilities
    })
    setEditing(plot._id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/map/plots/${id}`, { method: 'DELETE' })
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

  return (
    <div className="admin-map-page">
      {/* ── Page Header ── */}
      <div className="admin-map-page-header">
        <div>
          <h1 className="admin-map-title">
            <Map size={22} /> Map Management
          </h1>
          <p className="admin-map-sub">Visually manage interactive zones on the master plan</p>
        </div>
        <button
          id="admin-map-add-btn"
          className="btn btn-primary"
          onClick={() => { setShowForm(true); setEditing(null); setForm(BLANK_PLOT) }}
        >
          <Plus size={16} /> Add Plot / Zone
        </button>
      </div>

      {/* ── Main Grid ── */}
      <div className="admin-map-grid">

        {/* ── Interactive Map Preview ── */}
        <div className="admin-map-canvas-wrap">
          <div className="admin-map-canvas-header">
            <span>Master Plan Preview</span>
            {showForm && (
              <span className="admin-map-click-hint">
                <MapPin size={12} /> Click on map to set position
              </span>
            )}
          </div>
          <div className="admin-map-canvas" ref={mapRef} onClick={handleMapClick}>
            <img src={masterPlanImg} alt="Master Plan" className="admin-map-preview-img" />
            {/* Existing Plots */}
            {plots.map(plot => {
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
                  onClick={e => { e.stopPropagation(); handleEdit(plot) }}
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

        {/* ── Plots Table ── */}
        <div className="admin-map-table-wrap">
          <div className="admin-map-table-header">
            <span>{plots.length} Zones Configured</span>
          </div>
          {loading ? (
            <div className="admin-map-loading">Loading plots…</div>
          ) : plots.length === 0 ? (
            <div className="admin-map-empty">No plots yet. Add your first zone above.</div>
          ) : (
            <div className="admin-map-table-list">
              {plots.map(plot => {
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
                        <span>₹{plot.price?.toLocaleString()}</span>
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
                        onClick={() => handleEdit(plot)}
                        title="Edit"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        className="admin-map-action-btn admin-map-action-btn--delete"
                        onClick={() => setDeleteConfirm(plot._id)}
                        title="Delete"
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

      {/* ── Add / Edit Form ── */}
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
                    <label>Title *</label>
                    <input
                      id="admin-map-form-title"
                      className="admin-map-input"
                      placeholder="e.g. Biotech Park 1"
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    />
                  </div>
                  <div className="admin-map-form-2col">
                    <div className="admin-map-form-row">
                      <label>Price (₹/person)</label>
                      <input
                        id="admin-map-form-price"
                        type="number"
                        className="admin-map-input"
                        placeholder="499"
                        value={form.price}
                        onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      />
                    </div>
                    <div className="admin-map-form-row">
                      <label>Area</label>
                      <input
                        id="admin-map-form-area"
                        className="admin-map-input"
                        placeholder="4500 sq ft"
                        value={form.area}
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
                        value={form.capacity}
                        onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))}
                      />
                    </div>
                    <div className="admin-map-form-row">
                      <label>Status</label>
                      <select
                        id="admin-map-form-status"
                        className="admin-map-input"
                        value={form.status}
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
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    />
                  </div>
                  <div className="admin-map-form-row">
                    <label>Facilities (comma separated)</label>
                    <input
                      id="admin-map-form-facilities"
                      className="admin-map-input"
                      placeholder="Parking, Water, Electricity, Garden"
                      value={form.facilities}
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
                      <input type="number" className="admin-map-input" value={form.coordinates.x}
                        onChange={e => updateCoord('x', e.target.value)} min="0" max="100" step="0.5" />
                    </div>
                    <div className="admin-map-form-row">
                      <label>Y (top %)</label>
                      <input type="number" className="admin-map-input" value={form.coordinates.y}
                        onChange={e => updateCoord('y', e.target.value)} min="0" max="100" step="0.5" />
                    </div>
                    <div className="admin-map-form-row">
                      <label>Width %</label>
                      <input type="number" className="admin-map-input" value={form.coordinates.width}
                        onChange={e => updateCoord('width', e.target.value)} min="2" max="60" step="0.5" />
                    </div>
                    <div className="admin-map-form-row">
                      <label>Height %</label>
                      <input type="number" className="admin-map-input" value={form.coordinates.height}
                        onChange={e => updateCoord('height', e.target.value)} min="2" max="60" step="0.5" />
                    </div>
                  </div>
                </div>

                {/* Distances & Visual */}
                <div className="admin-map-form-section">
                  <h4>Distances & Appearance</h4>
                  <div className="admin-map-form-2col">
                    <div className="admin-map-form-row">
                      <label>Distance from Gate</label>
                      <input className="admin-map-input" placeholder="80 m"
                        value={form.distanceFromGate}
                        onChange={e => setForm(f => ({ ...f, distanceFromGate: e.target.value }))} />
                    </div>
                    <div className="admin-map-form-row">
                      <label>Distance from Canal</label>
                      <input className="admin-map-input" placeholder="20 m"
                        value={form.distanceFromCanal}
                        onChange={e => setForm(f => ({ ...f, distanceFromCanal: e.target.value }))} />
                    </div>
                    <div className="admin-map-form-row">
                      <label>Color</label>
                      <div className="admin-map-color-row">
                        <input type="color" className="admin-map-color-input" value={form.color}
                          onChange={e => setForm(f => ({ ...f, color: e.target.value }))} />
                        <input className="admin-map-input" value={form.color}
                          onChange={e => setForm(f => ({ ...f, color: e.target.value }))} />
                      </div>
                    </div>
                    <div className="admin-map-form-row">
                      <label>Priority</label>
                      <input type="number" className="admin-map-input" placeholder="0" value={form.priority}
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
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving…' : <><Save size={15} /> {editing ? 'Update Plot' : 'Save Plot'}</>}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Delete Confirm Modal ── */}
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
                <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>
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
