import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import {
  Search, MapPin, Calendar, Users, Star, ArrowRight,
  Waves, Flame, Music, Tent, Target, Trees, Camera,
  ChevronDown, Shield, Clock, Award, TrendingUp
} from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, EffectFade } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

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

const FEATURED_SPOTS = [
  {
    id: 'pandal-1',
    name: 'Pandal — Upper Block',
    location: 'Barapita Picnic Ground, Odisha',
    price: 499,
    rating: 4.9,
    reviews: 142,
    image: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600&q=80',
    zones: ['Shade', 'Seating', 'Lighting', 'Riverside View'],
    badge: 'Riverside View'
  },
  {
    id: 'pandal-5',
    name: 'Pandal — Road Block',
    location: 'Barapita Picnic Ground, Odisha',
    price: 449,
    rating: 4.7,
    reviews: 96,
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80',
    zones: ['Shade', 'Seating', 'Lighting', 'Road Access'],
    badge: 'Road Access'
  },
  {
    id: 'cottage-rooms',
    name: 'Cottage Rooms',
    location: 'Barapita Picnic Ground, Odisha',
    price: 999,
    rating: 4.9,
    reviews: 180,
    image: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=600&q=80',
    zones: ['AC Rooms', 'Attached Bath', 'Garden View', 'Canal View'],
    badge: 'Overnight Stay'
  },
  {
    id: 'pandal-6',
    name: 'Pandal — North East Block',
    location: 'Barapita Picnic Ground, Odisha',
    price: 499,
    rating: 4.8,
    reviews: 82,
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80',
    zones: ['Shade', 'Seating', 'Electricity', 'Open View'],
    badge: 'Open View'
  },
  {
    id: 'pandal-2',
    name: 'Pandal — Center Block',
    location: 'Barapita Picnic Ground, Odisha',
    price: 499,
    rating: 4.6,
    reviews: 114,
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80',
    zones: ['Shade', 'Seating', 'Lighting', 'DJ Point'],
    badge: 'Central Location'
  },
  {
    id: 'pandal-4',
    name: 'Pandal — East Block',
    location: 'Barapita Picnic Ground, Odisha',
    price: 449,
    rating: 4.8,
    reviews: 105,
    image: 'https://images.unsplash.com/photo-1533850595620-7b1711221751?w=600&q=80',
    zones: ['Shade', 'Seating', 'Parking Access', 'Electricity'],
    badge: 'Parking Access'
  },
  {
    id: 'pandal-3',
    name: 'Pandal — West Block',
    location: 'Barapita Picnic Ground, Odisha',
    price: 399,
    rating: 4.7,
    reviews: 73,
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80',
    zones: ['Shade', 'Seating', 'BBQ Area', 'Garden View'],
    badge: 'Garden View'
  }
]

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
        <img src={spot.image} alt={spot.name} className="spot-card__image" loading="lazy" />
        <div className="spot-card__image-overlay" />
        <span className="spot-card__badge badge badge-gold">{spot.badge}</span>
      </div>
      <div className="spot-card__body">
        <div className="spot-card__meta">
          <span className="spot-card__location"><MapPin size={13} /> {spot.location}</span>
          <div className="spot-card__rating">
            <Star size={13} fill="var(--gold)" color="var(--gold)" />
            <span>{spot.rating}</span>
            <span className="spot-card__reviews">({spot.reviews})</span>
          </div>
        </div>
        <h3 className="spot-card__name">{spot.name}</h3>
        <div className="spot-card__zones">
          {spot.zones.map(z => (
            <span key={z} className="spot-card__zone-tag">{z}</span>
          ))}
        </div>
        <div className="spot-card__footer">
          <div className="spot-card__price">
            <span className="spot-card__price-from">from</span>
            <span className="spot-card__price-amount">₹{spot.price}</span>
            <span className="spot-card__price-unit">{spot.id === 'cottage-rooms' ? '/night' : '/person'}</span>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate(`/plots/${spot.id}`)}
            id={`book-spot-${spot.id}`}
          >
            Book Now
          </button>
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

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchData.location) params.set('location', searchData.location)
    if (searchData.date) params.set('date', searchData.date)
    if (searchData.people) params.set('people', searchData.people)
    navigate(`/spots?${params.toString()}`)
  }

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
            {HERO_IMAGES.map((img, i) => (
              <SwiperSlide key={i}>
                <div className="hero__slide" style={{ backgroundImage: `url(${img})` }} />
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="hero-overlay" />
        </motion.div>

        <div className="hero__content container">
          <motion.span
            className="hero__eyebrow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            🌿 Welcome to Odisha's Nature Paradise
          </motion.span>

          <motion.h1
            className="hero__title heading-hero"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            Find Your Perfect<br />
            <span className="text-gradient">Picnic Escape</span><br />
            in Odisha
          </motion.h1>

          <motion.p
            className="hero__subtitle"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            Discover 50+ premium picnic zones with swimming, BBQ, camping, adventure & more.
            Book instantly and arrive to a perfectly arranged picnic.
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
                <input
                  id="search-location"
                  type="text"
                  placeholder="Bhubaneswar, Puri, Chilika..."
                  value={searchData.location}
                  onChange={e => setSearchData(d => ({ ...d, location: e.target.value }))}
                />
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
              <div className="hero__search-divider" />
              <div className="hero__search-field">
                <label htmlFor="search-people"><Users size={16} className="hero__search-icon" />Guests</label>
                <input
                  id="search-people"
                  type="number"
                  placeholder="How many people?"
                  min={1}
                  max={500}
                  value={searchData.people}
                  onChange={e => setSearchData(d => ({ ...d, people: e.target.value }))}
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
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Explore Zones</span>
            <h2 className="section-title">Choose Your <span className="text-gradient">Perfect Zone</span></h2>
            <p className="section-subtitle">From peaceful family gardens to thrilling adventure zones — we have it all.</p>
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
      <section className="section spots-section">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Top Destinations</span>
            <h2 className="section-title">Featured <span className="text-gradient-green">Picnic Spots</span></h2>
            <p className="section-subtitle">Handpicked premium picnic destinations across Odisha's most beautiful landscapes.</p>
          </div>
          <motion.div
            className="spots-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            {FEATURED_SPOTS.slice(0, 6).map((spot, i) => (
              <SpotCard key={spot.id} spot={spot} index={i} />
            ))}
          </motion.div>
          <div style={{ textAlign: 'center', marginTop: 'var(--space-10)' }}>
            <Link to="/map" className="btn btn-primary btn-lg" id="view-all-spots-btn">
              View All on Map <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>


      {/* WHY CHOOSE US */}
      <section className="section why-section">
        <div className="container">
          <div className="why-inner">
            <div className="why-text">
              <span className="section-eyebrow">Why PicnicUtkal?</span>
              <h2 className="section-title" style={{ textAlign: 'left', maxWidth: '480px' }}>
                The Smartest Way to<br /><span className="text-gradient-green">Plan a Picnic</span>
              </h2>
              <p className="section-subtitle" style={{ textAlign: 'left' }}>
                We handle everything — from booking your zone to arranging food, decorations, and parking. Just show up and enjoy.
              </p>
              <div className="why-features">
                {[
                  { icon: Shield, label: 'Secure Payments', desc: 'Razorpay secured. UPI, cards & more.' },
                  { icon: Clock,  label: 'Instant Confirmation', desc: 'QR ticket in seconds on email & SMS.' },
                  { icon: Award, label: 'Premium Spots', desc: 'Handpicked, verified, top-rated spots.' },
                  { icon: TrendingUp, label: 'Best Price Guarantee', desc: 'No hidden fees. What you see is final.' },
                ].map(f => (
                  <div key={f.label} className="why-feature">
                    <div className="why-feature__icon">
                      <f.icon size={20} />
                    </div>
                    <div>
                      <div className="why-feature__label">{f.label}</div>
                      <div className="why-feature__desc">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/about" className="btn btn-primary btn-lg" id="learn-more-btn">
                Learn More <ArrowRight size={18} />
              </Link>
            </div>
            <div className="why-visual">
              <div className="why-img-stack">
                <img
                  src="https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=500&q=80"
                  alt="Happy family picnic"
                  className="why-img why-img--main"
                />
                <img
                  src="https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=300&q=80"
                  alt="Picnic zone"
                  className="why-img why-img--secondary"
                  style={{ border: '4px solid var(--cream)' }}
                />
                <div className="why-badge glass-dark">
                  <Star size={16} fill="var(--gold)" color="var(--gold)" />
                  <span>4.9 · 15,000+ Reviews</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section testimonials-section">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Happy Families</span>
            <h2 className="section-title">What Our <span className="text-gradient">Guests Say</span></h2>
          </div>
          <div className="testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                className="testimonial-card card"
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <div className="testimonial-card__stars">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} fill="var(--gold)" color="var(--gold)" />
                  ))}
                </div>
                <p className="testimonial-card__comment">"{t.comment}"</p>
                <div className="testimonial-card__author">
                  <img src={t.avatar} alt={t.name} className="testimonial-card__avatar" />
                  <div>
                    <div className="testimonial-card__name">{t.name}</div>
                    <div className="testimonial-card__loc">{t.location} · {t.spot}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY PREVIEW */}
      <section className="section-sm gallery-preview-section">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Our Gallery</span>
            <h2 className="section-title">Moments of <span className="text-gradient-green">Pure Joy</span></h2>
          </div>
          <div className="gallery-preview-grid">
            {[
              'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80',
              'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&q=80',
              'https://images.unsplash.com/photo-1502472584811-0a2f2feb8968?w=400&q=80',
              'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
              'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80',
              'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80',
            ].map((src, i) => (
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
              View Full Gallery <ArrowRight size={18} />
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