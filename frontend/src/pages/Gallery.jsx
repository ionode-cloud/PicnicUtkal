import { useState, useMemo, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import { useSocket } from '../context/SocketContext'
import { useSiteConfig, useInvalidators } from '../hooks/useQueryHooks'

function GallerySkeleton() {
  return (
    <div className="gallery-page container-fluid" style={{ padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <div className="skeleton-shimmer" style={{ width: '140px', height: '24px', borderRadius: '999px' }} />
        <div className="skeleton-shimmer" style={{ width: '320px', height: '40px', borderRadius: '8px' }} />
      </div>
      <div className="gallery-grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton-shimmer" style={{ height: '240px', borderRadius: '16px' }} />
        ))}
      </div>
    </div>
  )
}

export default function Gallery() {
  const [index, setIndex] = useState(-1)
  const { data: siteConfigData, isLoading } = useSiteConfig()
  const { invalidateSiteConfig } = useInvalidators()

  const images = useMemo(() => {
    const raw = siteConfigData?.user_view_config?.gallery
    if (Array.isArray(raw)) return raw
    return []
  }, [siteConfigData])

  // Socket.io: live-reload when admin updates gallery
  const { socket } = useSocket()
  useEffect(() => {
    if (!socket) return
    const handler = () => invalidateSiteConfig()
    socket.on('gallery_config_update', handler)
    return () => socket.off('gallery_config_update', handler)
  }, [socket, invalidateSiteConfig])

  if (isLoading) {
    return <GallerySkeleton />
  }

  return (
    <>
      <Helmet>
        <title>Nature Masonry Gallery | PicnicUtkal</title>
        <meta name="description" content="View high-resolution images and drone footage of beautiful picnic spots, waterfalls, and adventure zones in Odisha." />
      </Helmet>

      <div className="gallery-page container-fluid">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
          <span className="section-eyebrow">Visual Moments</span>
          <h1 className="heading-2">Moments of Pure Joy</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>Captures from our high-end picnic resorts, camping zones, and natural sanctuaries.</p>
        </div>

        {/* Grid */}
        <div className="gallery-grid-responsive" style={{ marginBlock: 'var(--space-8)' }}>
          {images.map((img, i) => (
            <div
              key={img.id || i}
              className="card"
              style={{ overflow: 'hidden', cursor: 'pointer', position: 'relative', height: '240px' }}
              onClick={() => setIndex(i)}
            >
              <img
                src={img.src}
                alt={img.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                padding: '12px 14px', color: '#ffffff',
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                zIndex: 2
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff', textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 2px 6px rgba(0,0,0,0.9)', margin: 0, lineHeight: '1.3' }}>
                  {img.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        <Lightbox
          index={index}
          open={index >= 0}
          close={() => setIndex(-1)}
          slides={images}
        />
      </div>
    </>
  )
}