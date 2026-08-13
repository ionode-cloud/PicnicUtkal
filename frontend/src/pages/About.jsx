import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { LuTrees as Trees, LuCompass as Compass, LuHeart as Heart } from 'react-icons/lu'
import { useSocket } from '../context/SocketContext'

const DEFAULT_ABOUT = {
  title: 'Pioneering Premium Eco-Tourism & Picnic Experiences in Odisha',
  subtitle: "Connecting nature lovers with handcrafted, secure, and serene picnic sanctuaries across Odisha's rivers, forests, and hills.",
  mission: 'To empower families, corporate groups, and travelers to reconnect with nature through sustainable, frictionless, and memorable picnic experiences.',
  vision: 'To become eastern India\'s leading eco-hospitality network by preserving natural habitats while delivering world-class outdoor leisure services.',
  features: [
    '100% Verified Private & Eco-Friendly Locations',
    '24/7 On-Site Security & Clean Drinking Water',
    'Pre-booked Private Cooking & Catering Units',
    'Instant E-Pass & Invoice Generation'
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
}

const getStoredAbout = () => {
  try {
    const saved = localStorage.getItem('picnicutkal_user_view_config')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.about) return { ...DEFAULT_ABOUT, ...parsed.about }
    }
  } catch (e) {}
  return DEFAULT_ABOUT
}

export default function About() {
  const [about, setAbout] = useState(getStoredAbout)

  // Socket.io: live-reload when admin updates About page
  const { socket } = useSocket()
  useEffect(() => {
    if (!socket) return
    const handler = (data) => {
      if (data && data.config) {
        setAbout(prev => ({ ...prev, ...data.config }))
        try {
          const saved = localStorage.getItem('picnicutkal_user_view_config')
          const parsed = saved ? JSON.parse(saved) : {}
          localStorage.setItem('picnicutkal_user_view_config', JSON.stringify({ ...parsed, about: data.config }))
        } catch (e) {}
      }
    }
    socket.on('about_config_update', handler)
    return () => socket.off('about_config_update', handler)
  }, [socket])

  return (
    <>
      <Helmet>
        <title>About Us - Premium Nature Eco-tourism | PicnicUtkal</title>
        <meta name="description" content="Discover our story, mission, and dedication to premium, nature-preservation nature escapes in Odisha." />
      </Helmet>

      <div className="about-page container-fluid">
        {/* Story Section */}
        <div className="about-story-grid">
          <div>
            <span className="section-eyebrow">Our Story</span>
            <h1 className="heading-2" style={{ marginBottom: 'var(--space-4)' }}>
              {about.title || DEFAULT_ABOUT.title}
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', lineHeight: '1.75' }}>
              {about.subtitle || DEFAULT_ABOUT.subtitle}
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.75' }}>
              {about.mission || DEFAULT_ABOUT.mission}
            </p>
          </div>
          <div>
            <img src="https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=80" alt="Beautiful forest scenery" style={{ borderRadius: 'var(--radius-xl)', width: '100%', height: '400px', objectFit: 'cover', boxShadow: 'var(--shadow-lg)' }} />
          </div>
        </div>

        {/* Mission / Vision Cards */}
        <div className="about-mission-grid">
          {(about.featureCards || DEFAULT_ABOUT.featureCards).map((card, i) => (
            <div key={i} className="card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div style={{ fontSize: '32px', lineHeight: 1 }}>{card.icon}</div>
              <h3 className="heading-4">{card.title}</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{card.desc}</p>
            </div>
          ))}
        </div>

        {/* Features Highlights */}
        {about.features && about.features.length > 0 && (
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
            <span className="section-eyebrow">What We Offer</span>
            <h2 className="heading-3" style={{ marginBottom: 'var(--space-6)' }}>Our Core Commitments</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', justifyContent: 'center', maxWidth: '720px', margin: '0 auto' }}>
              {about.features.map((f, i) => (
                <span key={i} style={{ padding: '8px 18px', borderRadius: '999px', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', color: 'var(--gold)', fontSize: '13px', fontWeight: 600 }}>
                  ✓ {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Partners Section */}
        {(about.partnerships || DEFAULT_ABOUT.partnerships).length > 0 && (
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-16)' }}>
            <span className="section-eyebrow">Supported By</span>
            <h2 className="heading-3" style={{ marginBottom: 'var(--space-8)' }}>Our Valued Partnerships</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-12)', flexWrap: 'wrap', opacity: 0.75 }}>
              {(about.partnerships || DEFAULT_ABOUT.partnerships).map((partner, i) => (
                <span key={i} style={{ fontSize: 'var(--text-lg)', fontWeight: '700', color: 'var(--text-secondary)' }}>{partner}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}