import { Helmet } from 'react-helmet-async'
import { Trees, Compass, Heart } from 'lucide-react'

export default function About() {
  return (
    <>
      <Helmet>
        <title>About Us - Premium Nature Eco-tourism | PicnicUtkal</title>
        <meta name="description" content="Discover our story, mission, and dedication to premium, nature-preservation nature escapes in Odisha." />
      </Helmet>

      <div className="about-page container section" style={{ paddingTop: 'calc(var(--nav-height) + var(--space-8))' }}>
        {/* Story Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-12)', alignItems: 'center', marginBottom: 'var(--space-16)' }}>
          <div>
            <span className="section-eyebrow">Our Story</span>
            <h1 className="heading-2" style={{ marginBottom: 'var(--space-4)' }}>Pioneering Luxury Nature Escapes</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', lineHeight: '1.75' }}>
              PicnicUtkal was born from a simple vision: to bridge the gap between Odisha\'s pristine, untouched natural landscapes and modern luxury tourism convenience. Inspired by Airbnb Experiences and state-of-the-art nature retreats, we launched in 2026 to offer premium, seamless, and eco-friendly picnic spot bookings.
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.75' }}>
              We collaborate with state forestry departments, eco-tourism communities, and local vendors to provide clean, secure, and well-managed zones for swimming, cooking, music events, and camping.
            </p>
          </div>
          <div>
            <img src="https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=80" alt="Beautiful forest scenery" style={{ borderRadius: 'var(--radius-xl)', width: '100%', height: '400px', objectFit: 'cover', boxShadow: 'var(--shadow-lg)' }} />
          </div>
        </div>

        {/* Mission / Vision Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-6)', marginBottom: 'var(--space-16)' }}>
          <div className="card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ color: 'var(--forest)' }}><Trees size={32} /></div>
            <h3 className="heading-4">Nature Preservation</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>We promote plastic-free, low-impact tourist habits. Part of our booking revenue is donated to local wildlife conservation initiatives.</p>
          </div>
          <div className="card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ color: 'var(--gold-dark)' }}><Compass size={32} /></div>
            <h3 className="heading-4">Curated Adventures</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>From water slides to ziplines, our adventure zones are certified by international safety agencies to guarantee safety first.</p>
          </div>
          <div className="card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ color: 'var(--mid-green)' }}><Heart size={32} /></div>
            <h3 className="heading-4">Premium Hospitality</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Pre-ordered hot meals, clean restrooms, CCTV-monitored zones, and on-site local guides make planning stress-free.</p>
          </div>
        </div>

        {/* The Team / Partners Section */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-16)' }}>
          <span className="section-eyebrow">Supported By</span>
          <h2 className="heading-3" style={{ marginBottom: 'var(--space-8)' }}>Our Valued Partnerships</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-12)', flexWrap: 'wrap', opacity: 0.75 }}>
            <span style={{ fontSize: 'var(--text-lg)', fontWeight: '700', color: 'var(--text-secondary)' }}>🌲 Odisha Tourism</span>
            <span style={{ fontSize: 'var(--text-lg)', fontWeight: '700', color: 'var(--text-secondary)' }}>🐯 Eco-Development Committees</span>
            <span style={{ fontSize: 'var(--text-lg)', fontWeight: '700', color: 'var(--text-secondary)' }}>🤝 Local Forest Communities</span>
          </div>
        </div>
      </div>
    </>
  )
}