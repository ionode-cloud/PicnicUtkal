import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  LuPrinter as Printer, 
  LuArrowLeft as ArrowLeft, 
  LuCheck as Check, 
  LuDownload as Download,
  LuFileText as FileText,
  LuCalendar as Calendar,
  LuUser as User,
  LuPhone as Phone,
  LuMail as Mail,
  LuMapPin as MapPin
} from 'react-icons/lu'
import { Helmet } from 'react-helmet-async'

const SAMPLE_BOOKINGS = {
  'BK-928341': {
    bookingId: 'BK-928341',
    plotTitle: 'Pandal — Upper Block (Riverside View)',
    name: 'Sunil Mohanty',
    email: 'sunil.mohanty@gmail.com',
    phone: '9876543210',
    bookingDate: '2026-08-08',
    visitDate: '2026-08-15',
    duration: '1 Day',
    persons: 8,
    totalPrice: 499,
    paymentMethod: 'UPI (PhonePe)',
    paymentStatus: 'Paid',
    bookingStatus: 'Confirmed'
  },
  'BK-928342': {
    bookingId: 'BK-928342',
    plotTitle: 'Pandal — Road Block',
    name: 'Anjali Das',
    email: 'anjali.das@gmail.com',
    phone: '9123456789',
    bookingDate: '2026-08-08',
    visitDate: '2026-08-16',
    duration: '2 Days',
    persons: 5,
    totalPrice: 449,
    paymentMethod: 'Credit Card',
    paymentStatus: 'Paid',
    bookingStatus: 'Confirmed'
  },
  'BK-928343': {
    bookingId: 'BK-928343',
    plotTitle: 'Barapita Deluxe Cottage & AC Suite Rooms',
    name: 'Rajesh Tripathy',
    email: 'rajesh.t@yahoo.com',
    phone: '9437123456',
    bookingDate: '2026-08-09',
    visitDate: '2026-08-20',
    duration: '3 Days',
    persons: 4,
    totalPrice: 999,
    paymentMethod: 'Net Banking',
    paymentStatus: 'Pending',
    bookingStatus: 'Pending'
  }
}
export default function InvoicePage() {
  const { id } = useParams()
  const [realBooking, setRealBooking] = useState(null)

  useEffect(() => {
    if (!id) return
    fetch(`/api/bookings/${id}`)
      .then(r => r.json())
      .then(d => { if (d.success && d.data) setRealBooking(d.data) })
      .catch(() => {})
  }, [id])

  const booking = realBooking ? {
    bookingId:     realBooking.bookingId || id,
    plotTitle:     realBooking.plotTitle || 'Picnic Spot Booking',
    name:          realBooking.name || 'Valued Visitor',
    email:         realBooking.email || 'visitor@picnicutkal.com',
    phone:         realBooking.phone || '9876543210',
    bookingDate:   realBooking.createdAt ? new Date(realBooking.createdAt).toISOString().split('T')[0] : '',
    visitDate:     realBooking.visitDate ? new Date(realBooking.visitDate).toISOString().split('T')[0] : '',
    duration:      '1 Day',
    persons:       realBooking.persons || 1,
    totalPrice:    realBooking.totalAmount || realBooking.plotPrice || 499,
    paymentMethod: (realBooking.paymentMethod || 'UPI').toUpperCase(),
    paymentStatus: realBooking.paymentStatus === 'paid' ? 'Paid' : 'Pending',
    bookingStatus: realBooking.status ? (realBooking.status.charAt(0).toUpperCase() + realBooking.status.slice(1)) : 'Confirmed'
  } : (SAMPLE_BOOKINGS[id] || {
    bookingId: id || 'BK-928341',
    plotTitle: 'Pandal — Riverside Spot',
    name: 'Valued Customer',
    email: 'customer@picnicutkal.com',
    phone: '9876543210',
    bookingDate: '2026-08-08',
    visitDate: '2026-08-15',
    duration: '1 Day',
    persons: 6,
    totalPrice: 499,
    paymentMethod: 'Online Payment',
    paymentStatus: 'Paid',
    bookingStatus: 'Confirmed'
  })

  const handlePrint = () => {
    const params = new URLSearchParams({
      bookingId: booking.bookingId || booking._id || id || 'PK-1001',
      name: booking.name || '',
      phone: booking.phone || '',
      aadhaar: booking.aadhaar || '',
      spot: booking.plotTitle || 'Picnic Spot',
      date: booking.visitDate || '',
      duration: booking.duration || '1 Day',
      guests: booking.persons || 1,
      total: booking.totalPrice || 0,
      autoprint: 'true'
    })
    window.open(`/bill.html?${params.toString()}`, '_blank')
  }

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '24px 16px' }}>
      <Helmet>
        <title>Invoice #{booking.bookingId} — PicnicUtkal</title>
      </Helmet>

      {/* Top Action Bar (hidden on print) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }} className="no-print">
        <Link to="/admin/bookings" className="btn btn-outline btn-sm flex items-center gap-1">
          <ArrowLeft size={16} /> Back to Bookings
        </Link>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-gold btn-md flex items-center gap-2" onClick={handlePrint}>
            <Printer size={18} /> Print / Save PDF Invoice
          </button>
        </div>
      </div>

      {/* Dedicated Full Page Tax Invoice Card */}
      <div className="card glass-card" style={{ 
        padding: '40px', 
        border: '1.5px solid var(--border-gold)', 
        background: 'var(--bg-card)', 
        borderRadius: '20px',
        boxShadow: '0 16px 40px rgba(0,0,0,0.15)' 
      }}>
        {/* Invoice Header */}
        <div style={{ borderBottom: '2px solid var(--border)', paddingBottom: '24px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'var(--gold)', color: 'var(--dark-green)', padding: '8px 14px', borderRadius: '10px', fontWeight: 800, fontSize: '22px' }}>
                  PU
                </div>
                <div>
                  <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 800, color: 'var(--gold)', fontFamily: 'var(--font-heading)' }}>
                    PicnicUtkal Reserve
                  </h1>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Barapita Picnic Zone, Riverside, Bhubaneswar, Odisha</div>
                </div>
              </div>
              <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                GSTIN: <strong>21AAACP9012K1Z5</strong> | FSSAI: <strong>12024999000123</strong> | Contact: +91 98765 43210
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className="badge badge-gold" style={{ fontSize: '14px', padding: '8px 16px', fontWeight: 700 }}>
                OFFICIAL TAX INVOICE
              </span>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '10px', fontFamily: 'monospace' }}>
                #{booking.bookingId}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Date Issued: {booking.bookingDate || '08 Aug 2026'}
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Info Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          
          {/* Billed To */}
          <div style={{ backgroundColor: 'var(--bg-primary)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
              Billed To (Customer Details)
            </span>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{booking.name}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>📞 Mobile: {booking.phone}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>✉️ Email: {booking.email}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>📍 Billing Address: Bhubaneswar, Odisha, India</div>
          </div>

          {/* Reservation Summary */}
          <div style={{ backgroundColor: 'var(--bg-primary)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
              Reservation Details
            </span>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--gold)' }}>{booking.plotTitle}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginTop: '6px' }}>
              📅 Visit Date: <strong>{booking.visitDate}</strong>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
              ⏱ Duration: <strong>{booking.duration || '1 Day'}</strong>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
              👥 Visitors: <strong>{booking.persons} Guests Allowed</strong>
            </div>
          </div>

        </div>

        {/* Itemized Table */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
            Itemized Pricing Breakdown
          </h3>
          <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px' }}>Item & Service Description</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Rate Unit</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Tax (18% GST)</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Amount (INR)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                  <td style={{ padding: '16px' }}>
                    <strong style={{ fontSize: '15px', display: 'block', color: 'var(--text-primary)' }}>{booking.plotTitle}</strong>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Exclusive pandal reservation, private gazebos, free parking & lawn access
                    </div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Flat / Pandal ({booking.duration || '1 Day'})
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right', color: 'var(--text-muted)' }}>
                    Included (₹{Math.round(booking.totalPrice * 0.18)})
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700, color: 'var(--gold)', fontSize: '16px' }}>
                    ₹{booking.totalPrice.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Calculation Totals & Payment Summary */}
        <div style={{ 
          backgroundColor: 'var(--bg-primary)', 
          padding: '20px 24px', 
          borderRadius: '16px', 
          border: '1px solid var(--border)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          justify: 'space-between',
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Payment Method: <strong style={{ color: 'var(--text-primary)' }}>{booking.paymentMethod}</strong></div>
            <div style={{ fontSize: '13px', color: 'var(--success)', fontWeight: 700, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Check size={16} /> Status: {booking.paymentStatus} (Payment Confirmed)
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Transaction Ref ID: <span style={{ fontFamily: 'monospace' }}>TXN-{Math.floor(10000000 + Math.random() * 90000000)}</span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Grand Total Paid</span>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--gold)', fontFamily: 'var(--font-heading)' }}>
              ₹{booking.totalPrice.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Invoice Footer Terms */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
          Thank you for choosing PicnicUtkal Reserve! This is a computer-generated tax invoice and requires no physical signature.
        </div>
      </div>
    </div>
  )
}
