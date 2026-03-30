import { useProducts } from '../context/ProductContext';
import { MinHeap } from '../utils/MinHeap';
import { catIcon, DaysChip, StatusBadge, ExpiryBar } from './shared';

export default function ExpiryAlerts() {
  const { getExpiringIn, getExpired, removeExpired } = useProducts();

  const expiring3  = getExpiringIn(3);
  const expiring10 = getExpiringIn(10).filter(p => MinHeap.daysRemaining(p.expiryDate) > 3);
  const expired    = getExpired();

  const [toast, setToast] = React.useState(null);
  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }} className="animate-in">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <h1 style={{ fontSize:'1.9rem', fontWeight:900 }} className="gradient-text">Expiry Alerts</h1>
          <p style={{ color:'#475569', marginTop:3, fontSize:'0.85rem' }}>Products requiring urgent attention</p>
        </div>
        {expired.length > 0 && (
          <button id="alerts-clear-expired" className="btn-danger" onClick={() => { removeExpired(); notify(`Removed ${expired.length} expired products.`); }}>
            🗑 Remove {expired.length} Expired
          </button>
        )}
      </div>

      {toast && (
        <div style={{ padding:'0.75rem 1.25rem', borderRadius:10, fontSize:'0.875rem', background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.28)', color:'#86efac' }}>✅ {toast}</div>
      )}

      {/* Summary */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'1rem' }}>
        <AlertSummary icon="💀" label="Already Expired"   count={expired.length}   col="#94a3b8" />
        <AlertSummary icon="🚨" label="Critical (≤ 3d)"  count={expiring3.length}  col="#f87171" />
        <AlertSummary icon="⚠️" label="Warning (4–10d)"  count={expiring10.length} col="#fbbf24" />
      </div>

      {/* Expired */}
      {expired.length > 0 && (
        <AlertSection title="💀 Expired Products — Must Remove" items={expired} color="#94a3b8" borderColor="rgba(100,116,139,0.3)" bg="rgba(100,116,139,0.05)" />
      )}

      {/* Critical */}
      {expiring3.length > 0 && (
        <AlertSection title="🚨 Critical — Expiring Within 3 Days" items={expiring3} color="#f87171" borderColor="rgba(239,68,68,0.3)" bg="rgba(239,68,68,0.05)" />
      )}

      {/* Warning */}
      {expiring10.length > 0 && (
        <AlertSection title="⚠️ Warning — Expiring Within 10 Days" items={expiring10} color="#fbbf24" borderColor="rgba(245,158,11,0.3)" bg="rgba(245,158,11,0.05)" />
      )}

      {expired.length === 0 && expiring3.length === 0 && expiring10.length === 0 && (
        <div className="glass-card" style={{ padding:'3rem', textAlign:'center', color:'#475569' }}>
          <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>✅</div>
          <p style={{ fontWeight:600 }}>No urgent expiry alerts.</p>
          <p style={{ fontSize:'0.85rem', marginTop:6 }}>All products have more than 10 days remaining.</p>
        </div>
      )}
    </div>
  );
}

function AlertSummary({ icon, label, count, col }) {
  return (
    <div style={{ background:`${col}0d`, border:`1px solid ${col}30`, borderRadius:14, padding:'1.25rem', textAlign:'center' }}>
      <div style={{ fontSize:'2rem', marginBottom:'0.5rem' }}>{icon}</div>
      <div style={{ fontSize:'2rem', fontWeight:900, color:col }}>{count}</div>
      <div style={{ fontSize:'0.78rem', color:'#64748b', fontWeight:500, marginTop:3 }}>{label}</div>
    </div>
  );
}

function AlertSection({ title, items, color, borderColor, bg }) {
  return (
    <div>
      <h2 style={{ fontWeight:700, color, marginBottom:'0.875rem', fontSize:'1rem' }}>{title}</h2>
      <div style={{ display:'flex', flexDirection:'column', gap:'0.625rem' }}>
        {items.map(p => {
          const days = MinHeap.daysRemaining(p.expiryDate);
          const pct  = p.discountEnabled ? MinHeap.computeDiscount(days) : 0;
          return (
            <div key={p.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'0.875rem 1rem', background:bg, border:`1px solid ${borderColor}`, borderRadius:12 }}>
              <span style={{ fontSize:'1.5rem' }}>{catIcon(p.category)}</span>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                  <span style={{ fontWeight:700, fontSize:'0.9rem' }}>{p.name}</span>
                  <StatusBadge days={days} />
                  {pct > 0 && <span className="discount-tag">-{pct}%</span>}
                </div>
                <div style={{ fontSize:'0.73rem', color:'#475569', marginTop:3 }}>{p.id} · {p.category} · {p.quantity} units</div>
              </div>
              <div style={{ textAlign:'right', minWidth:120 }}>
                <div style={{ marginBottom:4 }}><DaysChip days={days} /></div>
                <ExpiryBar days={Math.max(0,days)} />
              </div>
              <div style={{ textAlign:'right', minWidth:80 }}>
                <div style={{ fontSize:'0.7rem', color:'#64748b', marginBottom:2 }}>Expiry</div>
                <div style={{ fontSize:'0.82rem', fontWeight:600 }}>{p.expiryDate}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


import React from 'react';
