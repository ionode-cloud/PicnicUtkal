import { Search, Eye, Filter } from 'lucide-react'

export default function Bookings() {
  return (
    <div className="card glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 className="heading-4">Bookings & Reservations Ledger</h2>
          <p className="text-muted text-sm">Review, verify, and validate guest zone slots check-ins.</p>
        </div>
      </div>

      <div className="admin-table-filters" style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div className="input-with-icon" style={{ flex: 1, maxWidth: '320px' }}>
          <Search size={16} />
          <input type="text" placeholder="Search by Booking ID or customer..." className="input" />
        </div>
        <select className="input" style={{ width: '160px', padding: '6px 12px' }}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="admin-table-scroll-wrapper">
        <table className="admin-table-view">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Customer</th>
              <th>Visit Date</th>
              <th>Grand Total</th>
              <th>Zones Selected</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="bold">#BK-9283</td>
              <td>Sunil Mohanty</td>
              <td>14 Jul 2026</td>
              <td>₹1,196</td>
              <td>BBQ Zone, Kids Zone</td>
              <td><span className="badge badge-success">Confirmed</span></td>
              <td><button className="btn btn-outline btn-sm"><Eye size={12} /></button></td>
            </tr>
            <tr>
              <td className="bold">#BK-9281</td>
              <td>Anjali Das</td>
              <td>15 Jul 2026</td>
              <td>₹1,848</td>
              <td>Swimming Zone</td>
              <td><span className="badge badge-warning">Pending</span></td>
              <td><button className="btn btn-outline btn-sm"><Eye size={12} /></button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
