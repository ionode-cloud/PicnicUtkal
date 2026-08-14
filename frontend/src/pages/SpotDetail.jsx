import { useState, useEffect } from 'react'
import SpotAvailabilityCalendar from '../components/ui/SpotAvailabilityCalendar'
import { useParams, Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuthStore } from '../store'
import { buildApiUrl } from '../services/api'
import {
  LuMapPin as MapPin, LuStar as Star, LuShare2 as Share2, LuCalendar as CalendarIcon,
  LuClock as Clock, LuCloudRain as CloudRain, LuSun as Sun, LuDroplets as Droplets, LuWind as Wind, LuCheck as Check, LuTriangleAlert as AlertTriangle,
  LuChevronRight as ChevronRight, LuSparkles as Sparkles, LuArrowRight as ArrowRight, LuShieldCheck as ShieldCheck, LuUsers as Users, LuWifi as Wifi, LuLock as Lock
} from 'react-icons/lu'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Thumbs, FreeMode } from 'swiper/modules'
import toast from 'react-hot-toast'
import 'swiper/css'
import 'swiper/css/free-mode'
import 'swiper/css/navigation'
import 'swiper/css/thumbs'

const EVENT_ADDONS = [
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
      'Structure arch frame setup & tear-down after event'
    ]
  }
]

const SPOTS_DB = {
  '1': {
    id: '1',
    name: 'Nandankanan Wildlife Sanctuary',
    location: 'Bhubaneswar, Odisha',
    basePrice: 299,
    rating: 4.9,
    reviewsCount: 348,
    description: 'Nandankanan Wildlife Sanctuary is a premier eco-tourism spot located in Bhubaneswar, Odisha. Known for its botanical gardens, white tiger safari, and pristine lake, it offers the ultimate premium nature getaway. Spanning over 437 hectares, the sanctuary features specialized activity zones designed for luxury nature experiences, family gatherings, and photography.',
    amenities: [
      { name: 'Clean Restrooms', icon: Clock },
      { name: 'Premium Picnic Tables', icon: Sparkles },
      { name: 'Water Stations', icon: Droplets },
      { name: 'WIFI Zone', icon: Wifi },
      { name: 'CCTV Security', icon: Lock },
      { name: 'Kids Play Area', icon: Users },
      { name: 'First Aid Station', icon: ShieldCheck }
    ],
    rules: [
      'No plastic bottles allowed',
      'Loud music allowed only in Music Zone',
      'Eco-friendly disposal mandatory',
      'Pre-registration required for Drone cameras',
      'Alcohol consumption prohibited'
    ],
    openingTime: '07:30 AM',
    closingTime: '05:30 PM',
    images: [
      'https://images.unsplash.com/photo-1502472584811-0a2f2feb8968?w=800&q=80',
      'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=800&q=80',
      'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80',
    ],
    zones: [
      { id: 'z1', name: '🏊 Premium Swimming Zone', desc: 'Resort-style pool with clean fresh water & slides', capacity: 150, priceAddon: 150 },
      { id: 'z2', name: '🍖 BBQ & Cooking Zone', desc: 'Individual BBQ grills, firewood & picnic tables', capacity: 80, priceAddon: 100 },
      { id: 'z3', name: '👨‍👩‍👧 Family Garden Zone', desc: 'Lush green lawns, shaded gazebos & resting spaces', capacity: 200, priceAddon: 50 },
      { id: 'z4', name: '📷 Photogenic Nature Zone', desc: 'Overlooks the lake, perfect scenic selfie points', capacity: 60, priceAddon: 30 }
    ],
    weather: { temp: '32°C', rain: '10%', humidity: '72%', wind: '12 km/h', desc: 'Partly Cloudy' }
  },
  '2': {
    id: '2',
    name: 'Chilika Lake Picnic Resort',
    location: 'Puri, Odisha',
    basePrice: 449,
    rating: 4.8,
    reviewsCount: 214,
    description: 'Situated on the banks of Asia\'s largest brackish water lagoon, Chilika Lake Picnic Resort is a luxury haven for nature lovers and bird watchers. Experience the migratory birds, dolphin watching, and delicious local seafood packages in our custom activity zones.',
    amenities: [
      { name: 'Boat Landing Dock', icon: Sparkles },
      { name: 'Lakeview Gazebos', icon: Clock },
      { name: 'Sunset View Decks', icon: Sun },
      { name: 'BBQ Grills', icon: Sparkles },
      { name: 'Safe Parking Area', icon: Lock },
      { name: 'Power Backup', icon: ShieldCheck },
      { name: 'Cafeteria', icon: Droplets }
    ],
    rules: [
      'Do not feed the dolphins or migratory birds',
      'Do not litter the lake waters',
      'Ensure lifejackets are worn during boating',
      'Plastic bags strictly banned'
    ],
    openingTime: '06:00 AM',
    closingTime: '06:00 PM',
    images: [
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    ],
    zones: [
      { id: 'z5', name: '⛵ Boating & Fishing Zone', desc: 'Private premium boating docks & fishing gear rental', capacity: 100, priceAddon: 200 },
      { id: 'z6', name: '🏕 Lakefront Camping Zone', desc: 'Premium tents, bonfire set-up and dolphin view deck', capacity: 50, priceAddon: 250 },
      { id: 'z7', name: '👨‍👩‍👧 Lakeside Family Lounge', desc: 'Luxury lounge chairs, umbrellas and mocktail bar', capacity: 120, priceAddon: 80 }
    ],
    weather: { temp: '30°C', rain: '20%', humidity: '80%', wind: '22 km/h', desc: 'Breezy & Warm' }
  }
}



export default function SpotDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  // Load saved draft for this spot if available
  const getDraft = () => {
    try {
      const saved = localStorage.getItem(`picnicutkal_spot_draft_${id}`)
      return saved ? JSON.parse(saved) : null
    } catch (e) { return null }
  }

  const draft = getDraft()

  const [thumbsSwiper, setThumbsSwiper] = useState(null)
  const [selectedDuration, setSelectedDuration] = useState(() => draft?.selectedDuration || '1')
  const [guests, setGuests] = useState(() => draft?.guests || 1)
  const [visitDate, setVisitDate] = useState(() => {
    return location.state?.initialDate || searchParams.get('date') || searchParams.get('visitDate') || draft?.visitDate || ''
  })
  const [selectedZones, setSelectedZones] = useState(() => draft?.selectedZones || [])
  const [selectedAddons, setSelectedAddons] = useState(() => draft?.selectedAddons || [])
  const [expandedAddons, setExpandedAddons] = useState([])

  useEffect(() => {
    const passedDate = location.state?.initialDate || searchParams.get('date') || searchParams.get('visitDate')
    if (passedDate) {
      setVisitDate(passedDate)
    }
  }, [location.state, searchParams])

  // Auto-save form draft on change
  useEffect(() => {
    if (!id) return
    const formData = { guests, visitDate, selectedDuration, selectedZones, selectedAddons }
    localStorage.setItem(`picnicutkal_spot_draft_${id}`, JSON.stringify(formData))
  }, [id, guests, visitDate, selectedDuration, selectedZones, selectedAddons])

  // Auto-scroll to booking card on mobile if ?book=true is passed
  useEffect(() => {
    if (spot) {
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
  }, [id])

  const [dynamicSpot, setDynamicSpot] = useState(null)

  useEffect(() => {
    if (!id) return
    fetch(buildApiUrl(`/api/map/plots/${id}`))
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) {
          setDynamicSpot({
            id: d.data._id || d.data.id,
            name: d.data.title || d.data.name,
            location: d.data.mapId === 'chilika-map-02' ? 'Chilika Lake, Puri' : (d.data.mapId === 'simlipal-map-03' ? 'Simlipal Reserve, Mayurbhanj' : 'Barapita Ground, Deras'),
            basePrice: d.data.price || 499,
            description: d.data.description || 'Exclusive picnic spot surrounded by lush greenery.',
            images: Array.isArray(d.data.images) && d.data.images.length > 0 ? d.data.images : [d.data.image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80'],
            zones: []
          })
        }
      })
      .catch(() => {})
  }, [id])

  const spot = dynamicSpot || SPOTS_DB[id] || SPOTS_DB['1']

  const handleZoneToggle = (zoneId) => {
    setSelectedZones(prev =>
      prev.includes(zoneId) ? prev.filter(id => id !== zoneId) : [...prev, zoneId]
    )
  }

  const handleAddonToggle = (addonId) => {
    setSelectedAddons(prev =>
      prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
    )
  }

  const toggleExpandAddon = (e, addonId) => {
    e.stopPropagation()
    setExpandedAddons(prev =>
      prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
    )
  }

  // Calculate pricing breakdown (flat rates per pandal)
  const baseTotal = spot.basePrice
  const zonesTotal = spot.zones
    .filter(z => selectedZones.includes(z.id))
    .reduce((sum, z) => sum + z.priceAddon, 0)
  const eventAddonsTotal = EVENT_ADDONS
    .filter(a => selectedAddons.includes(a.id))
    .reduce((sum, a) => sum + a.priceAddon, 0)
  const durationMultiplier = selectedDuration === 'custom' ? 1 : Number(selectedDuration)
  const grandTotal = (baseTotal + zonesTotal + eventAddonsTotal) * durationMultiplier

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied to clipboard!')
  }

  const { isAuthenticated, user } = useAuthStore()

  const handleBookingSubmit = (e) => {
    e.preventDefault()
    if (!visitDate) {
      toast.error('Please select a visit date first.')
      return
    }
    if (!isAuthenticated || !user) {
      toast.error('🔒 Please sign in to proceed with your booking!')
      navigate('/login', { state: { from: location } })
      return
    }
    toast.loading('Checking zone availability...')
    setTimeout(() => {
      toast.dismiss()
      toast.success('Redirecting to booking form...')
      navigate('/booking', {
        state: {
          spot,
          durationDays: durationMultiplier,
          initialGuests: guests,
          initialDate: visitDate
        }
      })
    }, 1500)
  }

  return (
    <>
      <Helmet>
        <title>{`${spot.name} - Picnic Spot in Odisha | PicnicUtkal`}</title>
        <meta name="description" content={spot.description.slice(0, 155)} />
      </Helmet>

      <div className="spot-detail container-fluid section">
        {/* Breadcrumb */}
        <div className="spot-breadcrumb">
          <Link to="/">Home</Link> <ChevronRight size={12} />
          <Link to="/spots">Spots</Link> <ChevronRight size={12} />
          <span>{spot.name}</span>
        </div>

        {/* Title Header */}
        <div className="spot-title-section">
          <div>
            <span className="badge badge-gold">Premium Spot</span>
            <h1 className="heading-2">{spot.name}</h1>
            <p className="spot-location"><MapPin size={16} /> {spot.location}</p>
          </div>
          <div className="spot-header-actions">
            <button className="btn btn-outline btn-sm" onClick={handleShare}>
              <Share2 size={16} /> Share Link
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
                {spot.images.map((img, i) => (
                  <SwiperSlide key={i}>
                    <img src={img} alt={`${spot.name} View ${i + 1}`} />
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
                {spot.images.map((img, i) => (
                  <SwiperSlide key={i}>
                    <img src={img} alt={`Thumb ${i + 1}`} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Description */}
            <div className="spot-card-info section-card">
              <h2 className="heading-4">About this Spot</h2>
              <p className="spot-description-text">{spot.description}</p>
            </div>

            {/* Activity Zones */}
            <div className="spot-card-info section-card">
              <h2 className="heading-4">Select Activity Zones</h2>
              <p className="spot-subtext">Customize your experience. Select one or more activity zones to add to your day ticket.</p>
              <div className="zones-list-detail">
                {spot.zones.map(zone => {
                  const isSelected = selectedZones.includes(zone.id)
                  return (
                    <div
                      key={zone.id}
                      className={`zone-detail-row ${isSelected ? 'zone-detail-row--selected' : ''}`}
                      onClick={() => handleZoneToggle(zone.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="zone-detail-checkbox">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // handled by row onClick
                          style={{ pointerEvents: 'none' }}
                          id={`zone-check-${zone.id}`}
                        />
                      </div>
                      <div className="zone-detail-main">
                        <h3>{zone.name}</h3>
                        <p>{zone.desc}</p>
                        <span className="zone-capacity-tag">👥 Max capacity: {zone.capacity} guests</span>
                      </div>
                      <div className="zone-detail-price">
                        <span>+ ₹{zone.priceAddon}</span>
                        <small>/ flat addon</small>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Custom Event Add-ons */}
            <div className="spot-card-info section-card">
              <h2 className="heading-4">Add Custom Event Add-ons</h2>
              <p className="spot-subtext">Customize your outdoor event package. Select one or more addons to include with your booking.</p>
              <div className="zones-list-detail">
                {EVENT_ADDONS.map(addon => {
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
                                {isExpanded ? 'HIDE DETAILS' : 'VIEW DETAILS'}
                              </button>
                            )}
                          </div>
                          <div className="zone-detail-price" style={{ minWidth: '85px', textAlign: 'right', flexShrink: 0 }}>
                            <span>+ ₹{addon.priceAddon}</span>
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



            {/* Amenities */}
            <div className="spot-card-info section-card">
              <h2 className="heading-4">Amenities Included</h2>
              <div className="amenities-grid-detail">
                {spot.amenities.map((item, index) => (
                  <div key={index} className="amenity-item-detail">
                    <ShieldCheck size={16} color="var(--forest)" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rules */}
            <div className="spot-card-info section-card">
              <h2 className="heading-4">Guidelines & Rules</h2>
              <div className="rules-list-detail">
                {spot.rules.map((rule, index) => (
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
                  <h2>₹{spot.basePrice} <small>/day</small></h2>
                </div>
              </div>

              <div className="booking-card-form">
                {/* Total Days Input Field */}
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label htmlFor="duration-days-spot-input" style={{ marginBottom: 0, fontWeight: 700 }}>
                      Total Days / Duration
                    </label>
                    <span style={{ fontSize: '12px', color: 'var(--gold)', fontWeight: 700 }}>
                      {durationMultiplier} Day(s) Selected
                    </span>
                  </div>
                  <div className="input-with-icon">
                    <Clock size={16} />
                    <input
                      type="number"
                      id="duration-days-spot-input"
                      className="input"
                      min="1"
                      max="30"
                      value={selectedDuration}
                      onChange={e => {
                        const val = Math.max(1, Math.min(30, Number(e.target.value) || 1))
                        setSelectedDuration(String(val))
                      }}
                    />
                  </div>
                  <small style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Enter total days, then click dates one by one on the calendar below.
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="booking-date">Select Reservation Dates (One by One)</label>
                  <SpotAvailabilityCalendar
                    spotId={spot?.id || spot?._id || id}
                    selectedDate={visitDate}
                    durationDays={durationMultiplier}
                    onSelectDate={(primaryDate, allDatesArray) => {
                      setVisitDate(primaryDate)
                    }}
                    title={`Availability Calendar — ${spot?.name || 'Spot'}`}
                  />
                  <div className="input-with-icon" style={{ marginTop: '8px' }}>
                    <CalendarIcon size={16} />
                    <input
                      type="date"
                      id="booking-date"
                      className="input"
                      value={visitDate}
                      onChange={e => setVisitDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

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

                {/* Price calculator breakdown */}
                <div className="price-breakdown-card">
                  <span className="breakdown-title">Pricing Breakdown</span>
                  <div className="breakdown-rows">
                    <div className="breakdown-row">
                      <span>Base Spot Rate</span>
                      <span>₹{baseTotal} flat rate</span>
                    </div>
                    {selectedZones.length > 0 && (
                      <div className="breakdown-row">
                        <span>Zone Add-ons ({selectedZones.length} selected)</span>
                        <span>+ ₹{zonesTotal}</span>
                      </div>
                    )}
                    {selectedAddons.length > 0 && (
                      <div className="breakdown-row">
                        <span>Event Add-ons ({selectedAddons.length} selected)</span>
                        <span>+ ₹{eventAddonsTotal}</span>
                      </div>
                    )}
                    {durationMultiplier > 1 && (
                      <div className="breakdown-row">
                        <span>Duration Multiplier</span>
                        <span>× {durationMultiplier}</span>
                      </div>
                    )}
                    <hr className="breakdown-divider" />
                    <div className="breakdown-row breakdown-row--total">
                      <span>Total Booking Fee</span>
                      <span>₹{grandTotal}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleBookingSubmit}
                  className="btn btn-gold btn-lg w-full booking-submit-btn"
                  id="book-spot-submit"
                >
                  Book Escapes Now <ArrowRight size={16} />
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}