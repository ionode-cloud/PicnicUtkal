import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  LuEye as Eye, LuCompass as Compass, LuBookOpen as BookOpen, LuImage as Image, LuMail as Mail,
  LuSave as Save, LuPlus as Plus, LuTrash2 as Trash2, LuSquarePen as Edit3, LuCheck as Check,
  LuSparkles as Sparkles, LuPhone as Phone, LuMapPin as MapPin, LuClock as Clock, LuGlobe as Globe,
  LuRefreshCw as RefreshCw, LuHeart as Heart, LuStar as Star, LuShieldCheck as ShieldCheck,
  LuLayers as Layers, LuWifi as Wifi, LuWifiOff as WifiOff, LuUpload as Upload, LuLink as LinkIcon,
  LuLeaf as Leaf
} from 'react-icons/lu'
import toast from 'react-hot-toast'
import { useSocket } from '../../context/SocketContext'
import { useLogo } from '../../context/LogoContext'
import { buildApiUrl } from '../../services/api'

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

const DEFAULT_CONFIG = {
  home: {
    // Hero Banner Section
    eyebrowText: "🌿 Welcome to Odisha's Nature Paradise",
    heroTitleLine1: "Find Your Perfect",
    heroTitleLine2: "Picnic Escape",
    heroTitleLine3: "in Odisha",
    heroSubtitle: "Discover 50+ premium picnic zones with swimming, BBQ, camping, adventure & more. Book instantly and arrive to a perfectly arranged picnic.",
    ctaText: "Explore Spots Now",
    announcement: "🔥 Monsoon Special: Get 20% OFF on all Forest Gazebo bookings this weekend!",
    heroImages: [
      'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=85',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=85',
      'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=1920&q=85',
      'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1920&q=85'
    ],

    // Why PicnicUtkal Section
    whyEyebrow: "Why PicnicUtkal?",
    whyTitleLine1: "The Smartest Way to",
    whyTitleLine2: "Plan a Picnic",
    whySubtitle: "We handle everything — from booking your zone to arranging food, decorations, and parking. Just show up and enjoy.",
    whyFeatures: [
      { label: 'Secure Payments', desc: 'Razorpay secured. UPI, cards & more.' },
      { label: 'Instant Confirmation', desc: 'QR ticket in seconds on email & SMS.' },
      { label: 'Premium Spots', desc: 'Handpicked, verified, top-rated spots.' },
      { label: 'Best Price Guarantee', desc: 'No hidden fees. What you see is final.' }
    ],
    whyImgMain: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=500&q=80',
    whyImgSecondary: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=300&q=80',

    // Spots Section
    spotsEyebrow: "Handpicked Locations",
    spotsTitle: "Picnic Spots",
    spotsSubtitle: "Discover top-rated spots across Odisha with instant online booking",

    // Zones Section
    zonesEyebrow: "Activity Zones",
    zonesTitle: "Explore Picnic Zones",
    zonesSubtitle: "Pick your style of outdoor fun",

    // Testimonials / Reviews Section
    reviewsEyebrow: "Happy Families",
    reviewsTitle: "What Our Guests Say",
    testimonials: [
      {
        name: 'Priya Mohanty', location: 'Bhubaneswar', rating: 5,
        comment: 'Amazing experience at Nandankanan! The booking was super smooth, got a QR ticket instantly. The swimming zone was clean and well-maintained. Highly recommend PicnicUtkal!',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
        spot: 'Nandankanan Sanctuary'
      },
      {
        name: 'Rajesh Kumar', location: 'Cuttack', rating: 5,
        comment: 'We booked the BBQ zone for our family reunion. The food pre-order feature is genius — everything was ready when we arrived! Will definitely book again.',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh',
        spot: 'Chilika Lake Resort'
      },
      {
        name: 'Sunita Dash', location: 'Puri', rating: 5,
        comment: 'Daringbadi camping was a dream! PicnicUtkal made it so easy to book tents, arrange a bonfire, and get a guide. The landscape was absolutely gorgeous.',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sunita',
        spot: 'Daringbadi Hill Station'
      }
    ],

    // Gallery Preview Section
    galleryPreviewEyebrow: "Our Gallery",
    galleryPreviewTitle: "Moments of Pure Joy",
    galleryPreviewBtnText: "View Full Gallery",
    galleryPreviewImages: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80',
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&q=80',
      'https://images.unsplash.com/photo-1502472584811-0a2f2feb8968?w=400&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80',
      'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80'
    ],

    stat1: "50+ Curated Spots",
    stat2: "12,000+ Happy Picnickers",
    stat3: "4.9/5 Rating"
  },
  about: {
    title: "Pioneering Premium Eco-Tourism & Picnic Experiences in Odisha",
    subtitle: "Connecting nature lovers with handcrafted, secure, and serene picnic sanctuaries across Odisha's rivers, forests, and hills.",
    mission: "To empower families, corporate groups, and travelers to reconnect with nature through sustainable, frictionless, and memorable picnic experiences.",
    features: [
      "100% Verified Private & Eco-Friendly Locations",
      "24/7 On-Site Security & Clean Drinking Water",
      "Pre-booked Private Cooking & Catering Units",
      "Instant E-Pass & Invoice Generation"
    ],
    featureCards: [
      { icon: '🌿', title: 'Nature Preservation', desc: 'We promote plastic-free, low-impact tourist habits. Part of our booking revenue is donated to local wildlife conservation initiatives.' },
      { icon: '🏄', title: 'Curated Adventures', desc: 'From water slides to ziplines, our adventure zones are certified by international safety agencies to guarantee safety first.' },
      { icon: '🏡', title: 'Premium Hospitality', desc: 'Pre-ordered hot meals, clean restrooms, CCTV-monitored zones, and on-site local guides make planning stress-free.' }
    ],
    partnerships: [
      '🌲 Odisha Tourism',
      '🐯 Eco-Development Committees',
      '🤝 Local Forest Communities'
    ]
  },
  gallery: [
    { id: 1, src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', title: 'Forest Camping Retreat', category: 'Camping' },
    { id: 2, src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80', title: 'Chandaka Nature Walk Trail', category: 'Nature' },
    { id: 3, src: 'https://images.unsplash.com/photo-1502472584811-0a2f2feb8968?w=800&q=80', title: 'Mahanadi River Swimming Deck', category: 'Riverside' },
    { id: 4, src: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80', title: 'Chilika Dolphin Boating Sanctuary', category: 'Boating' },
    { id: 5, src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', title: 'Barunei Hill Trekking & Picnic', category: 'Adventure' },
    { id: 6, src: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80', title: 'Mayurbhanj Similipal Eco Safari', category: 'Wildlife' }
  ],
  contact: {
    email: "support@picnicutkal.com",
    phone: "+91 98765 43210",
    emergencyPhone: "+91 94370 12345",
    address: "Plot 42, Eco Park Road, Chandaka Forest Sanctuary, Bhubaneswar, Odisha 751024",
    hours: "Monday - Sunday: 7:00 AM - 9:00 PM IST",
    mapEmbedUrl: "https://maps.google.com/?q=Bhubaneswar+Odisha"
  },
  footer: {
    tagline: "Odisha's Premier Picnic Destination. Discover breathtaking nature spots, book your perfect picnic zone, and create unforgettable memories.",
    phone: "+91 98765 43210",
    email: "hello@picnicutkal.com",
    address: "Bhubaneswar, Odisha 751001",
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    youtube: "https://youtube.com",
    twitter: "https://twitter.com",
    copyright: `© ${new Date().getFullYear()} PicnicUtkal. All rights reserved. Made with 💚 in Odisha.`,
    quickLinksTitle: "Quick Links",
    quickLinks: [
      { label: 'Home', href: '/' },
      { label: 'Picnic Spots', href: '/spots' },
      { label: 'Live Map', href: '/map' },
      { label: 'Gallery', href: '/gallery' },
      { label: 'About Us', href: '/about' }
    ],
    zonesTitle: "Activity Zones",
    zonesLinks: [
      { label: '🏊 Swimming Zone', href: '/spots?zone=swimming' },
      { label: '🎵 Music Zone', href: '/spots?zone=music' },
      { label: '🏕 Camping Zone', href: '/spots?zone=camping' },
      { label: '🎯 Adventure Zone', href: '/spots?zone=adventure' },
      { label: '👨‍👩‍👧 Family Zone', href: '/spots?zone=family' }
    ],
    supportTitle: "Support",
    supportLinks: [
      { label: 'How to Book', href: '/about' },
      { label: 'Cancellation Policy', href: '/cancel-policy' },
      { label: 'Refund Policy', href: '/refund-policy' },
      { label: 'Contact Support', href: '/contact' }
    ]
  }
}

export default function UserViewMgmt({ defaultTab = 'home' }) {
  const location = useLocation()
  
  // Determine active tab from URL path (e.g. /admin/user-view/home -> home)
  const getActiveSubTab = () => {
    if (location.pathname.includes('/user-view/about')) return 'about'
    if (location.pathname.includes('/user-view/gallery')) return 'gallery'
    if (location.pathname.includes('/user-view/contact')) return 'contact'
    if (location.pathname.includes('/user-view/logo')) return 'logo'
    if (location.pathname.includes('/user-view/footer')) return 'footer'
    return 'home'
  }

  const activeTab = getActiveSubTab()

  // Logo management state
  const { logoConfig, updateLogo } = useLogo()
  const [logoForm, setLogoForm] = useState(logoConfig)

  useEffect(() => {
    setLogoForm(logoConfig)
  }, [logoConfig])

  const handleSaveLogo = (e) => {
    e?.preventDefault()
    updateLogo(logoForm)
    toast.success('✅ Site Logo updated & broadcasted live across the website!')
  }

  const handleLogoFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit')
      return
    }
    const reader = new FileReader()
    reader.onload = (evt) => {
      const dataUrl = evt.target.result
      const updated = { ...logoForm, type: 'image', url: dataUrl }
      setLogoForm(updated)
      updateLogo(updated)
      toast.success('✅ Local logo uploaded & applied live!')
    }
    reader.readAsDataURL(file)
  }

  // Socket.io real-time
  const { isConnected, emitHomeConfigUpdate, emitAboutConfigUpdate, emitGalleryConfigUpdate, emitContactConfigUpdate, emitFooterConfigUpdate } = useSocket()

  // Config state (persisted in MongoDB database)
  const [config, setConfig] = useState(DEFAULT_CONFIG)

  // Home Form state
  const [homeData, setHomeData] = useState(config.home || DEFAULT_CONFIG.home)
  const [newHeroImgUrl, setNewHeroImgUrl] = useState('')
  const [heroImgInputMode, setHeroImgInputMode] = useState('url') // 'url' | 'file'
  const [whyMainImgInputMode, setWhyMainImgInputMode] = useState('file') // 'file' | 'url'
  const [whySecImgInputMode, setWhySecImgInputMode] = useState('file')   // 'file' | 'url'

  const handleWhyMainImgFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be under 5MB!')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setHomeData(p => ({ ...p, whyImgMain: reader.result }))
        toast.success('Local image selected for Why Section (Main)!')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleWhySecImgFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be under 5MB!')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setHomeData(p => ({ ...p, whyImgSecondary: reader.result }))
        toast.success('Local image selected for Why Section (Secondary)!')
      }
      reader.readAsDataURL(file)
    }
  }

  // About Form state
  const [aboutData, setAboutData] = useState(config.about || DEFAULT_CONFIG.about)
  const [newFeatureText, setNewFeatureText] = useState('')
  const [aboutImgInputMode, setAboutImgInputMode] = useState('file') // 'file' | 'url'

  const handleAboutHeroFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be under 5MB!')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setAboutData(p => ({ ...p, heroImage: reader.result }))
        toast.success('Local image selected for About Page!')
      }
      reader.readAsDataURL(file)
    }
  }

  // Gallery Form state
  const [galleryItems, setGalleryItems] = useState(config.gallery || DEFAULT_CONFIG.gallery)
  const [showAddForm, setShowAddForm] = useState(false)
  const [imgInputType, setImgInputType] = useState('url') // 'url' | 'file'
  const [newImgSrc, setNewImgSrc] = useState('')
  const [newImgTitle, setNewImgTitle] = useState('')

  // Contact Form state
  const [contactData, setContactData] = useState(config.contact || DEFAULT_CONFIG.contact)

  // Footer Form state
  const [footerData, setFooterData] = useState(config.footer || DEFAULT_CONFIG.footer)

  // Save config persistently to MongoDB database
  const saveConfigToDb = async (updatedConfig) => {
    try {
      await fetch(buildApiUrl('/api/site-config/user_view_config'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: updatedConfig })
      })
    } catch (e) {}
  }

  // Load config from MongoDB database on mount and clean up any bloated localStorage
  useEffect(() => {
    try {
      localStorage.removeItem('picnicutkal_user_view_config')
    } catch (e) {}

    fetch(buildApiUrl('/api/site-config/user_view_config'))
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d && d.success && d.data) {
          setConfig(prev => ({ ...prev, ...d.data }))
          if (d.data.home) setHomeData(d.data.home)
          if (d.data.about) setAboutData(d.data.about)
          if (d.data.gallery) setGalleryItems(d.data.gallery)
          if (d.data.contact) setContactData(d.data.contact)
          if (d.data.footer) setFooterData(d.data.footer)
        }
      })
      .catch(() => {})
  }, [])

  const handleSaveFooter = (e) => {
    e.preventDefault()
    const updated = { ...config, footer: footerData }
    setConfig(updated)
    saveConfigToDb(updated)
    emitFooterConfigUpdate(footerData)
    toast.success('✅ Footer details saved & persisted to database!')
  }

  // Save Home Tab Content
  const handleSaveHome = (e) => {
    e.preventDefault()
    const updated = { ...config, home: homeData }
    setConfig(updated)
    saveConfigToDb(updated)
    emitHomeConfigUpdate(homeData)
    toast.success('✅ Home page content saved & persisted to database!')
  }

  // Hero Banner Images handlers
  const handleAddHeroImage = () => {
    if (!newHeroImgUrl.trim()) return
    setHomeData(prev => ({
      ...prev,
      heroImages: [...(prev.heroImages || []), newHeroImgUrl.trim()]
    }))
    setNewHeroImgUrl('')
    toast.success('Hero slider background image added!')
  }

  const handleAddHeroLocalFile = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const remaining = 10 - (homeData.heroImages?.length || 0)
    if (remaining <= 0) {
      toast.error('Maximum 10 hero slider images allowed.')
      return
    }
    const toLoad = files.slice(0, remaining)
    let loaded = 0
    toLoad.forEach(file => {
      if (file.size > 8 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 8MB limit.`)
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setHomeData(prev => ({
          ...prev,
          heroImages: [...(prev.heroImages || []), reader.result]
        }))
        loaded++
        if (loaded === toLoad.length) toast.success(`${loaded} hero image(s) added!`)
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const handleRemoveHeroImage = (idx) => {
    setHomeData(prev => ({
      ...prev,
      heroImages: prev.heroImages.filter((_, i) => i !== idx)
    }))
    toast.success('Hero image removed')
  }

  // Why Feature Card edit handler
  const handleUpdateWhyFeature = (idx, field, val) => {
    setHomeData(prev => {
      const updated = [...(prev.whyFeatures || DEFAULT_CONFIG.home.whyFeatures)]
      updated[idx] = { ...updated[idx], [field]: val }
      return { ...prev, whyFeatures: updated }
    })
  }

  // Save About Tab Content
  const handleSaveAbout = (e) => {
    e.preventDefault()
    const updated = { ...config, about: aboutData }
    setConfig(updated)
    saveConfigToDb(updated)
    emitAboutConfigUpdate(aboutData)
    toast.success('✅ About page content saved & persisted to database!')
  }

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return
    setAboutData(prev => ({ ...prev, features: [...prev.features, newFeatureText.trim()] }))
    setNewFeatureText('')
    toast.success('Highlight feature added')
  }

  const handleRemoveFeature = (idx) => {
    setAboutData(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== idx) }))
    toast.success('Feature removed')
  }

  // Handle Local Image File Upload
  const handleLocalFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be under 5MB!')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewImgSrc(reader.result)
        toast.success('Local photo selected!')
      }
      reader.readAsDataURL(file)
    }
  }

  // Save Gallery Tab Item
  const handleAddGalleryItem = (e) => {
    e.preventDefault()
    if (!newImgSrc || !newImgTitle.trim()) {
      toast.error('Image and Photo Title are required!')
      return
    }
    const newItem = {
      id: Date.now(),
      src: newImgSrc,
      title: newImgTitle.trim()
    }
    const updatedGallery = [newItem, ...galleryItems]
    setGalleryItems(updatedGallery)
    const updatedConfig = { ...config, gallery: updatedGallery }
    setConfig(updatedConfig)
    saveConfigToDb(updatedConfig)
    emitGalleryConfigUpdate(updatedGallery)
    setNewImgSrc('')
    setNewImgTitle('')
    toast.success('✅ Gallery photo added & persisted to database!')
  }

  const handleDeleteGalleryItem = (id, title) => {
    if (window.confirm(`Delete photo "${title}" from Gallery?`)) {
      const updatedGallery = galleryItems.filter(item => item.id !== id)
      setGalleryItems(updatedGallery)
      const updatedConfig = { ...config, gallery: updatedGallery }
      setConfig(updatedConfig)
      saveConfigToDb(updatedConfig)
      emitGalleryConfigUpdate(updatedGallery)
      toast.success('✅ Gallery photo removed & persisted to database!')
    }
  }

  // Save Contact Tab Content
  const handleSaveContact = (e) => {
    e.preventDefault()
    const updated = { ...config, contact: contactData }
    setConfig(updated)
    saveConfigToDb(updated)
    emitContactConfigUpdate(contactData)
    toast.success('✅ Contact details saved & persisted to database!')
  }

  return (
    <div className="admin-dashboard-container animate-fade-in" style={{ padding: '0px 24px 48px' }}>
      {/* Submenu Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', overflowX: 'auto' }}>
        <Link
          to="/admin/user-view/home"
          className={`btn ${activeTab === 'home' ? 'btn-gold' : 'btn-ghost'}`}
          style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: 'var(--radius-md)' }}
        >
          <Compass size={16} /> Home Tab
        </Link>
        <Link
          to="/admin/user-view/about"
          className={`btn ${activeTab === 'about' ? 'btn-gold' : 'btn-ghost'}`}
          style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: 'var(--radius-md)' }}
        >
          <BookOpen size={16} /> About Tab
        </Link>
        <Link
          to="/admin/user-view/gallery"
          className={`btn ${activeTab === 'gallery' ? 'btn-gold' : 'btn-ghost'}`}
          style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: 'var(--radius-md)' }}
        >
          <Image size={16} /> Gallery Tab ({galleryItems.length})
        </Link>
        <Link
          to="/admin/user-view/contact"
          className={`btn ${activeTab === 'contact' ? 'btn-gold' : 'btn-ghost'}`}
          style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: 'var(--radius-md)' }}
        >
          <Mail size={16} /> Contact Tab
        </Link>
        <Link
          to="/admin/user-view/logo"
          className={`btn ${activeTab === 'logo' ? 'btn-gold' : 'btn-ghost'}`}
          style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: 'var(--radius-md)' }}
        >
          <Sparkles size={16} /> Logo Manage
        </Link>
        <Link
          to="/admin/user-view/footer"
          className={`btn ${activeTab === 'footer' ? 'btn-gold' : 'btn-ghost'}`}
          style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: 'var(--radius-md)' }}
        >
          <Layers size={16} /> Footer Manage
        </Link>
      </div>

      {/* TAB CONTENT PANELS */}
      <div style={{ marginTop: '24px' }}>

        {/* 1. HOME TAB FORM */}
        {activeTab === 'home' && (
          <form onSubmit={handleSaveHome} style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
            
            {/* SECTION 1: HERO & BANNER SLIDER CONTENT */}
            <div className="card glass-card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '14px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(201,168,76,0.15)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Compass size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700 }}>1. Hero Banner Headline & Slider Images</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Modify main hero text, title lines, and background slider images</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Top Eyebrow */}
                <div className="input-wrapper">
                  <label className="input-label">Top Eyebrow Badge Text</label>
                  <input
                    type="text"
                    className="input"
                    value={homeData.eyebrowText || ''}
                    onChange={e => setHomeData(p => ({ ...p, eyebrowText: e.target.value }))}
                  />
                </div>

                {/* Hero Title Lines (Find Your Perfect / Picnic Escape / in Odisha) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                  <div className="input-wrapper">
                    <label className="input-label">Title Line 1</label>
                    <input
                      type="text"
                      className="input"
                      value={homeData.heroTitleLine1 || 'Find Your Perfect'}
                      onChange={e => setHomeData(p => ({ ...p, heroTitleLine1: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="input-wrapper">
                    <label className="input-label" style={{ color: 'var(--gold)' }}>Title Line 2 (Gradient Highlight)</label>
                    <input
                      type="text"
                      className="input"
                      value={homeData.heroTitleLine2 || 'Picnic Escape'}
                      onChange={e => setHomeData(p => ({ ...p, heroTitleLine2: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="input-wrapper">
                    <label className="input-label">Title Line 3</label>
                    <input
                      type="text"
                      className="input"
                      value={homeData.heroTitleLine3 || 'in Odisha'}
                      onChange={e => setHomeData(p => ({ ...p, heroTitleLine3: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {/* Hero Subtitle */}
                <div className="input-wrapper">
                  <label className="input-label">Hero Subtitle / Description</label>
                  <textarea
                    className="input"
                    rows={3}
                    value={homeData.heroSubtitle || ''}
                    onChange={e => setHomeData(p => ({ ...p, heroSubtitle: e.target.value }))}
                    required
                  />
                </div>

                {/* Banner Background Images Slider List */}
                <div className="input-wrapper">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <label className="input-label" style={{ marginBottom: 0 }}>
                      Hero Background Slider Images
                      <span style={{ marginLeft: '8px', color: 'var(--text-muted)', fontWeight: 400 }}>
                        ({homeData.heroImages?.length || 0} / 10)
                      </span>
                    </label>
                    {/* Toggle: URL vs Local File */}
                    <div style={{ display: 'flex', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                      <button
                        type="button"
                        onClick={() => setHeroImgInputMode('url')}
                        style={{
                          padding: '5px 14px', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer',
                          background: heroImgInputMode === 'url' ? 'var(--gold)' : 'transparent',
                          color: heroImgInputMode === 'url' ? '#000' : 'var(--text-muted)'
                        }}
                      >
                        <LinkIcon size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setHeroImgInputMode('file')}
                        style={{
                          padding: '5px 14px', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer',
                          background: heroImgInputMode === 'file' ? 'var(--gold)' : 'transparent',
                          color: heroImgInputMode === 'file' ? '#000' : 'var(--text-muted)'
                        }}
                      >
                        <Upload size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />Local
                      </button>
                    </div>
                  </div>

                  {/* Existing images grid */}
                  {homeData.heroImages?.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', marginBottom: '14px' }}>
                      {homeData.heroImages.map((imgSrc, idx) => (
                        <div key={idx} style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                          <img src={resolvePlotImage(imgSrc)} alt={`Slider ${idx + 1}`} style={{ width: '100%', height: '80px', objectFit: 'cover', display: 'block' }} />
                          <div style={{ position: 'absolute', top: '4px', left: '4px', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                            #{idx + 1}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveHeroImage(idx)}
                            style={{ position: 'absolute', top: '4px', right: '4px', width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(239,68,68,0.85)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Trash2 size={11} />
                          </button>
                          <div style={{ padding: '5px 6px', background: 'var(--bg-card)', fontSize: '10px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {imgSrc.startsWith('data:') ? '📁 Local file' : imgSrc.split('/').pop()?.split('?')[0] || 'image'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* URL Input Mode */}
                  {heroImgInputMode === 'url' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="url"
                        className="input"
                        placeholder="Paste image URL (https://...)..."
                        value={newHeroImgUrl}
                        onChange={e => setNewHeroImgUrl(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddHeroImage())}
                      />
                      <button type="button" onClick={handleAddHeroImage} className="btn btn-outline" style={{ whiteSpace: 'nowrap' }}>
                        <Plus size={16} /> Add
                      </button>
                    </div>
                  )}

                  {/* Local File Upload Mode */}
                  {heroImgInputMode === 'file' && (
                    <label
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        gap: '8px', padding: '22px', border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-primary)', cursor: 'pointer', transition: 'border-color 0.2s'
                      }}
                      onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--gold)' }}
                      onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
                      onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--border)'; handleAddHeroLocalFile({ target: { files: e.dataTransfer.files, value: '' } }) }}
                    >
                      <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleAddHeroLocalFile} />
                      <Upload size={28} color="var(--gold)" />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Click or drag &amp; drop images here</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>JPG, PNG, WEBP · max 8MB each · up to 10 total</span>
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 2: WHY PICNICUTKAL SECTION (TEXT, IMAGES & CARDS) */}
            <div className="card glass-card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '14px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(201,168,76,0.15)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700 }}>2. "Why PicnicUtkal?" Section Content, Images & Feature Cards</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Modify titles, description, feature cards, stacked photos, and review badge</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Section Eyebrow */}
                <div className="input-wrapper">
                  <label className="input-label">Section Eyebrow</label>
                  <input
                    type="text"
                    className="input"
                    value={homeData.whyEyebrow || 'Why PicnicUtkal?'}
                    onChange={e => setHomeData(p => ({ ...p, whyEyebrow: e.target.value }))}
                  />
                </div>

                {/* Section Main Title Line 1 & Line 2 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                  <div className="input-wrapper">
                    <label className="input-label">Main Title Line 1</label>
                    <input
                      type="text"
                      className="input"
                      value={homeData.whyTitleLine1 || 'The Smartest Way to'}
                      onChange={e => setHomeData(p => ({ ...p, whyTitleLine1: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="input-wrapper">
                    <label className="input-label" style={{ color: 'var(--light-green)' }}>Main Title Line 2 (Green Highlight)</label>
                    <input
                      type="text"
                      className="input"
                      value={homeData.whyTitleLine2 || 'Plan a Picnic'}
                      onChange={e => setHomeData(p => ({ ...p, whyTitleLine2: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {/* Section Subtitle / Description */}
                <div className="input-wrapper">
                  <label className="input-label">Section Description / Subtitle</label>
                  <textarea
                    className="input"
                    rows={2}
                    value={homeData.whySubtitle || 'We handle everything — from booking your zone to arranging food, decorations, and parking. Just show up and enjoy.'}
                    onChange={e => setHomeData(p => ({ ...p, whySubtitle: e.target.value }))}
                  />
                </div>

                {/* 4 Feature Cards (Why Choose Us) */}
                <div className="input-wrapper">
                  <label className="input-label" style={{ fontWeight: 700, color: 'var(--gold)', marginBottom: '12px', display: 'block' }}>
                    Feature Cards (4 Key Benefits):
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                    {(homeData.whyFeatures || DEFAULT_CONFIG.home.whyFeatures).map((feat, idx) => (
                      <div key={idx} style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                        <label className="input-label" style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 700 }}>Feature #{idx + 1} Title</label>
                        <input
                          type="text"
                          className="input"
                          style={{ marginBottom: '8px' }}
                          value={feat.label}
                          onChange={e => {
                            const updated = [...(homeData.whyFeatures || DEFAULT_CONFIG.home.whyFeatures)]
                            updated[idx] = { ...updated[idx], label: e.target.value }
                            setHomeData(p => ({ ...p, whyFeatures: updated }))
                          }}
                        />
                        <label className="input-label" style={{ fontSize: '11px' }}>Feature #{idx + 1} Description</label>
                        <input
                          type="text"
                          className="input"
                          value={feat.desc}
                          onChange={e => {
                            const updated = [...(homeData.whyFeatures || DEFAULT_CONFIG.home.whyFeatures)]
                            updated[idx] = { ...updated[idx], desc: e.target.value }
                            setHomeData(p => ({ ...p, whyFeatures: updated }))
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section Images */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '8px' }}>
                  <label className="input-label" style={{ fontWeight: 700, color: 'var(--gold)', marginBottom: '12px', display: 'block' }}>
                    Section Photos:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    {/* Main Image (Large Left Photo) */}
                    <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <label className="input-label" style={{ fontWeight: 700, color: 'var(--gold)', margin: 0, fontSize: '12px' }}>
                          Main Image (Large Left Photo)
                        </label>
                        <div style={{ display: 'flex', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                          <button
                            type="button"
                            onClick={() => setWhyMainImgInputMode('file')}
                            className={`btn ${whyMainImgInputMode === 'file' ? 'btn-gold' : 'btn-ghost'}`}
                            style={{ padding: '4px 10px', fontSize: '11px' }}
                          >
                            <Upload size={12} style={{ marginRight: '4px' }} /> Local File
                          </button>
                          <button
                            type="button"
                            onClick={() => setWhyMainImgInputMode('url')}
                            className={`btn ${whyMainImgInputMode === 'url' ? 'btn-gold' : 'btn-ghost'}`}
                            style={{ padding: '4px 10px', fontSize: '11px' }}
                          >
                            <LinkIcon size={12} style={{ marginRight: '4px' }} /> Image URL
                          </button>
                        </div>
                      </div>

                      {whyMainImgInputMode === 'file' ? (
                        <div>
                          <label className="input-label" style={{ fontSize: '11px', marginBottom: '4px' }}>Upload Local Photo:</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleWhyMainImgFileUpload}
                            className="input"
                            style={{ width: '100%', padding: '6px 10px' }}
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="input-label" style={{ fontSize: '11px', marginBottom: '4px' }}>Web Image URL:</label>
                          <input
                            type="url"
                            className="input"
                            placeholder="https://images.unsplash.com/..."
                            value={homeData.whyImgMain || ''}
                            onChange={e => setHomeData(p => ({ ...p, whyImgMain: e.target.value }))}
                            style={{ width: '100%' }}
                          />
                        </div>
                      )}

                      {homeData.whyImgMain && (
                        <div>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Preview:</span>
                          <img
                            src={homeData.whyImgMain}
                            alt="Why Main Preview"
                            style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                            onError={e => { e.target.style.display = 'none' }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Secondary Image (Small Right Photo) */}
                    <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <label className="input-label" style={{ fontWeight: 700, color: 'var(--gold)', margin: 0, fontSize: '12px' }}>
                          Secondary Image (Small Right Photo)
                        </label>
                        <div style={{ display: 'flex', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                          <button
                            type="button"
                            onClick={() => setWhySecImgInputMode('file')}
                            className={`btn ${whySecImgInputMode === 'file' ? 'btn-gold' : 'btn-ghost'}`}
                            style={{ padding: '4px 10px', fontSize: '11px' }}
                          >
                            <Upload size={12} style={{ marginRight: '4px' }} /> Local File
                          </button>
                          <button
                            type="button"
                            onClick={() => setWhySecImgInputMode('url')}
                            className={`btn ${whySecImgInputMode === 'url' ? 'btn-gold' : 'btn-ghost'}`}
                            style={{ padding: '4px 10px', fontSize: '11px' }}
                          >
                            <LinkIcon size={12} style={{ marginRight: '4px' }} /> Image URL
                          </button>
                        </div>
                      </div>

                      {whySecImgInputMode === 'file' ? (
                        <div>
                          <label className="input-label" style={{ fontSize: '11px', marginBottom: '4px' }}>Upload Local Photo:</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleWhySecImgFileUpload}
                            className="input"
                            style={{ width: '100%', padding: '6px 10px' }}
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="input-label" style={{ fontSize: '11px', marginBottom: '4px' }}>Web Image URL:</label>
                          <input
                            type="url"
                            className="input"
                            placeholder="https://images.unsplash.com/..."
                            value={homeData.whyImgSecondary || ''}
                            onChange={e => setHomeData(p => ({ ...p, whyImgSecondary: e.target.value }))}
                            style={{ width: '100%' }}
                          />
                        </div>
                      )}

                      {homeData.whyImgSecondary && (
                        <div>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Preview:</span>
                          <img
                            src={homeData.whyImgSecondary}
                            alt="Why Secondary Preview"
                            style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                            onError={e => { e.target.style.display = 'none' }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SAVE BUTTON */}
            <button type="submit" className="btn btn-gold btn-lg w-full" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Save size={20} /> Save All Home Page Content
            </button>
          </form>
        )}

        {/* 2. ABOUT TAB FORM */}
        {activeTab === 'about' && (
          <div className="card glass-card" style={{ padding: '28px', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '14px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(201,168,76,0.15)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>About Page Content</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Modify story image, subtitle summary, mission statement, and core highlights</p>
              </div>
            </div>

            <form onSubmit={handleSaveAbout} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="input-wrapper">
                <label className="input-label">About Page Title</label>
                <input
                  type="text"
                  className="input"
                  value={aboutData.title}
                  onChange={e => setAboutData(p => ({ ...p, title: e.target.value }))}
                  required
                />
              </div>

              {/* About Page Hero / Story Image */}
              <div style={{ padding: '18px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label className="input-label" style={{ fontWeight: 700, color: 'var(--gold)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Image size={16} /> About Page Story Image
                  </label>
                  {/* Mode Toggle: Local File vs URL */}
                  <div style={{ display: 'flex', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    <button
                      type="button"
                      onClick={() => setAboutImgInputMode('file')}
                      className={`btn ${aboutImgInputMode === 'file' ? 'btn-gold' : 'btn-ghost'}`}
                      style={{ padding: '4px 12px', fontSize: '12px' }}
                    >
                      <Upload size={13} style={{ marginRight: '4px' }} /> Local File
                    </button>
                    <button
                      type="button"
                      onClick={() => setAboutImgInputMode('url')}
                      className={`btn ${aboutImgInputMode === 'url' ? 'btn-gold' : 'btn-ghost'}`}
                      style={{ padding: '4px 12px', fontSize: '12px' }}
                    >
                      <LinkIcon size={13} style={{ marginRight: '4px' }} /> Image URL
                    </button>
                  </div>
                </div>

                {aboutImgInputMode === 'file' ? (
                  <div>
                    <label className="input-label" style={{ fontSize: '12px', marginBottom: '6px' }}>Upload Image from Computer:</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAboutHeroFileUpload}
                      className="input"
                      style={{ width: '100%', padding: '8px 12px' }}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="input-label" style={{ fontSize: '12px', marginBottom: '6px' }}>Image Web URL:</label>
                    <input
                      type="url"
                      className="input"
                      placeholder="https://images.unsplash.com/..."
                      value={aboutData.heroImage || ''}
                      onChange={e => setAboutData(p => ({ ...p, heroImage: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px' }}
                    />
                  </div>
                )}

                {/* Preview Thumbnail */}
                {aboutData.heroImage && (
                  <div style={{ marginTop: '4px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Image Preview:</span>
                    <img
                      src={aboutData.heroImage}
                      alt="About hero preview"
                      style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                      onError={e => { e.target.style.display = 'none' }}
                    />
                  </div>
                )}
              </div>

              <div className="input-wrapper">
                <label className="input-label">Subtitle Summary</label>
                <textarea
                  className="input"
                  rows={3}
                  value={aboutData.subtitle || ''}
                  onChange={e => setAboutData(p => ({ ...p, subtitle: e.target.value }))}
                  placeholder="Connecting nature lovers with handcrafted, secure, and serene picnic sanctuaries..."
                />
              </div>

              <div className="input-wrapper">
                <label className="input-label">Our Mission Statement</label>
                <textarea
                  className="input"
                  rows={4}
                  value={aboutData.mission || ''}
                  onChange={e => setAboutData(p => ({ ...p, mission: e.target.value }))}
                  placeholder="To empower families, corporate groups, and travelers to reconnect with nature..."
                  required
                />
              </div>

              {/* Highlights Bullet List */}
              <div className="input-wrapper">
                <label className="input-label">Key Highlights / Features</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                  {aboutData.features?.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>• {feat}</span>
                      <button type="button" onClick={() => handleRemoveFeature(idx)} className="btn btn-ghost btn-xs" style={{ color: 'var(--error)' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="input"
                    placeholder="Add new highlight bullet..."
                    value={newFeatureText}
                    onChange={e => setNewFeatureText(e.target.value)}
                  />
                  <button type="button" onClick={handleAddFeature} className="btn btn-outline" style={{ whiteSpace: 'nowrap' }}>
                    <Plus size={16} /> Add Bullet
                  </button>
                </div>
              </div>

              {/* Feature Cards Section */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div>
                    <label className="input-label" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Feature Cards (About Page)</label>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Nature Preservation · Curated Adventures · Premium Hospitality</p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    onClick={() => setAboutData(p => ({ ...p, featureCards: [...(p.featureCards || []), { icon: '✨', title: '', desc: '' }] }))}
                  >
                    <Plus size={14} /> Add Card
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                  {(aboutData.featureCards || DEFAULT_CONFIG.about.featureCards).map((card, idx) => (
                    <div key={idx} style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gold)' }}>Card #{idx + 1}</span>
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          style={{ color: 'var(--error)' }}
                          onClick={() => setAboutData(p => ({ ...p, featureCards: (p.featureCards || []).filter((_, i) => i !== idx) }))}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '72px 1fr', gap: '10px', marginBottom: '10px' }}>
                        <div className="input-wrapper">
                          <label className="input-label">Icon/Emoji</label>
                          <input
                            type="text"
                            className="input"
                            value={card.icon || ''}
                            onChange={e => {
                              const cards = [...(aboutData.featureCards || DEFAULT_CONFIG.about.featureCards)]
                              cards[idx] = { ...cards[idx], icon: e.target.value }
                              setAboutData(p => ({ ...p, featureCards: cards }))
                            }}
                            placeholder="🌿"
                          />
                        </div>
                        <div className="input-wrapper">
                          <label className="input-label">Card Title</label>
                          <input
                            type="text"
                            className="input"
                            value={card.title || ''}
                            onChange={e => {
                              const cards = [...(aboutData.featureCards || DEFAULT_CONFIG.about.featureCards)]
                              cards[idx] = { ...cards[idx], title: e.target.value }
                              setAboutData(p => ({ ...p, featureCards: cards }))
                            }}
                            placeholder="Nature Preservation"
                          />
                        </div>
                      </div>
                      <div className="input-wrapper">
                        <label className="input-label">Description</label>
                        <textarea
                          rows={2}
                          className="input"
                          value={card.desc || ''}
                          onChange={e => {
                            const cards = [...(aboutData.featureCards || DEFAULT_CONFIG.about.featureCards)]
                            cards[idx] = { ...cards[idx], desc: e.target.value }
                            setAboutData(p => ({ ...p, featureCards: cards }))
                          }}
                          placeholder="We promote plastic-free, low-impact tourist habits..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Partnerships Section */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div>
                    <label className="input-label" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Our Valued Partnerships</label>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Partners shown in the About page — use emoji + name format</p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    onClick={() => setAboutData(p => ({ ...p, partnerships: [...(p.partnerships || []), ''] }))}
                  >
                    <Plus size={14} /> Add Partner
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(aboutData.partnerships || DEFAULT_CONFIG.about.partnerships).map((partner, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                      <input
                        type="text"
                        className="input"
                        style={{ flex: 1 }}
                        value={partner}
                        onChange={e => {
                          const list = [...(aboutData.partnerships || DEFAULT_CONFIG.about.partnerships)]
                          list[idx] = e.target.value
                          setAboutData(p => ({ ...p, partnerships: list }))
                        }}
                        placeholder="🌲 Odisha Tourism"
                      />
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        style={{ color: 'var(--error)', flexShrink: 0 }}
                        onClick={() => setAboutData(p => ({ ...p, partnerships: (p.partnerships || []).filter((_, i) => i !== idx) }))}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-gold" style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Save size={18} /> Save About Content
              </button>
            </form>
          </div>
        )}
        {/* 3. GALLERY TAB FORM & LIST */}
        {activeTab === 'gallery' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>

            {/* Photo List Grid */}
            <div className="card glass-card" style={{ padding: '28px' }}>
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(201,168,76,0.15)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Image size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Gallery Items ({galleryItems.length})</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Manage photos shown on the public Gallery page</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddForm(v => !v)}
                  className={`btn ${showAddForm ? 'btn-outline' : 'btn-gold'}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  {showAddForm
                    ? <><span style={{ fontSize: '18px', lineHeight: 1 }}>✕</span> Cancel</>  
                    : <><Plus size={16} /> Add Photo</>
                  }
                </button>
              </div>

              {/* Inline Add Photo Form — shown only when showAddForm is true */}
              {showAddForm && (
                <div style={{ marginBottom: '24px', padding: '20px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--gold)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Image size={15} /> New Gallery Photo
                  </h4>
                  <form onSubmit={(e) => { handleAddGalleryItem(e); setShowAddForm(false) }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                      <div className="input-wrapper">
                        <label className="input-label">Photo Title</label>
                        <input
                          type="text"
                          className="input"
                          value={newImgTitle}
                          onChange={e => setNewImgTitle(e.target.value)}
                          placeholder="e.g. Barunei Waterfall Camp"
                          required
                          autoFocus
                        />
                      </div>

                      <div className="input-wrapper">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label className="input-label" style={{ margin: 0 }}>Image Source</label>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              className={`btn btn-xs ${imgInputType === 'url' ? 'btn-gold' : 'btn-ghost'}`}
                              onClick={() => { setImgInputType('url'); setNewImgSrc(''); }}
                              style={{ padding: '2px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <LinkIcon size={12} /> URL
                            </button>
                            <button
                              type="button"
                              className={`btn btn-xs ${imgInputType === 'file' ? 'btn-gold' : 'btn-ghost'}`}
                              onClick={() => { setImgInputType('file'); setNewImgSrc(''); }}
                              style={{ padding: '2px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Upload size={12} /> Local File
                            </button>
                          </div>
                        </div>

                        {imgInputType === 'url' ? (
                          <input
                            type="url"
                            className="input"
                            value={newImgSrc}
                            onChange={e => setNewImgSrc(e.target.value)}
                            placeholder="https://images.unsplash.com/..."
                            required
                          />
                        ) : (
                          <input
                            type="file"
                            accept="image/*"
                            className="input"
                            onChange={handleLocalFileUpload}
                            style={{ padding: '6px 12px' }}
                            required={!newImgSrc}
                          />
                        )}
                      </div>
                    </div>

                    {/* Preview Image if selected */}
                    {newImgSrc && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                        <img src={newImgSrc} alt="Preview" style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Image ready to add</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button type="button" onClick={() => { setShowAddForm(false); setNewImgSrc(''); setNewImgTitle(''); }} className="btn btn-ghost btn-sm">
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-gold btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Plus size={16} /> Add Photo to Gallery
                      </button>
                    </div>
                  </form>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                {galleryItems.map(item => (
                  <div key={item.id} className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)', position: 'relative' }}>
                    <img src={item.src} alt={item.title} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                    <div style={{ padding: '12px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</h4>
                      <button
                        type="button"
                        onClick={() => handleDeleteGalleryItem(item.id, item.title)}
                        className="btn btn-ghost btn-xs w-full"
                        style={{ marginTop: '8px', color: 'var(--error)', border: '1px solid rgba(250,82,82,0.3)', justifyContent: 'center' }}
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* 4. CONTACT TAB FORM */}
        {activeTab === 'contact' && (
          <div className="card glass-card" style={{ padding: '28px', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '14px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(201,168,76,0.15)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Contact Page Details</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Modify contact email, phone, support numbers, and address</p>
              </div>
            </div>

            <form onSubmit={handleSaveContact} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div className="input-wrapper">
                  <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={14} /> Support Email
                  </label>
                  <input
                    type="email"
                    className="input"
                    value={contactData.email}
                    onChange={e => setContactData(p => ({ ...p, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="input-wrapper">
                  <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={14} /> Main Helpline Phone
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={contactData.phone}
                    onChange={e => setContactData(p => ({ ...p, phone: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div className="input-wrapper">
                  <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={14} /> Emergency Support Line
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={contactData.emergencyPhone}
                    onChange={e => setContactData(p => ({ ...p, emergencyPhone: e.target.value }))}
                  />
                </div>

                <div className="input-wrapper">
                  <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} /> Operating Hours
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={contactData.hours}
                    onChange={e => setContactData(p => ({ ...p, hours: e.target.value }))}
                  />
                </div>
              </div>

              <div className="input-wrapper">
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} /> Office Address
                </label>
                <textarea
                  className="input"
                  rows={2}
                  value={contactData.address}
                  onChange={e => setContactData(p => ({ ...p, address: e.target.value }))}
                  required
                />
              </div>

              <button type="submit" className="btn btn-gold" style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Save size={18} /> Save Contact Details
              </button>
            </form>
          </div>
        )}

        {/* 5. LOGO MANAGEMENT TAB */}
        {activeTab === 'logo' && (
          <div className="card glass-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(201,168,76,0.18)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Website Logo Management</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Upload a custom local logo file or enter an image URL to replace the site logo</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={handleSaveLogo} 
                className="btn btn-gold flex items-center gap-2"
                style={{ padding: '10px 22px', borderRadius: 'var(--radius-md)', fontWeight: 600 }}
              >
                <Save size={18} /> Save & Broadcast Logo
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {/* Form Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label className="input-label" style={{ fontWeight: 600, display: 'block', marginBottom: '10px' }}>
                    Select Logo Mode:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <button
                      type="button"
                      className={`btn ${logoForm?.type === 'icon' ? 'btn-gold' : 'btn-ghost'}`}
                      onClick={() => {
                        const updated = { ...logoForm, type: 'icon' }
                        setLogoForm(updated)
                        updateLogo(updated)
                      }}
                      style={{ padding: '12px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <Leaf size={16} /> Default Leaf Icon
                    </button>
                    <button
                      type="button"
                      className={`btn ${logoForm?.type === 'image' ? 'btn-gold' : 'btn-ghost'}`}
                      onClick={() => {
                        const updated = { ...logoForm, type: 'image' }
                        setLogoForm(updated)
                        updateLogo(updated)
                      }}
                      style={{ padding: '12px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <Image size={16} /> Custom Image Logo
                    </button>
                  </div>
                </div>

                {logoForm?.type === 'image' && (
                  <div style={{ padding: '18px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label className="input-label" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <Upload size={16} /> Upload Local Logo File:
                      </label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleLogoFileUpload}
                        className="input" 
                        style={{ width: '100%', padding: '8px 12px' }}
                      />
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                        Select logo file from your computer (PNG, JPG, SVG, WebP). Recommended height: 40px–60px.
                      </span>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                      <label className="input-label" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <LinkIcon size={16} /> Or Enter Logo Image URL:
                      </label>
                      <input
                        type="url"
                        className="input"
                        placeholder="https://domain.com/logo.png"
                        value={logoForm?.url || ''}
                        onChange={(e) => {
                          const updated = { ...logoForm, url: e.target.value }
                          setLogoForm(updated)
                          updateLogo(updated)
                        }}
                        style={{ width: '100%', padding: '10px 14px' }}
                      />
                    </div>
                  </div>
                )}

                {/* Logo Height / Size Control */}
                <div style={{ padding: '16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label className="input-label" style={{ fontWeight: 600, margin: 0 }}>
                      📏 Logo Display Height (Size):
                    </label>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--gold)', background: 'rgba(201,168,76,0.15)', padding: '2px 10px', borderRadius: '12px' }}>
                      {logoForm?.height || 50}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="140"
                    step="2"
                    value={logoForm?.height || 65}
                    onChange={(e) => {
                      const updated = { ...logoForm, height: Number(e.target.value) }
                      setLogoForm(updated)
                      updateLogo(updated)
                    }}
                    style={{ width: '100%', accentColor: 'var(--gold)', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    {[
                      { label: 'Medium (55px)', val: 55 },
                      { label: 'Large (75px)', val: 75 },
                      { label: 'XL (95px)', val: 95 },
                      { label: 'Jumbo (120px)', val: 120 }
                    ].map(preset => (
                      <button
                        key={preset.val}
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => {
                          const updated = { ...logoForm, height: preset.val }
                          setLogoForm(updated)
                          updateLogo(updated)
                        }}
                        style={{ flex: 1, padding: '4px 8px', fontSize: '11px', borderRadius: '4px' }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Live Preview Box */}
              <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Eye size={16} /> Live Real-time Preview
                </span>

                {/* Navbar Dark Preview */}
                <div style={{ padding: '18px', background: '#0a160f', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '10px' }}>Header / Navbar Display:</span>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {logoForm?.type === 'image' && logoForm?.url ? (
                      <img 
                        src={logoForm.url} 
                        alt="Logo Preview" 
                        style={{ height: `${logoForm?.height || 65}px`, maxWidth: '280px', objectFit: 'contain', borderRadius: '6px' }} 
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="navbar__logo-icon" style={{ width: '54px', height: '54px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Leaf size={32} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Preview */}
                <div style={{ padding: '18px', background: '#12251a', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '10px' }}>Footer Display:</span>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {logoForm?.type === 'image' && logoForm?.url ? (
                      <img 
                        src={logoForm.url} 
                        alt="Logo Preview" 
                        style={{ height: `${logoForm?.height || 65}px`, maxWidth: '320px', objectFit: 'contain', borderRadius: '6px' }} 
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="footer__logo-icon" style={{ width: '68px', height: '68px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Leaf size={36} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. FOOTER TAB FORM */}
        {activeTab === 'footer' && (
          <div className="card glass-card" style={{ padding: '28px', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '14px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(201,168,76,0.15)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Layers size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Footer Content Management</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Modify tagline description, contact info, social links, and copyright text</p>
              </div>
            </div>

            <form onSubmit={handleSaveFooter} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Tagline */}
              <div className="input-wrapper">
                <label className="input-label">Footer Tagline Text (Right side of Logo)</label>
                <textarea
                  className="input"
                  rows={2}
                  value={footerData.tagline || ''}
                  onChange={e => setFooterData(p => ({ ...p, tagline: e.target.value }))}
                  placeholder="Odisha's Premier Picnic Destination..."
                  required
                />
              </div>

              {/* Contact Info */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div className="input-wrapper">
                  <label className="input-label">Phone Number</label>
                  <input
                    type="text"
                    className="input"
                    value={footerData.phone || ''}
                    onChange={e => setFooterData(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="input-wrapper">
                  <label className="input-label">Email Address</label>
                  <input
                    type="email"
                    className="input"
                    value={footerData.email || ''}
                    onChange={e => setFooterData(p => ({ ...p, email: e.target.value }))}
                    placeholder="hello@picnicutkal.com"
                  />
                </div>
                <div className="input-wrapper">
                  <label className="input-label">Office Address / Location</label>
                  <input
                    type="text"
                    className="input"
                    value={footerData.address || ''}
                    onChange={e => setFooterData(p => ({ ...p, address: e.target.value }))}
                    placeholder="Bhubaneswar, Odisha 751001"
                  />
                </div>
              </div>

              {/* Social Media Links */}
              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                <label className="input-label" style={{ fontWeight: 700, color: 'var(--gold)', marginBottom: '12px', display: 'block' }}>
                  🌐 Social Media Handles & Links:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  <div className="input-wrapper">
                    <label className="input-label" style={{ fontSize: '11px' }}>Instagram URL</label>
                    <input
                      type="url"
                      className="input"
                      value={footerData.instagram || ''}
                      onChange={e => setFooterData(p => ({ ...p, instagram: e.target.value }))}
                      placeholder="https://instagram.com/picnicutkal"
                    />
                  </div>
                  <div className="input-wrapper">
                    <label className="input-label" style={{ fontSize: '11px' }}>Facebook URL</label>
                    <input
                      type="url"
                      className="input"
                      value={footerData.facebook || ''}
                      onChange={e => setFooterData(p => ({ ...p, facebook: e.target.value }))}
                      placeholder="https://facebook.com/picnicutkal"
                    />
                  </div>
                  <div className="input-wrapper">
                    <label className="input-label" style={{ fontSize: '11px' }}>YouTube URL</label>
                    <input
                      type="url"
                      className="input"
                      value={footerData.youtube || ''}
                      onChange={e => setFooterData(p => ({ ...p, youtube: e.target.value }))}
                      placeholder="https://youtube.com/@picnicutkal"
                    />
                  </div>
                  <div className="input-wrapper">
                    <label className="input-label" style={{ fontSize: '11px' }}>Twitter / X URL</label>
                    <input
                      type="url"
                      className="input"
                      value={footerData.twitter || ''}
                      onChange={e => setFooterData(p => ({ ...p, twitter: e.target.value }))}
                      placeholder="https://twitter.com/picnicutkal"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Navigation Columns Management */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--gold)' }}>
                  🔗 Footer Navigation Columns & Links Management
                </h4>

                {/* Column 1: Quick Links */}
                <div style={{ padding: '18px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                  <div className="input-wrapper" style={{ marginBottom: '14px' }}>
                    <label className="input-label" style={{ fontWeight: 700, color: 'var(--gold)' }}>Column 1 Header Title</label>
                    <input
                      type="text"
                      className="input"
                      value={footerData.quickLinksTitle || 'Quick Links'}
                      onChange={e => setFooterData(p => ({ ...p, quickLinksTitle: e.target.value }))}
                    />
                  </div>
                  <label className="input-label" style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Column 1 Links List:</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                    {(footerData.quickLinks || DEFAULT_CONFIG.footer.quickLinks).map((link, idx) => (
                      <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="text"
                          className="input"
                          placeholder="Link Text"
                          value={link.label}
                          onChange={e => {
                            const updated = [...(footerData.quickLinks || DEFAULT_CONFIG.footer.quickLinks)]
                            updated[idx] = { ...updated[idx], label: e.target.value }
                            setFooterData(p => ({ ...p, quickLinks: updated }))
                          }}
                        />
                        <input
                          type="text"
                          className="input"
                          placeholder="URL / Path (e.g. /spots)"
                          value={link.href}
                          onChange={e => {
                            const updated = [...(footerData.quickLinks || DEFAULT_CONFIG.footer.quickLinks)]
                            updated[idx] = { ...updated[idx], href: e.target.value }
                            setFooterData(p => ({ ...p, quickLinks: updated }))
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          style={{ color: 'var(--error)' }}
                          onClick={() => {
                            const updated = (footerData.quickLinks || DEFAULT_CONFIG.footer.quickLinks).filter((_, i) => i !== idx)
                            setFooterData(p => ({ ...p, quickLinks: updated }))
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline btn-xs"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => {
                      const updated = [...(footerData.quickLinks || DEFAULT_CONFIG.footer.quickLinks), { label: '', href: '/' }]
                      setFooterData(p => ({ ...p, quickLinks: updated }))
                    }}
                  >
                    <Plus size={13} /> Add Quick Link Item
                  </button>
                </div>

                {/* Column 2: Activity Zones */}
                <div style={{ padding: '18px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                  <div className="input-wrapper" style={{ marginBottom: '14px' }}>
                    <label className="input-label" style={{ fontWeight: 700, color: 'var(--gold)' }}>Column 2 Header Title</label>
                    <input
                      type="text"
                      className="input"
                      value={footerData.zonesTitle || 'Activity Zones'}
                      onChange={e => setFooterData(p => ({ ...p, zonesTitle: e.target.value }))}
                    />
                  </div>
                  <label className="input-label" style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Column 2 Links List:</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                    {(footerData.zonesLinks || DEFAULT_CONFIG.footer.zonesLinks).map((link, idx) => (
                      <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="text"
                          className="input"
                          placeholder="Link Text (e.g. 🏊 Swimming Zone)"
                          value={link.label}
                          onChange={e => {
                            const updated = [...(footerData.zonesLinks || DEFAULT_CONFIG.footer.zonesLinks)]
                            updated[idx] = { ...updated[idx], label: e.target.value }
                            setFooterData(p => ({ ...p, zonesLinks: updated }))
                          }}
                        />
                        <input
                          type="text"
                          className="input"
                          placeholder="URL / Path (e.g. /spots?zone=swimming)"
                          value={link.href}
                          onChange={e => {
                            const updated = [...(footerData.zonesLinks || DEFAULT_CONFIG.footer.zonesLinks)]
                            updated[idx] = { ...updated[idx], href: e.target.value }
                            setFooterData(p => ({ ...p, zonesLinks: updated }))
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          style={{ color: 'var(--error)' }}
                          onClick={() => {
                            const updated = (footerData.zonesLinks || DEFAULT_CONFIG.footer.zonesLinks).filter((_, i) => i !== idx)
                            setFooterData(p => ({ ...p, zonesLinks: updated }))
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline btn-xs"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => {
                      const updated = [...(footerData.zonesLinks || DEFAULT_CONFIG.footer.zonesLinks), { label: '', href: '/spots' }]
                      setFooterData(p => ({ ...p, zonesLinks: updated }))
                    }}
                  >
                    <Plus size={13} /> Add Zone Link Item
                  </button>
                </div>

                {/* Column 3: Support */}
                <div style={{ padding: '18px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                  <div className="input-wrapper" style={{ marginBottom: '14px' }}>
                    <label className="input-label" style={{ fontWeight: 700, color: 'var(--gold)' }}>Column 3 Header Title</label>
                    <input
                      type="text"
                      className="input"
                      value={footerData.supportTitle || 'Support'}
                      onChange={e => setFooterData(p => ({ ...p, supportTitle: e.target.value }))}
                    />
                  </div>
                  <label className="input-label" style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Column 3 Links List:</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                    {(footerData.supportLinks || DEFAULT_CONFIG.footer.supportLinks).map((link, idx) => (
                      <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="text"
                          className="input"
                          placeholder="Link Text"
                          value={link.label}
                          onChange={e => {
                            const updated = [...(footerData.supportLinks || DEFAULT_CONFIG.footer.supportLinks)]
                            updated[idx] = { ...updated[idx], label: e.target.value }
                            setFooterData(p => ({ ...p, supportLinks: updated }))
                          }}
                        />
                        <input
                          type="text"
                          className="input"
                          placeholder="URL / Path (e.g. /contact)"
                          value={link.href}
                          onChange={e => {
                            const updated = [...(footerData.supportLinks || DEFAULT_CONFIG.footer.supportLinks)]
                            updated[idx] = { ...updated[idx], href: e.target.value }
                            setFooterData(p => ({ ...p, supportLinks: updated }))
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          style={{ color: 'var(--error)' }}
                          onClick={() => {
                            const updated = (footerData.supportLinks || DEFAULT_CONFIG.footer.supportLinks).filter((_, i) => i !== idx)
                            setFooterData(p => ({ ...p, supportLinks: updated }))
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline btn-xs"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => {
                      const updated = [...(footerData.supportLinks || DEFAULT_CONFIG.footer.supportLinks), { label: '', href: '/contact' }]
                      setFooterData(p => ({ ...p, supportLinks: updated }))
                    }}
                  >
                    <Plus size={13} /> Add Support Link Item
                  </button>
                </div>
              </div>

              {/* Copyright Text */}
              <div className="input-wrapper">
                <label className="input-label">Copyright Text (Bottom Bar)</label>
                <input
                  type="text"
                  className="input"
                  value={footerData.copyright || ''}
                  onChange={e => setFooterData(p => ({ ...p, copyright: e.target.value }))}
                  placeholder="© 2026 PicnicUtkal. All rights reserved. Made with 💚 in Odisha."
                />
              </div>

              {/* Save Button */}
              <button type="submit" className="btn btn-gold btn-lg w-full" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px' }}>
                <Save size={20} /> Save All Footer Content
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  )
}
