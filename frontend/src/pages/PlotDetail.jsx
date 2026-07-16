import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  MapPin, Star, Share2, Calendar as CalendarIcon,
  Clock, CloudRain, Sun, Droplets, Wind, Check, AlertTriangle,
  ChevronRight, Sparkles, ArrowRight, ShieldCheck, Users, Wifi, Lock,
  Home as HomeIcon, CheckCircle2, Music, Coffee, Sparkle, Loader2
} from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Thumbs, FreeMode } from 'swiper/modules'
import toast from 'react-hot-toast'
import 'swiper/css'
import 'swiper/css/free-mode'
import 'swiper/css/navigation'
import 'swiper/css/thumbs'

const PLOT_IMAGES = {
  pandal: [
    'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&q=80',
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80'
  ],
  cottage: [
    'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&q=80',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'
  ],
  default: [
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
    'https://images.unsplash.com/photo-1533850595620-7b1711221751?w=800&q=80'
  ]
}

const PANDAL_ADDONS = [
  { 
    id: 'ad_gas_chulha', 
    name: '🔥 Gas & Chulha Booking', 
    desc: 'Full outdoor kitchen burner stove and filled LPG cylinder setup.', 
    priceAddon: 250,
    items: [
      '1x Commercial Single-Burner Chulha (Stove)',
      '1x 5kg LPG Gas Cylinder (Pre-filled, ready to use)',
      'High-pressure gas regulator and safety hose pipe',
      'Gas lighter utility included'
    ]
  },
  { 
    id: 'ad_cooking_kit', 
    name: '🍳 Cooking Accessories Pack', 
    desc: 'Complete picnic cookware, serving spoons and preparation kit.', 
    priceAddon: 150,
    items: [
      '2x Large Aluminum Cooking Pots (Dekchi with lids)',
      '1x Deep Frying Pan (Kadai) & 1x Tawa',
      'Large cooking ladles, spatula & serving spoons (Khanti & Chhanki)',
      'Heavy-duty chopping board & 2x stainless steel kitchen knives',
      'Dishwashing gel, scrubber sponge & cleaning cloth'
    ]
  },
  { 
    id: 'ad_sound', 
    name: '🔊 Standard Sound System', 
    desc: 'Dual speakers, microphone, Bluetooth audio receiver', 
    priceAddon: 150,
    items: [
      '2x Active Sound Tower Speakers (JBL 15-inch)',
      '1x Audio Mixing Console (Yamaha 6-channel)',
      '1x Wireless Handheld Vocal Microphone',
      'Bluetooth receiver, AUX cable, and power extension leads'
    ]
  },
  { 
    id: 'ad_catering', 
    name: '🍽 Catering Table Setup', 
    desc: 'Elegant buffet tables with satin cloth skirting', 
    priceAddon: 100,
    items: [
      '4x Buffet / food serving tables (6x3 ft metal frame)',
      'Premium white satin fabric table spreads',
      'Pleated gold border table skirtings'
    ]
  },
  { 
    id: 'ad_decor', 
    name: '🌸 Floral Welcome Arch', 
    desc: 'Decorated entry arch with fresh seasonal flowers', 
    priceAddon: 250,
    items: [
      'Yellow/orange fresh marigolds & white lily floral decorations',
      'Sturdy welcome gate frame structure',
      'Welcome text writing board'
    ]
  },
  { 
    id: 'ad_power', 
    name: '⚡ Dedicated Silent Generator', 
    desc: 'Uninterrupted power supply backup for event hours', 
    priceAddon: 200,
    items: [
      '1x 5 KVA Silent Diesel Generator Set',
      'Fuel included for up to 8 hours of peak load operation',
      'Safety MCB distribution box and extension cables'
    ]
  }
]

const COTTAGE_ROOM_TYPES = [
  { id: 'cottage-1', name: '🏡 Cottage 1 (Standard)', desc: '2 Beds · AC · Attached Bath · Garden View', price: 999 },
  { id: 'cottage-2', name: '🏘️ Cottage 2 (Deluxe)', desc: '3 Beds · AC · Attached Bath · Canal View · TV', price: 1499 },
  { id: 'cottage-3', name: '🏠 Cottage 3 (Premium Suite)', desc: '4 Beds · AC · Attached Bath · Riverside View · TV · Kitchenette', price: 1999 }
]

const DEFAULT_PLOTS = [
  {
    _id: 'pandal-1',
    title: 'Pandal — Upper Block',
    price: 499,
    area: '3500 sq ft',
    capacity: 120,
    description: 'Shaded pandal structure near the canal with cool breeze and scenic water views.',
    facilities: ['Shade', 'Seating', 'Lighting', 'Riverside View'],
    status: 'available'
  },
  {
    _id: 'pandal-2',
    title: 'Pandal — Center Block',
    price: 499,
    area: '3200 sq ft',
    capacity: 100,
    description: 'Central pandal with easy access to restroom facilities.',
    facilities: ['Shade', 'Seating', 'Lighting', 'DJ Point'],
    status: 'booked'
  },
  {
    _id: 'pandal-3',
    title: 'Pandal — West Block',
    price: 399,
    area: '2800 sq ft',
    capacity: 90,
    description: 'Cozy west-side pandal nestled among trees, perfect for intimate family picnics.',
    facilities: ['Shade', 'Seating', 'BBQ Area', 'Garden View'],
    status: 'available'
  },
  {
    _id: 'pandal-4',
    title: 'Pandal — East Block',
    price: 449,
    area: '3000 sq ft',
    capacity: 95,
    description: 'East-side pandal with direct parking access, ideal for large group events.',
    facilities: ['Shade', 'Seating', 'Parking Access', 'Electricity'],
    status: 'available'
  },
  {
    _id: 'pandal-5',
    title: 'Pandal — Road Block',
    price: 449,
    area: '3000 sq ft',
    capacity: 100,
    description: 'Roadside pandal near the main pathway — convenient access and great for large gatherings.',
    facilities: ['Shade', 'Seating', 'Lighting', 'Road Access'],
    status: 'available'
  },
  {
    _id: 'pandal-6',
    title: 'Pandal — North East Block',
    price: 499,
    area: '3200 sq ft',
    capacity: 110,
    description: 'Premium north-east pandal with open views, near the parking zone — ideal for large events.',
    facilities: ['Shade', 'Seating', 'Electricity', 'Parking Access', 'Open View'],
    status: 'available'
  },
  {
    _id: 'stage-stair',
    title: 'Stage / Stair Area',
    price: 299,
    area: '1200 sq ft',
    capacity: 50,
    description: 'Elevated stage area with stairs — perfect for performances, ceremonies and photo backdrops.',
    facilities: ['Stage Lighting', 'Sound System', 'Backdrop', 'Steps'],
    status: 'available'
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
    isCottage: true
  }
]

export default function PlotDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [thumbsSwiper, setThumbsSwiper] = useState(null)
  
  const [plot, setPlot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Form selections
  const [guests, setGuests] = useState(1)
  const [visitDate, setVisitDate] = useState('')
  const [selectedAddons, setSelectedAddons] = useState([])
  const [selectedCottageId, setSelectedCottageId] = useState('cottage-2') // default deluxe cottage
  const [expandedAddons, setExpandedAddons] = useState([])

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  useEffect(() => {
    setLoading(true)
    fetch(`/api/map/plots/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setPlot(d.data)
        } else {
          // Fallback to static seed
          const local = DEFAULT_PLOTS.find(p => p._id === id)
          if (local) setPlot(local)
          else setError('Zone/Pandal details not found.')
        }
      })
      .catch(() => {
        // Fallback to static seed on fetch error
        const local = DEFAULT_PLOTS.find(p => p._id === id)
        if (local) setPlot(local)
        else setError('Error loading zone details.')
      })
      .finally(() => setLoading(false))
  }, [id])

  // Auto-scroll to booking card on mobile if ?book=true is passed
  useEffect(() => {
    if (!loading && !error && plot) {
      const searchParams = new URLSearchParams(window.location.search)
      if (searchParams.get('book') === 'true') {
        setTimeout(() => {
          const element = document.getElementById('booking-date')
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

  if (loading) {
    return (
      <div className="container section flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="bk2-spin text-gold" size={36} />
        <p className="mt-4 text-white/50 text-sm">Loading details...</p>
      </div>
    )
  }

  if (error || !plot) {
    return (
      <div className="container section text-center">
        <h2 className="heading-3 text-white">Oops! Zone Not Found</h2>
        <p className="text-white/60 mt-2 mb-6">{error || 'The requested map zone could not be loaded.'}</p>
        <Link to="/map" className="btn btn-gold">Back to Interactive Map</Link>
      </div>
    )
  }

  const isCottage = plot._id === 'cottage-rooms' || plot.isCottage
  const isPandal = plot._id.startsWith('pandal')

  // Select current price
  let basePrice = plot.price
  if (isCottage) {
    const selectedCot = COTTAGE_ROOM_TYPES.find(c => c.id === selectedCottageId)
    basePrice = selectedCot ? selectedCot.price : 999
  }

  const baseTotal = basePrice * (isCottage ? 1 : guests) // Cottages are priced per room/night, Pandals are per person
  
  const addonsTotal = isPandal
    ? PANDAL_ADDONS
        .filter(a => selectedAddons.includes(a.id))
        .reduce((sum, a) => sum + a.priceAddon, 0) * guests
    : 0

  const grandTotal = baseTotal + addonsTotal

  const activeCottageName = isCottage 
    ? COTTAGE_ROOM_TYPES.find(c => c.id === selectedCottageId)?.name 
    : ''

  const handleBookingSubmit = (e) => {
    e.preventDefault()
    if (!visitDate) {
      toast.error('Please select a visit date first.')
      return
    }

    toast.loading('Preparing booking form...')
    setTimeout(() => {
      toast.dismiss()
      
      const selectedPlotObj = {
        _id: plot._id,
        title: isCottage ? activeCottageName : plot.title,
        price: basePrice,
        capacity: plot.capacity,
        color: plot.color,
        isCottage: isCottage,
        description: plot.description
      }

      navigate('/booking', {
        state: {
          plot: selectedPlotObj,
          initialGuests: guests,
          initialDate: visitDate
        }
      })
    }, 1200)
  }

  // Get gallery images
  const images = isCottage ? PLOT_IMAGES.cottage : (isPandal ? PLOT_IMAGES.pandal : PLOT_IMAGES.default)

  const facilities = plot.facilities?.length > 0
    ? plot.facilities
    : ['AC & Electric backup', 'Attached Washroom', 'Secured gated fencing', 'Lush lawns view']

  return (
    <>
      <Helmet>
        <title>{`${plot.title} Reservation | PicnicUtkal`}</title>
        <meta name="description" content={plot.description} />
      </Helmet>

      <div className="spot-detail container section">
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
              <Swiper
                spaceBetween={10}
                navigation={true}
                thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                modules={[Navigation, Thumbs]}
                className="spot-main-slider"
              >
                {images.map((img, i) => (
                  <SwiperSlide key={i}>
                    <img src={img} alt={`${plot.title} View ${i + 1}`} />
                  </SwiperSlide>
                ))}
              </Swiper>

              <Swiper
                onSwiper={setThumbsSwiper}
                spaceBetween={10}
                slidesPerView={3}
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
            </div>

            {/* Description */}
            <div className="spot-card-info section-card">
              <h2 className="heading-4">About this reservation</h2>
              <p className="spot-description-text">{plot.description}</p>
            </div>

            {/* Cottage Room Type Selector (If Cottage) */}
            {isCottage && (
              <div className="spot-card-info section-card">
                <h2 className="heading-4">Choose Cottage Room</h2>
                <p className="spot-subtext">Select which room type you would like to book for your overnight picnic stay.</p>
                <div className="zones-list-detail">
                  {COTTAGE_ROOM_TYPES.map(cot => {
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
                          <span className="zone-capacity-tag">👥 Bed capacity: Up to {cot.id === 'cottage-1' ? '2' : (cot.id === 'cottage-2' ? '3' : '4')} guests</span>
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

            {/* Addons Selection (If Pandal) */}
            {isPandal && (
              <div className="spot-card-info section-card">
                <h2 className="heading-4">Add Custom Event Add-ons</h2>
                <p className="spot-subtext">Customize your outdoor event package. Select one or more addons to include with your pandal booking.</p>
                <div className="zones-list-detail">
                  {PANDAL_ADDONS.map(addon => {
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
                              {addon.items && (
                                <button
                                  type="button"
                                  className="addon-details-btn"
                                  onClick={(e) => toggleExpandAddon(e, addon.id)}
                                >
                                  {isExpanded ? 'Hide Details' : 'View details'}
                                </button>
                              )}
                            </div>
                            <div className="zone-detail-price" style={{ minWidth: '85px', textAlign: 'right', flexShrink: 0 }}>
                              <span>+ ₹{addon.priceAddon}</span>
                              <small>/person addon</small>
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
                                  <span>{item}</span>
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
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rules */}
            <div className="spot-card-info section-card">
              <h2 className="heading-4">Guidelines &amp; Rules</h2>
              <div className="rules-list-detail">
                {[
                  'Alcohol consumption is strictly prohibited inside the sanctuary picnic campus',
                  'Littering is an offense; please dispose of plastic trash in colored bins only',
                  'Fires or self-organized BBQ must be restricted within designated brick fire pits',
                  'Decorations using cello tape or nails on trees/walls are strictly banned'
                ].map((rule, index) => (
                  <div key={index} className="rule-item-detail">
                    <AlertTriangle size={16} color="var(--gold-dark)" />
                    <span>{rule}</span>
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
                  <h2>₹{basePrice} <small>{!isCottage ? '/person' : '/night'}</small></h2>
                </div>
                <div className="rating-box">
                  <Star size={16} fill="var(--gold)" color="var(--gold)" />
                  <strong>4.9</strong>
                  <span>(120 reviews)</span>
                </div>
              </div>

              <div className="booking-card-form">
                <div className="form-group">
                  <label htmlFor="booking-date">Select Reservation Date</label>
                  <div className="input-with-icon">
                    <CalendarIcon size={16} />
                    <input
                      type="date"
                      id="booking-date"
                      className="input"
                      value={visitDate}
                      onChange={e => setVisitDate(e.target.value)}
                      min={tomorrowStr}
                    />
                  </div>
                </div>

                {!isCottage && (
                  <div className="form-group">
                    <label htmlFor="guest-count">Number of Guests</label>
                    <div className="input-with-icon">
                      <Users size={16} />
                      <input
                        type="number"
                        id="guest-count"
                        className="input"
                        placeholder="Guests"
                        value={guests}
                        onChange={e => setGuests(Math.max(1, Number(e.target.value)))}
                        min={1}
                      />
                    </div>
                  </div>
                )}

                {/* Price Calculator Breakdown */}
                <div className="price-breakdown-card">
                  <span className="breakdown-title">Pricing Breakdown</span>
                  <div className="breakdown-rows">
                    <div className="breakdown-row">
                      <span>Base Reservation</span>
                      <span>₹{basePrice.toLocaleString()} {isCottage ? 'per Room' : `× ${guests} guest(s)`}</span>
                    </div>
                    {isPandal && selectedAddons.length > 0 && (
                      <div className="breakdown-row">
                        <span>Event Add-ons</span>
                        <span>+ ₹{addonsTotal.toLocaleString()}</span>
                      </div>
                    )}
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
                  Reserve Now <ArrowRight size={16} />
                </button>
              </div>

              <div className="booking-card-footer">
                <p><ShieldCheck size={14} color="var(--success)" /> Secure UPI / Razorpay checkout enabled</p>
                <p><Clock size={14} /> Full refund cancellation up to 48 hours prior</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
