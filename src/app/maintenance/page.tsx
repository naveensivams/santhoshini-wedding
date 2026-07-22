export default function MaintenancePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '380px', textAlign: 'center' }}>
        <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💍</div>
          <h1 style={{ fontWeight: 700, fontSize: '1.25rem', color: '#111827', marginBottom: '0.5rem' }}>Down for Maintenance</h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: 1.6 }}>
            Santhoshini&apos;s Wedding Planner is temporarily unavailable. We&apos;ll be back shortly!
          </p>
          <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: '#9ca3af' }}>🌸 Something beautiful is being prepared</div>
        </div>
      </div>
    </div>
  )
}
