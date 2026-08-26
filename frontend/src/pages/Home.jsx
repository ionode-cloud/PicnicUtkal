import { useRef, useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import {
  LuSearch as Search, LuMapPin as MapPin, LuCalendar as Calendar, LuUsers as Users, LuStar as Star, LuArrowRight as ArrowRight,
  LuWaves as Waves, LuFlame as Flame, LuMusic as Music, LuTent as Tent, LuTarget as Target, LuTrees as Trees, LuCamera as Camera,
  LuChevronDown as ChevronDown, LuShield as Shield, LuClock as Clock, LuAward as Award, LuTrendingUp as TrendingUp, LuImage as ImageIcon
} from 'react-icons/lu'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, EffectFade } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'
import { useSocket } from '../context/SocketContext'
import { buildApiUrl } from '../services/api'
import { usePlots, useSiteConfig, useMaps, useInvalidators } from '../hooks/useQueryHooks'

function getZoneIcon(label = '') {
  const l = label.toLowerCase()
  if (l.includes('swim') || l.includes('water')) return Waves
  if (l.includes('bbq') || l.includes('cook') || l.includes('flame') || l.includes('food')) return Flame
  if (l.includes('music') || l.includes('stage') || l.includes('dance')) return Music
  if (l.includes('camp') || l.includes('tent')) return Tent
  if (l.includes('adventur') || l.includes('sport') || l.includes('target')) return Target
  if (l.includes('photo') || l.includes('camera') || l.includes('selfie')) return Camera
  return Trees
}

function resolvePlotImage(imgSrc) {
  if (!imgSrc) return ''
  if (typeof imgSrc === 'string' && imgSrc.startsWith('/uploads')) {
    const backendOrigin = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') 
      : 'http://localhost:5300'
    return `${backendOrigin}${imgSrc}`
  }
  return imgSrc
}

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
    image: (Array.isArray(p.images) && p.images[0]) ? p.images[0] : (p.image || ''),
    zones: facilities.length > 0 ? facilities.slice(0, 4) : ['Shade', 'Seating'],
    capacity: Number(p.capacity) || 100,
    badge: p.badge || 'Map Zone',
    mapId: p.mapId || 'default-master-plan'
  }
}


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
  const displayImage = resolvePlotImage(spot.image)

  // Guard against stale temporary IDs
  const isValidId = spot.id && !/^(plot|spot)-\d+$/.test(spot.id)

  return (
    <motion.div
      className="spot-card"
      custom={index}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      whileHover={{ y: -8 }}
      style={{ cursor: 'pointer' }}
      onClick={() => isValidId ? navigate(`/plots/${spot.id}`) : navigate('/spots')}
    >
      <div className="spot-card__image-wrap">
        {displayImage ? (
          <img
            src={displayImage}
            alt={spot.name}
            className="spot-card__image"
            loading="lazy"
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              minHeight: '200px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.03)',
              gap: '6px',
              color: 'var(--text-muted)'
            }}
          >
            <ImageIcon size={32} style={{ opacity: 0.35, color: 'var(--gold)' }} />
            <span style={{ fontSize: '11px', fontWeight: 600 }}>No Image Available</span>
          </div>
        )}
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
            <span className="spot-card__price-unit">/day</span>
          </div>
          <div className="spot-card__actions">
            <button
              className="btn btn-outline btn-sm"
              onClick={(e) => { e.stopPropagation(); isValidId ? navigate(`/plots/${spot.id}`) : navigate('/spots') }}
              id={`details-spot-${spot.id}`}
            >
              Details
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={(e) => { e.stopPropagation(); isValidId ? navigate(`/plots/${spot.id}?book=true`) : navigate('/spots') }}
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

function HomeSkeleton() {
  return (
    <div className="home-skeleton-wrapper" style={{ minHeight: '100vh', width: '100%' }}>
      {/* Hero Skeleton */}
      <section className="hero" style={{ minHeight: '85vh', position: 'relative', display: 'flex', alignItems: 'center' }}>
        <div className="hero__bg" style={{ background: 'linear-gradient(135deg, #071a0f 0%, #030c07 100%)' }}>
          <div className="hero-overlay" />
        </div>

        <div className="hero__content container-fluid" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px', zIndex: 2, padding: '40px 20px' }}>
          {/* Eyebrow badge */}
          <div className="skeleton-shimmer" style={{ width: '160px', height: '30px', borderRadius: '999px' }} />
          
          {/* Title Lines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="skeleton-shimmer" style={{ width: '85%', height: '54px', borderRadius: '12px' }} />
            <div className="skeleton-shimmer" style={{ width: '65%', height: '54px', borderRadius: '12px' }} />
          </div>

          {/* Subtitle Lines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
            <div className="skeleton-shimmer" style={{ width: '95%', height: '22px', borderRadius: '6px' }} />
            <div className="skeleton-shimmer" style={{ width: '70%', height: '22px', borderRadius: '6px' }} />
          </div>

          {/* Search Box Glass Container */}
          <div className="hero__search glass" style={{ marginTop: '24px', padding: '18px 24px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="skeleton-shimmer" style={{ flex: 1, minWidth: '180px', height: '48px', borderRadius: '10px' }} />
            <div className="skeleton-shimmer" style={{ flex: 1, minWidth: '180px', height: '48px', borderRadius: '10px' }} />
            <div className="skeleton-shimmer" style={{ width: '140px', height: '48px', borderRadius: '10px' }} />
          </div>
        </div>
      </section>

      {/* Popular Zones Skeleton */}
      <section className="section section-sm zones-section">
        <div className="container-fluid">
          <div className="section-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
            <div className="skeleton-shimmer" style={{ width: '120px', height: '20px', borderRadius: '999px' }} />
            <div className="skeleton-shimmer" style={{ width: '280px', height: '36px', borderRadius: '8px' }} />
          </div>
          <div className="zones-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="zone-pill" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', border: '1px solid var(--border)' }}>
                <div className="skeleton-shimmer" style={{ width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <div className="skeleton-shimmer" style={{ width: '80%', height: '18px', borderRadius: '4px' }} />
                  <div className="skeleton-shimmer" style={{ width: '50%', height: '12px', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Spots Skeleton */}
      <section className="section spots-section">
        <div className="container-fluid">
          <div className="section-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
            <div className="skeleton-shimmer" style={{ width: '140px', height: '20px', borderRadius: '999px' }} />
            <div className="skeleton-shimmer" style={{ width: '320px', height: '36px', borderRadius: '8px' }} />
          </div>
          <div className="spots-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="spot-card" style={{ height: '340px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="skeleton-shimmer" style={{ width: '100%', height: '180px', borderRadius: 'var(--radius-lg)' }} />
                <div className="skeleton-shimmer" style={{ width: '70%', height: '22px', borderRadius: '6px' }} />
                <div className="skeleton-shimmer" style={{ width: '40%', height: '16px', borderRadius: '6px' }} />
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="skeleton-shimmer" style={{ width: '80px', height: '24px', borderRadius: '4px' }} />
                  <div className="skeleton-shimmer" style={{ width: '90px', height: '32px', borderRadius: '8px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

let isInitialHomeLoad = true

export default function Home() {
  const heroRef = useRef(null)
  const { scrollY } = useScroll()
  const heroParallax = useTransform(scrollY, [0, 600], [0, 200])

  const [searchData, setSearchData] = useState({ location: '', date: '', people: '' })
  const navigate = useNavigate()

  const { data: siteConfigData, isLoading: siteConfigLoading } = useSiteConfig()
  const { data: rawPlots = [], isLoading: plotsLoading } = usePlots()
  const { data: rawMaps = [], isLoading: mapsLoading } = useMaps()
  const { invalidatePlots, invalidateSiteConfig, invalidateMaps } = useInvalidators()

  // Derive homeConfig, galleryImages, zonesList, and maps directly from fresh query data
  const homeConfig = useMemo(() => {
    return siteConfigData?.user_view_config?.home || {}
  }, [siteConfigData])

  const galleryImages = useMemo(() => {
    const raw = siteConfigData?.user_view_config?.gallery
    if (Array.isArray(raw)) {
      return raw.map(item => typeof item === 'string' ? item : (item.src || item.url)).filter(Boolean)
    }
    return []
  }, [siteConfigData])

  const [galleryOffset, setGalleryOffset] = useState(0)

  const zonesList = useMemo(() => {
    const raw = siteConfigData?.admin_zones
    if (Array.isArray(raw)) {
      return raw.filter(z => z.status !== 'Inactive')
    }
    return []
  }, [siteConfigData])

  const maps = useMemo(() => {
    const cleaned = rawMaps.filter(m => m._id !== 'chilika-map-02' && m._id !== 'simlipal-map-03')
    if (cleaned.length > 0) return cleaned
    return [
      { _id: 'default-master-plan', title: 'Barapita Master Plan (Main Ground)', linkedSpot: 'Barapita Ground, Deras' }
    ]
  }, [rawMaps])

  // Socket.io: live-reload when admin saves Home page content, Gallery content, Zones, or Maps
  const { socket } = useSocket()
  useEffect(() => {
    if (!socket) return
    const handleHomeUpdate = () => invalidateSiteConfig()
    const handleGalleryUpdate = () => invalidateSiteConfig()
    const handleZonesUpdate = () => invalidateSiteConfig()
    const handleMapUpdate = () => invalidateMaps()

    socket.on('home_config_update', handleHomeUpdate)
    socket.on('gallery_config_update', handleGalleryUpdate)
    socket.on('zones_config_update', handleZonesUpdate)
    socket.on('map_config_update', handleMapUpdate)
    return () => {
      socket.off('home_config_update', handleHomeUpdate)
      socket.off('gallery_config_update', handleGalleryUpdate)
      socket.off('zones_config_update', handleZonesUpdate)
      socket.off('map_config_update', handleMapUpdate)
    }
  }, [socket, invalidateSiteConfig, invalidateMaps])

  // Rotate gallery images every 5 minutes (300,000ms)
  useEffect(() => {
    if (galleryImages.length === 0) return
    const timer = setInterval(() => {
      setGalleryOffset(prev => prev + 1)
    }, 5 * 60 * 1000)
    return () => clearInterval(timer)
  }, [galleryImages.length])

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

  const isNonBookableLandmark = (p) => Boolean(
    p.isLandmark ||
    p.isFree ||
    Number(p.price) === 0 ||
    p.price === 0 ||
    p._id === 'main-gate' ||
    p._id === 'parking' ||
    p.id === 'main-gate' ||
    p.id === 'parking'
  )

  // Load featured spots — use shared React Query cache so navigating
  // away and back doesn't re-fetch while data is still fresh
  const isStaleTemporaryId = (p) => {
    const id = p._id || p.id || ''
    return /^(plot|spot)-\d+$/.test(id)
  }

  const featuredSpots = useMemo(() => {
    return rawPlots
      .filter(p => p._id !== 'chilika-zone-1' && p._id !== 'simlipal-zone-1' && p.id !== 'chilika-zone-1' && p.id !== 'simlipal-zone-1')
      .filter(p => !isNonBookableLandmark(p))
      .filter(p => !isStaleTemporaryId(p))
      .map(normalizePlot)
  }, [rawPlots])

  // Listen for live real-time spot updates via Socket.io → invalidate cache
  useEffect(() => {
    if (!socket) return
    const handleUpdate = () => invalidatePlots()
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

  const [minLoading, setMinLoading] = useState(() => isInitialHomeLoad)
  useEffect(() => {
    if (isInitialHomeLoad) {
      const timer = setTimeout(() => {
        setMinLoading(false)
        isInitialHomeLoad = false
      }, 1200)
      return () => clearTimeout(timer)
    }
  }, [])

  const heroSlides = useMemo(() => {
    if (!homeConfig.heroImages || !Array.isArray(homeConfig.heroImages)) return []
    return homeConfig.heroImages.filter(img => img && !String(img).includes('photo-1506905925346-21bda4d32df4'))
  }, [homeConfig.heroImages])

  if (siteConfigLoading || minLoading) {
    return <HomeSkeleton />
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
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
          {heroSlides.length > 0 ? (
            <Swiper
              key={heroSlides.map(img => typeof img === 'string' ? img : (img?.url || '')).join(',')}
              modules={[Autoplay, Pagination, EffectFade]}
              effect="fade"
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              loop={heroSlides.length > 1}
              className="hero__swiper"
            >
              {heroSlides.map((img, i) => {
                const resolvedUrl = resolvePlotImage(typeof img === 'string' ? img : (img?.url || img?.src || ''))
                return (
                  <SwiperSlide key={i}>
                    <div className="hero__slide" style={{ backgroundImage: `url("${resolvedUrl}")` }} />
                  </SwiperSlide>
                )
              })}
            </Swiper>
          ) : (
            <div className="hero__slide" style={{ background: 'linear-gradient(135deg, #0d2818 0%, #04120a 100%)' }} />
          )}
          <div className="hero-overlay" />
        </motion.div>

        <div className="hero__content container-fluid">
          {homeConfig.eyebrowText && (
            <motion.span
              className="hero__eyebrow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {homeConfig.eyebrowText}
            </motion.span>
          )}

          <motion.h1
            className="hero__title heading-hero"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {homeConfig.heroTitleLine1 ? (
              <>
                {homeConfig.heroTitleLine1}<br />
                {homeConfig.heroTitleLine2 ? <><span className="text-gradient">{homeConfig.heroTitleLine2}</span><br /></> : null}
                {homeConfig.heroTitleLine3 || ''}
              </>
            ) : (
              <>
                Find Your Perfect<br />
                <span className="text-gradient">Picnic Escape</span><br />
                in Odisha
              </>
            )}
          </motion.h1>

          <motion.p
            className="hero__subtitle"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {homeConfig.heroSubtitle !== undefined
              ? homeConfig.heroSubtitle
              : "Discover 50+ premium picnic zones with swimming, BBQ, camping, adventure & more. Book instantly and arrive to a perfectly arranged picnic."}
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
            {zonesList.map((zone, i) => {
              const ZoneIcon = zone.icon || getZoneIcon(zone.label)
              return (
                <motion.a
                  key={zone.id || zone.label || i}
                  href={zone.href || '/spots'}
                  className="zone-pill"
                  custom={i}
                  variants={fadeUp}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  id={`zone-${(zone.label || '').toLowerCase().replace(/\s+/g,'-')}`}
                >
                  <div className="zone-pill__icon" style={{ background: `${zone.color || '#228BE6'}18`, color: zone.color || '#228BE6' }}>
                    <ZoneIcon size={24} />
                  </div>
                  <div>
                    <div className="zone-pill__label">{zone.label}</div>
                    <div className="zone-pill__count">{zone.count}</div>
                  </div>
                </motion.a>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* FEATURED SPOTS */}
      <section className="section spots-section" id="featured-spots-section">
        <div className="container-fluid">
          <div className="section-header">
            <span className="section-eyebrow">{homeConfig.spotsEyebrow || "Top Destinations"}</span>
            <h2 className="section-title">
              {homeConfig.spotsTitle && homeConfig.spotsTitle !== 'Featured Picnic Spots' ? homeConfig.spotsTitle : 'Picnic Spots'}
            </h2>
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
            {plotsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="spot-card" style={{ height: '320px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ width: '100%', height: '180px', borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s infinite' }} />
                  <div style={{ width: '70%', height: '22px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s infinite' }} />
                  <div style={{ width: '40%', height: '16px', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s infinite' }} />
                </div>
              ))
            ) : displayedSpots.length === 0 ? (
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
            
            </div>
            <div className="why-visual">
              <div className="why-img-stack">
                <img
                  src={homeConfig.whyImgMain}
                  alt="Happy family picnic"
                  className="why-img why-img--main"
                />
                <img
                  src={homeConfig.whyImgSecondary}
                  alt="Picnic zone"
                  className="why-img why-img--secondary"
                  style={{ border: '4px solid var(--cream)' }}
                />
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
            {(() => {
              const pool = (galleryImages && galleryImages.length > 0) ? galleryImages : []
              const total = pool.length
              if (total === 0) {
                return Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className={`gallery-preview-item ${i === 0 || i === 5 ? 'gallery-preview-item--wide' : ''}`}
                    style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-lg)', animation: 'pulse 1.5s infinite', minHeight: '220px' }}
                  />
                ))
              }
              const displayCount = Math.min(6, total)
              const items = Array.from({ length: displayCount }).map((_, i) => {
                const idx = (galleryOffset + i) % total
                return pool[idx]
              })

              return items.map((src, i) => (
                <motion.div
                  key={`${galleryOffset}-${i}-${src}`}
                  className={`gallery-preview-item ${i === 0 || i === 5 ? 'gallery-preview-item--wide' : ''}`}
                  whileHover={{ scale: 1.03 }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                >
                  <img src={src} alt={`Gallery ${i + 1}`} loading="lazy" />
                  <div className="gallery-preview-overlay" />
                </motion.div>
              ))
            })()}
          </div>
          <div style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
            <Link to="/gallery" className="btn btn-outline btn-lg" id="view-gallery-btn">
              {homeConfig.galleryPreviewBtnText || "View Full Gallery"} <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

    </>
    </motion.div>
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