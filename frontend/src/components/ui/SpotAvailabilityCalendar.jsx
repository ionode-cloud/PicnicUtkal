import { useState, useEffect } from 'react'
import { LuChevronLeft as ChevronLeft, LuChevronRight as ChevronRight, LuCalendar as Calendar, LuCircleCheck as CheckCircle, LuRefreshCw as RefreshCw } from 'react-icons/lu'
import { useSocket } from '../../context/SocketContext'
import { buildApiUrl } from '../../services/api'
import toast from 'react-hot-toast'

export default function SpotAvailabilityCalendar({
  spotId,
  selectedDate,
  onSelectDate,
  title = 'Spot Availability Calendar',
  variant = 'dark',
  durationDays = 1
}) {
  const { socket } = useSocket()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [bookedDates, setBookedDates] = useState([])
  const [loading, setLoading] = useState(false)

  const isLight = variant === 'light'

  // Helper to compute date array for multi-day duration
  const getRangeForStart = (startStr, count) => {
    if (!startStr) return []
    const res = []
    const d = new Date(startStr)
    for (let i = 0; i < Math.max(1, count); i++) {
      const next = new Date(d)
      next.setDate(next.getDate() + i)
      res.push(next.toISOString().split('T')[0])
    }
    return res
  }

  const selectedDatesList = (() => {
    if (!selectedDate) return []
    if (Array.isArray(selectedDate)) return selectedDate.filter(Boolean)
    if (typeof selectedDate === 'string' && selectedDate.includes(',')) {
      return selectedDate.split(',').map(s => s.trim()).filter(Boolean)
    }
    return [selectedDate]
  })()

  // Theme variable colors
  const containerBg = isLight ? 'var(--bg-card, #ffffff)' : 'rgba(13, 31, 20, 0.95)'
  const containerBorder = isLight ? '1px solid var(--border, rgba(212, 175, 55, 0.3))' : '1px solid rgba(212, 175, 55, 0.35)'
  const containerColor = isLight ? 'var(--text-primary, #111827)' : '#ffffff'
  const navBg = isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.06)'
  const navText = isLight ? 'var(--text-primary, #111827)' : '#ffffff'
  const dayHeaderColor = isLight ? 'var(--text-muted, #6B7280)' : 'rgba(255, 255, 255, 0.5)'
  const defaultDayBg = isLight ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.05)'
  const defaultDayBorder = isLight ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.08)'
  const defaultDayText = isLight ? 'var(--text-primary, #111827)' : '#ffffff'

  // Fetch real availability from backend
  const fetchAvailability = () => {
    if (!spotId) return
    setLoading(true)
    fetch(buildApiUrl(`/api/spots/${spotId}/availability`))
      .then(r => r.json())
      .then(d => {
        if (d.success && Array.isArray(d.bookedDates)) {
          setBookedDates(d.bookedDates)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  // Initial fetch and on spotId change
  useEffect(() => {
    fetchAvailability()
  }, [spotId])

  // Real-time socket listener for booking updates
  useEffect(() => {
    if (!socket) return
    const handleUpdate = () => fetchAvailability()
    socket.on('plots_update', handleUpdate)
    socket.on('plot_updated', handleUpdate)
    return () => {
      socket.off('plots_update', handleUpdate)
      socket.off('plot_updated', handleUpdate)
    }
  }, [socket, spotId])

  // Calendar math
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const firstDayIndex = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const todayStr = new Date().toISOString().split('T')[0]
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const daysArray = []
  // Empty padding cells
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null)
  }
  // Month days
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d)
  }

  return (
    <div style={{
      background: containerBg,
      border: containerBorder,
      borderRadius: '16px',
      padding: '16px',
      color: containerColor,
      boxShadow: isLight ? 'var(--shadow-sm, 0 4px 16px rgba(0,0,0,0.05))' : '0 8px 32px rgba(0,0,0,0.3)',
      width: '100%',
      maxWidth: '460px',
      margin: '0 auto 16px'
    }}>
      {/* Calendar Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={16} color="var(--gold, #D4AF37)" />
          <span style={{ fontSize: '14px', fontWeight: 700, color: isLight ? 'var(--text-primary, #111827)' : 'var(--cream, #FDFBF7)' }}>
            {title}
          </span>
          {loading && <RefreshCw size={12} className="spin" color="var(--gold, #D4AF37)" />}
        </div>
        <span className={`badge ${selectedDatesList.length === durationDays ? 'badge-success' : 'badge-gold'}`} style={{ fontSize: '10px', padding: '2px 8px' }}>
          {selectedDatesList.length} / {durationDays} Day{durationDays > 1 ? 's' : ''} Selected
        </span>
      </div>

      {/* Month Navigation Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        background: navBg,
        borderRadius: '10px',
        padding: '6px 12px',
        marginBottom: '12px'
      }}>
        <button
          onClick={handlePrevMonth}
          type="button"
          style={{ background: 'none', border: 'none', color: 'var(--gold, #D4AF37)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
        >
          <ChevronLeft size={18} />
        </button>

        <span style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.5px', color: navText }}>
          {monthName}
        </span>

        <button
          onClick={handleNextMonth}
          type="button"
          style={{ background: 'none', border: 'none', color: 'var(--gold, #D4AF37)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day Names Header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '6px' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <span key={day} style={{ fontSize: '10px', fontWeight: 700, color: dayHeaderColor, textTransform: 'uppercase' }}>
            {day}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {daysArray.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} style={{ minHeight: '36px' }} />
          }

          const mm = String(month + 1).padStart(2, '0')
          const dd = String(day).padStart(2, '0')
          const dateStr = `${year}-${mm}-${dd}`
          const dateObj = new Date(year, month, day)

          const isPast = dateObj < today
          const isBooked = bookedDates.includes(dateStr)
          
          const rangeIndex = selectedDatesList.indexOf(dateStr)
          const isSelected = rangeIndex !== -1
          const isToday = dateStr === todayStr

          let bg = defaultDayBg
          let border = defaultDayBorder
          let textColor = defaultDayText
          let cursor = 'pointer'

          if (isPast) {
            bg = isLight ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)'
            textColor = isLight ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.25)'
            cursor = 'not-allowed'
          } else if (isBooked) {
            bg = isLight ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.25)'
            border = '1px solid #EF4444'
            textColor = isLight ? '#b91c1c' : '#FA5252'
            cursor = 'not-allowed'
          } else if (isSelected) {
            bg = isLight ? 'rgba(212, 175, 55, 0.25)' : 'rgba(212, 175, 55, 0.35)'
            border = '2px solid #D4AF37'
            textColor = isLight ? '#744210' : '#ffffff'
          }

          const handleClick = () => {
            if (isPast) {
              toast.error('Past dates are not available for booking.')
              return
            }
            if (isBooked) {
              toast.error('This spot is already booked for this date. Please select another date.')
              return
            }

            let updatedList = [...selectedDatesList]

            if (updatedList.includes(dateStr)) {
              // Unselect if already picked
              updatedList = updatedList.filter(d => d !== dateStr)
              toast.success(`Unselected ${dateStr}`)
            } else {
              if (durationDays === 1) {
                updatedList = [dateStr]
              } else if (updatedList.length < durationDays) {
                updatedList.push(dateStr)
                updatedList.sort((a, b) => new Date(a) - new Date(b))
                toast.success(`Selected Day ${updatedList.length}: ${dateStr}`)
              } else {
                toast(`Selected ${durationDays} of ${durationDays} day(s). Click a selected date to remove it or change Total Days input.`, { icon: 'ℹ️' })
                return
              }
            }

            const primaryDate = updatedList[0] || dateStr
            if (onSelectDate) onSelectDate(primaryDate, updatedList)
          }

          return (
            <button
              key={dateStr}
              type="button"
              onClick={handleClick}
              disabled={isPast || isBooked}
              title={isBooked ? 'Booked' : isPast ? 'Past date' : `Available: ${dateStr}`}
              style={{
                minHeight: '38px',
                borderRadius: '8px',
                background: bg,
                border: border,
                color: textColor,
                cursor: cursor,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justify: 'center',
                padding: '2px',
                position: 'relative',
                transition: 'all 0.15s ease',
                fontWeight: isSelected ? 900 : 600,
                fontSize: '12px'
              }}
            >
              <span>{day}</span>
              {isBooked && (
                <span style={{ fontSize: '8px', fontWeight: 800, color: '#FA5252', textTransform: 'uppercase', lineHeight: 1 }}>
                  Booked
                </span>
              )}
              {!isBooked && isSelected && (
                <span style={{ fontSize: '8px', fontWeight: 800, color: '#D4AF37', textTransform: 'uppercase', lineHeight: 1 }}>
                  {durationDays > 1 ? `Day ${rangeIndex + 1}` : 'Selected'}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Legend Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justify: 'space-around',
        marginTop: '12px',
        paddingTop: '10px',
        borderTop: isLight ? '1px dashed rgba(0, 0, 0, 0.12)' : '1px dashed rgba(255, 255, 255, 0.12)',
        fontSize: '11px',
        color: isLight ? 'var(--text-muted, #4B5563)' : 'rgba(255, 255, 255, 0.8)',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#52B788', display: 'inline-block', boxShadow: '0 0 6px rgba(82, 183, 136, 0.5)' }} />
          <span>Available</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444', display: 'inline-block', boxShadow: '0 0 6px rgba(239, 68, 68, 0.5)' }} />
          <span>Booked</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#D4AF37', display: 'inline-block', boxShadow: '0 0 6px rgba(212, 175, 55, 0.5)' }} />
          <span>Selected</span>
        </div>
      </div>
    </div>
  )
}
