import { useRef, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import {
  LuSearch as Search, LuMapPin as MapPin, LuCalendar as Calendar, LuUsers as Users, LuStar as Star, LuArrowRight as ArrowRight,
  LuWaves as Waves, LuFlame as Flame, LuMusic as Music, LuTent as Tent, LuTarget as Target, LuTrees as Trees, LuCamera as Camera,
  LuChevronDown as ChevronDown, LuShield as Shield, LuClock as Clock, LuAward as Award, LuTrendingUp as TrendingUp
} from 'react-icons/lu'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, EffectFade } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'
import { useSocket } from '../context/SocketContext'
import { buildApiUrl } from '../services/api'

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=85',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=85',
  'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=1920&q=85',
  'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1920&q=85',
]

const POPULAR_ZONES = [
  { icon: Waves,  label: 'Swimming Zone', count: '12 spots', color: '#228BE6', href: '/spots?zone=swimming' },
  { icon: Flame,  label: 'BBQ Zone',      count: '18 spots', color: '#FA5252', href: '/spots?zone=cooking'  },
  { icon: Music,  label: 'Music Zone',    count: '8 spots',  color: '#BE4BDB', href: '/spots?zone=music'    },
  { icon: Tent,   label: 'Camping Zone',  count: '15 spots', color: '#F76707', href: '/spots?zone=camping'  },
  { icon: Target, label: 'Adventure',     count: '10 spots', color: '#E8590C', href: '/spots?zone=adventure'},
  { icon: Trees,  label: 'Family Zone',   count: '22 spots', color: '#2F9E44', href: '/spots?zone=family'   },
  { icon: Camera, label: 'Photo Zone',    count: '9 spots',  color: '#C9A84C', href: '/spots?zone=photo'    },
]

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600&q=80'

function normalizePlot(p) {
  const facilities = Array.isArray(p.facilities)
    ? p.facilities
    : typeof p.facilities === 'string'
      ? p.facilities.split(',').map(f => f.trim()).filter(Boolean)
      : []
  return {
    id: p._id || p.id,
    name: p.title || p.name || 'Unnamed Spot',
    location: p.location || (p.mapId === 'chilika-map-02' ? 'Chilika Lake Sanctuary, Puri' : (p.mapId === 'simlipal-map-03' ? 'Simlipal Reserve, Mayurbhanj' : 'Barapita Picnic Ground, Odisha')),
    price: Number(p.price) || 499,
    rating: p.rating || 4.8,
    reviews: p.reviews || 0,
    image: (Array.isArray(p.images) && p.images[0]) ? p.images[0] : (p.image || FALLBACK_IMG),
    zones: facilities.length > 0 ? facilities.slice(0, 4) : ['Shade', 'Seating'],
    capacity: Number(p.capacity) || 100,
    badge: p.badge || 'Map Zone',
    mapId: p.mapId || 'default-master-plan'
  }
}

const TESTIMONIALS = [
  {
    name: 'Priya Mohanty', location: 'Bhubaneswar', rating: 5,
    comment: 'Amazing experience at Nandankanan! The booking was super smooth, got a QR ticket instantly. The swimming zone was clean and well-maintained. Highly recommend PicnicUtkal!',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    spot: 'Nandankanan Sanctuary',
  },
  {
    name: 'Rajesh Kumar', location: 'Cuttack', rating: 5,
    comment: 'We booked the BBQ zone for our family reunion. The food pre-order feature is genius — everything was ready when we arrived! Will definitely book again.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh',
    spot: 'Chilika Lake Resort',
  },
  {
    name: 'Sunita Dash', location: 'Puri', rating: 5,
    comment: 'Daringbadi camping was a dream! PicnicUtkal made it so easy to book tents, arrange a bonfire, and get a guide. The landscape was absolutely gorgeous.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sunita',
    spot: 'Daringbadi Hill Station',
  },
]


const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] } }),
}
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

function SpotCard({ spot, index }) {
  const navigate = useNavigate()
  return (
    <motion.div
      className="spot-card"
      custom={index}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      whileHover={{ y: -8 }}
    >
      <div className="spot-card__image-wrap">
        <img
          src={spot.image || FALLBACK_IMG}
          alt={spot.name}
          className="spot-card__image"
          loading="lazy"
          onError={e => { e.target.src = FALLBACK_IMG }}
        />
        <div className="spot-card__image-overlay" />
        <span className="spot-card__badge badge badge-gold">{spot.badge}</span>
        <span className="spot-card__capacity badge badge-glass">👥 {spot.capacity} capacity</span>
      </div>
      <div className="spot-card__body">
        <div className="spot-card__meta">
          <span className="spot-card__location"><MapPin size={13} /> {spot.location}</span>
        </div>
        <h3 className="spot-card__name">{spot.name}</h3>
        <div className="spot-card__zones">
          {spot.zones.map(z => (
            <span key={z} className="spot-card__zone-tag">{z}</span>
          ))}
        </div>
        <div className="spot-card__footer">
          <div className="spot-card__price">
            <span className="spot-card__price-amount">₹{spot.price}</span>
            <span className="spot-card__price-unit">{spot.id === 'cottage-rooms' ? '/night' : '/pandal'}</span>
          </div>
          <div className="spot-card__actions">
            <button
              className="btn btn-outline btn-sm"
              onClick={() => navigate(`/plots/${spot.id}`)}
              id={`details-spot-${spot.id}`}
            >
              Details
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate(`/plots/${spot.id}?book=true`)}
              id={`book-spot-${spot.id}`}
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function Home() {
  const heroRef = useRef(null)
  const { scrollY } = useScroll()
  const heroParallax = useTransform(scrollY, [0, 600], [0, 200])

  const [searchData, setSearchData] = useState({ location: '', date: '', people: '' })
  const navigate = useNavigate()

  // Load User View config from Admin Panel (localStorage)
  const getStoredHomeConfig = () => {
    try {
      const saved = localStorage.getItem('picnicutkal_user_view_config')
      if (saved) {
        const parsed = JSON.parse(saved)
        return parsed.home || {}
      }
    } catch (e) {}
    return {}
  }

  const [homeConfig, setHomeConfig] = useState(getStoredHomeConfig)

  // Socket.io: live-reload when admin saves Home page content
  const { socket } = useSocket()
  useEffect(() => {
    if (!socket) return
    const handler = (data) => {
      if (data && data.config) {
        setHomeConfig(data.config)
        // Also persist to localStorage so refreshes keep changes
        try {
          const saved = localStorage.getItem('picnicutkal_user_view_config')
          const parsed = saved ? JSON.parse(saved) : {}
          localStorage.setItem('picnicutkal_user_view_config', JSON.stringify({ ...parsed, home: data.config }))
        } catch (e) {}
      }
    }
    socket.on('home_config_update', handler)
    return () => socket.off('home_config_update', handler)
  }, [socket])

  const [maps, setMaps] = useState(() => {
    try {
      const saved = localStorage.getItem('picnicutkal_admin_maps')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (e) {}
    return [
      { _id: 'default-master-plan', title: 'Barapita Master Plan (Main Ground)', linkedSpot: 'Barapita Ground, Deras' },
      { _id: 'chilika-map-02', title: 'Chilika Lake Sanctuary Map', linkedSpot: 'Chilika Lake Sanctuary, Puri' },
      { _id: 'simlipal-map-03', title: 'Simlipal Forest & Waterfall Map', linkedSpot: 'Simlipal Forest Reserve, Mayurbhanj' }
    ]
  })

  // Listen to Socket.io for live maps update
  useEffect(() => {
    if (!socket) return
    const mapHandler = (data) => {
      if (data && Array.isArray(data.maps)) {
        setMaps(data.maps)
      }
    }
    socket.on('map_config_update', mapHandler)
    return () => socket.off('map_config_update', mapHandler)
  }, [socket])

  const [isSearched, setIsSearched] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    setIsSearched(true)
    const params = new URLSearchParams()
    if (searchData.location) params.set('mapId', searchData.location)
    if (searchData.date) params.set('date', searchData.date)
    if (searchData.people) params.set('people', searchData.people)
    navigate(`/spots?${params.toString()}`)
  }

  // Load featured spots from backend (same source as admin Spots panel)
  const [featuredSpots, setFeaturedSpots] = useState([])
  const fetchFeatured = () => {
    fetch(buildApiUrl('/api/map/plots'))
      .then(r => r.json())
      .then(d => {
        if (d.success && Array.isArray(d.data) && d.data.length > 0) {
          setFeaturedSpots(d.data.map(normalizePlot))
        }
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchFeatured()
  }, [])

  // Listen for live real-time spot updates via Socket.io
  useEffect(() => {
    if (!socket) return
    const handleUpdate = () => fetchFeatured()
    socket.on('plots_update', handleUpdate)
    socket.on('plot_updated', handleUpdate)
    return () => {
      socket.off('plots_update', handleUpdate)
      socket.off('plot_updated', handleUpdate)
    }
  }, [socket])

  // Filter spots based on location map dropdown and guest count
  const displayedSpots = featuredSpots.filter(spot => {
    if (searchData.location) {
      const isDefaultSel = searchData.location === 'default-master-plan' || searchData.location === 'default-map'
      const spotMap = spot.mapId || 'default-master-plan'
      if (isDefaultSel) {
        if (spotMap !== 'default-master-plan' && spotMap !== 'default-map') return false
      } else {
        const selectedMap = maps.find(m => m._id === searchData.location)
        const matchesMapId = spotMap === searchData.location
        const matchesTitle = selectedMap && spot.location?.toLowerCase().includes(selectedMap.title?.toLowerCase())
        const matchesLinked = selectedMap && selectedMap.linkedSpot && spot.location?.toLowerCase().includes(selectedMap.linkedSpot?.toLowerCase())
        if (!matchesMapId && !matchesTitle && !matchesLinked) return false
      }
    }
    if (searchData.people) {
      const minGuests = Number(searchData.people)
      if (spot.capacity && Number(spot.capacity) < minGuests) return false
    }
    return true
  })

  return (
    <>
      <Helmet>
        <title>PicnicUtkal — Odisha's Premier Picnic Destination</title>
        <meta name="description" content="Discover and book premium picnic zones in Odisha. Swimming, camping, BBQ, adventure & more. Easy online booking with instant QR confirmation." />
        <meta property="og:title" content="PicnicUtkal — Odisha's Premier Picnic Destination" />
        <meta property="og:description" content="Book your perfect picnic zone in Odisha's most beautiful natural spots." />
      </Helmet>

      {/* HERO */}
      <section className="hero" ref={heroRef}>
        <motion.div className="hero__bg" style={{ y: heroParallax }}>
          <Swiper
            modules={[Autoplay, Pagination, EffectFade]}
            effect="fade"
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            loop
            className="hero__swiper"
          >
            {(homeConfig.heroImages && homeConfig.heroImages.length > 0 ? homeConfig.heroImages : HERO_IMAGES).map((img, i) => (
              <SwiperSlide key={i}>
                <div className="hero__slide" style={{ backgroundImage: `url(${img})` }} />
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="hero-overlay" />
        </motion.div>

        <div className="hero__content container-fluid">
          <motion.span
            className="hero__eyebrow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {homeConfig.eyebrowText || "🌿 Welcome to Odisha's Nature Paradise"}
          </motion.span>

          <motion.h1
            className="hero__title heading-hero"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {homeConfig.heroTitleLine1 || "Find Your Perfect"}<br />
            <span className="text-gradient">{homeConfig.heroTitleLine2 || "Picnic Escape"}</span><br />
            {homeConfig.heroTitleLine3 || "in Odisha"}
          </motion.h1>

          <motion.p
            className="hero__subtitle"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {homeConfig.heroSubtitle || "Discover 50+ premium picnic zones with swimming, BBQ, camping, adventure & more. Book instantly and arrive to a perfectly arranged picnic."}
          </motion.p>

          {/* Search Box */}
          <motion.div
            className="hero__search glass"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <form onSubmit={handleSearch} className="hero__search-form">
              <div className="hero__search-field">
                <label htmlFor="search-location"><MapPin size={16} className="hero__search-icon" />Location</label>
                <select
                  id="search-location"
                  className="hero__search-select"
                  value={searchData.location}
                  onChange={e => setSearchData(d => ({ ...d, location: e.target.value }))}
                >
                  <option value="">All Locations</option>
                  {maps.map(m => (
                    <option key={m._id} value={m._id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="hero__search-divider" />
              <div className="hero__search-field">
                <label htmlFor="search-date"><Calendar size={16} className="hero__search-icon" />Date</label>
                <input
                  id="search-date"
                  type="date"
                  value={searchData.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setSearchData(d => ({ ...d, date: e.target.value }))}
                />
              </div>
              <button type="submit" className="btn btn-gold btn-lg hero__search-btn" id="hero-search-btn">
                <Search size={18} />
                Search
              </button>
            </form>
          </motion.div>

        </div>

        {/* Scroll Cue */}
        <motion.div
          className="hero__scroll-cue"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
        >
          <ChevronDown size={24} />
        </motion.div>
      </section>

      {/* POPULAR ZONES */}
      <section className="section section-sm zones-section">
        <div className="container-fluid">
          <div className="section-header">
            <span className="section-eyebrow">{homeConfig.zonesEyebrow || "Explore Zones"}</span>
            <h2 className="section-title">{homeConfig.zonesTitle || "Choose Your Perfect Zone"}</h2>
            <p className="section-subtitle">{homeConfig.zonesSubtitle || "From peaceful family gardens to thrilling adventure zones — we have it all."}</p>
          </div>
          <motion.div
            className="zones-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            {POPULAR_ZONES.map((zone, i) => (
              <motion.a
                key={zone.label}
                href={zone.href}
                className="zone-pill"
                custom={i}
                variants={fadeUp}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.98 }}
                id={`zone-${zone.label.toLowerCase().replace(/\s+/g,'-')}`}
              >
                <div className="zone-pill__icon" style={{ background: `${zone.color}18`, color: zone.color }}>
                  <zone.icon size={24} />
                </div>
                <div>
                  <div className="zone-pill__label">{zone.label}</div>
                  <div className="zone-pill__count">{zone.count}</div>
                </div>
              </motion.a>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FEATURED SPOTS */}
      <section className="section spots-section" id="featured-spots-section">
        <div className="container-fluid">
          <div className="section-header">
            <span className="section-eyebrow">{homeConfig.spotsEyebrow || "Top Destinations"}</span>
            <h2 className="section-title">{homeConfig.spotsTitle || "Featured Picnic Spots"}</h2>
            <p className="section-subtitle">
              {isSearched && searchData.location
                ? `Showing spots for "${maps.find(m => m._id === searchData.location)?.title || 'Selected Location'}" (${displayedSpots.length} found)`
                : (homeConfig.spotsSubtitle || "Handpicked premium picnic destinations across Odisha's most beautiful landscapes.")}
            </p>
          </div>
          <motion.div
            className="spots-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            {displayedSpots.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>No picnic spots found matching your search criteria.</p>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => { setSearchData({ location: '', date: '', people: '' }); setIsSearched(false); }}
                >
                  Clear Search Filters
                </button>
              </div>
            ) : (
              displayedSpots.slice(0, 8).map((spot, i) => (
                <SpotCard key={spot.id} spot={spot} index={i} />
              ))
            )}
          </motion.div>
          <div style={{ textAlign: 'center', marginTop: 'var(--space-10)' }}>
            <Link to={`/map${searchData.location ? `?mapId=${searchData.location}` : ''}`} className="btn btn-primary btn-lg" id="view-all-spots-btn">
              View All on Map <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>


      {/* WHY CHOOSE US */}
      <section className="section why-section">
        <div className="container-fluid">
          <div className="why-inner">
            <div className="why-text">
              <span className="section-eyebrow">{homeConfig.whyEyebrow || "Why PicnicUtkal?"}</span>
              <h2 className="section-title" style={{ textAlign: 'left', maxWidth: '480px' }}>
                {homeConfig.whyTitleLine1 || "The Smartest Way to"}<br />
                <span className="text-gradient-green">{homeConfig.whyTitleLine2 || "Plan a Picnic"}</span>
              </h2>
              <p className="section-subtitle" style={{ textAlign: 'left' }}>
                {homeConfig.whySubtitle || "We handle everything — from booking your zone to arranging food, decorations, and parking. Just show up and enjoy."}
              </p>
              <div className="why-features">
                {(homeConfig.whyFeatures || [
                  { label: 'Secure Payments', desc: 'Razorpay secured. UPI, cards & more.' },
                  { label: 'Instant Confirmation', desc: 'QR ticket in seconds on email & SMS.' },
                  { label: 'Premium Spots', desc: 'Handpicked, verified, top-rated spots.' },
                  { label: 'Best Price Guarantee', desc: 'No hidden fees. What you see is final.' },
                ]).map((f, idx) => {
                  const icons = [Shield, Clock, Award, TrendingUp]
                  const IconComp = icons[idx % icons.length]
                  return (
                    <div key={f.label || idx} className="why-feature">
                      <div className="why-feature__icon">
                        <IconComp size={20} />
                      </div>
                      <div>
                        <div className="why-feature__label">{f.label}</div>
                        <div className="why-feature__desc">{f.desc}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <Link to="/about" className="btn btn-primary btn-lg" id="learn-more-btn">
                Learn More <ArrowRight size={18} />
              </Link>
            </div>
            <div className="why-visual">
              <div className="why-img-stack">
                <img
                  src={homeConfig.whyImgMain || "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=500&q=80"}
                  alt="Happy family picnic"
                  className="why-img why-img--main"
                />
                <img
                  src={homeConfig.whyImgSecondary || "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=300&q=80"}
                  alt="Picnic zone"
                  className="why-img why-img--secondary"
                  style={{ border: '4px solid var(--cream)' }}
                />
                <div className="why-badge glass-dark">
                  <Star size={16} fill="var(--gold)" color="var(--gold)" />
                  <span>{homeConfig.whyBadgeText || "4.9 · 15,000+ Reviews"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* GALLERY PREVIEW */}
      <section className="section-sm gallery-preview-section">
        <div className="container-fluid">
          <div className="section-header">
            <span className="section-eyebrow">{homeConfig.galleryPreviewEyebrow || "Our Gallery"}</span>
            <h2 className="section-title">{homeConfig.galleryPreviewTitle || "Moments of Pure Joy"}</h2>
          </div>
          <div className="gallery-preview-grid">
            {(homeConfig.galleryPreviewImages && homeConfig.galleryPreviewImages.length > 0
              ? homeConfig.galleryPreviewImages
              : [
                  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80',
                  'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&q=80',
                  'https://images.unsplash.com/photo-1502472584811-0a2f2feb8968?w=400&q=80',
                  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
                  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80',
                  'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80',
                ]
            ).map((src, i) => (
              <motion.div
                key={i}
                className={`gallery-preview-item ${i === 0 || i === 5 ? 'gallery-preview-item--wide' : ''}`}
                whileHover={{ scale: 1.03 }}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <img src={src} alt={`Gallery ${i+1}`} loading="lazy" />
                <div className="gallery-preview-overlay" />
              </motion.div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
            <Link to="/gallery" className="btn btn-outline btn-lg" id="view-gallery-btn">
              {homeConfig.galleryPreviewBtnText || "View Full Gallery"} <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

    </>
  )
}

function AnimateHeight({ open, children }) {
  return (
    <motion.div
      initial={false}
      animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
      transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
      style={{ overflow: 'hidden' }}
    >
      {children}
    </motion.div>
  )
}