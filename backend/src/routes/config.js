const express = require('express')
const router = express.Router()
const SiteConfig = require('../models/SiteConfig')
const { processObjectForCloudinary } = require('../utils/cloudinaryHelper')

const DEFAULT_USER_VIEW_CONFIG = {
  home: {
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
    spotsEyebrow: "Handpicked Locations",
    spotsTitle: "Picnic Spots",
    spotsSubtitle: "Discover top-rated spots across Odisha with instant online booking",
    zonesEyebrow: "Activity Zones",
    zonesTitle: "Explore Picnic Zones",
    zonesSubtitle: "Pick your style of outdoor fun",
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
    copyright: "© 2026 PicnicUtkal. All rights reserved. Made with 💚 in Odisha.",
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

const DEFAULT_ADMIN_ZONES = [
  {
    id: 'z1',
    label: 'Swimming Zone',
    count: '12 spots',
    color: '#228BE6',
    href: '/spots?zone=swimming',
    status: 'Active',
    order: 1
  },
  {
    id: 'z2',
    label: 'BBQ & Cooking Zone',
    count: '18 spots',
    color: '#FA5252',
    href: '/spots?zone=cooking',
    status: 'Active',
    order: 2
  },
  {
    id: 'z3',
    label: 'Music & Stage Zone',
    count: '8 spots',
    color: '#BE4BDB',
    href: '/spots?zone=music',
    status: 'Active',
    order: 3
  },
  {
    id: 'z4',
    label: 'Camping & Tent Zone',
    count: '15 spots',
    color: '#F76707',
    href: '/spots?zone=camping',
    status: 'Active',
    order: 4
  },
  {
    id: 'z5',
    label: 'Adventure Zone',
    count: '10 spots',
    color: '#E8590C',
    href: '/spots?zone=adventure',
    status: 'Active',
    order: 5
  },
  {
    id: 'z6',
    label: 'Family & Garden Zone',
    count: '22 spots',
    color: '#2F9E44',
    href: '/spots?zone=family',
    status: 'Active',
    order: 6
  }
]

// GET /api/site-config -> fetch all site configs
router.get('/', async (req, res) => {
  try {
    const configs = await SiteConfig.find({}).lean()
    const result = {}
    configs.forEach(c => {
      result[c.key] = c.data
    })

    // Ensure user_view_config is populated if missing
    const uvc = result.user_view_config
    if (!uvc) {
      result.user_view_config = DEFAULT_USER_VIEW_CONFIG
    } else {
      result.user_view_config = {
        ...DEFAULT_USER_VIEW_CONFIG,
        ...uvc,
        home: {
          ...DEFAULT_USER_VIEW_CONFIG.home,
          ...(uvc.home || {}),
          heroImages: Array.isArray(uvc.home?.heroImages)
            ? uvc.home.heroImages
            : DEFAULT_USER_VIEW_CONFIG.home.heroImages
        },
        about: {
          ...DEFAULT_USER_VIEW_CONFIG.about,
          ...(uvc.about || {}),
          features: Array.isArray(uvc.about?.features) ? uvc.about.features : DEFAULT_USER_VIEW_CONFIG.about.features,
          featureCards: Array.isArray(uvc.about?.featureCards) ? uvc.about.featureCards : DEFAULT_USER_VIEW_CONFIG.about.featureCards,
          partnerships: Array.isArray(uvc.about?.partnerships) ? uvc.about.partnerships : DEFAULT_USER_VIEW_CONFIG.about.partnerships
        },
        gallery: Array.isArray(uvc.gallery) ? uvc.gallery : DEFAULT_USER_VIEW_CONFIG.gallery,
        contact: {
          ...DEFAULT_USER_VIEW_CONFIG.contact,
          ...(uvc.contact || {})
        },
        footer: {
          ...DEFAULT_USER_VIEW_CONFIG.footer,
          ...(uvc.footer || {}),
          quickLinks: Array.isArray(uvc.footer?.quickLinks) ? uvc.footer.quickLinks : DEFAULT_USER_VIEW_CONFIG.footer.quickLinks,
          zonesLinks: Array.isArray(uvc.footer?.zonesLinks) ? uvc.footer.zonesLinks : DEFAULT_USER_VIEW_CONFIG.footer.zonesLinks,
          supportLinks: Array.isArray(uvc.footer?.supportLinks) ? uvc.footer.supportLinks : DEFAULT_USER_VIEW_CONFIG.footer.supportLinks
        }
      }
    }

    // Ensure admin_zones is always populated
    if (!result.admin_zones || !Array.isArray(result.admin_zones)) {
      result.admin_zones = DEFAULT_ADMIN_ZONES
    }

    res.json({ success: true, data: result })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/site-config/:key -> fetch specific key
router.get('/:key', async (req, res) => {
  try {
    const configDoc = await SiteConfig.findOne({ key: req.params.key }).lean()
    let val = configDoc ? (configDoc.data !== undefined ? configDoc.data : configDoc.value) : null

    // If key is 'user_view_config'
    if (req.params.key === 'user_view_config') {
      if (!val) {
        return res.status(200).json({ success: true, data: DEFAULT_USER_VIEW_CONFIG, value: DEFAULT_USER_VIEW_CONFIG })
      }
      const merged = {
        ...DEFAULT_USER_VIEW_CONFIG,
        ...val,
        home: {
          ...DEFAULT_USER_VIEW_CONFIG.home,
          ...(val.home || {}),
          heroImages: Array.isArray(val.home?.heroImages)
            ? val.home.heroImages
            : DEFAULT_USER_VIEW_CONFIG.home.heroImages
        },
        about: {
          ...DEFAULT_USER_VIEW_CONFIG.about,
          ...(val.about || {}),
          features: Array.isArray(val.about?.features) ? val.about.features : DEFAULT_USER_VIEW_CONFIG.about.features,
          featureCards: Array.isArray(val.about?.featureCards) ? val.about.featureCards : DEFAULT_USER_VIEW_CONFIG.about.featureCards,
          partnerships: Array.isArray(val.about?.partnerships) ? val.about.partnerships : DEFAULT_USER_VIEW_CONFIG.about.partnerships
        },
        gallery: Array.isArray(val.gallery) ? val.gallery : DEFAULT_USER_VIEW_CONFIG.gallery,
        contact: {
          ...DEFAULT_USER_VIEW_CONFIG.contact,
          ...(val.contact || {})
        },
        footer: {
          ...DEFAULT_USER_VIEW_CONFIG.footer,
          ...(val.footer || {}),
          quickLinks: Array.isArray(val.footer?.quickLinks) ? val.footer.quickLinks : DEFAULT_USER_VIEW_CONFIG.footer.quickLinks,
          zonesLinks: Array.isArray(val.footer?.zonesLinks) ? val.footer.zonesLinks : DEFAULT_USER_VIEW_CONFIG.footer.zonesLinks,
          supportLinks: Array.isArray(val.footer?.supportLinks) ? val.footer.supportLinks : DEFAULT_USER_VIEW_CONFIG.footer.supportLinks
        }
      }
      return res.status(200).json({ success: true, data: merged, value: merged })
    }

    // If key is 'admin_zones' or 'zones' and not yet in DB
    if (req.params.key === 'admin_zones' || req.params.key === 'zones') {
      if (!val || !Array.isArray(val)) {
        SiteConfig.findOneAndUpdate(
          { key: 'admin_zones' },
          { key: 'admin_zones', data: DEFAULT_ADMIN_ZONES },
          { upsert: true, new: true }
        ).catch(() => {})
        return res.status(200).json({ success: true, data: DEFAULT_ADMIN_ZONES, value: DEFAULT_ADMIN_ZONES })
      }
    }

    // If key is 'upi_qr_config' and not yet in DB, return default active UPI configuration
    if (!val && req.params.key === 'upi_qr_config') {
      const defaultUpiConfig = {
        enabled: true,
        upiId: 'picnicutkal@upi',
        payeeName: 'PicnicUtkal Resort',
        merchantCode: '',
        note: 'Picnic Spot Reservation',
        useCustomQrImage: false,
        customQrImage: '',
        instructions: 'Open PhonePe, Google Pay, Paytm, or BHIM app and scan the QR code to finish your reservation.',
        paymentConfirmationNote: 'After completing UPI transfer, click Confirm & Pay to get your instant QR reservation ticket.',
        showBankDetails: true,
        accountHolder: 'PicnicUtkal Tourism Pvt Ltd',
        bankName: 'HDFC Bank',
        accountNumber: '50200088991122',
        ifscCode: 'HDFC0001234'
      }
      SiteConfig.findOneAndUpdate(
        { key: 'upi_qr_config' },
        { key: 'upi_qr_config', data: defaultUpiConfig },
        { upsert: true, new: true }
      ).catch(() => {})
      return res.status(200).json({ success: true, data: defaultUpiConfig, value: defaultUpiConfig })
    }

    res.status(200).json({ success: true, data: val, value: val })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

const saveConfigHandler = async (req, res) => {
  try {
    const { key } = req.params
    const rawData = req.body.data !== undefined ? req.body.data : (req.body.value !== undefined ? req.body.value : req.body)

    // Automatically detect and convert any base64 images into Cloudinary CDN URLs
    const folder = `picnicutkal/${key || 'site_config'}`
    const processedData = await processObjectForCloudinary(rawData, folder)

    let configDoc = await SiteConfig.findOne({ key })
    if (configDoc) {
      configDoc.data = processedData
      configDoc.markModified('data')
      await configDoc.save()
    } else {
      configDoc = await SiteConfig.create({ key, data: processedData })
    }

    // Socket.io real-time broadcast with processed Cloudinary URLs
    if (req.io) {
      if (key === 'user_view_config') {
        req.io.emit('home_config_update', { config: processedData?.home || {} })
        req.io.emit('about_config_update', { config: processedData?.about || {} })
        req.io.emit('gallery_config_update', { config: processedData?.gallery || [] })
        req.io.emit('contact_config_update', { config: processedData?.contact || {} })
        req.io.emit('footer_config_update', { config: processedData?.footer || {} })
      } else if (key === 'admin_zones' || key === 'zones') {
        req.io.emit('zones_config_update', { zones: Array.isArray(processedData) ? processedData : (processedData?.zones || []) })
      } else if (key === 'admin_maps' || key === 'maps') {
        req.io.emit('map_config_update', { maps: Array.isArray(processedData) ? processedData : [] })
      } else if (key === 'map_plots_config' || key === 'plots') {
        req.io.emit('plots_update', { plots: Array.isArray(processedData) ? processedData : [] })
      } else if (key === 'logo_config' || key === 'logo') {
        req.io.emit('logo_config_update', { logo: processedData })
      } else if (key === 'addons_config' || key === 'addons') {
        req.io.emit('addons_config_update', { addons: Array.isArray(processedData) ? processedData : [] })
      } else if (key === 'upi_qr_config' || key === 'upi') {
        req.io.emit('upi_qr_config_update', { upiConfig: processedData })
      } else if (key === 'guidelines_rules' || key === 'guidelines') {
        req.io.emit('guidelines_rules_update', { rules: Array.isArray(processedData) ? processedData : [] })
      }
    }

    res.status(200).json({ success: true, data: configDoc.data, value: configDoc.data, message: 'Saved persistently to MongoDB' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

router.put('/:key', saveConfigHandler)
router.post('/:key', saveConfigHandler)

module.exports = router
