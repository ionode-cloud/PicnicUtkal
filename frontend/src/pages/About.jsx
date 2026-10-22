import { useMemo, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { LuTrees as Trees, LuCompass as Compass, LuHeart as Heart } from 'react-icons/lu'
import { useSocket } from '../context/SocketContext'
import { useSiteConfig, useInvalidators } from '../hooks/useQueryHooks'

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

function AboutSkeleton() {
  return (
    <div className="about-page container-fluid" style={{ padding: '40px 20px' }}>
      <div className="about-story-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="skeleton-shimmer" style={{ width: '120px', height: '24px', borderRadius: '999px' }} />
          <div className="skeleton-shimmer" style={{ width: '80%', height: '44px', borderRadius: '8px' }} />
          <div className="skeleton-shimmer" style={{ width: '100%', height: '80px', borderRadius: '8px' }} />
        </div>
        <div className="skeleton-shimmer" style={{ width: '100%', height: '320px', borderRadius: '20px' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginTop: '48px' }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="skeleton-shimmer" style={{ width: '48px', height: '48px', borderRadius: '12px' }} />
            <div className="skeleton-shimmer" style={{ width: '60%', height: '22px', borderRadius: '6px' }} />
            <div className="skeleton-shimmer" style={{ width: '90%', height: '40px', borderRadius: '6px' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function About() {
  const { data: siteConfigData, isLoading } = useSiteConfig()
  const { invalidateSiteConfig } = useInvalidators()

  const about = useMemo(() => {
    return siteConfigData?.user_view_config?.about || {
      title: 'About PicnicUtkal',
      subtitle: '',
      mission: '',
      features: [],
      featureCards: [],
      partnerships: [],
      heroImage: ''
    }
  }, [siteConfigData])

  // Socket.io: live-reload when admin updates About page
  const { socket } = useSocket()
  useEffect(() => {
    if (!socket) return
    const handler = () => invalidateSiteConfig()
    socket.on('about_config_update', handler)
    return () => socket.off('about_config_update', handler)
  }, [socket, invalidateSiteConfig])

  if (isLoading) {
    return <AboutSkeleton />
  }

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
              {about.title || 'About PicnicUtkal'}
            </h1>
            {about.subtitle && (
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', lineHeight: '1.75' }}>
                {about.subtitle}
              </p>
            )}
            {about.mission && (
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.75' }}>
                {about.mission}
              </p>
            )}
          </div>
          {about.heroImage && (
            <div>
              <img 
                src={resolvePlotImage(about.heroImage)} 
                alt="About PicnicUtkal" 
                style={{ borderRadius: 'var(--radius-xl)', width: '100%', height: '400px', objectFit: 'cover', boxShadow: 'var(--shadow-lg)' }} 
              />
            </div>
          )}
        </div>

        {/* Mission / Vision Cards */}
        {about.featureCards && about.featureCards.length > 0 && (
          <div className="about-mission-grid">
            {about.featureCards.map((card, i) => (
              <div key={i} className="card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div style={{ fontSize: '32px', lineHeight: 1 }}>{card.icon}</div>
                <h3 className="heading-4">{card.title}</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{card.desc}</p>
              </div>
            ))}
          </div>
        )}

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
        {about.partnerships && about.partnerships.length > 0 && (
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-16)' }}>
            <span className="section-eyebrow">Supported By</span>
            <h2 className="heading-3" style={{ marginBottom: 'var(--space-8)' }}>Our Valued Partnerships</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-12)', flexWrap: 'wrap', opacity: 0.75 }}>
              {about.partnerships.map((partner, i) => (
                <span key={i} style={{ fontSize: 'var(--text-lg)', fontWeight: '700', color: 'var(--text-secondary)' }}>{partner}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}