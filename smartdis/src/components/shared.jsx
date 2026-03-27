// Shared small UI helpers used across pages
import { MinHeap } from '../utils/MinHeap';
import { useProducts } from '../context/ProductContext';

export const CATEGORY_ICONS = {
  Dairy:'🥛', Meat:'🥩', Produce:'🥦', Bakery:'🍞', Seafood:'🐟',
  Deli:'🥪', Beverages:'🧃', Canned:'🥫', Frozen:'🧊', Snacks:'🍪', Other:'📦',
};

export const CATEGORIES = Object.keys(CATEGORY_ICONS);

export function catIcon(cat) { return CATEGORY_ICONS[cat] ?? '📦'; }

export function StatusBadge({ days }) {
  if (days < 0)    return <span className="badge badge-expired">Expired</span>;
  if (days === 0)  return <span className="badge badge-critical">Today</span>;
  if (days <= 30)  return <span className="badge badge-warning" style={{ color: '#fbbf24' }}>Month 1</span>;
  if (days <= 60)  return <span className="badge badge-good" style={{ color: '#818cf8', borderColor: 'rgba(129,139,248,0.3)' }}>Month 2</span>;
  return               <span className="badge badge-good">Safe</span>;
}

export function DaysChip({ days }) {
  if (days < 0)   return <span style={{ color:'#94a3b8' }}>{Math.abs(days)}d ago</span>;
  if (days === 0) return <span style={{ color:'#f87171', fontWeight:700 }}>Today!</span>;
  if (days <= 3)  return <span style={{ color:'#f87171', fontWeight:700 }}>{days}d left</span>;
  if (days <= 10) return <span style={{ color:'#fbbf24', fontWeight:600 }}>{days}d left</span>;
  if (days <= 30) return <span style={{ color:'#fbbf24', fontSize:'0.75rem' }}>{days}d left</span>;
  return              <span style={{ color:'#86efac' }}>{days}d left</span>;
}

export function PriceCell({ product, onlyOriginal = false }) {
  const { categoryDiscounts } = useProducts?.() || {};
  const days = MinHeap.daysRemaining(product.expiryDate);
  const cd = categoryDiscounts?.[product.category] || {};

  if (onlyOriginal) {
    return <span style={{ fontWeight:600 }}>LKR {product.price.toFixed(2)}</span>;
  }

  // Expired items — no discount applies
  if (days < 0) {
    return (
      <span style={{ display:'flex', alignItems:'center', gap:6 }}>
        <span className="discount-tag" style={{ background:'#334155', color:'#94a3b8', fontSize:'0.65rem' }}>
          EXPIRED
        </span>
        <span style={{ color:'#64748b', fontWeight:600, textDecoration:'line-through' }}>
          LKR {product.price.toFixed(2)}
        </span>
      </span>
    );
  }

  let catManual = cd.all;
  if (days <= 30 && cd.month1 !== null && cd.month1 !== undefined) catManual = cd.month1;
  if (days > 30 && days <= 60 && cd.month2 !== null && cd.month2 !== undefined) catManual = cd.month2;

  const pct = product.discountEnabled
    ? MinHeap.computeDiscount(days, product.category, product.manualDiscount, catManual)
    : 0;

  const isProductManual  = product.manualDiscount !== undefined && product.manualDiscount !== null && product.manualDiscount !== '';
  const isCategoryManual = !isProductManual && (catManual !== undefined && catManual !== null && catManual !== '');

  if (pct > 0) {
    const dp = MinHeap.discountedPrice(product.price, pct);
    return (
      <span style={{ display:'flex', alignItems:'center', gap:6 }}>
        <span className="discount-tag" style={{
          background: isProductManual ? '#6366f1' : isCategoryManual ? '#8b5cf6' : 'linear-gradient(135deg, #f59e0b, #ef4444)'
        }}>
          {isProductManual ? 'MANUAL' : isCategoryManual ? 'Discount' : `-${pct}%`}
        </span>
        <span style={{ color:'#86efac', fontWeight:700 }}>LKR {dp.toFixed(2)}</span>
      </span>
    );
  }
  return <span style={{ color:'#64748b', fontSize:'0.8rem', fontStyle:'italic' }}>No Discount</span>;
}

export function ExpiryBar({ days, max = 30 }) {
  const pct = Math.max(0, Math.min(100, (days / max) * 100));
  const col = days <= 3 ? '#ef4444' : days <= 10 ? '#f59e0b' : '#22c55e';
  return (
    <div className="progress-bar" style={{ width:70 }}>
      <div className="progress-fill" style={{ width:`${pct}%`, background:col }} />
    </div>
  );
}
