import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LuMapPin as MapPin, LuX as X, LuZoomIn as ZoomIn, LuZoomOut as ZoomOut, LuMaximize2 as Maximize2, LuMinimize2 as Minimize2,
  LuNavigation as Navigation, LuExternalLink as ExternalLink, LuSearch as Search, LuFilter as Filter, LuRotateCcw as RotateCcw,
  LuCircleCheck as CheckCircle, LuClock as Clock, LuCircleAlert as AlertCircle, LuDroplets as Droplets,
  LuStar as Star, LuUsers as Users, LuRuler as Ruler, LuIndianRupee as IndianRupee, LuShare2 as Share2, LuMap as Map, LuImage as Image
} from 'react-icons/lu'
import masterPlanImg from '../assets/master-plan.png'
import { useSocket } from '../context/SocketContext'

/* ─── Static seed plots (Landscape % positions) ─── */
const DEFAULT_PLOTS = [
  {
    _id: 'main-gate',
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
    distanceFromCanal: '180 m',
    isGate: true
  },
  {
    _id: 'parking',
    title: 'Parking Zone',
    price: 0,
    area: '3200 sq ft',
    capacity: 80,
    description: 'Spacious secure parking with CCTV surveillance. Accommodates cars, buses and two-wheelers. Free parking for all visitors.',
    facilities: ['CCTV', 'Security Guard', 'Lighting', '24x7 Open', 'Free'],
    status: 'available',
    coordinates: { x: 62, y: 61, width: 32, height: 18 },
    color: '#6B7280',
    distanceFromGate: '40 m',
    distanceFromCanal: '160 m',
    isParking: true
  },
  {
    _id: 'pandal-1',
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
    _id: 'pandal-5',
    title: 'Pandal — Road Block',
    price: 449,
    area: '3000 sq ft',
    capacity: 100,
    description: 'Roadside pandal near the main pathway — convenient access and great for large gatherings.',
    facilities: ['Shade', 'Seating', 'Lighting', 'Road Access'],
    status: 'available',
    coordinates: { x: 27, y: 35, width: 10, height: 8 },
    color: '#52B788',
    distanceFromGate: '95 m',
    distanceFromCanal: '45 m'
  },
  {
    _id: 'pandal-6',
    title: 'Pandal — North East Block',
    price: 499,
    area: '3200 sq ft',
    capacity: 110,
    description: 'Premium north-east pandal with open views, near the parking zone — ideal for large events.',
    facilities: ['Shade', 'Seating', 'Electricity', 'Parking Access', 'Open View'],
    status: 'available',
    coordinates: { x: 83, y: 43, width: 11, height: 9 },
    color: '#52B788',
    distanceFromGate: '35 m',
    distanceFromCanal: '170 m'
  },
  {
    _id: 'stage-stair',
    title: 'Stage / Stair Area',
    price: 299,
    area: '1200 sq ft',
    capacity: 50,
    description: 'Elevated stage area with stairs — perfect for performances, ceremonies and photo backdrops.',
    facilities: ['Stage Lighting', 'Sound System', 'Backdrop', 'Steps'],
    status: 'available',
    coordinates: { x: 25, y: 44, width: 5, height: 4 },
    color: '#C9A84C',
    distanceFromGate: '100 m',
    distanceFromCanal: '50 m'
  },
  {
    _id: 'cottage-rooms',
    title: 'Cottage Rooms',
    price: 999,
    area: '4800 sq ft',
    capacity: 36,
    description: 'Comfortable cottage accommodation block with 3 room types — Standard (Cottage 1 ₹999/night), Deluxe (Cottage 2 ₹1499/night), and Premium Suite (Cottage 3 ₹1999/night). All rooms include AC, attached bath and scenic views.',
    facilities: ['AC Rooms', 'Attached Bath', 'Garden View', 'Canal View', 'Riverside View', 'TV', 'Kitchenette (Suite)'],
    status: 'available',
    coordinates: { x: 36, y: 5, width: 16, height: 18 },
    color: '#A07830',
    distanceFromGate: '140 m',
    distanceFromCanal: '15 m',
    isCottage: true,
    cottageRooms: [
      { name: 'Cottage 1', type: 'Standard', price: 999 },
      { name: 'Cottage 2', type: 'Deluxe', price: 1499 },
      { name: 'Cottage 3', type: 'Premium Suite', price: 1999 }
    ]
  }
]

/* ─── Route paths in Landscape coordinate space ─── */
const ROUTE_PATHS = {
  'main-gate':    [{ x: 58.5, y: 77.5 }],
  'parking':      [{ x: 58.5, y: 77.5 }, { x: 75, y: 70 }],
  'pandal-1':     [{ x: 58.5, y: 77.5 }, { x: 58.5, y: 46.5 }, { x: 55, y: 34 }],
  'pandal-2':     [{ x: 58.5, y: 77.5 }, { x: 58.5, y: 55 }, { x: 40, y: 53 }],
  'pandal-3':     [{ x: 58.5, y: 77.5 }, { x: 58.5, y: 55 }, { x: 35, y: 67 }],
  'pandal-4':     [{ x: 58.5, y: 77.5 }, { x: 74, y: 55 }],
  'pandal-5':     [{ x: 58.5, y: 77.5 }, { x: 58.5, y: 50.5 }, { x: 40, y: 44 }, { x: 32, y: 39 }],
  'pandal-6':     [{ x: 58.5, y: 77.5 }, { x: 75, y: 65 }, { x: 88, y: 52 }],
  'stage-stair':  [{ x: 58.5, y: 77.5 }, { x: 58.5, y: 50.5 }, { x: 31.5, y: 49.5 }, { x: 27.5, y: 46 }],
  'cottage-rooms':[{ x: 58.5, y: 77.5 }, { x: 58.5, y: 46.5 }, { x: 50, y: 28 }, { x: 44, y: 14 }],
}

const STATUS_CONFIG = {
  available:   { label: 'Available',   color: '#40C057', icon: CheckCircle },
  booked:      { label: 'Booked',      color: '#FA5252', icon: AlertCircle },
  maintenance: { label: 'Maintenance', color: '#FAB005', icon: Clock }
}

const DEFAULT_MAPS = [
  {
    _id: 'default-master-plan',
    title: 'Barapita Master Plan (Main Ground)',
    image: masterPlanImg,
    description: 'Central master plan containing Biotech parks, Riverside Pandals, and Main Gate.',
    spotId: '1',
    isDefault: true
  },
  {
    _id: 'chilika-map-02',
    title: 'Chilika Lake Sanctuary Map',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
    description: 'Waterfront camping pandals, boating docks, and island picnic spots.',
    spotId: '2',
    isDefault: false
  },
  {
    _id: 'simlipal-map-03',
    title: 'Simlipal Forest & Waterfall Map',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80',
    description: 'Deep forest camping zones, safari trails, and canopy watchtowers.',
    spotId: '3',
    isDefault: false
  }
]

function buildPathD(points, svgW, svgH) {
  if (!points || points.length < 2) return ''
  const pts = points.map(p => `${(p.x / 100) * svgW},${(p.y / 100) * svgH}`)
  return 'M ' + pts.join(' L ')
}

export default function MapPage() {
  const navigate = useNavigate()
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
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [zoom, setZoom] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [routeKey, setRouteKey] = useState(0)
  const [svgSize, setSvgSize] = useState({ w: 800, h: 450 })
  const [imgLoaded, setImgLoaded] = useState(false)

  const canvasOuterRef = useRef(null)
  const imgRef = useRef(null)
  const containerRef = useRef(null)

  const { socket } = useSocket()

  /* Real-time Socket.io listener for maps updates */
  useEffect(() => {
    if (!socket) return
    const handler = (data) => {
      if (data && Array.isArray(data.maps)) {
        setMaps(data.maps)
        try {
          localStorage.setItem('picnicutkal_admin_maps', JSON.stringify(data.maps))
        } catch (e) {}
      }
    }
    socket.on('map_config_update', handler)
    return () => socket.off('map_config_update', handler)
  }, [socket])

  const currentMap = maps.find(m => m._id === selectedMapId) || maps[0] || DEFAULT_MAPS[0]

  /* Fetch from API */
  useEffect(() => {
    fetch('/api/map/plots')
      .then(r => r.json())
      .then(d => { if (d.success && d.data.length > 0) setPlots(d.data) })
      .catch(() => {})
  }, [])

  /* Measure visual dimensions of landscape image for SVG scaling */
  useEffect(() => {
    const updateSize = () => {
      if (imgRef.current) {
        setSvgSize({
          w: imgRef.current.offsetWidth,
          h: imgRef.current.offsetHeight
        })
      }
    }
    updateSize()
    const ro = new ResizeObserver(updateSize)
    if (imgRef.current) ro.observe(imgRef.current)
    return () => ro.disconnect()
  }, [imgLoaded])

  const handlePlotClick = (plot) => { setSelected(plot); setRouteKey(k => k + 1) }
  const handleClose = () => setSelected(null)
  const handleZoomIn  = () => setZoom(z => Math.min(z + 0.15, 2.5))
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.15, 0.6))
  const handleReset   = () => { setZoom(1); setSelected(null) }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleShare = () => {
    navigator.clipboard?.writeText('https://maps.google.com/?q=20.311450,85.690644')
      .then(() => alert('Location copied to clipboard!'))
      .catch(() => {})
  }

  const isDefaultMapSelected = selectedMapId === 'default-master-plan' || selectedMapId === 'default-map'

  const visiblePlots = plots.filter(p => {
    const pMapId = p.mapId || 'default-master-plan'
    const matchMap = isDefaultMapSelected
      ? (pMapId === 'default-master-plan' || pMapId === 'default-map' || !p.mapId)
      : (pMapId === selectedMapId)
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || p.status === filterStatus
    return matchMap && matchSearch && matchStatus
  })

  const routePoints = selected ? (ROUTE_PATHS[selected._id] || ROUTE_PATHS['main-gate']) : []
  const routeD = buildPathD(routePoints, svgSize.w, svgSize.h)

  const StatusIcon  = selected ? STATUS_CONFIG[selected.status]?.icon  : null
  const statusColor = selected ? STATUS_CONFIG[selected.status]?.color : '#40C057'
  const statusLabel = selected ? STATUS_CONFIG[selected.status]?.label : ''

  return (
    <>
      <Helmet>
        <title>{currentMap?.title || 'Master Plan Map'} | PicnicUtkal</title>
        <meta name="description" content="Explore interactive resort & sanctuary master plans. Click any plot to view pricing, availability, and navigate to the location." />
      </Helmet>

      <div className="mp-page" ref={containerRef}>

        {/* ── Hero Header ── */}
        <div className="mp-header">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mp-header-content"
          >
            <div className="mp-header-badge">
              <MapPin size={14} />
              <span>{currentMap?.title || 'Barapita, Deras — Odisha'}</span>
            </div>
            <h1 className="mp-header-title">Interactive Resort &amp; Sanctuary Maps</h1>
            <p className="mp-header-sub">Click any zone to explore pricing, availability &amp; navigate</p>
          </motion.div>

          {/* Controls Bar */}
          <div className="mp-controls-bar">
            {/* Map Selection Dropdown */}
            <div className="mp-filter-wrap" style={{ borderRight: '1px solid var(--border)', paddingRight: '12px' }}>
              <Map size={14} style={{ color: 'var(--gold)' }} />
              <select
                id="mp-filter-map"
                className="mp-filter-select"
                value={selectedMapId}
                onChange={e => { setSelectedMapId(e.target.value); setSelected(null); }}
                style={{ fontWeight: 700, color: 'var(--gold)' }}
              >
                {maps.map(m => (
                  <option key={m._id} value={m._id}>{m.title}</option>
                ))}
              </select>
            </div>

            <div className="mp-search-wrap">
              <Search size={15} className="mp-search-icon" />
              <input
                id="mp-search"
                className="mp-search-input"
                placeholder="Search zones..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="mp-filter-wrap">
              <Filter size={14} />
              <select
                id="mp-filter-status"
                className="mp-filter-select"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value="all">All Zones</option>
                <option value="available">Available</option>
                <option value="booked">Booked</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div className="mp-zoom-btns">
              <button id="mp-zoom-in"    className="mp-ctrl-btn" onClick={handleZoomIn}      title="Zoom In"><ZoomIn size={16}/></button>
              <button id="mp-zoom-out"   className="mp-ctrl-btn" onClick={handleZoomOut}     title="Zoom Out"><ZoomOut size={16}/></button>
              <button id="mp-reset"      className="mp-ctrl-btn" onClick={handleReset}       title="Reset"><RotateCcw size={16}/></button>
              <button id="mp-fullscreen" className="mp-ctrl-btn" onClick={toggleFullscreen}  title="Fullscreen">
                {isFullscreen ? <Minimize2 size={16}/> : <Maximize2 size={16}/>}
              </button>
              <button id="mp-share"      className="mp-ctrl-btn" onClick={handleShare}       title="Share"><Share2 size={16}/></button>
            </div>
          </div>
        </div>

        {/* ── Full-Width Landscape Map ── */}
        <div className="mp-map-outer">
          <div className="mp-map-container" ref={canvasOuterRef}>
            <div
              className="mp-map-inner"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
                position: 'relative',
                width: '100%',
                height: '100%'
              }}
            >
              {/* Landscape Master Plan Image */}
              <img
                ref={imgRef}
                src={currentMap?.image || masterPlanImg}
                alt={currentMap?.title || 'Master Plan'}
                className="mp-map-image"
                onLoad={() => setImgLoaded(true)}
                draggable={false}
              />

                {/* SVG Route Overlay — scales dynamically with image width & height */}
                {imgLoaded && (
                  <svg
                    className="mp-route-svg"
                    width={svgSize.w}
                    height={svgSize.h}
                    viewBox={`0 0 ${svgSize.w} ${svgSize.h}`}
                  >
                    <defs>
                      <filter id="route-glow">
                        <feGaussianBlur stdDeviation="3" result="blur"/>
                        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                      </filter>
                    </defs>
                    <AnimatePresence>
                      {selected && routeD && (
                        <>
                          <motion.path
                            key={`shadow-${routeKey}`}
                            d={routeD}
                            fill="none"
                            stroke="rgba(201,168,76,0.3)"
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <motion.path
                            key={`route-${routeKey}`}
                            d={routeD}
                            fill="none"
                            stroke="#C9A84C"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeDasharray="12 8"
                            filter="url(#route-glow)"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1, strokeDashoffset: [0, -100] }}
                            transition={{
                              pathLength: { duration: 1.2, ease: 'easeInOut' },
                              opacity: { duration: 0.3 },
                              strokeDashoffset: { duration: 1.5, repeat: Infinity, ease: 'linear' }
                            }}
                          />
                          <motion.circle key={`dot-${routeKey}`} r="5" fill="#C9A84C" filter="url(#route-glow)">
                            <animateMotion dur="1.8s" repeatCount="indefinite" path={routeD} />
                          </motion.circle>
                          <motion.circle
                            cx={(routePoints[0]?.x / 100) * svgSize.w}
                            cy={(routePoints[0]?.y / 100) * svgSize.h}
                            r="8" fill="none" stroke="#C9A84C" strokeWidth="2"
                            initial={{ scale: 1, opacity: 1 }}
                            animate={{ scale: 2.5, opacity: 0 }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                          />
                        </>
                      )}
                    </AnimatePresence>
                  </svg>
                )}

                {/* Hotspot Overlays */}
                {imgLoaded && visiblePlots.map(plot => {
                  const isSelected = selected?._id === plot._id
                  const sColor = STATUS_CONFIG[plot.status]?.color || '#40C057'
                  const isPandal = plot._id?.startsWith('pandal')
                  return (
                    <motion.div
                      key={plot._id}
                      id={`plot-${plot._id}`}
                      className={`mp-hotspot ${isSelected ? 'mp-hotspot--selected' : ''}`}
                      style={{
                        left:   `${plot.coordinates.x}%`,
                        top:    `${plot.coordinates.y}%`,
                        width:  `${plot.coordinates.width}%`,
                        height: `${plot.coordinates.height}%`,
                        '--plot-color': plot.color || '#C9A84C',
                        '--status-color': sColor
                      }}
                      onClick={() => handlePlotClick(plot)}
                      whileHover={{ scale: 1.04 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <span className="mp-hotspot-label">
                        {isPandal && plot.price > 0 ? `₹${plot.price}/Pindi` : plot.title}
                      </span>
                      <span className="mp-hotspot-status-dot" style={{ background: sColor }} />
                    </motion.div>
                  )
                })}
              </div>

              {/* Loading Skeleton */}
              {!imgLoaded && (
                <div className="mp-map-loading-skeleton">
                  <div className="mp-skeleton-pulse" />
                  <p>Loading master plan…</p>
                </div>
              )}
            </div>

          {/* Legend */}
          <div className="mp-legend">
            {Object.entries(STATUS_CONFIG).map(([key, val]) => (
              <div key={key} className="mp-legend-item">
                <span className="mp-legend-dot" style={{ background: val.color }} />
                <span>{val.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Popup Card (Glassmorphism) — No backdrop blur ── */}
        <AnimatePresence>
          {selected && (
            <>
              {/* Transparent clickable overlay — no blur, no dark tint */}
              <motion.div
                className="mp-popup-backdrop mp-popup-backdrop--clear"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleClose}
              />
              <motion.div
                className="mp-popup-card"
                id="mp-popup-card"
                initial={{ opacity: 0, y: 40, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 40, scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              >
                <div className="mp-popup-header" style={{ '--popup-accent': selected.color || '#C9A84C' }}>
                  <div className="mp-popup-title-row">
                    <div className="mp-popup-icon-wrap">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <h2 className="mp-popup-title">{selected.title}</h2>
                      <div className="mp-popup-status" style={{ color: statusColor }}>
                        {StatusIcon && <StatusIcon size={12} />}
                        <span>{statusLabel}</span>
                      </div>
                    </div>
                  </div>
                  <button id="mp-close-popup" className="mp-popup-close" onClick={handleClose}>
                    <X size={18} />
                  </button>
                </div>

                <div className="mp-popup-body">
                  <div className="mp-popup-stats">
                    {!selected.isGate && !selected.isParking && !selected.isCottage && (
                      <div className="mp-popup-stat">
                        <IndianRupee size={14} />
                        <div>
                          <span className="mp-popup-stat-val">₹{selected.price?.toLocaleString()}</span>
                          <span className="mp-popup-stat-lbl">Flat / Pandal</span>
                        </div>
                      </div>
                    )}
                    {selected.isCottage && (
                      <div className="mp-popup-stat">
                        <IndianRupee size={14} />
                        <div>
                          <span className="mp-popup-stat-val">₹999 – ₹1,999</span>
                          <span className="mp-popup-stat-lbl">Per Night</span>
                        </div>
                      </div>
                    )}
                    {selected.isParking && (
                      <div className="mp-popup-stat">
                        <IndianRupee size={14} />
                        <div>
                          <span className="mp-popup-stat-val">Free</span>
                          <span className="mp-popup-stat-lbl">Parking</span>
                        </div>
                      </div>
                    )}
                    <div className="mp-popup-stat">
                      <Ruler size={14} />
                      <div>
                        <span className="mp-popup-stat-val">{selected.area}</span>
                        <span className="mp-popup-stat-lbl">Area</span>
                      </div>
                    </div>
                    <div className="mp-popup-stat">
                      <Users size={14} />
                      <div>
                        <span className="mp-popup-stat-val">{selected.capacity}</span>
                        <span className="mp-popup-stat-lbl">Capacity</span>
                      </div>
                    </div>
                    <div className="mp-popup-stat">
                      <Navigation size={14} />
                      <div>
                        <span className="mp-popup-stat-val">{selected.distanceFromGate || '—'}</span>
                        <span className="mp-popup-stat-lbl">From Gate</span>
                      </div>
                    </div>
                    <div className="mp-popup-stat">
                      <Droplets size={14} />
                      <div>
                        <span className="mp-popup-stat-val">{selected.distanceFromCanal || '—'}</span>
                        <span className="mp-popup-stat-lbl">From Canal</span>
                      </div>
                    </div>
                  </div>

                  {/* Photo Gallery Grid (Up to 10 Images) */}
                  {(selected.images?.length > 0 || selected.image) && (
                    <div style={{ marginBottom: '14px' }}>
                      <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gold)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Image size={13} /> Zone Photo Gallery ({(selected.images?.length > 0 ? selected.images : [selected.image]).length} / 10 Photos)
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                        {(selected.images?.length > 0 ? selected.images : [selected.image]).slice(0, 10).map((img, i) => (
                          <div key={i} style={{ width: '100%', paddingTop: '75%', position: 'relative', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                            <img src={img} alt={`Zone Photo ${i + 1}`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="mp-popup-desc">{selected.description}</p>

                  {/* Cottage room pricing table */}
                  {selected.isCottage && selected.cottageRooms?.length > 0 && (
                    <div className="mp-popup-cottage-rooms">
                      <h4 className="mp-popup-cottage-heading">
                        <IndianRupee size={13} /> Room Pricing
                      </h4>
                      <div className="mp-popup-cottage-list">
                        {selected.cottageRooms.map((room, i) => (
                          <div key={room.name} className={`mp-popup-cot-row ${i === 1 ? 'mp-popup-cot-row--featured' : ''}`}>
                            <div className="mp-popup-cot-info">
                              <span className="mp-popup-cot-name">{room.name}</span>
                              <span className="mp-popup-cot-type">{room.type}</span>
                            </div>
                            <div className="mp-popup-cot-price">
                              ₹{room.price.toLocaleString()}<span>/night</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selected.facilities?.length > 0 && (
                    <div className="mp-popup-facilities">
                      <h4>Facilities</h4>
                      <div className="mp-popup-fac-list">
                        {selected.facilities.map(f => (
                          <span key={f} className="mp-popup-fac-tag">
                            <CheckCircle size={11} />{f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mp-popup-coords">
                    <MapPin size={12} />
                    <span>20°18'41.2"N &nbsp;85°41'26.3"E</span>
                    <span className="mp-popup-coords-decimal">( 20.311450, 85.690644 )</span>
                  </div>

                  <div className="mp-popup-actions">
                    <a
                      id="mp-view-on-google-maps"
                      href="https://maps.google.com/?q=20.311450,85.690644"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mp-btn-maps"
                    >
                      <ExternalLink size={14} />
                      View on Google Maps
                    </a>
                    {!selected.isGate && !selected.isParking && (
                      <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                        <button
                          id={`mp-details-${selected._id}`}
                          className="mp-btn-book"
                          style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--cream)', border: '1px solid rgba(255,255,255,0.2)', flex: 1 }}
                          onClick={() => navigate(`/plots/${selected._id}`)}
                        >
                          Details
                        </button>
                        <button
                          id={`mp-book-${selected._id}`}
                          className={`mp-btn-book ${selected.status !== 'available' ? 'mp-btn-book--disabled' : ''}`}
                          disabled={selected.status !== 'available'}
                          style={{ flex: 1 }}
                          onClick={() => navigate(`/plots/${selected._id}?book=true`)}
                        >
                          <Star size={14} />
                          {selected.status === 'available' ? 'Book Now' : 'Not Available'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Cottage Rooms Pricing Section ── */}
        <motion.div
          className="mp-cottage-section"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
        >
          <div className="mp-cottage-header">
            <div className="mp-cottage-badge"><IndianRupee size={14} />Room Pricing</div>
            <h2 className="mp-cottage-title">Cottage Accommodation</h2>
            <p className="mp-cottage-sub">Choose from our cozy cottage rooms — perfect for overnight stays</p>
          </div>
          <div className="mp-cottage-grid">
            {[
              {
                id: 'cottage-1', name: 'Cottage 1', type: 'Standard Room',
                price: 999, perNight: true,
                features: ['2 Beds', 'AC', 'Attached Bath', 'Garden View'],
                color: '#52B788', icon: '🏡'
              },
              {
                id: 'cottage-2', name: 'Cottage 2', type: 'Deluxe Room',
                price: 1499, perNight: true,
                features: ['3 Beds', 'AC', 'Attached Bath', 'Canal View', 'TV'],
                color: '#C9A84C', icon: '🏘️', featured: true
              },
              {
                id: 'cottage-3', name: 'Cottage 3', type: 'Premium Suite',
                price: 1999, perNight: true,
                features: ['4 Beds', 'AC', 'Attached Bath', 'Riverside View', 'TV', 'Kitchenette'],
                color: '#A07830', icon: '🏠'
              }
            ].map(cottage => (
              <div key={cottage.id} className={`mp-cottage-card ${cottage.featured ? 'mp-cottage-card--featured' : ''}`}
                style={{ '--cot-color': cottage.color }}>
                {cottage.featured && <div className="mp-cottage-badge-top">Most Popular</div>}
                <div className="mp-cottage-card-icon">{cottage.icon}</div>
                <div className="mp-cottage-card-name">{cottage.name}</div>
                <div className="mp-cottage-card-type">{cottage.type}</div>
                <div className="mp-cottage-card-price">
                  <span className="mp-cottage-rupee">₹</span>
                  <span className="mp-cottage-amount">{cottage.price.toLocaleString()}</span>
                  <span className="mp-cottage-per">/night</span>
                </div>
                <ul className="mp-cottage-features">
                  {cottage.features.map(f => (
                    <li key={f}><CheckCircle size={11} />{f}</li>
                  ))}
                </ul>
                <button
                  className="mp-cottage-book-btn"
                  onClick={() => navigate('/plots/cottage-rooms')}
                >
                  <Star size={13} /> Book Room
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Bottom Info Card ── */}
        <motion.div
          className="mp-info-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="mp-info-card-inner">
            <div className="mp-info-left">
              <div className="mp-info-loc-badge"><MapPin size={16} /></div>
              <div>
                <h3 className="mp-info-name">Barapita Picnic Utkal</h3>
                <p className="mp-info-sub">Near Deras Dam · Beautiful Riverside Picnic Destination</p>
                <p className="mp-info-coords">📍 20.311450, 85.690644 &nbsp;|&nbsp; 20°18'41.2"N 85°41'26.3"E</p>
              </div>
            </div>
            <div className="mp-info-nearby">
              <h4>Nearby</h4>
              <div className="mp-info-nearby-list">
                {['Deras Dam', 'Canal', 'Parking', 'Club', 'Garden'].map(item => (
                  <span key={item} className="mp-info-nearby-tag">
                    <CheckCircle size={11} /> {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="mp-info-right">
              <a
                id="mp-open-google-maps"
                href="https://maps.google.com/?q=20.311450,85.690644"
                target="_blank"
                rel="noopener noreferrer"
                className="mp-btn-open-maps"
              >
                <Navigation size={16} />
                Open in Google Maps
              </a>
              <div className="mp-info-stats-row">
                <div className="mp-info-stat-item">
                  <span className="mp-info-stat-num">{plots.filter(p => p.status === 'available').length}</span>
                  <span>Available</span>
                </div>
                <div className="mp-info-stat-item">
                  <span className="mp-info-stat-num">{plots.length}</span>
                  <span>Total Zones</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </>
  )
}