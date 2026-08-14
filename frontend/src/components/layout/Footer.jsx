import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LuLeaf as Leaf, LuPhone as Phone, LuMail as Mail, LuMapPin as MapPin } from 'react-icons/lu'
import { FaInstagram, FaFacebookF, FaYoutube, FaXTwitter } from 'react-icons/fa6'
import { useLogo } from '../../context/LogoContext'
import { useSocket } from '../../context/SocketContext'

const DEFAULT_FOOTER = {
  tagline: "Odisha's Premier Picnic Destination. Discover breathtaking nature spots, book your perfect picnic zone, and create unforgettable memories.",
  phone: "+91 98765 43210",
  email: "hello@picnicutkal.com",
  address: "Bhubaneswar, Odisha 751001",
  instagram: "https://instagram.com",
  facebook: "https://facebook.com",
  youtube: "https://youtube.com",
  twitter: "https://twitter.com",
  copyright: `© ${new Date().getFullYear()} PicnicUtkal. All rights reserved.`
}

const getStoredFooter = () => {
  try {
    const saved = localStorage.getItem('picnicutkal_user_view_config')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.footer) return { ...DEFAULT_FOOTER, ...parsed.footer }
    }
  } catch (e) {}
  return DEFAULT_FOOTER
}

const QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Picnic Spots', href: '/spots' },
  { label: 'Live Map', href: '/map' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'About Us', href: '/about' },
]

const ZONES = [
  { label: '🏊 Swimming Zone', href: '/spots?zone=swimming' },
  { label: '🎵 Music Zone', href: '/spots?zone=music' },
  { label: '🏕 Camping Zone', href: '/spots?zone=camping' },
  { label: '🎯 Adventure Zone', href: '/spots?zone=adventure' },
  { label: '👨‍👩‍👧 Family Zone', href: '/spots?zone=family' },
]

const SUPPORT = [
  { label: 'How to Book', href: '/about' },
  { label: 'Cancellation Policy', href: '/cancel-policy' },
  { label: 'Refund Policy', href: '/refund-policy' },
  { label: 'Contact Support', href: '/contact' },
]

export default function Footer() {
  const { logoConfig } = useLogo()
  const { socket } = useSocket()
  const [footer, setFooter] = useState(getStoredFooter)

  useEffect(() => {
    if (!socket) return
    const handler = (data) => {
      if (data && data.config) {
        setFooter(prev => ({ ...prev, ...data.config }))
        try {
          const saved = localStorage.getItem('picnicutkal_user_view_config')
          const parsed = saved ? JSON.parse(saved) : {}
          localStorage.setItem('picnicutkal_user_view_config', JSON.stringify({ ...parsed, footer: data.config }))
        } catch (e) {}
      }
    }
    socket.on('footer_config_update', handler)
    return () => socket.off('footer_config_update', handler)
  }, [socket])

  return (
    <footer className="footer">
      {/* Top Wave */}
      <div className="footer__wave">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="var(--dark-green)" />
        </svg>
      </div>

      <div className="footer__main">
        <div className="container-fluid">
          <div className="footer__grid">
            {/* Brand */}
            <div className="footer__brand">
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <Link to="/" className="footer__logo" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  {logoConfig?.type === 'image' && logoConfig?.url ? (
                    <img 
                      src={logoConfig.url} 
                      alt="Logo" 
                      style={{ 
                        height: `${logoConfig?.height ? Math.max(logoConfig.height, 65) : 110}px`, 
                        width: 'auto', 
                        maxWidth: '280px', 
                        objectFit: 'contain', 
                        borderRadius: '12px' 
                      }}
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
                </Link>
                <p className="footer__tagline" style={{ margin: 0, flex: 1, minWidth: '220px', fontSize: '0.95rem', lineHeight: '1.6', color: 'rgba(255, 255, 255, 0.75)' }}>
                  {footer.tagline || DEFAULT_FOOTER.tagline}
                </p>
              </div>
              <div className="footer__contact">
                {footer.phone && (
                  <a href={`tel:${footer.phone.replace(/\s+/g, '')}`} className="footer__contact-item">
                    <Phone size={15} /> {footer.phone}
                  </a>
                )}
                {footer.email && (
                  <a href={`mailto:${footer.email}`} className="footer__contact-item">
                    <Mail size={15} /> {footer.email}
                  </a>
                )}
                {footer.address && (
                  <span className="footer__contact-item">
                    <MapPin size={15} /> {footer.address}
                  </span>
                )}
              </div>
              <div className="footer__socials">
                {footer.instagram && (
                  <a href={footer.instagram} target="_blank" rel="noopener noreferrer" className="footer__social" aria-label="Instagram" title="Instagram">
                    <FaInstagram size={15} />
                  </a>
                )}
                {footer.facebook && (
                  <a href={footer.facebook} target="_blank" rel="noopener noreferrer" className="footer__social" aria-label="Facebook" title="Facebook">
                    <FaFacebookF size={14} />
                  </a>
                )}
                {footer.youtube && (
                  <a href={footer.youtube} target="_blank" rel="noopener noreferrer" className="footer__social" aria-label="YouTube" title="YouTube">
                    <FaYoutube size={16} />
                  </a>
                )}
                {footer.twitter && (
                  <a href={footer.twitter} target="_blank" rel="noopener noreferrer" className="footer__social" aria-label="Twitter / X" title="Twitter / X">
                    <FaXTwitter size={14} />
                  </a>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer__col">
              <h4 className="footer__col-title">{footer.quickLinksTitle || "Quick Links"}</h4>
              <ul className="footer__col-links">
                {(footer.quickLinks || QUICK_LINKS).map((link, idx) => (
                  <li key={idx}>
                    <Link to={link.href} className="footer__link">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Zones */}
            <div className="footer__col">
              <h4 className="footer__col-title">{footer.zonesTitle || "Activity Zones"}</h4>
              <ul className="footer__col-links">
                {(footer.zonesLinks || ZONES).map((link, idx) => (
                  <li key={idx}>
                    <Link to={link.href} className="footer__link">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div className="footer__col">
              <h4 className="footer__col-title">{footer.supportTitle || "Support"}</h4>
              <ul className="footer__col-links">
                {(footer.supportLinks || SUPPORT).map((link, idx) => (
                  <li key={idx}>
                    <Link to={link.href} className="footer__link">{link.label}</Link>
                  </li>
                ))}
              </ul>
              {/* Newsletter */}
              <div className="footer__newsletter">
                <p className="footer__newsletter-label">Get Offers in Your Inbox</p>
                <div className="footer__newsletter-form">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="footer__newsletter-input"
                    id="newsletter-email"
                  />
                  <button className="btn btn-gold btn-sm">Subscribe</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer__bottom">
        <div className="container-fluid footer__bottom-inner">
          <p>{footer.copyright || `© ${new Date().getFullYear()} PicnicUtkal. All rights reserved. Made with 💚 in Odisha.`}</p>
          <div className="footer__bottom-links">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/sitemap.xml">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}