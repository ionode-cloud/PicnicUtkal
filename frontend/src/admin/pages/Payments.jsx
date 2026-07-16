import { Search, DollarSign, Download } from 'lucide-react'

export default function Payments() {
  return (
    <div className="card glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 className="heading-4">Transaction History</h2>
          <p className="text-muted text-sm">Review credit logs, Razorpay invoice matches, and trigger refunds.</p>
        </div>
        <button className="btn btn-outline btn-sm flex items-center gap-1">
          <Download size={14} /> Export Report
        </button>
      </div>

      <div className="admin-table-filters" style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <div className="input-with-icon" style={{ flex: 1, maxWidth: '320px' }}>
          <Search size={16} />
          <input type="text" placeholder="Search by payment ID or booking ref..." className="input" />
        </div>
      </div>

      <div className="admin-table-scroll-wrapper">
        <table className="admin-table-view">
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Booking ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Transaction Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="bold text-gradient">pay_RzP928371</td>
              <td>#BK-9283</td>
              <td>Sunil Mohanty</td>
              <td>₹1,196</td>
              <td>UPI (Google Pay)</td>
              <td>14 Jul 2026, 11:20 AM</td>
              <td><span className="badge badge-success">Paid</span></td>
            </tr>
            <tr>
              <td className="bold text-gradient">pay_RzP928154</td>
              <td>#BK-9281</td>
              <td>Anjali Das</td>
              <td>₹1,848</td>
              <td>Credit Card (HDFC)</td>
              <td>15 Jul 2026, 12:45 PM</td>
              <td><span className="badge badge-warning">Captured</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
