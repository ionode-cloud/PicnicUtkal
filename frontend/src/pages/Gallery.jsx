import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import { useSocket } from '../context/SocketContext'

const getStoredGallery = () => {
  try {
    const saved = localStorage.getItem('picnicutkal_user_view_config')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.gallery && Array.isArray(parsed.gallery)) return parsed.gallery
    }
  } catch (e) {}
  return []
}

export default function Gallery() {
  const [index, setIndex] = useState(-1)
  const [images, setImages] = useState(getStoredGallery)

  // Socket.io: live-reload when admin updates gallery
  const { socket } = useSocket()
  useEffect(() => {
    if (!socket) return
    const handler = (data) => {
      if (data && Array.isArray(data.config)) {
        setImages(data.config)
        try {
          const saved = localStorage.getItem('picnicutkal_user_view_config')
          const parsed = saved ? JSON.parse(saved) : {}
          localStorage.setItem('picnicutkal_user_view_config', JSON.stringify({ ...parsed, gallery: data.config }))
        } catch (e) {}
      }
    }
    socket.on('gallery_config_update', handler)
    return () => socket.off('gallery_config_update', handler)
  }, [socket])

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