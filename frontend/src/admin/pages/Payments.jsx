import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { 
  LuSearch as Search, 
  LuCreditCard as CreditCard,
  LuIndianRupee as IndianRupee,
  LuTrendingUp as TrendingUp,
  LuRotateCcw as RotateCcw,
  LuCircleCheck as CheckCircle,
  LuClock as Clock,
  LuCircleX as XCircle,
  LuFileText as FileText,
  LuDownload as Download,
  LuArrowDownLeft as ArrowDownLeft,
  LuArrowUpRight as ArrowUpRight,
  LuRefreshCw as RefreshCw,
  LuTrash2 as Trash2,
  LuQrCode as QrCode,
  LuSmartphone as Smartphone,
  LuCopy as Copy,
  LuCheck as Check,
  LuUpload as Upload,
  LuImage as ImageIcon,
  LuShieldCheck as ShieldCheck,
  LuBuilding2 as Building2,
  LuSave as Save,
  LuSparkles as Sparkles,
  LuEye as Eye,
  LuFileSpreadsheet as FileSpreadsheet,
  LuInfo as Info
} from 'react-icons/lu'
import toast from 'react-hot-toast'
import { useSocket } from '../../context/SocketContext'
import { buildApiUrl } from '../../services/api'

// Derive a payment row from a DB booking document
const toPayment = (b, idx) => ({
  txnId:         b.bookingId || `TXN-${idx + 1}`,
  bookingId:     b.bookingId || b._id,
  customerName:  b.name || 'Unknown',
  customerEmail: b.email || '',
  spotTitle:     b.plotTitle || 'Picnic Spot',
  amount:        b.totalAmount || b.totalPrice || 0,
  method:        (b.paymentMethod || 'UPI').toUpperCase(),
  status:        b.paymentStatus === 'paid' ? 'Paid' : b.paymentStatus === 'failed' ? 'Failed' : 'Pending',
  type:          'Payment',
  date:          b.createdAt ? new Date(b.createdAt).toLocaleString('en-IN') : ''
})

const DEFAULT_UPI_CONFIG = {
  enabled: true,
  upiId: 'picnicutkal@upi',
  payeeName: 'PicnicUtkal Resort',
  customQrImage: '',
  instructions: 'Scan using PhonePe, Google Pay, Paytm, BHIM, or any UPI App to complete payment.',
  paymentConfirmationNote: 'After payment transfer, click Confirm & Pay to generate your instant booking QR ticket.'
}

export default function Payments() {
  const { socket } = useSocket()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') === 'qr' ? 'qr' : 'transactions'

  const handleTabChange = (tab) => {
    setSearchParams(tab === 'qr' ? { tab: 'qr' } : {})
  }

  // --- Transactions State ---
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // --- UPI QR Config State ---
  const [upiConfig, setUpiConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('picnicutkal_upi_qr_config')
      if (saved) return JSON.parse(saved)
    } catch (e) {}
    return DEFAULT_UPI_CONFIG
  })
  const [savingUpi, setSavingUpi] = useState(false)
  const [copiedUpi, setCopiedUpi] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const fetchPayments = () => {
    setLoading(true)
    fetch(buildApiUrl('/api/bookings'))
      .then(r => r.json())
      .then(d => { if (d.success && Array.isArray(d.data)) setPayments(d.data.map(toPayment)) })
      .catch(() => toast.error('Failed to load payments'))
      .finally(() => setLoading(false))
  }

  const fetchUpiConfig = () => {
    fetch(buildApiUrl('/api/site-config/upi_qr_config'))
      .then(r => r.json())
      .then(d => {
        if (d && (d.data || d.value)) {
          const val = d.data || d.value
          setUpiConfig(prev => ({ ...prev, ...val }))
          try {
            localStorage.setItem('picnicutkal_upi_qr_config', JSON.stringify(val))
          } catch (e) {}
        }
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchPayments()
    fetchUpiConfig()
  }, [])

  // Socket listener for real-time changes
  useEffect(() => {
    if (!socket) return
    const handleUpdate = () => fetchPayments()
    const handleUpiUpdate = (data) => {
      if (data?.upiConfig) {
        setUpiConfig(data.upiConfig)
        try {
          localStorage.setItem('picnicutkal_upi_qr_config', JSON.stringify(data.upiConfig))
        } catch (e) {}
      }
    }

    socket.on('plots_update', handleUpdate)
    socket.on('upi_qr_config_update', handleUpiUpdate)

    return () => {
      socket.off('plots_update', handleUpdate)
      socket.off('upi_qr_config_update', handleUpiUpdate)
    }
  }, [socket])

  // --- Save UPI QR Settings to MongoDB ---
  const handleSaveUpiConfig = async () => {
    setSavingUpi(true)
    try {
      const payload = {
        ...upiConfig,
        useCustomQrImage: Boolean(upiConfig.customQrImage)
      }
      const res = await fetch(buildApiUrl('/api/site-config/upi_qr_config'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'upi_qr_config', data: payload, value: payload })
      })
      const data = await res.json()
      if (data.success) {
        localStorage.setItem('picnicutkal_upi_qr_config', JSON.stringify(payload))
        toast.success('UPI QR Code image & settings saved! Live on customer booking page.', {
          icon: '🖼️'
        })
      } else {
        toast.error(data.message || 'Failed to save UPI config')
      }
    } catch (err) {
      toast.error('Network error saving UPI config')
    } finally {
      setSavingUpi(false)
    }
  }

  // Handle Local QR Code Image Upload
  const processUploadedFile = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, JPEG, WEBP)')
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error('Image size exceeds 8MB limit')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setUpiConfig(prev => ({
        ...prev,
        customQrImage: reader.result,
        useCustomQrImage: true
      }))
      toast.success('New QR Code image loaded! Click "Save Changes" to publish.')
    }
    reader.readAsDataURL(file)
  }

  const handleImageUpload = (e) => {
    processUploadedFile(e.target.files?.[0])
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0])
    }
  }

  const handleCopyUpi = () => {
    if (!upiConfig.upiId) return
    navigator.clipboard?.writeText(upiConfig.upiId)
    setCopiedUpi(true)
    toast.success(`Copied UPI ID: ${upiConfig.upiId}`)
    setTimeout(() => setCopiedUpi(false), 2000)
  }

  const handleDeletePayment = async (bookingId) => {
    if (window.confirm(`Are you sure you want to permanently delete payment & booking #${bookingId}?`)) {
      try {
        const res = await fetch(buildApiUrl(`/api/bookings/${bookingId}`), { method: 'DELETE' })
        const data = await res.json()
        if (data.success) {
          setPayments(prev => prev.filter(p => p.bookingId !== bookingId && p.txnId !== bookingId))
          toast.success(`Payment & booking #${bookingId} deleted!`)
        } else {
          toast.error(data.message || 'Failed to delete payment record')
        }
      } catch (err) {
        toast.error('Error deleting payment')
      }
    }
  }

  // Calculated Stats Summary
  const totalRevenue = payments
    .filter(p => p.status === 'Paid')
    .reduce((sum, p) => sum + p.amount, 0)

  const paidCount = payments.filter(p => p.status === 'Paid').length
  const pendingCount = payments.filter(p => p.status === 'Pending').length
  const refundedTotal = payments
    .filter(p => p.status === 'Refunded')
    .reduce((sum, p) => sum + p.amount, 0)

  // Filter payments
  const filteredPayments = payments.filter(p => {
    const matchesSearch = 
      p.txnId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.spotTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.method.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'All' || p.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  // Issue Refund
  const handleProcessRefund = (txnId, amount, customerName) => {
    if (window.confirm(`Are you sure you want to process refund of ₹${amount} for ${customerName} (#${txnId})?`)) {
      setPayments(prev => prev.map(p => p.txnId === txnId ? { ...p, status: 'Refunded', type: 'Refund' } : p))
      toast.success(`Refund of ₹${amount} processed successfully.`, { icon: '💸' })
    }
  }

  // Mark Pending as Paid
  const handleMarkPaid = (txnId) => {
    setPayments(prev => prev.map(p => p.txnId === txnId ? { ...p, status: 'Paid', type: 'Payment' } : p))
    toast.success(`Payment #${txnId} marked as PAID.`)
  }

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':     return 'badge-success'
      case 'pending':  return 'badge-gold'
      case 'refunded': return 'badge-danger'
      default:         return 'badge-glass'
    }
  }

  // Active display image (custom uploaded QR image or standard fallback)
  const currentQrImage = upiConfig.customQrImage || `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=upi://pay?pa=${encodeURIComponent(upiConfig.upiId || 'picnicutkal@upi')}%26pn=${encodeURIComponent(upiConfig.payeeName || 'PicnicUtkal')}%26cu=INR`

  return (
    <div className="card glass-card" style={{ padding: '24px' }}>
      {/* Top Header & Tab Switcher Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(201, 168, 76, 0.15)', color: 'var(--gold)', padding: '8px', borderRadius: '10px', display: 'flex' }}>
              {activeTab === 'qr' ? <QrCode size={22} /> : <CreditCard size={22} />}
            </div>
            <div>
              <h2 className="heading-4" style={{ margin: 0, color: 'var(--text-primary)' }}>
                {activeTab === 'qr' ? 'Upload & Manage UPI QR Code' : 'Payments & Refunds Ledger'}
              </h2>
              <p className="text-muted text-sm" style={{ margin: '2px 0 0' }}>
                {activeTab === 'qr' 
                  ? 'Upload your local PhonePe / GPay / Paytm / Bank QR Code image to show on customer checkout.'
                  : 'Monitor all customer booking payments, online UPI/Card transactions, and issue refunds.'}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Toggle Buttons */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <button
            onClick={() => handleTabChange('transactions')}
            className={`btn btn-sm ${activeTab === 'transactions' ? 'btn-gold' : 'btn-ghost'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px', padding: '6px 14px', fontSize: '13px', fontWeight: 600 }}
          >
            <FileSpreadsheet size={15} />
            <span>Transactions &amp; Ledger</span>
            <span style={{ background: activeTab === 'transactions' ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '10px', fontSize: '11px' }}>
              {payments.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('qr')}
            className={`btn btn-sm ${activeTab === 'qr' ? 'btn-gold' : 'btn-ghost'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px', padding: '6px 14px', fontSize: '13px', fontWeight: 600 }}
          >
            <QrCode size={15} />
            <span>Pay via UPI QR Code</span>
            <span style={{ 
              background: upiConfig.enabled ? 'rgba(82, 183, 136, 0.25)' : 'rgba(239, 68, 68, 0.25)', 
              color: upiConfig.enabled ? '#52b788' : '#ef4444',
              padding: '2px 6px', 
              borderRadius: '10px', 
              fontSize: '11px',
              fontWeight: 700 
            }}>
              {upiConfig.enabled ? 'LIVE' : 'OFF'}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PAY VIA UPI QR CODE - LOCAL IMAGE UPLOADER & MANAGER               */}
      {/* ========================================================================= */}
      {activeTab === 'qr' && (
        <div>
          {/* Top Status & Quick Action Banner */}
          <div style={{ 
            background: upiConfig.enabled ? 'rgba(82, 183, 136, 0.08)' : 'rgba(239, 68, 68, 0.08)', 
            border: `1px solid ${upiConfig.enabled ? 'rgba(82, 183, 136, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            borderRadius: '14px', 
            padding: '16px 20px', 
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                background: upiConfig.enabled ? '#52b788' : '#ef4444', 
                color: '#fff', 
                padding: '8px', 
                borderRadius: '50%', 
                display: 'flex' 
              }}>
                <Smartphone size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
                  Pay via UPI QR Code: {upiConfig.enabled ? <span style={{ color: '#52b788' }}>Active on Booking Page</span> : <span style={{ color: '#ef4444' }}>Disabled</span>}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Upload your shop / resort QR code image below. It will be shown to customers during booking.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={upiConfig.enabled}
                  onChange={(e) => setUpiConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--gold)', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Enable on Checkout
                </span>
              </label>

              <button
                className="btn btn-gold btn-sm"
                onClick={handleSaveUpiConfig}
                disabled={savingUpi}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', fontWeight: 700 }}
              >
                <Save size={15} />
                {savingUpi ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Main 2-Column Grid: Left (Local Upload & Settings) / Right (Customer View Preview) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', alignItems: 'start' }}>
            
            {/* LEFT COLUMN: Local Image Uploader & Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Card: Upload Local QR Code Image */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '16px', padding: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <QrCode size={18} color="var(--gold)" />
                    <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                      Upload QR Code Image
                    </h3>
                  </div>
                  {upiConfig.customQrImage && (
                    <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 700 }}>
                      ✓ Custom Image Uploaded
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 16px', lineHeight: 1.4 }}>
                  Select or drag &amp; drop an image of your <strong>PhonePe, Google Pay, Paytm, BharatPe, or Bank Merchant QR standee</strong> from your computer.
                </p>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />

                {/* Drag and Drop Box / Upload Trigger */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${dragOver ? 'var(--gold)' : 'rgba(201, 168, 76, 0.4)'}`,
                    borderRadius: '14px',
                    padding: '28px 20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: dragOver ? 'rgba(201, 168, 76, 0.1)' : 'rgba(255,255,255,0.02)',
                    transition: 'all 0.2s ease',
                    marginBottom: '16px'
                  }}
                >
                  <div style={{ 
                    width: '54px', 
                    height: '54px', 
                    borderRadius: '50%', 
                    background: 'rgba(201, 168, 76, 0.12)', 
                    color: 'var(--gold)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    margin: '0 auto 12px' 
                  }}>
                    <Upload size={24} />
                  </div>

                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {upiConfig.customQrImage ? 'Click or Drop new image to REPLACE QR Code' : 'Click to Upload Local QR Code Image'}
                  </div>

                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                    Supports PNG, JPG, JPEG, WEBP (Max 8MB)
                  </p>
                </div>

                {/* Uploaded File Actions */}
                {upiConfig.customQrImage && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.04)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={upiConfig.customQrImage}
                        alt="Uploaded QR"
                        style={{ width: '40px', height: '40px', objectFit: 'contain', background: '#fff', borderRadius: '6px', padding: '2px' }}
                      />
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>Custom QR Code Image Active</div>
                        <small style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Ready for customer bookings</small>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => fileInputRef.current?.click()}
                        style={{ fontSize: '11px', padding: '4px 10px' }}
                      >
                        Change Image
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          setUpiConfig(prev => ({ ...prev, customQrImage: '', useCustomQrImage: false }))
                          toast.success('Custom QR image removed')
                        }}
                        style={{ fontSize: '11px', padding: '4px 10px', color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Card: Payee & UPI Details */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '16px', padding: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Smartphone size={18} color="var(--gold)" />
                  <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                    UPI ID &amp; Payee Name Details
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                      UPI ID / VPA (Printed on QR Code)
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type="text"
                        className="input"
                        placeholder="e.g. picnicutkal@upi or 9876543210@paytm"
                        value={upiConfig.upiId || ''}
                        onChange={(e) => setUpiConfig(prev => ({ ...prev, upiId: e.target.value.trim() }))}
                        style={{ paddingRight: '80px', fontFamily: 'monospace', fontWeight: 600 }}
                      />
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="btn btn-outline btn-sm"
                        style={{ position: 'absolute', right: '6px', padding: '3px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        {copiedUpi ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                        {copiedUpi ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <small style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                      Customers can copy this UPI ID to pay directly in any UPI app.
                    </small>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                      Payee / Business Name
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. PicnicUtkal Resort"
                      value={upiConfig.payeeName || ''}
                      onChange={(e) => setUpiConfig(prev => ({ ...prev, payeeName: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                      Customer Checkout Note / Instructions
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Scan using PhonePe, Google Pay, Paytm, BHIM, or any UPI App."
                      value={upiConfig.instructions || ''}
                      onChange={(e) => setUpiConfig(prev => ({ ...prev, instructions: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button
                  className="btn btn-gold"
                  onClick={handleSaveUpiConfig}
                  disabled={savingUpi}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', fontWeight: 700 }}
                >
                  <Save size={16} />
                  {savingUpi ? 'Saving to Database…' : 'Save & Publish Live'}
                </button>

                <button
                  className="btn btn-outline"
                  onClick={() => {
                    if (window.confirm('Reset UPI QR settings to defaults?')) {
                      setUpiConfig(DEFAULT_UPI_CONFIG)
                      toast.success('Reset to defaults')
                    }
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <RotateCcw size={14} /> Reset
                </button>
              </div>

            </div>

            {/* RIGHT COLUMN: Live Customer Checkout Preview */}
            <div style={{ position: 'sticky', top: '20px' }}>
              <div style={{ 
                background: 'linear-gradient(145deg, rgba(26, 26, 26, 0.95), rgba(18, 18, 18, 0.98))', 
                border: '1px solid var(--gold)', 
                borderRadius: '20px', 
                padding: '24px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ 
                    background: 'rgba(201, 168, 76, 0.15)', 
                    color: 'var(--gold)', 
                    padding: '4px 10px', 
                    borderRadius: '20px', 
                    fontSize: '11px', 
                    fontWeight: 800, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px'
                  }}>
                    <Eye size={12} /> LIVE BOOKING PREVIEW
                  </span>
                  
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Exact display on checkout
                  </span>
                </div>

                {/* The Customer Checkout Card */}
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  border: '1px solid var(--border)', 
                  borderRadius: '16px', 
                  padding: '20px', 
                  textAlign: 'center' 
                }}>
                  {/* White Box for QR Code Image */}
                  <div style={{ 
                    background: '#ffffff', 
                    padding: '16px', 
                    borderRadius: '16px', 
                    display: 'inline-block', 
                    marginBottom: '14px', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                    maxWidth: '100%'
                  }}>
                    <img
                      src={currentQrImage}
                      alt="UPI QR Code"
                      style={{ 
                        width: '200px', 
                        height: '200px', 
                        display: 'block', 
                        margin: '0 auto', 
                        objectFit: 'contain' 
                      }}
                    />
                    
                    <div style={{ 
                      fontSize: '13px', 
                      color: '#111827', 
                      marginTop: '10px', 
                      fontWeight: 800, 
                      fontFamily: 'monospace', 
                      letterSpacing: '0.5px',
                      wordBreak: 'break-all'
                    }}>
                      {upiConfig.upiId || 'picnicutkal@upi'}
                    </div>

                    <div style={{ fontSize: '11px', color: '#4b5563', fontWeight: 600 }}>
                      {upiConfig.payeeName || 'PicnicUtkal Resort'}
                    </div>
                  </div>

                  <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--gold)', marginBottom: '6px' }}>
                    Scan QR Code to Pay
                  </div>

                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 14px', lineHeight: 1.4 }}>
                    {upiConfig.instructions || 'Scan using PhonePe, Google Pay, Paytm, BHIM, or any UPI App to complete payment.'}
                  </p>

                  {/* Mandatory UTR Input Preview */}
                  <div style={{ textAlign: 'left', background: 'rgba(201, 168, 76, 0.08)', padding: '12px', borderRadius: '10px', border: '1.5px solid var(--gold)', marginBottom: '14px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gold)', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>UPI Transaction UTR / Ref Number <span style={{ color: 'var(--error)' }}>*</span></span>
                      <span style={{ fontSize: '9px', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>Mandatory</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace', background: '#121212', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                      e.g. 4231XXXXXXXX (12-digit UTR)
                    </div>
                    <small style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', marginTop: '4px', display: 'block' }}>
                      ⚠️ Customer must submit valid UTR number to confirm booking.
                    </small>
                  </div>

                  {/* Copy UPI Button */}
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="btn btn-outline btn-sm"
                    style={{ width: '100%', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    {copiedUpi ? <Check size={13} color="var(--success)" /> : <Copy size={13} />}
                    {copiedUpi ? 'Copied UPI ID to Clipboard' : `Copy UPI ID: ${upiConfig.upiId || 'picnicutkal@upi'}`}
                  </button>
                </div>

                <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <ShieldCheck size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px', color: 'var(--success)' }} />
                  Secured &amp; directly linked with your merchant account
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TRANSACTIONS & REFUNDS LEDGER (EXISTING)                           */}
      {/* ========================================================================= */}
      {activeTab === 'transactions' && (
        <div>
          {/* KPI Stats Cards Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            
            <div style={{ backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>Total Paid Revenue</span>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--gold)', marginTop: '4px' }}>
                ₹{totalRevenue.toLocaleString()}
              </div>
              <small style={{ color: 'var(--success)', fontSize: '11px' }}>{paidCount} Successful Transactions</small>
            </div>

            <div style={{ backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>Pending Payments</span>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#D97706', marginTop: '4px' }}>
                {pendingCount} Pending
              </div>
              <small style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Awaiting clearance / cash on spot</small>
            </div>

            <div style={{ backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>Total Refunds Issued</span>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--error)', marginTop: '4px' }}>
                ₹{refundedTotal.toLocaleString()}
              </div>
              <small style={{ color: 'var(--error)', fontSize: '11px' }}>Refunded Transactions</small>
            </div>

          </div>

          {/* Filters & Search */}
          <div className="admin-table-filters" style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="input-with-icon" style={{ flex: 1, minWidth: '240px', maxWidth: '380px' }}>
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Search by Txn ID, customer name, spot, or method..." 
                className="input" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {['All', 'Paid', 'Pending', 'Refunded'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`btn btn-sm ${statusFilter === st ? 'btn-gold' : 'btn-outline'}`}
                  style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '20px' }}
                >
                  {st}
                </button>
              ))}
              <button className="btn btn-outline btn-sm" onClick={fetchPayments} disabled={loading} style={{ marginLeft: '8px', gap: '6px', display: 'flex', alignItems: 'center' }}>
                <RefreshCw size={14} /> {loading ? 'Loading…' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Payments Table */}
          <div className="admin-table-scroll-wrapper">
            <table className="admin-table-view">
              <thead>
                <tr>
                  <th>Txn ID</th>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Spot Details</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Date &amp; Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                      ⏳ Loading payment transactions…
                    </td>
                  </tr>
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                      <div style={{ fontSize: '32px', marginBottom: '12px' }}>💳</div>
                      {payments.length === 0 ? 'No payments yet. Transactions will appear here after a user books a spot.' : 'No transactions match the current filter.'}
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map(p => (
                    <tr key={p.txnId}>
                      <td className="bold" style={{ color: 'var(--gold)', fontFamily: 'monospace', fontSize: '13px' }}>
                        #{p.txnId}
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-muted)' }}>
                        #{p.bookingId}
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{p.customerName}</span>
                          <small style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{p.customerEmail}</small>
                        </div>
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600, maxWidth: '180px' }}>
                        {p.spotTitle}
                      </td>
                      <td style={{ fontWeight: 800, color: p.status === 'Refunded' ? 'var(--error)' : 'var(--gold)', fontSize: '14px' }}>
                        {p.status === 'Refunded' ? '-' : ''}₹{p.amount.toLocaleString()}
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          {p.method.includes('UPI') ? <Smartphone size={13} color="var(--gold)" /> : <CreditCard size={13} />}
                          {p.method}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {p.date}
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(p.status)}`} style={{ fontSize: '11px' }}>
                          {p.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          {p.status === 'Paid' && (
                            <button 
                              className="btn btn-outline btn-sm"
                              style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                              onClick={() => handleProcessRefund(p.txnId, p.amount, p.customerName)}
                              title="Process Refund"
                            >
                              Issue Refund
                            </button>
                          )}

                          {p.status === 'Pending' && (
                            <button 
                              className="btn btn-gold btn-sm"
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                              onClick={() => handleMarkPaid(p.txnId)}
                              title="Mark as Paid"
                            >
                              Mark Paid
                            </button>
                          )}

                          <button 
                            className="btn btn-outline btn-sm"
                            style={{ padding: '4px 8px', fontSize: '11px', color: '#FA5252', borderColor: 'rgba(250, 82, 82, 0.3)', gap: '4px', display: 'inline-flex', alignItems: 'center' }}
                            onClick={() => handleDeletePayment(p.bookingId || p.txnId)}
                            title="Delete payment & booking record"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
