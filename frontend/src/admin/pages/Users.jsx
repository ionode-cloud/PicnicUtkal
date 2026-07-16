import { Search, UserCheck, ShieldAlert } from 'lucide-react'

export default function Users() {
  return (
    <div className="card glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 className="heading-4">User Accounts Directory</h2>
          <p className="text-muted text-sm">Manage user accounts, roles level, and rewards wallet state.</p>
        </div>
      </div>

      <div className="admin-table-filters" style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <div className="input-with-icon" style={{ flex: 1, maxWidth: '320px' }}>
          <Search size={16} />
          <input type="text" placeholder="Search by name, email, or phone..." className="input" />
        </div>
      </div>

      <div className="admin-table-scroll-wrapper">
        <table className="admin-table-view">
          <thead>
            <tr>
              <th>User Name</th>
              <th>Email Address</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Wallet Balance</th>
              <th>Reward Points</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="bold">Jyoti Ranjan</td>
              <td>jyoti@picnicutkal.com</td>
              <td>+91 9876543210</td>
              <td><span className="badge badge-gold">Admin</span></td>
              <td>₹250</td>
              <td>10 pts</td>
              <td><span className="badge badge-success">Active</span></td>
            </tr>
            <tr>
              <td className="bold">Ananya Senapati</td>
              <td>ananya@gmail.com</td>
              <td>+91 8765432109</td>
              <td><span className="badge badge-glass">User</span></td>
              <td>₹0</td>
              <td>0 pts</td>
              <td><span className="badge badge-success">Active</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
