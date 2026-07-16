import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

const IMAGES = [
  { src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', title: 'Forest Camping' },
  { src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80', title: 'Nature Walks' },
  { src: 'https://images.unsplash.com/photo-1502472584811-0a2f2feb8968?w=800&q=80', title: 'River Swimming' },
  { src: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80', title: 'Dolphin Boating' },
  { src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', title: 'Barunei Adventure' },
  { src: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80', title: 'Mayurbhanj Safari' }
]

export default function Gallery() {
  const [index, setIndex] = useState(-1)

  return (
    <>
      <Helmet>
        <title>Nature Masonry Gallery | PicnicUtkal</title>
        <meta name="description" content="View high-resolution images and drone footage of beautiful picnic spots, waterfalls, and adventure zones in Odisha." />
      </Helmet>

      <div className="gallery-page container section" style={{ paddingTop: 'calc(var(--nav-height) + var(--space-8))' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
          <span className="section-eyebrow">Visual Moments</span>
          <h1 className="heading-2">Moments of Pure Joy</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>Captures from our high-end picnic resorts, camping zones, and natural sanctuaries.</p>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)', marginBlock: 'var(--space-8)' }}>
          {IMAGES.map((img, i) => (
            <div
              key={i}
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
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                padding: 'var(--space-4)', color: 'var(--white)'
              }}>
                <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: '600' }}>{img.title}</h3>
              </div>
            </div>
          ))}
        </div>

        <Lightbox
          index={index}
          open={index >= 0}
          close={() => setIndex(-1)}
          slides={IMAGES}
        />
      </div>
    </>
  )
}