import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuthStore } from '../store'
import { motion } from 'framer-motion'
import {
  User, Mail, Phone, Calendar, Users, FileText,
  CreditCard, Smartphone, Banknote, CheckCircle2,
  ArrowRight, ArrowLeft, IndianRupee, MapPin, Loader2,
  PartyPopper, Copy, Check, ShieldCheck, Clock,
  IdCard, Star, Sparkles, ChevronRight, ShieldAlert
} from 'lucide-react'

const STEPS = [
  { label: 'Contact Details', icon: User },
  { label: 'Visitor Details', icon: Users },
  { label: 'Review & Pay',   icon: CreditCard },
  { label: 'Confirmation',    icon: CheckCircle2 }
]

const PAYMENT_METHODS = [
  { id: 'upi',  label: 'UPI Payment',   icon: Smartphone, desc: 'PhonePe · GPay · Paytm · BHIM' },
  { id: 'card', label: 'Debit / Credit Card', icon: CreditCard, desc: 'Visa · MasterCard · Rupay' },
  { id: 'cash', label: 'Pay at Venue',  icon: Banknote,    desc: 'Cash on arrival at the gate' }
]

function FieldLabel({ icon: Icon, text, optional }) {
  return (
    <label className="bk2-label">
      {Icon && <Icon size={12} />}
      {text}
      {optional && <span className="bk2-optional">(optional)</span>}
    </label>
  )
}

export default function BookingPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { user, token, isAuthenticated, logout } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated && location.state) {
      sessionStorage.setItem('pending_booking', JSON.stringify(location.state))
    }
  }, [isAuthenticated, location.state])

  const [plot, setPlot] = useState(location.state?.plot || null)
  const [spot, setSpot] = useState(location.state?.spot || null)
  const [fetching, setFetching] = useState(false)

  const [step, setStep]       = useState(0)
  const [loading, setLoading] = useState(false)
  const [booking, setBooking] = useState(null)
  const [error, setError]     = useState('')
  const [copied, setCopied]   = useState(false)

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  const isCottage = plot?.isCottage || spot?.isCottage || false
  const pricePerPerson = plot?.price || spot?.basePrice || 0

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    visitDate: location.state?.initialDate || tomorrowStr,
    persons: location.state?.initialGuests || 1,
    specialNote: '',
    paymentMethod: 'upi'
  })

  // Dynamic visitor details
  const [visitors, setVisitors] = useState(() => {
    const initialCount = location.state?.initialGuests || 1
    return Array(initialCount).fill({ name: '', aadhaar: '' })
  })

  // Sync visitor details array size with number of persons
  useEffect(() => {
    setVisitors(prev => {
      const count = form.persons
      if (count > prev.length) {
        return [...prev, ...Array(count - prev.length).fill({ name: '', aadhaar: '' })]
      }
      return prev.slice(0, count)
    })
  }, [form.persons])

  // Fetch Plot or Spot details if not passed via state
  useEffect(() => {
    if (!plot && !spot) {
      const plotId = searchParams.get('plotId')
      const spotId = searchParams.get('spotId')

      if (plotId) {
        setFetching(true)
        // Check local default plots first to make it instant for seeds
        fetch(`/api/map/plots/${plotId}`)
          .then(r => r.json())
          .then(d => {
            if (d.success) setPlot(d.data)
            else setError('Zone not found.')
          })
          .catch(() => setError('Error loading zone details.'))
          .finally(() => setFetching(false))
      } else if (spotId) {
        setFetching(true)
        fetch(`/api/spots/${spotId}`)
          .then(r => r.json())
          .then(d => {
            if (d.success) setSpot(d.data)
            else if (d.name) setSpot(d) // local fallback
            else setError('Spot not found.')
          })
          .catch(() => setError('Error loading spot details.'))
          .finally(() => setFetching(false))
      } else {
        setError('No item selected for booking. Please go back to the Map or Spots tab.')
      }
    }
  }, [plot, spot, searchParams])

  const total = pricePerPerson * form.persons

  const validateDetails = () => {
    if (!form.name.trim())                return 'Full name is required.'
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Valid email address is required.'
    if (!/^[6-9]\d{9}$/.test(form.phone)) return 'Valid 10-digit Indian mobile number is required.'
    if (!form.visitDate)                  return 'Please select a visit date.'
    const selected = new Date(form.visitDate)
    const today    = new Date(); today.setHours(0,0,0,0)
    if (selected <= today)                return 'Visit date must be tomorrow or later.'
    if (form.persons < 1)                 return 'At least 1 person is required.'
    return ''
  }

  const validateVisitors = () => {
    for (let i = 0; i < visitors.length; i++) {
      const v = visitors[i]
      if (!v.name.trim()) return `Person ${i + 1}: Full name is required.`
      if (v.aadhaar && !/^\d{12}$/.test(v.aadhaar)) return `Person ${i + 1}: Aadhaar must be 12 digits.`
    }
    return ''
  }

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: name === 'persons' ? Math.max(1, Number(value)) : value }))
    setError('')
  }

  const handleVisitorChange = (idx, field, value) => {
    setVisitors(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      return next
    })
    setError('')
  }

  const handleStep0Next = () => {
    const err = validateDetails()
    if (err) { setError(err); return }
    // Pre-fill visitor 0 with the main contact name
    setVisitors(prev => {
      const next = [...prev]
      if (!next[0]?.name) next[0] = { ...next[0], name: form.name }
      return next
    })
    setStep(1)
  }

  const handleStep1Next = () => {
    const err = validateVisitors()
    if (err) { setError(err); return }
    setStep(2)
  }

  const handleConfirmPayment = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/bookings', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plotId:        plot?._id || spot?.id || 'spot-booking',
          plotTitle:     plot?.title || spot?.name || 'Picnic Spot Booking',
          plotPrice:     pricePerPerson,
          name:          form.name,
          email:         form.email,
          phone:         form.phone,
          visitDate:     form.visitDate,
          persons:       form.persons,
          specialNote:   form.specialNote,
          paymentMethod: form.paymentMethod,
          visitors:      visitors
        })
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || 'Booking failed. Please try again.')
      setBooking(data.data)
      setStep(3)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyId = () => {
    navigator.clipboard?.writeText(booking?.bookingId || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const activeTitle = plot?.title || spot?.name || 'Booking Form'

  if (fetching) {
    return (
      <div className="bk-page-container container section flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 size={40} className="bk2-spin text-gold" />
        <p className="mt-4 text-white/60">Loading reservation details...</p>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{`Book ${activeTitle} | PicnicUtkal`}</title>
        <meta name="description" content={`Booking form page for reserving ${activeTitle} at Picnic Utkal.`} />
      </Helmet>

      <div className="bk-page-container container section">
        {/* Breadcrumb */}
        <div className="spot-breadcrumb">
          <Link to="/">Home</Link> <ChevronRight size={12} />
          {plot ? <Link to="/map">Interactive Map</Link> : <Link to="/spots">Spots</Link>} <ChevronRight size={12} />
          <span>Book {activeTitle}</span>
        </div>

        {/* Outer Grid Layout */}
        <div className="bk-page-grid">
          {/* Left Column: Form & Stepper */}
          <div className="bk-page-main">
            <div className="glass-card bk-card-wrapper">
              {!isAuthenticated || !token || !user ? (
                <div style={{ padding: '30px 20px', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', backgroundColor: 'rgba(201,168,76,0.1)', color: 'var(--gold)', marginBottom: '20px' }}>
                    <User size={36} />
                  </div>
                  <h2 className="heading-3" style={{ marginBottom: '10px' }}>Visitor Sign In Required</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '15px', lineHeight: '1.6', maxWidth: '440px', margin: '0 auto 24px' }}>
                    Please log in to your PicnicUtkal account to complete your slot booking, register gate access, and proceed with payment.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '280px', margin: '0 auto' }}>
                    <Link to="/login" className="btn btn-gold w-full">Sign In to Continue</Link>
                    <Link to="/register" className="btn btn-outline w-full">Create Free Account</Link>
                  </div>
                </div>
              ) : user.role === 'admin' ? (
                <div style={{ padding: '30px 20px', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', backgroundColor: 'rgba(250,82,82,0.1)', color: 'var(--error)', marginBottom: '20px' }}>
                    <ShieldAlert size={36} />
                  </div>
                  <h2 className="heading-3" style={{ color: 'var(--error)', marginBottom: '10px' }}>Booking Restricted for Admins</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '15px', lineHeight: '1.6', maxWidth: '440px', margin: '0 auto 24px' }}>
                    You are currently logged in as an <strong>Administrator</strong>. Admin accounts are restricted from reserving picnic tables or cottage rooms. Please sign out and sign in with a visitor account.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '280px', margin: '0 auto' }}>
                    <button
                      onClick={() => { logout(); navigate('/login'); }}
                      className="btn btn-gold w-full"
                    >
                      Log Out &amp; Sign In as Visitor
                    </button>
                    <Link to="/" className="btn btn-outline w-full">Return to Home</Link>
                  </div>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="bk-page-header">
                    <div className="bk2-header-left">
                      <div className="bk2-header-icon" style={{ background: `${plot?.color || '#C9A84C'}22`, borderColor: `${plot?.color || '#C9A84C'}44` }}>
                        <MapPin size={18} style={{ color: plot?.color || '#C9A84C' }} />
                      </div>
                      <div>
                        <h1 className="bk-page-main-title">Book {activeTitle}</h1>
                        <div className="bk2-header-meta">
                          {!isCottage
                            ? <><IndianRupee size={11} />{pricePerPerson.toLocaleString()} per person</>
                            : <>₹{pricePerPerson.toLocaleString()} per night</>
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Steps */}
                  <div className="bk-page-steps">
                    {STEPS.map((s, i) => (
                      <div key={s.label} className={`bk-page-step-tab ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
                        <div className="bk-page-step-circle">
                          {i < step ? <CheckCircle2 size={14} /> : <span>{i + 1}</span>}
                        </div>
                        <span className="bk-page-step-lbl">{s.label}</span>
                        {i < STEPS.length - 1 && <div className="bk-page-step-connector" />}
                      </div>
                    ))}
                  </div>

                  <div className="bk-page-body-content">
                    {/* ══ STEP 0: Contact Details ══ */}
                    {step === 0 && (
                      <div className="bk2-section-wrap">
                        <div className="bk2-section-title"><User size={14} />Contact Details</div>

                        <div className="bk2-grid-2">
                          <div className="bk2-field bk2-full">
                            <FieldLabel icon={User} text="Full Name" />
                            <input className="bk2-input" name="name" value={form.name}
                              onChange={handleChange} placeholder="Your full name" />
                          </div>

                          <div className="bk2-field">
                            <FieldLabel icon={Mail} text="Email" />
                            <input className="bk2-input" name="email" type="email" value={form.email}
                              onChange={handleChange} placeholder="you@email.com" />
                          </div>

                          <div className="bk2-field">
                            <FieldLabel icon={Phone} text="Mobile" />
                            <input className="bk2-input" name="phone" type="tel" value={form.phone}
                              onChange={handleChange} placeholder="10-digit number" maxLength={10} />
                          </div>

                          <div className="bk2-field">
                            <FieldLabel icon={Calendar} text="Visit Date" />
                            <input className="bk2-input" name="visitDate" type="date" value={form.visitDate}
                              min={tomorrowStr} onChange={handleChange} />
                          </div>

                          <div className="bk2-field">
                            <FieldLabel icon={Users} text="Number of Persons" />
                            <div className="bk2-stepper">
                              <button className="bk2-step-btn"
                                onClick={() => setForm(f => ({ ...f, persons: Math.max(1, f.persons - 1) }))}>−</button>
                              <span className="bk2-step-val">{form.persons}</span>
                              <button className="bk2-step-btn"
                                onClick={() => setForm(f => ({ ...f, persons: Math.min(plot?.capacity || spot?.capacity || 500, f.persons + 1) }))}>+</button>
                            </div>
                          </div>

                          <div className="bk2-field bk2-full">
                            <FieldLabel icon={FileText} text="Special Note" optional />
                            <textarea className="bk2-input bk2-textarea" name="specialNote"
                              value={form.specialNote} onChange={handleChange}
                              placeholder="Any special requirements..." rows={2} />
                          </div>
                        </div>

                        {error && <div className="bk2-error">{error}</div>}

                        <button className="bk2-btn-gold" onClick={handleStep0Next}>
                          Continue — Add Visitor Details <ArrowRight size={15} />
                        </button>
                      </div>
                    )}

                    {/* ══ STEP 1: Visitor Names & Aadhaar ══ */}
                    {step === 1 && (
                      <div className="bk2-section-wrap">
                        <div className="bk2-section-title"><IdCard size={14} />Visitor Details</div>
                        <p className="bk2-hint">Please provide names and Aadhaar details for all visitors for gate entry clearance.</p>

                        <div className="bk2-visitors-list">
                          {visitors.map((v, i) => (
                            <div key={i} className="bk2-visitor-card">
                              <div className="bk2-visitor-num">
                                <span>{i + 1}</span>
                                {i === 0 && <div className="bk2-visitor-lead-tag">Lead Contact</div>}
                              </div>
                              <div className="bk2-visitor-fields">
                                <div className="bk2-field">
                                  <FieldLabel icon={User} text="Full Name" />
                                  <input className="bk2-input" value={v.name} placeholder={`Visitor ${i + 1} Name`}
                                    onChange={e => handleVisitorChange(i, 'name', e.target.value)} />
                                </div>
                                <div className="bk2-field">
                                  <FieldLabel icon={IdCard} text="Aadhaar Number" optional />
                                  <input className="bk2-input" value={v.aadhaar} placeholder="12-digit Aadhaar"
                                    maxLength={12} inputMode="numeric"
                                    onChange={e => handleVisitorChange(i, 'aadhaar', e.target.value.replace(/\D/g, ''))} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {error && <div className="bk2-error">{error}</div>}

                        <div className="bk2-btn-row">
                          <button className="bk2-btn-ghost" onClick={() => setStep(0)}>
                            <ArrowLeft size={14} /> Back
                          </button>
                          <button className="bk2-btn-gold" onClick={handleStep1Next}>
                            Review &amp; Payment <ArrowRight size={15} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ══ STEP 2: Review & Pay ══ */}
                    {step === 2 && (
                      <div className="bk2-section-wrap">
                        <div className="bk2-section-title"><CreditCard size={14} />Select Payment Method</div>

                        <div className="bk2-pay-methods">
                          {PAYMENT_METHODS.map(m => (
                            <label key={m.id} className={`bk2-pay-card ${form.paymentMethod === m.id ? 'selected' : ''}`}>
                              <input type="radio" name="paymentMethod" value={m.id}
                                checked={form.paymentMethod === m.id} onChange={handleChange} className="sr-only" />
                              <div className="bk2-pay-icon"><m.icon size={19} /></div>
                              <div className="bk2-pay-text">
                                <div className="bk2-pay-label">{m.label}</div>
                                <div className="bk2-pay-desc">{m.desc}</div>
                              </div>
                              {form.paymentMethod === m.id && (
                                <CheckCircle2 size={16} className="bk2-pay-check" />
                              )}
                            </label>
                          ))}
                        </div>

                        {form.paymentMethod === 'upi' && (
                          <div className="bk2-upi-note">📱 UPI app checkout prompt will launch on confirmation.</div>
                        )}

                        <div className="bk2-secure-note">
                          <ShieldCheck size={13} /> Secure SSL Encrypted checkout
                        </div>

                        {error && <div className="bk2-error">{error}</div>}

                        <div className="bk2-btn-row">
                          <button className="bk2-btn-ghost" onClick={() => setStep(1)}>
                            <ArrowLeft size={14} /> Back
                          </button>
                          <button className="bk2-btn-green" onClick={handleConfirmPayment} disabled={loading}>
                            {loading
                              ? <><Loader2 size={15} className="bk2-spin" /> Processing booking…</>
                              : <><CheckCircle2 size={15} /> Confirm &amp; Pay ₹{total.toLocaleString()}</>
                            }
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ══ STEP 3: Confirmed ══ */}
                    {step === 3 && booking && (
                      <div className="bk2-section-wrap bk2-confirmed-wrap">
                        <div className="bk2-confetti-icon">🎉</div>
                        <h3 className="bk2-confirmed-h">Booking Confirmed!</h3>
                        <p className="bk2-confirmed-sub">Your booking has been successful. Please show the booking receipt at the gate entrance.</p>

                        <div className="bk2-booking-id-box">
                          <div className="bk2-booking-id-lbl">Booking ID</div>
                          <div className="bk2-booking-id-row">
                            <span className="bk2-booking-id">{booking.bookingId}</span>
                            <button className="bk2-copy-btn" onClick={copyId}>
                              {copied ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                          </div>
                        </div>

                        <div className="bk2-conf-table">
                          {[
                            ['Zone / Spot', booking.plotTitle],
                            ['Lead Guest',  booking.name],
                            ['Phone',      booking.phone],
                            ['Email',      booking.email],
                            ['Visit Date', new Date(booking.visitDate).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' })],
                            ['Persons',    `${booking.persons} person(s)`],
                            ['Total Paid', `₹${booking.totalAmount?.toLocaleString()}`],
                            ['Payment',    booking.paymentMethod?.toUpperCase()],
                            ['Status',     '✅ Confirmed'],
                          ].map(([lbl, val]) => (
                            <div key={lbl} className="bk2-conf-row">
                              <span className="bk2-conf-lbl">{lbl}</span>
                              <span className="bk2-conf-val">{val}</span>
                            </div>
                          ))}
                        </div>

                        {visitors.length > 0 && (
                          <div className="bk2-conf-visitors">
                            <div className="bk2-section-title"><Users size={13} />Registered Visitors</div>
                            {visitors.map((v, i) => (
                              <div key={i} className="bk2-cv-row">
                                <span className="bk2-cv-num">{i + 1}</span>
                                <span className="bk2-cv-name">{v.name}</span>
                                {v.aadhaar && <span className="bk2-cv-aadh">••••••••{v.aadhaar.slice(-4)}</span>}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="bk2-help-note">
                          📞 Reservation Support: <strong>+91 98765 43210</strong>
                        </div>

                        <button className="bk2-btn-gold" onClick={() => navigate(plot ? '/map' : '/spots')}>
                          Done — Return to Map
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Summary & Sidebar (Only for Steps 0, 1, 2) */}
          {step < 3 && (
            <div className="bk-page-sidebar">
              <div className="booking-sticky-card glass-card">
                <div className="bk2-section-title" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                  <Star size={14} /> Booking Summary
                </div>

                <div className="bk-sidebar-item-info">
                  <h3>{activeTitle}</h3>
                  <p>{plot?.description || spot?.description?.slice(0, 120)}...</p>
                </div>

                <div className="price-breakdown-card">
                  <span className="breakdown-title">Pricing &amp; Details</span>
                  <div className="breakdown-rows">
                    <div className="breakdown-row">
                      <span>Rate</span>
                      <span>₹{pricePerPerson.toLocaleString()} {!plot?.isCottage ? '/person' : '/night'}</span>
                    </div>
                    <div className="breakdown-row">
                      <span>Persons</span>
                      <span>{form.persons} visitor{form.persons > 1 ? 's' : ''}</span>
                    </div>
                    <div className="breakdown-row">
                      <span>Visit Date</span>
                      <span>{new Date(form.visitDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                    {form.specialNote && (
                      <div className="breakdown-row" style={{ marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Note: {form.specialNote}</span>
                      </div>
                    )}
                    <hr className="breakdown-divider" />
                    <div className="breakdown-row breakdown-row--total">
                      <span>Total Price</span>
                      <span>₹{total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {step === 2 && visitors.length > 0 && (
                  <div className="bk-sidebar-visitors">
                    <span className="breakdown-title">Visitor Checklist</span>
                    <div className="bk-sidebar-v-list">
                      {visitors.map((v, idx) => (
                        <div key={idx} className="bk-sidebar-v-item">
                          <CheckCircle2 size={12} className="text-gold" />
                          <span>{v.name || `Visitor ${idx + 1}`}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="booking-card-footer mt-4">
                  <p><ShieldCheck size={14} color="var(--success)" /> Verified Secured Reservation</p>
                  <p><Clock size={14} /> Full refund cancellation up to 48h prior</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
