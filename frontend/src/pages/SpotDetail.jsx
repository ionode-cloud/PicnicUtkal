import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  MapPin, Star, Share2, Calendar as CalendarIcon,
  Clock, CloudRain, Sun, Droplets, Wind, Check, AlertTriangle,
  ChevronRight, Sparkles, ArrowRight, ShieldCheck, Users, Wifi, Lock
} from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Thumbs, FreeMode } from 'swiper/modules'
import toast from 'react-hot-toast'
import 'swiper/css'
import 'swiper/css/free-mode'
import 'swiper/css/navigation'
import 'swiper/css/thumbs'

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
  const [thumbsSwiper, setThumbsSwiper] = useState(null)
  const [selectedDuration, setSelectedDuration] = useState('1')
  const [guests, setGuests] = useState(1)
  const [visitDate, setVisitDate] = useState('')
  const [selectedZones, setSelectedZones] = useState([])

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
  }, [id, spot])

  const spot = SPOTS_DB[id] || SPOTS_DB['1']

  const handleZoneToggle = (zoneId) => {
    setSelectedZones(prev =>
      prev.includes(zoneId) ? prev.filter(id => id !== zoneId) : [...prev, zoneId]
    )
  }

  // Calculate pricing breakdown
  const baseTotal = spot.basePrice * guests
  const addonsTotal = spot.zones
    .filter(z => selectedZones.includes(z.id))
    .reduce((sum, z) => sum + z.priceAddon, 0) * guests
  const durationMultiplier = selectedDuration === 'custom' ? 1 : Number(selectedDuration)
  const grandTotal = (baseTotal + addonsTotal) * durationMultiplier

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied to clipboard!')
  }

  const handleBookingSubmit = (e) => {
    e.preventDefault()
    if (!visitDate) {
      toast.error('Please select a visit date first.')
      return
    }
    toast.loading('Checking zone availability...')
    setTimeout(() => {
      toast.dismiss()
      toast.success('Redirecting to booking form...')
      navigate('/booking', {
        state: {
          spot,
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

      <div className="spot-detail container section">
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
                        <small>/person addon</small>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>



            {/* Amenities */}
            <div className="spot-card-info section-card">
              <h2 className="heading-4">Amenities Provided</h2>
              <div className="amenities-grid-detail">
                {spot.amenities.map((item, index) => (
                  <div key={index} className="amenity-item-detail">
                    <item.icon size={16} color="var(--forest)" />
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rules */}
            <div className="spot-card-info section-card">
              <h2 className="heading-4">Rules & Guidelines</h2>
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
                  <h2>₹{spot.basePrice} <small>/person</small></h2>
                </div>
                <div className="rating-box">
                  <Star size={16} fill="var(--gold)" color="var(--gold)" />
                  <strong>{spot.rating}</strong>
                  <span>({spot.reviewsCount})</span>
                </div>
              </div>

              <div className="booking-card-form">
                {/* Duration select */}
                <div className="form-group">
                  <label>Booking Duration</label>
                  <div className="duration-selector">
                    <button className={selectedDuration === '1' ? 'active' : ''} onClick={() => setSelectedDuration('1')}>1 Day</button>
                    <button className={selectedDuration === '2' ? 'active' : ''} onClick={() => setSelectedDuration('2')}>2 Days</button>
                    <button className={selectedDuration === '3' ? 'active' : ''} onClick={() => setSelectedDuration('3')}>3 Days</button>
                    <button className={selectedDuration === 'custom' ? 'active' : ''} onClick={() => setSelectedDuration('custom')}>Custom</button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="booking-date">Select Visit Date</label>
                  <div className="input-with-icon">
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
                      <span>Base Ticket (₹{spot.basePrice} × {guests})</span>
                      <span>₹{baseTotal}</span>
                    </div>
                    {selectedZones.length > 0 && (
                      <div className="breakdown-row">
                        <span>Zone Add-ons ({selectedZones.length} selected)</span>
                        <span>+ ₹{addonsTotal}</span>
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

              <div className="booking-card-footer">
                <p><ShieldCheck size={14} color="var(--success)" /> Razorpay Secure Payments Supported</p>
                <p><Clock size={14} /> Easy cancellation up to 48 hours prior</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}