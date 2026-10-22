import { useState, useEffect, useMemo } from 'react'
import SpotAvailabilityCalendar from '../components/ui/SpotAvailabilityCalendar'
import { useSocket } from '../context/SocketContext'
import { useParams, Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuthStore } from '../store'
import { buildApiUrl } from '../services/api'
import {
  LuMapPin as MapPin, LuStar as Star, LuShare2 as Share2, LuCalendar as CalendarIcon,
  LuClock as Clock, LuCloudRain as CloudRain, LuSun as Sun, LuDroplets as Droplets, LuWind as Wind, LuCheck as Check, LuTriangleAlert as AlertTriangle,
  LuChevronRight as ChevronRight, LuSparkles as Sparkles, LuArrowRight as ArrowRight, LuShieldCheck as ShieldCheck, LuUsers as Users, LuWifi as Wifi, LuLock as Lock,
  LuHouse as HomeIcon, LuCircleCheck as CheckCircle2, LuMusic as Music, LuCoffee as Coffee, LuSparkle as Sparkle, LuLoader as Loader2,
  LuPhone as Phone, LuCreditCard as CreditCard, LuUser as User, LuImage as ImageIcon
} from 'react-icons/lu'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Thumbs, FreeMode, Autoplay } from 'swiper/modules'
import toast from 'react-hot-toast'
import 'swiper/css'
import 'swiper/css/free-mode'
import 'swiper/css/navigation'
import 'swiper/css/thumbs'
import 'swiper/css/autoplay'

function PlotDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [thumbsSwiper, setThumbsSwiper] = useState(null)
  
  const [plot, setPlot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load saved draft for this plot if available
  const getDraft = () => {
    try {
      const saved = localStorage.getItem(`picnicutkal_plot_draft_${id}`)
      return saved ? JSON.parse(saved) : null
    } catch (e) { return null }
  }

  const draft = getDraft()
  const { isAuthenticated, user } = useAuthStore()

  // Form selections with draft restoration
  const [customerName, setCustomerName] = useState(() => draft?.customerName || '')
  const [guests, setGuests] = useState(() => draft?.guests || 1)
  const [rawGuests, setRawGuests] = useState(() => String(draft?.guests || 1))
  const [phone, setPhone] = useState(() => draft?.phone || '')
  const [aadhaar, setAadhaar] = useState(() => draft?.aadhaar || '')
  const [durationDays, setDurationDays] = useState(() => draft?.durationDays || 1)
  const [visitDate, setVisitDate] = useState(() => {
    return location.state?.initialDate || searchParams.get('date') || searchParams.get('visitDate') || draft?.visitDate || ''
  })
  const [selectedDates, setSelectedDates] = useState(() => draft?.selectedDates || [])
  const [selectedAddons, setSelectedAddons] = useState(() => draft?.selectedAddons || [])
  const [selectedCottageId, setSelectedCottageId] = useState(() => draft?.selectedCottageId || 'standard')
  const [selectedVehicle, setSelectedVehicle] = useState(() => draft?.selectedVehicle || 'car')
  const [expandedAddons, setExpandedAddons] = useState([])

  const [addonsList, setAddonsList] = useState([])

  useEffect(() => {
    fetch(buildApiUrl('/api/site-config/addons_config'), { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.value && Array.isArray(d.value)) {
          setAddonsList(d.value)
          try { localStorage.setItem('picnicutkal_event_addons', JSON.stringify(d.value)) } catch (e) {}
        }
      })
      .catch(() => {})
  }, [])

  const { socket } = useSocket()

  useEffect(() => {
    if (!socket) return
    const handleAddonsUpdate = (data) => {
      if (data && Array.isArray(data.addons)) {
        setAddonsList(data.addons)
        try { localStorage.setItem('picnicutkal_event_addons', JSON.stringify(data.addons)) } catch (e) {}
      }
    }
    socket.on('addons_config_update', handleAddonsUpdate)
    return () => socket.off('addons_config_update', handleAddonsUpdate)
  }, [socket])

  const getStoredRules = () => {
    try {
      const saved = localStorage.getItem('picnicutkal_guidelines_rules')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(r => r.status === 'Active')
        }
      }
    } catch (e) {}
    return [
      { id: 'def-1', title: 'Valid Photo ID Required', desc: 'Aadhaar, Voter ID or Driving License must be produced upon entry for all adult members.' },
      { id: 'def-2', title: 'Plastic-Free Sanctuary', desc: 'Strict zero-single-use-plastic zone. Carry eco-friendly containers and trash bags.' },
      { id: 'def-3', title: 'Eco-Hours Timing', desc: 'Grounds open 07:00 AM to 06:30 PM. Overnight stays are allowed strictly in pre-booked cottages.' }
    ]
  }

  const [activeRules, setActiveRules] = useState(getStoredRules)

  useEffect(() => {
    fetch(buildApiUrl('/api/site-config/guidelines_rules'))
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d && d.success && Array.isArray(d.data)) {
          setActiveRules(d.data.filter(r => r.status === 'Active'))
          try { localStorage.setItem('picnicutkal_guidelines_rules', JSON.stringify(d.data)) } catch (e) {}
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!socket) return
    const handler = (data) => {
      if (data && Array.isArray(data.rules)) {
        setActiveRules(data.rules.filter(r => r.status === 'Active'))
      }
    }
    socket.on('guidelines_rules_update', handler)
    return () => socket.off('guidelines_rules_update', handler)
  }, [socket])

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  useEffect(() => {
    const passedDate = location.state?.initialDate || searchParams.get('date') || searchParams.get('visitDate')
    if (passedDate) {
      setVisitDate(passedDate)
    }
  }, [location.state, searchParams])

  // Auto-save form draft on change
  useEffect(() => {
    if (!id) return
    const formData = { customerName, guests, phone, aadhaar, visitDate, selectedDates, durationDays, selectedAddons, selectedCottageId, selectedVehicle }
    localStorage.setItem(`picnicutkal_plot_draft_${id}`, JSON.stringify(formData))
  }, [id, customerName, guests, phone, aadhaar, visitDate, selectedDates, durationDays, selectedAddons, selectedCottageId, selectedVehicle])

  useEffect(() => {
    if (!id) return

    // Reject stale temporary frontend IDs immediately — they were never saved in DB
    if (id.startsWith('plot-') || id.startsWith('spot-') || /^plot-\d+$/.test(id)) {
      setPlot(null)
      setError('This link is outdated. Please navigate to the Spots or Map page to find a valid zone.')
      setLoading(false)
      // Clear stale draft for this ID
      try { localStorage.removeItem(`picnicutkal_plot_draft_${id}`) } catch (e) {}
      return
    }

    setPlot(null)
    setError('')
    setLoading(true)
    let isMounted = true

    fetch(buildApiUrl(`/api/map/plots/${id}`), { cache: 'no-store' })
      .then(async res => {
        if (!isMounted) return
        if (res.status === 200) {
          const d = await res.json()
          if (d.success && d.data) {
            setPlot(d.data)
            setError('')
            return
          }
        }
        setError('Spot or Zone not found')
      })
      .catch(() => {
        if (!isMounted) return
        setError('Spot or Zone not found')
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [id])

  // Auto-scroll to booking card on mobile if ?book=true is passed
  useEffect(() => {
    if (!loading && !error && plot) {
      const searchParams = new URLSearchParams(window.location.search)
      if (searchParams.get('book') === 'true') {
        setTimeout(() => {
          const element = document.getElementById('booking-date') || document.getElementById('duration-days-input')
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
            element.focus()
          }
        }, 300)
      }
    }
  }, [loading, error, plot])

  const handleAddonToggle = (addonId) => {
    setSelectedAddons(prev =>
      prev.includes(addonId) ? prev.filter(a => a !== addonId) : [...prev, addonId]
    )
  }

  const toggleExpandAddon = (e, addonId) => {
    e.stopPropagation()
    setExpandedAddons(prev =>
      prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
    )
  }

  const cottageRoomTypes = useMemo(() => {
    if (!plot) return []
    if (Array.isArray(plot.roomTypes) && plot.roomTypes.length > 0) {
      return plot.roomTypes
    }
    if (plot.isCottage || plot._id === 'cottage-rooms') {
      return [
        { id: 'standard', name: `${plot.title} (Standard)`, desc: plot.description || 'AC · Attached Bath', price: plot.price || 999 }
      ]
    }
    return []
  }, [plot])

  if (loading) {
    return (
      <div className="plot-loading-container">
        <Loader2 className="spin" size={38} color="var(--gold)" />
        <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600 }}>
          Loading picnic zone details...
        </p>
      </div>
    )
  }

  if (error || !plot) {
    return (
      <div className="container-fluid section text-center">
        <h2 className="heading-3 text-white">Oops! Zone Not Found</h2>
        <p className="text-white/60 mt-2 mb-6">{error || 'The requested map zone could not be loaded.'}</p>
        <Link to="/map" className="btn btn-gold">Back to Interactive Map</Link>
      </div>
    )
  }

  const isCottage = plot ? (plot._id === 'cottage-rooms' || plot.isCottage) : false
  const isPandal = plot ? (plot._id.startsWith('pandal') || plot.isPandal) : false

  // Select current price
  let basePrice = plot ? plot.price : 0
  if (isCottage && cottageRoomTypes.length > 0) {
    const selectedCot = cottageRoomTypes.find(c => c.id === selectedCottageId) || cottageRoomTypes[0]
    basePrice = selectedCot ? selectedCot.price : (plot.price || 0)
  }

  const baseTotal = basePrice * (Number(durationDays) || 1)
  
  const activeAddonsList = addonsList.filter(a => a.status === 'Active' || !a.status)
  const selectedAddonsObjects = activeAddonsList.filter(a => selectedAddons.includes(a.id))

  const addonsTotal = selectedAddonsObjects.reduce((sum, a) => sum + (Number(a.priceAddon) || Number(a.price) || 0), 0)

  const grandTotal = baseTotal + addonsTotal

  const activeCottageName = isCottage && cottageRoomTypes.length > 0
    ? (cottageRoomTypes.find(c => c.id === selectedCottageId)?.name || cottageRoomTypes[0]?.name)
    : ''

  const maxCapacity = plot ? (Number(plot.capacity) || 100) : 100

  const handleBookingSubmit = (e) => {
    e.preventDefault()
    if (!customerName || !customerName.trim()) {
      toast.error('Please enter the lead guest name.')
      return
    }
    if (!visitDate) {
      toast.error('Please select a visit date first.')
      return
    }
    if (guests > maxCapacity) {
      toast.error(`Pindi has only ${maxCapacity} capacity!`)
      return
    }
    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      toast.error('Please enter a valid 10-digit mobile number.')
      return
    }
    if (!aadhaar || !/^\d{12}$/.test(aadhaar)) {
      toast.error('Please enter a valid 12-digit Aadhaar Card number.')
      return
    }

    if (!isAuthenticated || !user) {
      toast.error('🔒 Please sign in to complete your reservation!')
      const selectedPlotObj = {
        _id: plot._id,
        title: isCottage ? activeCottageName : plot.title,
        price: basePrice,
        capacity: plot.capacity,
        color: plot.color,
        isCottage: isCottage,
        description: plot.description
      }
      const pendingData = {
        plot: selectedPlotObj,
        durationDays: durationDays,
        initialName: customerName,
        initialGuests: guests,
        initialDate: visitDate,
        initialPhone: phone,
        initialAadhaar: aadhaar,
        selectedAddons: selectedAddonsObjects
      }
      sessionStorage.setItem('pending_booking', JSON.stringify(pendingData))
      navigate('/login', { state: { from: location, bookingIntent: true } })
      return
    }

    toast.loading('Preparing booking form...')
    setTimeout(() => {
      toast.dismiss()
      try { localStorage.removeItem(`picnicutkal_plot_draft_${id}`); } catch (err) {}
      
      const selectedPlotObj = {
        _id: plot._id,
        title: isCottage ? activeCottageName : plot.title,
        price: basePrice,
        capacity: plot.capacity,
        color: plot.color,
        isCottage: isCottage,
        description: plot.description
      }

      navigate(`/booking?plotId=${plot._id}`, {
        state: {
          plot: selectedPlotObj,
          durationDays: durationDays,
          initialName: customerName,
          initialGuests: guests,
          initialDate: visitDate,
          initialPhone: phone,
          initialAadhaar: aadhaar,
          selectedAddons: selectedAddonsObjects
        }
      })
    }, 800)
  }

  // Get gallery images (use strictly uploaded plot.images / plot.image from admin backend, no dummy images)
  const rawImages = (Array.isArray(plot.images) && plot.images.filter(Boolean).length > 0)
    ? plot.images.filter(Boolean)
    : (plot.image ? [plot.image] : [])
  const images = rawImages.map(imgSrc => {
    if (!imgSrc) return ''
    if (typeof imgSrc === 'string' && imgSrc.startsWith('/uploads')) {
      const backendOrigin = import.meta.env.VITE_API_URL 
        ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') 
        : 'http://localhost:5300'
      return `${backendOrigin}${imgSrc}`
    }
    return imgSrc
  }).filter(Boolean)

  const facilities = plot.facilities?.length > 0
    ? plot.facilities
    : ['AC & Electric backup', 'Attached Washroom', 'Secured gated fencing', 'Lush lawns view']

  return (
    <>
      <Helmet>
        <title>{`${plot.title} Reservation | PicnicUtkal`}</title>
        <meta name="description" content={plot.description} />
      </Helmet>

      <div className="spot-detail container-fluid section">
        {/* Breadcrumb */}
        <div className="spot-breadcrumb">
          <Link to="/">Home</Link> <ChevronRight size={12} />
          <Link to="/map">Interactive Map</Link> <ChevronRight size={12} />
          <span>{plot.title}</span>
        </div>

        {/* Title Header */}
        <div className="spot-title-section">
          <div>
            <span className="badge badge-gold">{isCottage ? 'Premium Cottage Block' : 'Event Zone Pandal'}</span>
            <h1 className="heading-2">{plot.title}</h1>
            <p className="spot-location"><MapPin size={16} /> Barapita Picnic Area, Odisha</p>
          </div>
          <div className="spot-header-actions">
            <button className="btn btn-outline btn-sm" onClick={() => {
              navigator.clipboard.writeText(window.location.href)
              toast.success('Details page link copied to clipboard!')
            }}>
              <Share2 size={16} /> Share Details
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="spot-grid-layout">
          {/* Left Column - Gallery & Info */}
          <div className="spot-main-content">
            {/* Swiper Gallery */}
            <div className="spot-gallery-wrapper">
              {images.length > 0 ? (
                <>
                  <Swiper
                    spaceBetween={10}
                    navigation={images.length > 1}
                    autoplay={images.length > 1 ? {
                      delay: 3000,
                      disableOnInteraction: false,
                      pauseOnMouseEnter: true
                    } : false}
                    loop={images.length > 1}
                    thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                    modules={[Navigation, Thumbs, FreeMode, Autoplay]}
                    className="spot-main-slider"
                  >
                    {images.map((img, i) => (
                      <SwiperSlide key={i}>
                        <img src={img} alt={`${plot.title} View ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  {images.length > 1 && (
                    <Swiper
                      onSwiper={setThumbsSwiper}
                      spaceBetween={10}
                      slidesPerView={Math.min(images.length, 4)}
                      freeMode={true}
                      watchSlidesProgress={true}
                      modules={[FreeMode, Navigation, Thumbs]}
                      className="spot-thumbs-slider"
                    >
                      {images.map((img, i) => (
                        <SwiperSlide key={i}>
                          <img src={img} alt={`Thumb ${i + 1}`} />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  )}
                </>
              ) : (
                <div
                  style={{
                    width: '100%',
                    minHeight: '340px',
                    borderRadius: 'var(--radius-lg, 12px)',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px dashed var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    color: 'var(--text-muted)',
                    padding: '30px'
                  }}
                >
                  <ImageIcon size={44} style={{ opacity: 0.4, color: 'var(--gold)' }} />
                  <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)' }}>No Image Available</span>
                  <span style={{ fontSize: '12px', opacity: 0.7 }}>No photo has been uploaded for this zone yet</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="spot-card-info section-card">
              <h2 className="heading-4">About this reservation</h2>
              <p className="spot-description-text">{plot.description}</p>
            </div>

            {/* Cottage Room Type Selector (If Cottage) */}
            {isCottage && cottageRoomTypes.length > 0 && (
              <div className="spot-card-info section-card">
                <h2 className="heading-4">Choose Cottage Room</h2>
                <p className="spot-subtext">Select which room type you would like to book for your overnight picnic stay.</p>
                <div className="zones-list-detail">
                  {cottageRoomTypes.map(cot => {
                    const isSelected = selectedCottageId === cot.id
                    return (
                      <div
                        key={cot.id}
                        className={`zone-detail-row ${isSelected ? 'zone-detail-row--selected' : ''}`}
                        onClick={() => setSelectedCottageId(cot.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="zone-detail-checkbox">
                          <input
                            type="radio"
                            checked={isSelected}
                            onChange={() => {}}
                            style={{ pointerEvents: 'none' }}
                            id={`cot-radio-${cot.id}`}
                          />
                        </div>
                        <div className="zone-detail-main">
                          <h3>{cot.name}</h3>
                          <p>{cot.desc}</p>
                          <span className="zone-capacity-tag">👥 Bed capacity: Up to {cot.capacity || (cot.id === 'cottage-1' ? '2' : (cot.id === 'cottage-2' ? '3' : '4'))} guests</span>
                        </div>
                        <div className="zone-detail-price">
                          <span>₹{cot.price}</span>
                          <small>/night</small>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Addons Selection */}
            {activeAddonsList.length > 0 && (
              <div className="spot-card-info section-card">
                <h2 className="heading-4">Add Custom Event Add-ons</h2>
                <p className="spot-subtext">Customize your outdoor event package. Select one or more addons to include with your booking.</p>
                <div className="zones-list-detail">
                  {activeAddonsList.map(addon => {
                    const isSelected = selectedAddons.includes(addon.id)
                    const isExpanded = expandedAddons.includes(addon.id)
                    return (
                      <div
                        key={addon.id}
                        className={`zone-detail-row ${isSelected ? 'zone-detail-row--selected' : ''}`}
                        onClick={() => handleAddonToggle(addon.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="addon-row-content">
                          <div className="zone-detail-checkbox">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              style={{ pointerEvents: 'none' }}
                              id={`addon-check-${addon.id}`}
                            />
                          </div>
                          <div className="addon-row-body">
                            <div className="zone-detail-main" style={{ flex: 1, paddingRight: '12px' }}>
                              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>{addon.name}</h3>
                              <p style={{ margin: '4px 0 6px', fontSize: '13px' }}>{addon.desc}</p>
                              {addon.items && Array.isArray(addon.items) && addon.items.length > 0 && (
                                <button
                                  type="button"
                                  className="addon-details-btn"
                                  onClick={(e) => toggleExpandAddon(e, addon.id)}
                                >
                                  {isExpanded ? 'HIDE DETAILS' : 'VIEW DETAILS'}
                                </button>
                              )}
                            </div>
                            <div className="zone-detail-price" style={{ minWidth: '85px', textAlign: 'right', flexShrink: 0 }}>
                              <span>+ ₹{addon.priceAddon || addon.price || 0}</span>
                              <small>/ flat addon</small>
                            </div>
                          </div>
                        </div>

                      {/* Collapsible Items Details */}
                      {isExpanded && addon.items && (
                        <div 
                          className="addon-expanded-box" 
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="addon-items-heading">What's Inside:</div>
                          <div className="addon-items-grid">
                            {addon.items.map((item, idx) => (
                              <div key={idx} className="addon-item-row">
                                <Check size={11} className="addon-check-icon" />
                                <span>{typeof item === 'string' ? item : (item.title || item.name || item.text || '')}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}



            {/* Amenities */}
            <div className="spot-card-info section-card">
              <h2 className="heading-4">Amenities Included</h2>
              <div className="amenities-grid-detail">
                {facilities.map((item, index) => (
                  <div key={index} className="amenity-item-detail">
                    <CheckCircle2 size={16} color="var(--forest)" />
                    <span>{typeof item === 'string' ? item : (item.title || item.name || item.text || '')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rules */}
            <div className="spot-card-info section-card">
              <h2 className="heading-4">Guidelines &amp; Rules</h2>
              <div className="rules-list-detail">
                {activeRules.map((rule, index) => (
                  <div key={index} className="rule-item-detail">
                    <AlertTriangle size={16} color="var(--gold-dark)" />
                    <span>
                      {typeof rule === 'string' ? rule : (rule.desc ? `${rule.title ? `${rule.title}: ` : ''}${rule.desc}` : (rule.title || rule.text || ''))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="spot-booking-sidebar">
            <div className="booking-sticky-card glass-card">
              <div className="booking-card-price">
                <div>
                  <span className="price-label">Starts from</span>
                  <h2>₹{basePrice} <small>{!isCottage ? '/day' : '/night'}</small></h2>
                </div>
              </div>

              <div className="booking-card-form">
                {/* 1. FULL WIDTH CALENDAR */}
                <div className="form-group plot-calendar-fullwidth" >
                  <label style={{ fontWeight: 700, display: 'block', fontSize: '14px' }}>
                    Select Reservation Dates (One by One)
                  </label>
                  <SpotAvailabilityCalendar
                    spotId={plot?.id || plot?._id || id}
                    selectedDate={selectedDates.length > 0 ? selectedDates : visitDate}
                    durationDays={durationDays}
                    onSelectDate={(primaryDate, allDatesArray) => {
                      setVisitDate(primaryDate)
                      setSelectedDates(allDatesArray || [primaryDate])
                    }}
                    title={`Availability Calendar — ${plot?.title || 'Spot'}`}
                  />
                </div>

                {/* 2. ROW 1: LEFT = SELECT VISIT DATE, RIGHT = NUMBER OF GUESTS */}
                <div className="plot-form-bottom-grid-2col" >
                  {/* Left: Select Visit Date */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="booking-date" style={{ fontWeight: 700, display: 'block' }}>
                      Select Visit Date *
                    </label>
                    <div className="input-with-icon">
                      <CalendarIcon size={16} />
                      <input
                        type="date"
                        id="booking-date"
                        className="input"
                        value={visitDate}
                        onChange={e => setVisitDate(e.target.value)}
                        min={tomorrowStr}
                        required
                      />
                    </div>
                  </div>

                  {/* Right: Number of Guests */}
                  {!isCottage && (
                    <div className="form-group" style={{ margin: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', }}>
                        <label htmlFor="guest-count" style={{ marginBottom: 0, fontWeight: 700 }}>Number of Guests</label>
                        <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 600 }}>
                          Max: {maxCapacity} Guests
                        </span>
                      </div>
                      <div className="input-with-icon">
                        <Users size={16} />
                        <input
                          type="number"
                          id="guest-count"
                          className="input"
                          placeholder="Enter guest count"
                          value={rawGuests}
                          onChange={e => {
                            const valStr = e.target.value
                            setRawGuests(valStr)
                            const valNum = Number(valStr)
                            if (valNum > maxCapacity) {
                              toast.error(`Pindi has only ${maxCapacity} capacity!`, { id: 'pindi-cap-toast' })
                            }
                            setGuests(valNum)
                          }}
                          min={1}
                        />
                      </div>
                      {Number(rawGuests) > maxCapacity && (
                        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                          <AlertTriangle size={13} color="#fca5a5" /> Pindi has only {maxCapacity} capacity!
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. ROW 2: LEFT = TOTAL DAYS, RIGHT = LEAD GUEST NAME */}
                <div className="plot-form-bottom-grid-2col" >
                  {/* Left: Total Days / Duration */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', }}>
                      <label htmlFor="duration-days-input" style={{ marginBottom: 0, fontWeight: 700 }}>
                        Total Days / Duration *
                      </label>
                      <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 700 }}>
                        {selectedDates.length > 0 ? selectedDates.length : (visitDate ? 1 : 0)} of {durationDays} Day(s)
                      </span>
                    </div>
                    <div className="input-with-icon">
                      <Clock size={16} />
                      <input
                        type="number"
                        id="duration-days-input"
                        className="input"
                        min="1"
                        max="30"
                        value={durationDays}
                        onChange={e => {
                          const val = Math.max(1, Math.min(30, Number(e.target.value) || 1))
                          setDurationDays(val)
                        }}
                      />
                    </div>
                  </div>

                  {/* Right: Lead Guest Name */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="user-name" style={{ fontWeight: 700 }}>Lead Guest Name *</label>
                    <div className="input-with-icon">
                      <User size={16} />
                      <input
                        type="text"
                        id="user-name"
                        className="input"
                        placeholder="Enter full name"
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* 4. ROW 3: LEFT = AADHAAR CARD NUMBER, RIGHT = MOBILE NUMBER */}
                <div className="plot-form-bottom-grid-2col" >
                  {/* Left: Aadhaar Card Number */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="user-aadhaar" style={{ fontWeight: 700 }}>Adhaar Card Number *</label>
                    <div className="input-with-icon">
                      <CreditCard size={16} />
                      <input
                        type="text"
                        id="user-aadhaar"
                        className="input"
                        placeholder="12-digit Aadhaar number"
                        maxLength={12}
                        value={aadhaar}
                        onChange={e => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                        required
                      />
                    </div>
                  </div>

                  {/* Right: Mobile Number */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="user-phone" style={{ fontWeight: 700 }}>Mobile Number *</label>
                    <div className="input-with-icon">
                      <Phone size={16} />
                      <input
                        type="tel"
                        id="user-phone"
                        className="input"
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Price Calculator Breakdown */}
                <div className="price-breakdown-card">
                  <span className="breakdown-title">Pricing Breakdown</span>
                  <div className="breakdown-rows">
                    <div className="breakdown-row">
                      <span>Pandal Rate</span>
                      <span>₹{basePrice.toLocaleString()} / day</span>
                    </div>
                    <div className="breakdown-row" style={{ color: 'var(--gold)', fontWeight: 600 }}>
                      <span>Total Days</span>
                      <span>{durationDays} Day{durationDays > 1 ? 's' : ''} (₹{baseTotal.toLocaleString()})</span>
                    </div>
                    {selectedAddonsObjects.map(addon => (
                      <div key={addon.id} className="breakdown-row" style={{ color: 'var(--gold)', fontSize: '13px' }}>
                        <span>{addon.name}</span>
                        <span>+ ₹{addon.priceAddon.toLocaleString()}</span>
                      </div>
                    ))}
                    <hr className="breakdown-divider" />
                    <div className="breakdown-row breakdown-row--total">
                      <span>Total Amount</span>
                      <span>₹{grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleBookingSubmit}
                  className="btn btn-gold btn-lg w-full booking-submit-btn"
                  id="book-spot-submit"
                >
                  Book Now <ArrowRight size={16} />
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default PlotDetail
