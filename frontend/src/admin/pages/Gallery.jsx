import { PlusCircle, Image, Film, Trash2 } from 'lucide-react'

export default function Gallery() {
  return (
    <div className="card glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 className="heading-4">Media Library Manager</h2>
          <p className="text-muted text-sm">Organize public photos, drone videos, and 360 virtual views.</p>
        </div>
        <button className="btn btn-gold btn-sm flex items-center gap-1">
          <PlusCircle size={16} /> Upload Media
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
        {/* Mock photos list */}
        <div className="card" style={{ overflow: 'hidden', border: '1px solid var(--border)' }}>
          <img src="https://images.unsplash.com/photo-1502472584811-0a2f2feb8968?w=300&q=80" alt="mock" style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
          <div style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Nandankanan 1</span>
            <button style={{ border: 'none', background: 'none', color: 'var(--error)', cursor: 'pointer' }}><Trash2 size={14} /></button>
          </div>
        </div>

        <div className="card" style={{ overflow: 'hidden', border: '1px solid var(--border)' }}>
          <img src="https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=300&q=80" alt="mock" style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
          <div style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Nandankanan 2</span>
            <button style={{ border: 'none', background: 'none', color: 'var(--error)', cursor: 'pointer' }}><Trash2 size={14} /></button>
          </div>
        </div>

        <div className="card" style={{ overflow: 'hidden', border: '1px solid var(--border)' }}>
          <img src="https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=300&q=80" alt="mock" style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
          <div style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Nandankanan 3</span>
            <button style={{ border: 'none', background: 'none', color: 'var(--error)', cursor: 'pointer' }}><Trash2 size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  )
}
