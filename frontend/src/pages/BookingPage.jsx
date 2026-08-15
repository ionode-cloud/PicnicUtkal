import { useState, useEffect } from 'react'
import SpotAvailabilityCalendar from '../components/ui/SpotAvailabilityCalendar'
import { useLocation, useNavigate, Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuthStore } from '../store'
import { buildApiUrl } from '../services/api'
import { useSocket } from '../context/SocketContext'
import { motion } from 'framer-motion'
import {
  LuUser as User, LuMail as Mail, LuPhone as Phone, LuCalendar as Calendar, LuUsers as Users, LuFileText as FileText,
  LuCreditCard as CreditCard, LuSmartphone as Smartphone, LuBanknote as Banknote, LuCircleCheck as CheckCircle2,
  LuArrowRight as ArrowRight, LuArrowLeft as ArrowLeft, LuIndianRupee as IndianRupee, LuMapPin as MapPin, LuLoader as Loader2,
  LuPartyPopper as PartyPopper, LuCopy as Copy, LuCheck as Check, LuShieldCheck as ShieldCheck, LuClock as Clock,
  LuIdCard as IdCard, LuStar as Star, LuSparkles as Sparkles, LuChevronRight as ChevronRight, LuShieldAlert as ShieldAlert,
  LuReceipt as Receipt, LuPrinter as Printer, LuX as X, LuTicket as Ticket, LuDownload as Download, LuHouse as HomeIcon,
  LuBuilding2 as Building2, LuQrCode as QrCode
} from 'react-icons/lu'

const STEPS = [
  { label: 'Review & Pay', icon: CreditCard },
  { label: 'Confirmation', icon: CheckCircle2 }
]

const PAYMENT_METHODS = [
  { id: 'upi',  label: 'Pay via UPI QR Code', icon: Smartphone, desc: 'Scan & Pay via PhonePe, GPay, Paytm, BHIM' },
  { id: 'razorpay', label: 'Razorpay Online Gateway', icon: CreditCard, desc: 'Instant Debit / Credit Card & Netbanking' },
  { id: 'cash', label: 'Pay on Same Day (Cash / Spot Pay)', icon: Banknote, desc: 'Pay cash on arrival at picnic ground gate' }
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
  const [showBillModal, setShowBillModal] = useState(false)
  const [countdown, setCountdown] = useState(10)
  const [timerActive, setTimerActive] = useState(false)

  // Start countdown timer when step 1 (Confirmed) is reached
  useEffect(() => {
    if (step === 1) {
      setCountdown(10)
      setTimerActive(true)
    }
  }, [step])

  // Countdown tick effect: auto-redirects to Home after 10 seconds
  useEffect(() => {
    let interval = null
    if (step === 1 && timerActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
    } else if (step === 1 && timerActive && countdown === 0) {
      navigate('/')
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [step, timerActive, countdown, navigate])

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  const isCottage = plot?.isCottage || spot?.isCottage || false
  const pricePerPerson = plot?.price || spot?.basePrice || 0

  const getDraftForm = () => {
    try {
      const saved = localStorage.getItem('picnicutkal_checkout_form')
      return saved ? JSON.parse(saved) : null
    } catch (e) { return null }
  }

  const [upiConfig, setUpiConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('picnicutkal_upi_qr_config')
      if (saved) return JSON.parse(saved)
    } catch (e) {}
    return {
      enabled: true,
      upiId: 'picnicutkal@upi',
      payeeName: 'PicnicUtkal Resort',
      note: 'Picnic Spot Reservation',
      useCustomQrImage: false,
      customQrImage: '',
      instructions: 'Open PhonePe, Google Pay, Paytm, or BHIM app and scan the QR code to finish your reservation.',
      paymentConfirmationNote: 'After completing UPI transfer, click Confirm & Pay to get your instant QR reservation ticket.',
      showBankDetails: true,
      accountHolder: 'PicnicUtkal Tourism Pvt Ltd',
      bankName: 'HDFC Bank',
      accountNumber: '50200088991122',
      ifscCode: 'HDFC0001234'
    }
  })
  const [copiedUpi, setCopiedUpi] = useState(false)

  // Fetch UPI QR Config from SiteConfig on mount
  useEffect(() => {
    fetch(buildApiUrl('/api/site-config/upi_qr_config'))
      .then(r => r.json())
      .then(d => {
        if (d && (d.data || d.value)) {
          const val = d.data || d.value
          setUpiConfig(prev => ({ ...prev, ...val }))
          try { localStorage.setItem('picnicutkal_upi_qr_config', JSON.stringify(val)) } catch (e) {}
        }
      })
      .catch(() => {})
  }, [])

  // Socket listener for real-time UPI QR config updates
  const { socket } = useSocket()
  useEffect(() => {
    if (!socket) return
    const handleUpiUpdate = (data) => {
      if (data?.upiConfig) {
        setUpiConfig(data.upiConfig)
        try { localStorage.setItem('picnicutkal_upi_qr_config', JSON.stringify(data.upiConfig)) } catch (e) {}
      }
    }
    socket.on('upi_qr_config_update', handleUpiUpdate)
    return () => socket.off('upi_qr_config_update', handleUpiUpdate)
  }, [socket])

  const draftForm = getDraftForm()

  const [form, setForm] = useState(() => ({
    name: location.state?.initialName || draftForm?.name || user?.name || (user?.email ? user.email.split('@')[0] : 'Valued Visitor'),
    email: draftForm?.email || user?.email || 'visitor@picnicutkal.com',
    phone: location.state?.initialPhone || draftForm?.phone || user?.phone || '',
    visitDate: location.state?.initialDate || draftForm?.visitDate || tomorrowStr,
    durationDays: location.state?.durationDays || draftForm?.durationDays || 1,
    persons: location.state?.initialGuests || draftForm?.persons || 1,
    specialNote: draftForm?.specialNote || '',
    paymentMethod: draftForm?.paymentMethod || 'upi',
    transactionRef: draftForm?.transactionRef || ''
  }))

  useEffect(() => {
    localStorage.setItem('picnicutkal_checkout_form', JSON.stringify(form))
  }, [form])

  // Dynamic visitor details from PlotDetail
  const [visitors] = useState(() => [
    {
      name: location.state?.initialName || user?.name || (user?.email ? user.email.split('@')[0] : 'Lead Visitor'),
      aadhaar: location.state?.initialAadhaar || draftForm?.aadhaar || ''
    }
  ])

  // Sync form state if user logs in or state changes
  useEffect(() => {
    if (location.state?.initialName) {
      setForm(f => ({ ...f, name: location.state.initialName }))
    } else if (user) {
      setForm(f => ({
        ...f,
        name: f.name || user.name || (user.email ? user.email.split('@')[0] : 'Valued Visitor'),
        email: f.email || user.email || 'visitor@picnicutkal.com',
        phone: f.phone || user.phone || ''
      }))
    }
  }, [user, location.state])

  // Fetch Plot or Spot details if not passed via state or on page refresh
  useEffect(() => {
    const plotId = searchParams.get('plotId') || location.state?.plot?._id || location.state?.plot?.id
    const spotId = searchParams.get('spotId') || location.state?.spot?.id

    if (!plot && !spot) {
      if (plotId) {
        setFetching(true)
        fetch(buildApiUrl(`/api/map/plots/${plotId}`), { cache: 'no-store' })
          .then(async r => {
            if (r.status === 200) {
              const d = await r.json()
              if (d.success && d.data) {
                setPlot(d.data)
                setError('')
                return
              }
            }
            setError('Zone not found in database. Please return to the Map.')
          })
          .catch(() => setError('Error loading zone details.'))
          .finally(() => setFetching(false))
      } else if (spotId) {
        setFetching(true)
        fetch(buildApiUrl(`/api/spots/${spotId}`), { cache: 'no-store' })
          .then(async r => {
            if (r.status === 200) {
              const d = await r.json()
              if (d.success && d.data) {
                setSpot(d.data)
                setError('')
                return
              } else if (d.name) {
                setSpot(d)
                setError('')
                return
              }
            }
            setError('Spot not found.')
          })
          .catch(() => setError('Error loading spot details.'))
          .finally(() => setFetching(false))
      } else {
        setError('No item selected for booking. Please go back to the Map or Spots tab.')
      }
    }
  }, [plot, spot, searchParams, location.state])

  const selectedAddons = location.state?.selectedAddons || []
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + (Number(a.priceAddon) || Number(a.price) || 0), 0)
  const baseSpotTotal = pricePerPerson * (Number(form.durationDays) || 1)
  const total = baseSpotTotal + addonsTotal

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setError('')
  }

  const handleConfirmPayment = async () => {
    setError('')

    // Validate mandatory UTR for UPI payments
    if (form.paymentMethod === 'upi') {
      const utr = (form.transactionRef || '').trim()
      if (!utr) {
        setError('⚠️ Please enter the UPI Transaction ID / UTR Number to confirm your reservation.')
        toast.error('UPI UTR Number is required to confirm booking!')
        return
      }
      if (utr.length < 6) {
        setError('⚠️ Please enter a valid UPI Transaction / UTR reference number (minimum 6 digits).')
        toast.error('Please enter a valid UTR number')
        return
      }
    }

    setLoading(true)
    try {
      const res = await fetch(buildApiUrl('/api/bookings'), {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plotId:        plot?._id || spot?.id || 'spot-booking',
          plotTitle:     plot?.title || spot?.name || 'Picnic Spot Booking',
          plotPrice:     pricePerPerson || 499,
          durationDays:  Number(form.durationDays || 1),
          totalAmount:   total || pricePerPerson || 499,
          name:          form.name || user?.name || (user?.email ? user.email.split('@')[0] : 'Valued Visitor'),
          email:         form.email || user?.email || 'visitor@picnicutkal.com',
          phone:         form.phone || location.state?.initialPhone || user?.phone || '9876543210',
          visitDate:     form.visitDate || tomorrowStr,
          persons:       Number(form.persons || location.state?.initialGuests || 1),
          specialNote:   form.specialNote || '',
          paymentMethod: form.paymentMethod || 'upi',
          transactionRef: (form.transactionRef || '').trim(),
          visitors:      visitors,
          selectedAddons: selectedAddons
        })
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Booking failed. Please try again.')
      }
      
      const confirmedBooking = data.data || data.booking
      setBooking(confirmedBooking)
      setStep(1)
      toast.success('🎉 Booking Confirmed Successfully!')

      try {
        localStorage.setItem('picnicutkal_last_invoice', JSON.stringify(confirmedBooking))
        const existing = JSON.parse(localStorage.getItem('picnicutkal_my_bookings') || '[]')
        const updated = [confirmedBooking, ...existing.filter(b => b.bookingId !== confirmedBooking.bookingId && b._id !== confirmedBooking._id)]
        localStorage.setItem('picnicutkal_my_bookings', JSON.stringify(updated))
        localStorage.removeItem('picnicutkal_checkout_form')
      } catch (e) {}
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyId = () => {
    navigator.clipboard?.writeText(booking?.bookingId || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const triggerDirectBillDownload = (targetBk) => {
    const bkData = targetBk || booking || {}
    const addonsToPass = bkData.selectedAddons || selectedAddons || []
    const params = new URLSearchParams({
      bookingId: bkData.bookingId || bkData._id || 'PK-1001',
      name: bkData.name || form.name || '',
      phone: bkData.phone || form.phone || '',
      spot: bkData.plotTitle || activeTitle || 'Picnic Spot',
      date: bkData.visitDate || form.visitDate || '',
      duration: bkData.durationDays || form.durationDays || 1,
      guests: bkData.persons || form.persons || 1,
      total: bkData.totalAmount || total || 0,
      addons: JSON.stringify(addonsToPass),
      autoprint: 'true'
    })

    let iframe = document.getElementById('direct-bill-download-iframe')
    if (!iframe) {
      iframe = document.createElement('iframe')
      iframe.id = 'direct-bill-download-iframe'
      iframe.style.position = 'fixed'
      iframe.style.right = '-9999px'
      iframe.style.bottom = '-9999px'
      iframe.style.width = '0'
      iframe.style.height = '0'
      iframe.style.border = '0'
      document.body.appendChild(iframe)
    }

    iframe.src = `/bill.html?${params.toString()}`
    iframe.onload = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow.focus()
          iframe.contentWindow.print()
        } catch (e) {
          window.open(`/bill.html?${params.toString()}`, '_blank')
        }
      }, 300)
    }
  }

  const activeTitle = plot?.title || spot?.name || 'Booking Form'

  if (fetching) {
    return (
      <div className="bk-page-container container-fluid section flex flex-col items-center justify-center min-h-[60vh]">
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

      <div className="bk-page-container container-fluid section">
        {/* Breadcrumb */}
        <div className="spot-breadcrumb">
          <Link to="/">Home</Link> <ChevronRight size={12} />
          {plot ? <Link to="/map">Interactive Map</Link> : <Link to="/spots">Spots</Link>} <ChevronRight size={12} />
          <span>Book {activeTitle}</span>
        </div>

        {/* Outer Grid Layout */}
        <div className={`bk-page-grid ${step === 1 ? 'bk-page-grid--full' : ''}`}>
          {/* Left Column: Form & Stepper */}
          <div className="bk-page-main" style={step === 1 ? { width: '100%', maxWidth: '780px' } : {}}>
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
                            ? <><IndianRupee size={11} />{pricePerPerson.toLocaleString()} per day</>
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
                    {/* ══ STEP 0: Review & Pay ══ */}
                    {step === 0 && (
                      <div className="bk2-section-wrap">
                        <div className="bk2-section-title"><CreditCard size={14} />Select Payment Method</div>

                        <div className="bk2-pay-methods">
                          {PAYMENT_METHODS.filter(m => m.id !== 'upi' || upiConfig.enabled).map(m => (
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

                        {form.paymentMethod === 'upi' && upiConfig.enabled && (
                          <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', textAlign: 'center', margin: '16px 0' }}>
                            <div style={{ background: '#ffffff', padding: '16px', borderRadius: '14px', display: 'inline-block', marginBottom: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', maxWidth: '100%' }}>
                              <img
                                src={upiConfig.useCustomQrImage && upiConfig.customQrImage 
                                  ? upiConfig.customQrImage 
                                  : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${encodeURIComponent(upiConfig.upiId || 'picnicutkal@upi')}%26pn=${encodeURIComponent(upiConfig.payeeName || 'PicnicUtkal')}%26am=${total}%26cu=INR%26tn=${encodeURIComponent(upiConfig.note || 'Picnic Spot Booking')}`
                                }
                                alt="UPI QR Code"
                                style={{ width: '170px', height: '170px', display: 'block', margin: '0 auto', objectFit: 'contain' }}
                              />
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '10px' }}>
                                <span style={{ fontSize: '13px', color: '#111827', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                                  {upiConfig.upiId || 'picnicutkal@upi'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!upiConfig.upiId) return
                                    navigator.clipboard?.writeText(upiConfig.upiId)
                                    setCopiedUpi(true)
                                    setTimeout(() => setCopiedUpi(false), 2000)
                                  }}
                                  style={{ background: 'rgba(0,0,0,0.06)', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#374151' }}
                                  title="Copy UPI ID"
                                >
                                  {copiedUpi ? '✓ Copied' : 'Copy'}
                                </button>
                              </div>
                              <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600, marginTop: '2px' }}>
                                {upiConfig.payeeName || 'PicnicUtkal Resort'}
                              </div>
                            </div>

                            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--gold)', marginBottom: '4px' }}>
                              Scan QR Code to Pay ₹{total.toLocaleString()}
                            </div>

                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 16px', lineHeight: 1.4 }}>
                              {upiConfig.instructions || 'Scan the QR code using any UPI App (PhonePe, GPay, Paytm, BHIM) to complete payment.'}
                            </p>

                            {/* UTR / Transaction ID input (MANDATORY) */}
                            <div style={{ textAlign: 'left', padding: '16px', borderRadius: '12px', border: '1.5px solid var(--gold)' }}>
                              <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span>UPI Transaction UTR / Ref Number <span style={{ color: 'var(--error)' }}>* (Required)</span></span>
                                <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>Mandatory to Confirm</span>
                              </label>
                              <input
                                type="text"
                                name="transactionRef"
                                className="input"
                                placeholder="Enter 12-digit UTR No. from your UPI payment receipt (e.g. 4231XXXXXXXX)"
                                value={form.transactionRef || ''}
                                onChange={handleChange}
                                required
                                style={{ fontSize: '13px', padding: '10px 14px', fontFamily: 'monospace', fontWeight: 600, border: '1px solid var(--border)' }}
                              />
                              
                            </div>
                          </div>
                        )}

                        {form.paymentMethod === 'razorpay' && (
                          <div className="bk2-upi-note" style={{ background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#60a5fa' }}>
                            💳 Instant Razorpay Gateway checkout will launch for Debit/Credit Cards &amp; Netbanking.
                          </div>
                        )}

                        {form.paymentMethod === 'cash' && (
                          <div className="bk2-upi-note" style={{ background: 'rgba(82, 183, 136, 0.12)', border: '1px solid rgba(82, 183, 136, 0.3)', color: '#52b788' }}>
                            💵 Pay cash on arrival at the picnic ground main gate entrance. Spot reservation confirmed!
                          </div>
                        )}

                        <div className="bk2-secure-note">
                          <ShieldCheck size={13} /> Secure SSL Encrypted checkout
                        </div>

                        {error && <div className="bk2-error">{error}</div>}

                        <div className="bk2-btn-row" style={{ marginTop: '20px' }}>
                          <button className="bk2-btn-ghost" onClick={() => navigate(-1)}>
                            <ArrowLeft size={14} /> Back to Spot Details
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

                    {/* ══ STEP 1: Confirmed Success Alert Card ══ */}
                    {step === 1 && booking && (
                      <div style={{
                        maxWidth: '480px',
                        margin: '40px auto',
                        padding: '36px 28px',
                        background: '#0d1f14',
                        border: '1.5px solid var(--gold)',
                        borderRadius: '24px',
                        textAlign: 'center',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                        color: '#ffffff'
                      }}>
                        <div style={{ fontSize: '52px', marginBottom: '12px' }}>🎉</div>
                        <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', margin: '0 0 8px' }}>
                          Booking Confirmed Successfully!
                        </h3>
                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', margin: '0 0 24px', lineHeight: '1.5' }}>
                          Your spot reservation is confirmed. Show your bill receipt at entrance or view it anytime under My Bookings.
                        </p>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                          <button
                            className="btn btn-gold"
                            onClick={() => triggerDirectBillDownload(booking)}
                            style={{ flex: 1, minWidth: '140px', justifyContent: 'center', gap: '8px', padding: '12px 16px', fontSize: '14px', fontWeight: 700 }}
                          >
                            <Receipt size={16} /> View Bill
                          </button>

                          <button
                            className="btn btn-outline"
                            onClick={() => navigate('/')}
                            style={{ flex: 1, minWidth: '120px', justifyContent: 'center', gap: '8px', padding: '12px 16px', fontSize: '14px', fontWeight: 700, borderColor: 'var(--gold)', color: 'var(--gold)' }}
                          >
                            <HomeIcon size={16} /> Home
                          </button>

                          <button
                            className="btn btn-outline"
                            onClick={() => navigate('/user?tab=bookings')}
                            style={{ flex: 1, minWidth: '140px', justifyContent: 'center', gap: '8px', padding: '12px 16px', fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}
                          >
                            <Ticket size={16} /> My Bookings
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Summary & Sidebar (Only for Step 0) */}
          {step < 1 && (
            <div className="bk-page-sidebar">
              <div className="glass-card booking-card-summary sticky-summary">
                <SpotAvailabilityCalendar
                  spotId={plot?._id || spot?.id || 'spot-booking'}
                  selectedDate={form.visitDate}
                  durationDays={form.durationDays}
                  onSelectDate={(d) => setForm(f => ({ ...f, visitDate: d }))}
                  title="Date Availability Calendar"
                  variant="light"
                />
                <div className="booking-card-summary-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
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
                      <span>Base Spot Rate</span>
                      <span>₹{pricePerPerson.toLocaleString()} {!plot?.isCottage ? '/Pindi' : '/night'}</span>
                    </div>
                    <div className="breakdown-row" style={{ color: 'var(--gold)', fontWeight: 600 }}>
                      <span>Total Days / Duration</span>
                      <span>{form.durationDays} Day{form.durationDays > 1 ? 's' : ''} (₹{(pricePerPerson * form.durationDays).toLocaleString()})</span>
                    </div>
                    {selectedAddons.map((addon, idx) => (
                      <div key={idx} className="breakdown-row" style={{ color: 'var(--gold)', fontSize: '13px' }}>
                        <span>{addon.name}</span>
                        <span>+ ₹{(addon.priceAddon || 0).toLocaleString()}</span>
                      </div>
                    ))}
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
              </div>
            </div>
          )}
        </div>

        {/* Bill Receipt Modal */}
        {showBillModal && booking && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div style={{ background: '#0d1f14', border: '1px solid rgba(212, 175, 55, 0.5)', borderRadius: '22px', width: '100%', maxWidth: '480px', padding: '24px', position: 'relative', boxShadow: '0 25px 60px rgba(0,0,0,0.75)', color: '#ffffff' }}>
              <button 
                onClick={() => setShowBillModal(false)} 
                style={{ position: 'absolute', top: '14px', right: '14px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', cursor: 'pointer', zIndex: 10 }}
              >
                <X size={18} />
              </button>

              <div style={{ textAlign: 'center', borderBottom: '1px dashed rgba(255,255,255,0.15)', paddingBottom: '16px', marginBottom: '16px' }}>
                <span className="badge badge-gold" style={{ marginBottom: '8px', display: 'inline-block' }}>OFFICIAL BILL RECEIPT</span>
                <h3 style={{ margin: 0, color: '#ffffff', fontSize: '20px', fontWeight: 700 }}>PicnicUtkal Eco Tourism</h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: '4px 0 0' }}>Bhubaneswar, Odisha · GSTIN: 21AAACP1234F1Z0</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '10px' }}>
                <span style={{ color: 'rgba(255,255,255,0.65)' }}>Receipt Ref No:</span>
                <strong style={{ color: '#d4af37', fontFamily: 'monospace' }}>INV-{booking.bookingId}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '10px' }}>
                <span style={{ color: 'rgba(255,255,255,0.65)' }}>Billed To:</span>
                <strong style={{ color: '#ffffff' }}>{booking.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '16px' }}>
                <span style={{ color: 'rgba(255,255,255,0.65)' }}>Date &amp; Time:</span>
                <strong style={{ color: '#ffffff' }}>{new Date(booking.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
              </div>

              <div style={{ background: 'rgba(0, 0, 0, 0.4)', borderRadius: '14px', padding: '16px', marginBottom: '20px', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px', fontWeight: 600 }}>
                  <span style={{ color: '#ffffff' }}>{booking.plotTitle}</span>
                  <strong style={{ color: '#d4af37' }}>₹{booking.totalAmount?.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'rgba(255,255,255,0.65)', marginBottom: '8px' }}>
                  <span>Payment Method ({booking.paymentMethod?.toUpperCase()})</span>
                  <span>Included</span>
                </div>
                <hr style={{ borderColor: 'rgba(255,255,255,0.12)', margin: '10px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800 }}>
                  <span>Total Amount Paid</span>
                  <span style={{ color: '#52b788' }}>
                    ₹{booking.totalAmount?.toLocaleString()}
                  </span>
                </div>
              </div>

              <button onClick={() => {
                const params = new URLSearchParams({
                  bookingId: booking?.bookingId || booking?._id || 'PK-1001',
                  name: booking?.name || customerName || '',
                  phone: booking?.phone || phone || '',
                  aadhaar: booking?.aadhaar || aadhaar || '',
                  spot: booking?.plotTitle || activeTitle || '',
                  date: booking?.visitDate || visitDate || '',
                  duration: booking?.durationDays || durationDays || 1,
                  guests: booking?.guests || guests || 1,
                  total: booking?.totalAmount || grandTotal || 0,
                  autoprint: 'true'
                })
                window.open(`/bill.html?${params.toString()}`, '_blank')
              }} className="btn btn-gold w-full" style={{ justifyContent: 'center', gap: '8px', padding: '12px', fontSize: '14px', fontWeight: 700 }}>
                <Printer size={16} /> Print / Download PDF Bill
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
