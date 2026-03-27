import { useProducts } from '../context/ProductContext';
import { MinHeap } from '../utils/MinHeap';
import { catIcon, DaysChip, ExpiryBar } from './shared';

export default function Discounts() {
  const { getDiscounted } = useProducts();
  const items = getDiscounted();

  // Group by discount tier
  const clearance = items.filter(p => p.discountPct >= 50);
  const high      = items.filter(p => p.discountPct >= 30 && p.discountPct < 50);
  const moderate  = items.filter(p => p.discountPct < 30);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }} className="animate-in">
      <div>
        <h1 style={{ fontSize:'1.9rem', fontWeight:900 }} className="gradient-text">Discount Showcase</h1>
        <p style={{ color:'#475569', marginTop:3, fontSize:'0.85rem' }}>{items.length} product{items.length !== 1 ? 's' : ''} currently discounted</p>
      </div>

      {/* Summary chips */}
      <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
        <Chip color="#ef4444" label={`🔥 Clearance (≥50%): ${clearance.length}`} />
        <Chip color="#f59e0b" label={`⚡ High Deal (30-49%): ${high.length}`} />
        <Chip color="#6366f1" label={`✨ Moderate (5-29%): ${moderate.length}`} />
      </div>

      {items.length === 0 ? (
        <div className="glass-card" style={{ padding:'3rem', textAlign:'center', color:'#475569' }}>
          No discounted products right now. Category discounts are only applied to items within 30 days of expiry.
        </div>
      ) : (
        <>
          {clearance.length > 0 && <Section title="🔥 Clearance — Expires Very Soon" items={clearance} accent="#ef4444" />}
          {high.length > 0      && <Section title="⚡ High Discount"                  items={high}      accent="#f59e0b" />}
          {moderate.length > 0  && <Section title="✨ Moderate Discount"              items={moderate}  accent="#6366f1" />}
        </>
      )}
    </div>
  );
}

function Section({ title, items, accent }) {
  return (
    <div>
      <h2 style={{ fontWeight:700, color: accent, marginBottom:'0.875rem', fontSize:'1rem' }}>{title}</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'1rem' }}>
        {items.map(p => <DiscountCard key={p.id} product={p} accent={accent} />)}
      </div>
    </div>
  );
}

function DiscountCard({ product: p, accent }) {
  return (
    <div className="glass-card" style={{ padding:'1.25rem', border:`1px solid ${accent}28` }}>
      {/* Top row */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'0.875rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:'2rem' }}>{catIcon(p.category)}</span>
          <div>
            <div style={{ fontSize:'0.9rem', fontWeight:700 }}>{p.name}</div>
            <div style={{ fontSize:'0.7rem', color:'#475569' }}>{p.id} · {p.category}</div>
          </div>
        </div>
        <span className="discount-tag" style={{ fontSize:'0.85rem', padding:'4px 10px' }}>-{p.discountPct}%</span>
      </div>

      {/* Expiry bar */}
      <div style={{ marginBottom:'0.875rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
          <span style={{ fontSize:'0.72rem', color:'#64748b' }}>Expiry: {p.expiryDate}</span>
          <DaysChip days={p.daysRemaining} />
        </div>
        <ExpiryBar days={p.daysRemaining} />
      </div>

      {/* Price row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.625rem 0.875rem', background:'rgba(0,0,0,0.25)', borderRadius:10 }}>
        <div>
          <div style={{ fontSize:'0.69rem', color:'#64748b', marginBottom:2 }}>ORIGINAL PRICE</div>
          <div style={{ fontSize:'0.9rem', textDecoration:'line-through', color:'#475569' }}>LKR {p.price.toFixed(2)}</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:'0.69rem', color:'#64748b', marginBottom:2 }}>DISCOUNTED</div>
          <div style={{ fontSize:'1.2rem', fontWeight:900, color:'#86efac' }}>LKR {p.discountedPrice.toFixed(2)}</div>
        </div>
      </div>

      {/* Savings */}
      <div style={{ marginTop:'0.625rem', textAlign:'center', fontSize:'0.75rem', color: accent }}>
        Save LKR {(p.price - p.discountedPrice).toFixed(2)} per unit · Qty: {p.quantity}
      </div>
    </div>
  );
}

function Chip({ color, label }) {
  return (
    <div style={{ display:'inline-flex', alignItems:'center', padding:'0.4rem 1rem', borderRadius:20, background:`${color}18`, border:`1px solid ${color}38`, color, fontSize:'0.8rem', fontWeight:600 }}>
      {label}
    </div>
  );
}
