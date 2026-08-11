import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LuX as X, LuUser as User, LuMail as Mail, LuPhone as Phone, LuCalendar as Calendar, LuUsers as Users, LuFileText as FileText,
  LuCreditCard as CreditCard, LuSmartphone as Smartphone, LuBanknote as Banknote, LuCircleCheck as CheckCircle2,
  LuArrowRight as ArrowRight, LuArrowLeft as ArrowLeft, LuIndianRupee as IndianRupee, LuMapPin as MapPin, LuLoader as Loader2,
  LuPartyPopper as PartyPopper, LuCopy as Copy, LuCheck as Check, LuShieldCheck as ShieldCheck, LuClock as Clock,
  LuIdCard as IdCard, LuChevronDown as ChevronDown, LuChevronUp as ChevronUp, LuStar as Star, LuSparkles as Sparkles
} from 'react-icons/lu'

const STEPS = [
  { label: 'Details',   icon: User },
  { label: 'Visitors',  icon: Users },
  { label: 'Payment',   icon: CreditCard },
  { label: 'Confirmed', icon: CheckCircle2 }
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

export default function BookingModal({ plot, onClose }) {
  const { emitNewBooking, emitPlotStatusChange } = useSocket()
  const [step, setStep]       = useState(0)
  const [loading, setLoading] = useState(false)
  const [booking, setBooking] = useState(null)
  const [error, setError]     = useState('')
  const [copied, setCopied]   = useState(false)

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  const pricePerPerson = plot?.price || 0

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    visitDate: tomorrowStr,
    persons: 1,
    specialNote: '',
    paymentMethod: 'upi'
  })

  // Dynamic per-person visitor list
  const [visitors, setVisitors] = useState([{ name: '', aadhaar: '' }])

  // Keep visitors array in sync with person count
  useEffect(() => {
    setVisitors(prev => {
      const count = form.persons
      if (count > prev.length) {
        return [...prev, ...Array(count - prev.length).fill({ name: '', aadhaar: '' })]
      }
      return prev.slice(0, count)
    })
  }, [form.persons])

  const total = pricePerPerson // Fixed flat rate per pandal/plot

  /* ── Validation helpers ── */
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
          plotId:        plot._id,
          plotTitle:     plot.title,
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

      // Emit real-time socket events
      emitNewBooking({
        pandalName: plot?.title || 'Picnic Pandal',
        visitDate: form.visitDate,
        total: total,
        customerName: form.name
      })
      emitPlotStatusChange(plot?._id, 'booked')
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

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        className="bk2-backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        className="bk2-modal"
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        role="dialog" aria-modal="true"
      >
        {/* ── Header ── */}
        <div className="bk2-header">
          <div className="bk2-header-left">
            <div className="bk2-header-icon" style={{ background: `${plot?.color || '#C9A84C'}22`, borderColor: `${plot?.color || '#C9A84C'}44` }}>
              <MapPin size={17} style={{ color: plot?.color || '#C9A84C' }} />
            </div>
            <div>
              <div className="bk2-header-zone">{plot?.title}</div>
              <div className="bk2-header-meta">
                {!plot?.isCottage
                  ? <><IndianRupee size={11} />{pricePerPerson.toLocaleString()} per person</>
                  : <>₹{pricePerPerson.toLocaleString()} per night</>
                }
              </div>
            </div>
          </div>
          <button className="bk2-close" onClick={onClose}><X size={17} /></button>
        </div>

        {/* ── Step Tabs ── */}
        <div className="bk2-steps">
          {STEPS.map((s, i) => (
            <div key={s.label} className={`bk2-step-tab ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
              <div className="bk2-step-num">
                {i < step ? <CheckCircle2 size={13} /> : i + 1}
              </div>
              <span>{s.label}</span>
              {i < STEPS.length - 1 && <div className="bk2-step-connector" />}
            </div>
          ))}
        </div>

        {/* ── Scrollable Body ── */}
        <div className="bk2-body">

          {/* ════ STEP 0 — Contact Details ════ */}
          {step === 0 && (
            <motion.div key="s0" className="bk2-section-wrap"
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>

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
                      onClick={() => setForm(f => ({ ...f, persons: Math.min(plot?.capacity || 500, f.persons + 1) }))}>+</button>
                  </div>
                </div>

                <div className="bk2-field bk2-full">
                  <FieldLabel icon={FileText} text="Special Note" optional />
                  <textarea className="bk2-input bk2-textarea" name="specialNote"
                    value={form.specialNote} onChange={handleChange}
                    placeholder="Any special requirements..." rows={2} />
                </div>
              </div>

              {/* Live price preview */}
              {!plot?.isCottage && (
                <div className="bk2-price-preview">
                  <div className="bk2-price-preview-row">
                    <span>₹{pricePerPerson} × {form.persons} person{form.persons > 1 ? 's' : ''}</span>
                    <strong className="bk2-price-big">₹{total.toLocaleString()}</strong>
                  </div>
                </div>
              )}

              {error && <div className="bk2-error">{error}</div>}

              <button className="bk2-btn-gold" onClick={handleStep0Next}>
                Continue — Add Visitor Details <ArrowRight size={15} />
              </button>
            </motion.div>
          )}

          {/* ════ STEP 1 — Visitor Names & Aadhaar ════ */}
          {step === 1 && (
            <motion.div key="s1" className="bk2-section-wrap"
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>

              <div className="bk2-section-title"><IdCard size={14} />Visitor Details</div>
              <p className="bk2-hint">Please fill in the details for each visitor. Aadhaar is optional but recommended for entry verification.</p>

              <div className="bk2-visitors-list">
                {visitors.map((v, i) => (
                  <div key={i} className="bk2-visitor-card">
                    <div className="bk2-visitor-num">
                      <span>{i + 1}</span>
                      {i === 0 && <div className="bk2-visitor-lead-tag">Main Contact</div>}
                    </div>
                    <div className="bk2-visitor-fields">
                      <div className="bk2-field">
                        <FieldLabel icon={User} text="Full Name" />
                        <input className="bk2-input" value={v.name} placeholder={`Visitor ${i + 1} name`}
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
                  Review & Payment <ArrowRight size={15} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ════ STEP 2 — Payment ════ */}
          {step === 2 && (
            <motion.div key="s2" className="bk2-section-wrap"
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>

              {/* Order Summary */}
              <div className="bk2-section-title"><IndianRupee size={14} />Order Summary</div>
              <div className="bk2-summary-card">
                <div className="bk2-summary-row">
                  <span>{plot?.title}</span>
                  <span>₹{pricePerPerson.toLocaleString()} {!plot?.isCottage ? '/Pindi' : '/night'}</span>
                </div>
                <div className="bk2-summary-row">
                  <span>Persons</span>
                  <span>× {form.persons}</span>
                </div>
                <div className="bk2-summary-row">
                  <span>Visit Date</span>
                  <span>{new Date(form.visitDate).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="bk2-summary-divider" />
                <div className="bk2-summary-row bk2-summary-total">
                  <span>Total Amount</span>
                  <strong>₹{total.toLocaleString()}</strong>
                </div>
              </div>

              {/* Guest Info */}
              <div className="bk2-guest-chips">
                <div className="bk2-chip"><User size={11} />{form.name}</div>
                <div className="bk2-chip"><Phone size={11} />{form.phone}</div>
                <div className="bk2-chip"><Calendar size={11} />{form.visitDate}</div>
              </div>

              {/* Visitor Summary */}
              <div className="bk2-section-title" style={{ marginTop: '12px' }}><Users size={14} />Visitors ({form.persons})</div>
              <div className="bk2-visitor-summary">
                {visitors.map((v, i) => (
                  <div key={i} className="bk2-visitor-summary-row">
                    <span className="bk2-vs-num">{i + 1}</span>
                    <span className="bk2-vs-name">{v.name || '—'}</span>
                    {v.aadhaar && <span className="bk2-vs-aadh">XXXX-XXXX-{v.aadhaar.slice(-4)}</span>}
                  </div>
                ))}
              </div>

              {/* Payment Method */}
              <div className="bk2-section-title" style={{ marginTop: '16px' }}><CreditCard size={14} />Payment Method</div>
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
                <div className="bk2-upi-note">📱 UPI payment prompt will appear after confirmation.</div>
              )}

              <div className="bk2-secure-note">
                <ShieldCheck size={13} /> Secured by 256-bit SSL encryption
              </div>

              {error && <div className="bk2-error">{error}</div>}

              <div className="bk2-btn-row">
                <button className="bk2-btn-ghost" onClick={() => setStep(1)}>
                  <ArrowLeft size={14} /> Back
                </button>
                <button className="bk2-btn-green" onClick={handleConfirmPayment} disabled={loading}>
                  {loading
                    ? <><Loader2 size={15} className="bk2-spin" /> Processing…</>
                    : <><CheckCircle2 size={15} /> Confirm &amp; Pay ₹{total.toLocaleString()}</>
                  }
                </button>
              </div>
            </motion.div>
          )}

          {/* ════ STEP 3 — Confirmed ════ */}
          {step === 3 && booking && (
            <motion.div key="s3" className="bk2-section-wrap bk2-confirmed-wrap"
              initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}>

              <div className="bk2-confetti-icon">🎉</div>
              <h3 className="bk2-confirmed-h">Booking Confirmed!</h3>
              <p className="bk2-confirmed-sub">Your spot has been reserved. Show this ID at the entrance.</p>

              {/* Booking ID */}
              <div className="bk2-booking-id-box">
                <div className="bk2-booking-id-lbl">Booking ID</div>
                <div className="bk2-booking-id-row">
                  <span className="bk2-booking-id">{booking.bookingId}</span>
                  <button className="bk2-copy-btn" onClick={copyId}>
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Details table */}
              <div className="bk2-conf-table">
                {[
                  ['Zone',       booking.plotTitle],
                  ['Guest',      booking.name],
                  ['Phone',      booking.phone],
                  ['Email',      booking.email],
                  ['Visit Date', new Date(booking.visitDate).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' })],
                  ['Persons',    `${booking.persons} person${booking.persons > 1 ? 's' : ''}`],
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

              {/* Visitors */}
              {visitors.length > 0 && (
                <div className="bk2-conf-visitors">
                  <div className="bk2-section-title"><Users size={13} />Registered Visitors</div>
                  {visitors.map((v, i) => (
                    <div key={i} className="bk2-cv-row">
                      <span className="bk2-cv-num">{i + 1}</span>
                      <span className="bk2-cv-name">{v.name}</span>
                      {v.aadhaar && <span className="bk2-cv-aadh">••••{v.aadhaar.slice(-4)}</span>}
                    </div>
                  ))}
                </div>
              )}

              <div className="bk2-help-note">
                📞 Need help? Call <strong>+91 98765 43210</strong><br />
                <Clock size={11} /> Easy cancellation up to 48 hours prior
              </div>

              <button className="bk2-btn-gold" onClick={onClose}>
                <Sparkles size={14} /> Done — All Set!
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
