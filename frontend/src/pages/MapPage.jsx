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
import { buildApiUrl } from '../services/api'



const STATUS_CONFIG = {
  available:   { label: 'Picnic Spot', color: '#52B788', icon: CheckCircle },
  booked:      { label: 'Picnic Spot', color: '#52B788', icon: CheckCircle },
  maintenance: { label: 'Maintenance', color: '#FAB005', icon: Clock }
}

import SpotAvailabilityCalendar from '../components/ui/SpotAvailabilityCalendar'

function buildPathD(points, svgW, svgH) {
  if (!points || points.length < 2) return ''
  const pts = points.map(p => `${(p.x / 100) * svgW},${(p.y / 100) * svgH}`)
  return 'M ' + pts.join(' L ')
}

export default function MapPage() {
  const navigate = useNavigate()
  const [mapVisitDate, setMapVisitDate] = useState('')
  const [maps, setMaps] = useState(() => {
    try {
      const saved = localStorage.getItem('picnicutkal_admin_maps')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (e) {}
    return []
  })
  const [selectedMapId, setSelectedMapId] = useState(() => maps[0]?._id || '')
  const [plots, setPlots] = useState([])
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

  const fetchMapPlots = () => {
    fetch(buildApiUrl('/api/map/maps'))
      .then(r => r.json())
      .then(d => { if (d.success && Array.isArray(d.data) && d.data.length > 0) setMaps(d.data) })
      .catch(() => {})

    fetch(buildApiUrl('/api/map/plots'))
      .then(r => r.json())
      .then(d => { if (d.success && Array.isArray(d.data)) setPlots(d.data) })
      .catch(() => {})
  }

  /* Real-time Socket.io listener for maps and plot updates */
  useEffect(() => {
    fetchMapPlots()
  }, [selectedMapId])

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
    const handlePlotUpdate = (data) => {
      fetchMapPlots()
      if (data?.plotId) {
        setPlots(prev => prev.map(p => (p._id === data.plotId || p.id === data.plotId) ? { ...p, status: 'booked', isBooked: true } : p))
      }
    }
    socket.on('map_config_update', handler)
    socket.on('plot_updated', handlePlotUpdate)
    socket.on('plots_update', fetchMapPlots)
    return () => {
      socket.off('map_config_update', handler)
      socket.off('plot_updated', handlePlotUpdate)
      socket.off('plots_update', fetchMapPlots)
    }
  }, [socket])

  const currentMap = maps.find(m => m._id === selectedMapId) || maps[0] || null

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
    return matchMap && matchSearch
  })

  const routePoints = selected ? (
    selected.routePath || [
      { x: 58.5, y: 77.5 },
      { x: (selected.coordinates?.x || 50) + (selected.coordinates?.width || 0) / 2, y: (selected.coordinates?.y || 50) + (selected.coordinates?.height || 0) / 2 }
    ]
  ) : []
  const routeD = buildPathD(routePoints, svgSize.w, svgSize.h)

  const StatusIcon  = CheckCircle
  const statusColor = '#52B788'
  const statusLabel = 'Picnic Spot'

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
              <span>{currentMap?.linkedSpot || currentMap?.title || 'Barapita, Deras — Odisha'}</span>
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
            <a
              id="mp-open-google-maps"
              href={currentMap?.googleMapUrl || 'https://maps.google.com/?q=20.311450,85.690644'}
              target="_blank"
              rel="noopener noreferrer"
              className="mp-btn-open-maps"
              style={{ padding: '7px 16px', fontSize: '13px', whiteSpace: 'nowrap' }}
            >
              <Navigation size={14} />
              Open in Google Maps
            </a>
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

                  {/* Spot Date-wise Availability Calendar */}
                  {!selected.isGate && !selected.isParking && (
                    <div style={{ marginTop: '12px' }}>
                      <SpotAvailabilityCalendar
                        spotId={selected._id || selected.id}
                        selectedDate={mapVisitDate}
                        onSelectDate={(d) => setMapVisitDate(d)}
                        title={`Availability Calendar — ${selected.title}`}
                      />
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
                          className="mp-btn-book"
                          style={{ flex: 1 }}
                          onClick={() => navigate(`/plots/${selected._id}?book=true`, { state: { initialDate: mapVisitDate } })}
                        >
                          <Star size={14} />
                          {mapVisitDate ? `Book for ${mapVisitDate}` : 'Book Now'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>



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
                <h3 className="mp-info-name">{currentMap?.title || 'Barapita Picnic Utkal'}</h3>
                <p className="mp-info-sub">{currentMap?.linkedSpot ? `📍 Spot: ${currentMap.linkedSpot}` : (currentMap?.description || 'Near Deras Dam · Beautiful Riverside Picnic Destination')}</p>
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