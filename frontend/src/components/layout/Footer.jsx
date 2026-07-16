import { Link } from 'react-router-dom'
import { Leaf, Phone, Mail, MapPin } from 'lucide-react'

const QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Picnic Spots', href: '/spots' },
  { label: 'Live Map', href: '/map' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'About Us', href: '/about' },
]

const ZONES = [
  { label: '🏊 Swimming Zone', href: '/spots?zone=swimming' },
  { label: '🍖 BBQ Zone', href: '/spots?zone=cooking' },
  { label: '🎵 Music Zone', href: '/spots?zone=music' },
  { label: '🏕 Camping Zone', href: '/spots?zone=camping' },
  { label: '🎯 Adventure Zone', href: '/spots?zone=adventure' },
  { label: '👨‍👩‍👧 Family Zone', href: '/spots?zone=family' },
]

const SUPPORT = [
  { label: 'How to Book', href: '/about' },
  { label: 'Cancellation Policy', href: '/cancel-policy' },
  { label: 'Refund Policy', href: '/refund-policy' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms & Conditions', href: '/terms' },
  { label: 'Contact Support', href: '/contact' },
]

export default function Footer() {
  return (
    <footer className="footer">
      {/* Top Wave */}
      <div className="footer__wave">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="var(--dark-green)" />
        </svg>
      </div>

      <div className="footer__main">
        <div className="container">
          <div className="footer__grid">
            {/* Brand */}
            <div className="footer__brand">
              <Link to="/" className="footer__logo">
                <div className="footer__logo-icon">
                  <Leaf size={20} />
                </div>
                <span>Picnic<span className="text-gradient">Utkal</span></span>
              </Link>
              <p className="footer__tagline">
                Odisha's Premier Picnic Destination. Discover breathtaking nature spots, book your perfect picnic zone, and create unforgettable memories.
              </p>
              <div className="footer__contact">
                <a href="tel:+919876543210" className="footer__contact-item">
                  <Phone size={15} /> +91 98765 43210
                </a>
                <a href="mailto:hello@picnicutkal.com" className="footer__contact-item">
                  <Mail size={15} /> hello@picnicutkal.com
                </a>
                <span className="footer__contact-item">
                  <MapPin size={15} /> Bhubaneswar, Odisha 751001
                </span>
              </div>
              <div className="footer__socials">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer__social" aria-label="Instagram">
                  IG
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer__social" aria-label="Facebook">
                  FB
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="footer__social" aria-label="YouTube">
                  YT
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer__social" aria-label="Twitter">
                  TW
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer__col">
              <h4 className="footer__col-title">Quick Links</h4>
              <ul className="footer__col-links">
                {QUICK_LINKS.map(link => (
                  <li key={link.href}>
                    <Link to={link.href} className="footer__link">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Zones */}
            <div className="footer__col">
              <h4 className="footer__col-title">Activity Zones</h4>
              <ul className="footer__col-links">
                {ZONES.map(link => (
                  <li key={link.href}>
                    <Link to={link.href} className="footer__link">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div className="footer__col">
              <h4 className="footer__col-title">Support</h4>
              <ul className="footer__col-links">
                {SUPPORT.map(link => (
                  <li key={link.href}>
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
        <div className="container footer__bottom-inner">
          <p>© {new Date().getFullYear()} PicnicUtkal. All rights reserved. Made with 💚 in Odisha.</p>
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