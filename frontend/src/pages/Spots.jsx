import { useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { Search, Grid, List, MapPin, Star, SlidersHorizontal, X, ChevronDown } from 'lucide-react'

const SPOTS = [
  {
    id: 'pandal-1',
    name: 'Pandal — Upper Block',
    location: 'Barapita Picnic Ground',
    district: 'Khordha',
    price: 499,
    rating: 4.9,
    reviews: 142,
    image: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600&q=80',
    zones: ['Shade', 'Seating', 'Lighting', 'Riverside View'],
    capacity: 120,
    badge: 'Riverside View'
  },
  {
    id: 'pandal-5',
    name: 'Pandal — Road Block',
    location: 'Barapita Picnic Ground',
    district: 'Khordha',
    price: 449,
    rating: 4.7,
    reviews: 96,
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80',
    zones: ['Shade', 'Seating', 'Lighting', 'Road Access'],
    capacity: 100,
    badge: 'Road Access'
  },
  {
    id: 'cottage-rooms',
    name: 'Cottage Rooms',
    location: 'Barapita Picnic Ground',
    district: 'Khordha',
    price: 999,
    rating: 4.9,
    reviews: 180,
    image: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=600&q=80',
    zones: ['AC Rooms', 'Attached Bath', 'Garden View', 'Canal View'],
    capacity: 36,
    badge: 'Overnight Stay'
  },
  {
    id: 'pandal-6',
    name: 'Pandal — North East Block',
    location: 'Barapita Picnic Ground',
    district: 'Khordha',
    price: 499,
    rating: 4.8,
    reviews: 82,
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80',
    zones: ['Shade', 'Seating', 'Electricity', 'Open View'],
    capacity: 110,
    badge: 'Open View'
  },
  {
    id: 'pandal-2',
    name: 'Pandal — Center Block',
    location: 'Barapita Picnic Ground',
    district: 'Khordha',
    price: 499,
    rating: 4.6,
    reviews: 114,
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80',
    zones: ['Shade', 'Seating', 'Lighting', 'DJ Point'],
    capacity: 100,
    badge: 'Central Location'
  },
  {
    id: 'pandal-4',
    name: 'Pandal — East Block',
    location: 'Barapita Picnic Ground',
    district: 'Khordha',
    price: 449,
    rating: 4.8,
    reviews: 105,
    image: 'https://images.unsplash.com/photo-1533850595620-7b1711221751?w=600&q=80',
    zones: ['Shade', 'Seating', 'Parking Access', 'Electricity'],
    capacity: 95,
    badge: 'Parking Access'
  },
  {
    id: 'pandal-3',
    name: 'Pandal — West Block',
    location: 'Barapita Picnic Ground',
    district: 'Khordha',
    price: 399,
    rating: 4.7,
    reviews: 73,
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80',
    zones: ['Shade', 'Seating', 'BBQ Area', 'Garden View'],
    capacity: 90,
    badge: 'Garden View'
  }
]

const DISTRICTS = ['All', 'Khordha']
const ZONE_TYPES = ['Shade', 'Seating', 'Lighting', 'Riverside View', 'Road Access', 'AC Rooms', 'Attached Bath', 'Garden View', 'Canal View']

export default function Spots() {
  const [view, setView] = useState('grid')
  const [searchQ, setSearchQ] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState({ district: 'All', minPrice: 0, maxPrice: 1000, minRating: 0, zone: '', minCapacity: 0 })
  const [sort, setSort] = useState('rating')

  const filtered = SPOTS
    .filter(s => {
      if (searchQ && !s.name.toLowerCase().includes(searchQ.toLowerCase()) && !s.location.toLowerCase().includes(searchQ.toLowerCase())) return false
      if (filters.district !== 'All' && s.district !== filters.district) return false
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
        <meta name="description" content="Browse 50+ premium picnic spots across Odisha. Filter by location, price, zone type, and capacity. Book instantly." />
      </Helmet>

      {/* Page Header */}
      <div className="spots-header">
        <div className="spots-header__bg" />
        <div className="container spots-header__content">
          <motion.h1 className="heading-2" style={{ color: 'var(--cream)' }}
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            Discover Picnic Spots<br /><span className="text-gradient">Across Odisha</span>
          </motion.h1>
          <p style={{ color: 'rgba(245,240,232,0.8)', marginTop: 'var(--space-2)' }}>{filtered.length} spots found</p>
        </div>
      </div>

      <div className="spots-page container">
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
                <option value="rating">Top Rated</option>
                <option value="price-low">Price: Low–High</option>
                <option value="price-high">Price: High–Low</option>
                <option value="reviews">Most Reviewed</option>
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
              <div>
                <label className="filter-label">District</label>
                <div className="filter-pills">
                  {DISTRICTS.map(d => (
                    <button key={d} className={`filter-pill ${filters.district === d ? 'active' : ''}`}
                      onClick={() => setFilters(f => ({ ...f, district: d }))} id={`filter-district-${d}`}>{d}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="filter-label">Zone Type</label>
                <div className="filter-pills">
                  {ZONE_TYPES.map(z => (
                    <button key={z} className={`filter-pill ${filters.zone === z ? 'active' : ''}`}
                      onClick={() => setFilters(f => ({ ...f, zone: f.zone === z ? '' : z }))} id={`filter-zone-${z}`}>{z}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="filter-label">Min Rating: {filters.minRating}★</label>
                <input type="range" min={0} max={5} step={0.5} value={filters.minRating}
                  onChange={e => setFilters(f => ({ ...f, minRating: Number(e.target.value) }))} className="filter-range" />
              </div>
              <div>
                <label className="filter-label">Max Price: ₹{filters.maxPrice}/person</label>
                <input type="range" min={100} max={1000} step={50} value={filters.maxPrice}
                  onChange={e => setFilters(f => ({ ...f, maxPrice: Number(e.target.value) }))} className="filter-range" />
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setFilters({ district: 'All', minPrice: 0, maxPrice: 1000, minRating: 0, zone: '', minCapacity: 0 })}>
              <X size={14} /> Clear All
            </button>
          </motion.div>
        )}

        {/* Results */}
        <div className={`spots-results ${view === 'list' ? 'spots-results--list' : 'spots-results--grid'}`}>
          {filtered.length === 0 ? (
            <div className="spots-empty">
              <p>No spots found. Try adjusting your filters.</p>
              <button className="btn btn-primary" onClick={() => { setSearchQ(''); setFilters({ district: 'All', minPrice: 0, maxPrice: 1000, minRating: 0, zone: '', minCapacity: 0 }) }}>Clear Filters</button>
            </div>
          ) : filtered.map((spot, i) => (
            <motion.div key={spot.id} className={`spot-card ${view === 'list' ? 'spot-card--list' : ''}`}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.06 }} whileHover={{ y: -4 }}>
              <div className="spot-card__image-wrap">
                <img src={spot.image} alt={spot.name} className="spot-card__image" loading="lazy" />
                <div className="spot-card__image-overlay" />
                <span className="spot-card__badge badge badge-gold">{spot.badge}</span>
                <span className="spot-card__capacity badge badge-glass">👥 {spot.capacity} max</span>
              </div>
              <div className="spot-card__body">
                <div className="spot-card__meta">
                  <span className="spot-card__location"><MapPin size={12} /> {spot.location}, Odisha</span>
                  <div className="spot-card__rating">
                    <Star size={12} fill="var(--gold)" color="var(--gold)" />
                    {spot.rating} <span className="spot-card__reviews">({spot.reviews})</span>
                  </div>
                </div>
                <h3 className="spot-card__name">{spot.name}</h3>
                <div className="spot-card__zones">
                  {spot.zones.map(z => <span key={z} className="spot-card__zone-tag">{z}</span>)}
                </div>
                <div className="spot-card__footer">
                  <div className="spot-card__price">
                    <span className="spot-card__price-from">from</span>
                    <span className="spot-card__price-amount">₹{spot.price}</span>
                    <span className="spot-card__price-unit">{spot.id === 'cottage-rooms' ? '/night' : '/person'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <Link to={`/plots/${spot.id}`} className="btn btn-outline btn-sm">Details</Link>
                    <Link to={`/plots/${spot.id}`} className="btn btn-primary btn-sm" id={`book-${spot.id}`}>Book Now</Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  )
}