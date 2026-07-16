import { PlusCircle, Search, Edit2, Trash2, Eye } from 'lucide-react'

export default function Spots() {
  return (
    <div className="card glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 className="heading-4">Picnic Spots Manager</h2>
          <p className="text-muted text-sm">Add, modify, or delete public picnic zones listings.</p>
        </div>
        <button className="btn btn-gold btn-sm flex items-center gap-1">
          <PlusCircle size={16} /> Add New Spot
        </button>
      </div>

      <div className="admin-table-filters" style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <div className="input-with-icon" style={{ flex: 1, maxWidth: '320px' }}>
          <Search size={16} />
          <input type="text" placeholder="Search by spot name or location..." className="input" />
        </div>
      </div>

      <div className="admin-table-scroll-wrapper">
        <table className="admin-table-view">
          <thead>
            <tr>
              <th>Spot Name</th>
              <th>Location</th>
              <th>Base Price</th>
              <th>Rating</th>
              <th>Capacity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="bold">Nandankanan Wildlife Sanctuary</td>
              <td>Bhubaneswar, Odisha</td>
              <td>₹299/person</td>
              <td>4.9★ (348)</td>
              <td>500 guests</td>
              <td>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-outline btn-sm"><Edit2 size={12} /></button>
                  <button className="btn btn-outline btn-sm" style={{ color: 'var(--error)' }}><Trash2 size={12} /></button>
                </div>
              </td>
            </tr>
            <tr>
              <td className="bold">Chilika Lake Picnic Resort</td>
              <td>Puri, Odisha</td>
              <td>₹449/person</td>
              <td>4.8★ (214)</td>
              <td>350 guests</td>
              <td>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-outline btn-sm"><Edit2 size={12} /></button>
                  <button className="btn btn-outline btn-sm" style={{ color: 'var(--error)' }}><Trash2 size={12} /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
