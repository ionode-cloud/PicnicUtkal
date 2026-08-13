import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Link, useSearchParams } from 'react-router-dom'
import { LuSearch as Search, LuLayoutGrid as Grid, LuList as List, LuMapPin as MapPin, LuStar as Star, LuSlidersHorizontal as SlidersHorizontal, LuX as X, LuChevronDown as ChevronDown, LuLoader as Loader } from 'react-icons/lu'
import { useSocket } from '../context/SocketContext'

// Helper: normalize a plot from admin API into public spot shape
function normalizePlot(p) {
  const facilities = Array.isArray(p.facilities)
    ? p.facilities
    : typeof p.facilities === 'string'
      ? p.facilities.split(',').map(f => f.trim()).filter(Boolean)
      : []

  return {
    id: p._id || p.id,
    name: p.title || p.name || 'Unnamed Spot',
    location: p.location || (p.mapId === 'chilika-map-02' ? 'Chilika Lake, Puri' : p.mapId === 'simlipal-map-03' ? 'Simlipal Reserve, Mayurbhanj' : 'Barapita Picnic Ground'),
    district: p.district || 'Khordha',
    price: Number(p.price) || 499,
    rating: p.rating || 4.8,
    reviews: p.reviews || 0,
    image: (Array.isArray(p.images) && p.images[0]) ? p.images[0] : (p.image || ''),
    images: p.images || (p.image ? [p.image] : []),
    zones: facilities.length > 0 ? facilities : ['Shade', 'Seating'],
    capacity: Number(p.capacity) || 100,
    badge: p.badge || 'Map Zone',
    status: p.status || 'active',
    isBooked: Boolean(p.isBooked || p.status === 'booked'),
    mapId: p.mapId || 'default-master-plan',
    description: p.description || ''
  }
}

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600&q=80'

export default function Spots() {
  const [searchParams] = useSearchParams()
  const selectedMapId = searchParams.get('mapId')
  const peopleParam   = searchParams.get('people')

  const [spots, setSpots] = useState([])
  const [loading, setLoading] = useState(true)

  const [view, setView] = useState('grid')
  const [searchQ, setSearchQ] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState({ minPrice: 0, maxPrice: 2000, minRating: 0, zone: '' })
  const [sort, setSort] = useState('price-low')

  // Load spots from backend API (same source as admin Spots panel)
  const fetchSpots = () => {
    fetch('/api/map/plots')
      .then(r => r.json())
      .then(d => {
        if (d.success && Array.isArray(d.data) && d.data.length > 0) {
          setSpots(d.data.map(normalizePlot))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    setLoading(true)
    fetchSpots()
  }, [])

  // Real-time Socket.io listener for instant updates when admin edits spots
  const { socket } = useSocket()
  useEffect(() => {
    if (!socket) return
    const handleUpdate = () => fetchSpots()
    socket.on('plots_update', handleUpdate)
    socket.on('plot_updated', handleUpdate)
    socket.on('map_config_update', handleUpdate)
    return () => {
      socket.off('plots_update', handleUpdate)
      socket.off('plot_updated', handleUpdate)
      socket.off('map_config_update', handleUpdate)
    }
  }, [socket])

  // Collect unique zone tags across all spots for filter pills
  const allZoneTags = [...new Set(spots.flatMap(s => s.zones))].slice(0, 12)

  const filtered = spots
    .filter(s => {
      if (s.status === 'maintenance') return false

      // Map filter from URL parameters
      if (selectedMapId && selectedMapId !== 'all') {
        const isDefaultMap = selectedMapId === 'default-master-plan' || selectedMapId === 'default-map'
        const sMap = s.mapId || 'default-master-plan'
        if (isDefaultMap) {
          if (sMap !== 'default-master-plan' && sMap !== 'default-map') return false
        } else {
          if (sMap !== selectedMapId) return false
        }
      }

      // Guest count filter from URL parameters
      if (peopleParam && s.capacity && Number(s.capacity) < Number(peopleParam)) return false

      if (searchQ && !s.name.toLowerCase().includes(searchQ.toLowerCase()) && !s.location.toLowerCase().includes(searchQ.toLowerCase())) return false
      if (s.price < filters.minPrice || s.price > filters.maxPrice) return false
      if (s.rating < filters.minRating) return false
      if (filters.zone && !s.zones.map(z => z.toLowerCase()).includes(filters.zone.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      if (sort === 'rating') return b.rating - a.rating
      if (sort === 'price-low') return a.price - b.price
      if (sort === 'price-high') return b.price - a.price
      if (sort === 'reviews') return b.reviews - a.reviews
      return 0
    })

  return (
    <>
      <Helmet>
        <title>Picnic Spots in Odisha — PicnicUtkal</title>
        <meta name="description" content="Browse premium picnic spots across Odisha. Filter by location, price, zone type, and capacity. Book instantly." />
      </Helmet>

      {/* Page Header */}
      <div className="spots-header">
        <div className="spots-header__bg" />
        <div className="container-fluid spots-header__content">
          <motion.h1 className="heading-2" style={{ color: 'var(--cream)' }}
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            Discover Picnic Spots<br /><span className="text-gradient">Across Odisha</span>
          </motion.h1>
          <p style={{ color: 'rgba(245,240,232,0.8)', marginTop: 'var(--space-2)' }}>
            {loading ? 'Loading spots...' : `${filtered.length} spot${filtered.length !== 1 ? 's' : ''} found`}
          </p>
        </div>
      </div>

      <div className="spots-page container-fluid">
        {/* Controls */}
        <div className="spots-controls">
          <div className="spots-search-wrap">
            <Search size={18} className="spots-search-icon" />
            <input className="spots-search input" placeholder="Search spots by name or location..." value={searchQ}
              onChange={e => setSearchQ(e.target.value)} id="spots-search-input" />
            {searchQ && <button className="spots-search-clear" onClick={() => setSearchQ('')}><X size={16} /></button>}
          </div>
          <div className="spots-controls-right">
            <div className="spots-sort">
              <ChevronDown size={14} />
              <select value={sort} onChange={e => setSort(e.target.value)} id="spots-sort-select">
                <option value="price-low">Price: Low–High</option>
                <option value="price-high">Price: High–Low</option>
              </select>
            </div>
            <button className={`spots-filter-btn btn btn-outline btn-sm ${filterOpen ? 'active' : ''}`}
              onClick={() => setFilterOpen(!filterOpen)} id="spots-filter-btn">
              <SlidersHorizontal size={16} /> Filters
            </button>
            <div className="spots-view-btns">
              <button className={`spots-view-btn ${view === 'grid' ? 'active' : ''}`} onClick={() => setView('grid')} id="view-grid-btn"><Grid size={18} /></button>
              <button className={`spots-view-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')} id="view-list-btn"><List size={18} /></button>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {filterOpen && (
          <motion.div className="spots-filters" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="spots-filters-grid">
              {allZoneTags.length > 0 && (
                <div>
                  <label className="filter-label">Zone Type</label>
                  <div className="filter-pills">
                    {allZoneTags.map(z => (
                      <button key={z} className={`filter-pill ${filters.zone === z ? 'active' : ''}`}
                        onClick={() => setFilters(f => ({ ...f, zone: f.zone === z ? '' : z }))} id={`filter-zone-${z}`}>{z}</button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="filter-label">Min Rating: {filters.minRating}★</label>
                <input type="range" min={0} max={5} step={0.5} value={filters.minRating}
                  onChange={e => setFilters(f => ({ ...f, minRating: Number(e.target.value) }))} className="filter-range" />
              </div>
              <div>
                <label className="filter-label">Max Price: ₹{filters.maxPrice}/pandal</label>
                <input type="range" min={100} max={2000} step={50} value={filters.maxPrice}
                  onChange={e => setFilters(f => ({ ...f, maxPrice: Number(e.target.value) }))} className="filter-range" />
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setFilters({ minPrice: 0, maxPrice: 2000, minRating: 0, zone: '' })}>
              <X size={14} /> Clear All
            </button>
          </motion.div>
        )}

        {/* Results */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 0', flexDirection: 'column', gap: '16px' }}>
            <Loader size={36} color="var(--gold)" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading picnic spots...</p>
          </div>
        ) : (
          <div className={`spots-results ${view === 'list' ? 'spots-results--list' : 'spots-results--grid'}`}>
            {filtered.length === 0 ? (
              <div className="spots-empty">
                <p>No spots found. Try adjusting your filters.</p>
                <button className="btn btn-primary" onClick={() => { setSearchQ(''); setFilters({ minPrice: 0, maxPrice: 2000, minRating: 0, zone: '' }) }}>Clear Filters</button>
              </div>
            ) : filtered.map((spot, i) => (
              <motion.div key={spot.id} className={`spot-card ${view === 'list' ? 'spot-card--list' : ''}`}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06 }} whileHover={{ y: -4 }}>
                <div className="spot-card__image-wrap">
                  <img
                    src={spot.image || DEFAULT_IMAGE}
                    alt={spot.name}
                    className="spot-card__image"
                    loading="lazy"
                    onError={e => { e.target.src = DEFAULT_IMAGE }}
                  />
                  <div className="spot-card__image-overlay" />
                  {spot.isBooked || spot.status === 'booked' ? (
                    <span className="spot-card__badge badge" style={{ background: '#ef4444', color: '#ffffff', fontWeight: 800 }}>🔴 BOOKED</span>
                  ) : (
                    <span className="spot-card__badge badge badge-gold">{spot.badge}</span>
                  )}
                  <span className="spot-card__capacity badge badge-glass">👥 {spot.capacity} capacity</span>
                </div>
                <div className="spot-card__body">
                  <div className="spot-card__meta">
                    <span className="spot-card__location"><MapPin size={12} /> {spot.location}</span>
                  </div>
                  <h3 className="spot-card__name">{spot.name}</h3>
                  <div className="spot-card__zones">
                    {spot.zones.slice(0, 4).map(z => <span key={z} className="spot-card__zone-tag">{z}</span>)}
                  </div>
                  <div className="spot-card__footer">
                    <div className="spot-card__price">
                      <span className="spot-card__price-amount">₹{spot.price}</span>
                      <span className="spot-card__price-unit">{spot.id === 'cottage-rooms' ? '/night' : '/pandal'}</span>
                    </div>
                    <div className="spot-card__actions">
                      <Link to={`/plots/${spot.id}`} className="btn btn-outline btn-sm" id={`details-${spot.id}`}>Details</Link>
                      {spot.isBooked || spot.status === 'booked' ? (
                        <button disabled className="btn btn-sm" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.4)', cursor: 'not-allowed', fontWeight: 700 }}>
                          🔴 BOOKED
                        </button>
                      ) : (
                        <Link to={`/plots/${spot.id}?book=true`} className="btn btn-primary btn-sm" id={`book-${spot.id}`}>Book Now</Link>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}