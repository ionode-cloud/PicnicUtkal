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
    <div
      className="spot-cal-box"
      style={{
        background: containerBg,
        border: containerBorder,
        color: containerColor,
        boxShadow: isLight ? 'var(--shadow-sm, 0 4px 16px rgba(0,0,0,0.05))' : '0 8px 32px rgba(0,0,0,0.3)',
      }}
    >
      {/* Calendar Header */}
      <div className="spot-cal-header">
        <div className="spot-cal-title-wrap">
          <Calendar size={15} color="var(--gold, #D4AF37)" style={{ flexShrink: 0 }} />
          <span className="spot-cal-title" style={{ color: isLight ? 'var(--text-primary, #111827)' : 'var(--cream, #FDFBF7)' }}>
            {title}
          </span>
          {loading && <RefreshCw size={12} className="spin" color="var(--gold, #D4AF37)" style={{ flexShrink: 0 }} />}
        </div>
        <span className={`badge spot-cal-badge ${selectedDatesList.length === durationDays ? 'badge-success' : 'badge-gold'}`}>
          {selectedDatesList.length} / {durationDays} Day{durationDays > 1 ? 's' : ''} Selected
        </span>
      </div>

      {/* Month Navigation Bar */}
      <div
        className="spot-cal-month-nav"
        style={{
          background: navBg,
        }}
      >
        <button
          onClick={handlePrevMonth}
          type="button"
          style={{ background: 'none', border: 'none', color: 'var(--gold, #D4AF37)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
          aria-label="Previous Month"
        >
          <ChevronLeft size={18} />
        </button>

        <span className="spot-cal-month-title" style={{ color: navText }}>
          {monthName}
        </span>

        <button
          onClick={handleNextMonth}
          type="button"
          style={{ background: 'none', border: 'none', color: 'var(--gold, #D4AF37)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
          aria-label="Next Month"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day Names Header */}
      <div className="spot-cal-weekdays">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <span key={day} className="spot-cal-weekday" style={{ color: dayHeaderColor }}>
            {day}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="spot-cal-grid">
        {daysArray.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="spot-cal-empty-cell" style={{ minHeight: '32px' }} />
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
              className={`spot-cal-day-cell ${isSelected ? 'spot-cal-day-cell--selected' : ''} ${isBooked ? 'spot-cal-day-cell--booked' : ''} ${isPast ? 'spot-cal-day-cell--past' : ''}`}
              style={{
                background: bg,
                border: border,
                color: textColor,
                cursor: cursor,
                fontWeight: isSelected ? 900 : 600,
              }}
            >
              <span className="spot-cal-day-num">{day}</span>
              {isBooked && (
                <span className="spot-cal-day-status status-booked">
                  Booked
                </span>
              )}
              {!isBooked && isSelected && (
                <span className="spot-cal-day-status status-selected">
                  {durationDays > 1 ? `Day ${rangeIndex + 1}` : 'Selected'}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Legend Footer */}
      <div
        className="spot-cal-legend"
        style={{
          borderTop: isLight ? '1px dashed rgba(0, 0, 0, 0.12)' : '1px dashed rgba(255, 255, 255, 0.12)',
          color: isLight ? 'var(--text-muted, #4B5563)' : 'rgba(255, 255, 255, 0.8)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#52B788', display: 'inline-block', boxShadow: '0 0 6px rgba(82, 183, 136, 0.5)' }} />
          <span>Available</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', display: 'inline-block', boxShadow: '0 0 6px rgba(239, 68, 68, 0.5)' }} />
          <span>Booked</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#D4AF37', display: 'inline-block', boxShadow: '0 0 6px rgba(212, 175, 55, 0.5)' }} />
          <span>Selected</span>
        </div>
      </div>
    </div>
  )
}
