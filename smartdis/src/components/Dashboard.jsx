import { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { MinHeap } from '../utils/MinHeap';
import { BST } from '../utils/BST';
import { catIcon, StatusBadge, DaysChip, PriceCell, ExpiryBar } from './shared';
import AddProductModal from './AddProductModal';

export default function Dashboard() {
  const { getAllSorted, getStats, getNextExpiring, getExpiringIn, removeExpired, removeProduct } = useProducts();
  const [showAdd, setShowAdd] = useState(false);
  const [banner, setBanner]   = useState(null);

  // Search state
  const [query,    setQuery]   = useState('');
  const [mode,     setMode]    = useState('name'); // 'name' | 'id'
  const [results,  setResults] = useState(null);
  const [searched, setSearched]= useState(false);

  const stats  = getStats();
  const peak   = getNextExpiring();
  const topRows = getAllSorted().slice(0, 6);

  const clearExpired = () => {
    const n = removeExpired();
    setBanner({ msg: `✅ Removed ${n} expired product${n !== 1 ? 's' : ''}.`, type: 'success' });
    setTimeout(() => setBanner(null), 3500);
  };

  const runSearch = () => {
    if (!query.trim()) return;
    // Build a fresh BST from the current heap each search
    const allProducts = getAllSorted();
    if (mode === 'id') {
      // BST keyed by ID — O(log n) exact match
      const tree = BST.fromArray(allProducts, 'id');
      const hit  = tree.searchById(query.trim());
      setResults(hit ? [hit] : []);
    } else {
      // BST keyed by name — O(n) in-order substring search (alphabetical results)
      const tree = BST.fromArray(allProducts, 'name');
      setResults(tree.searchByName(query.trim()));
    }
    setSearched(true);
  };

  const resetSearch = () => { setQuery(''); setResults(null); setSearched(false); };

  const S = { gap: '1.5rem', display: 'flex', flexDirection: 'column' };

  return (
    <div style={S} className="animate-in">
      {/* ─── Header ─── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <h1 style={{ fontSize:'1.9rem', fontWeight:900 }} className="gradient-text">Dashboard</h1>
          <p style={{ color:'#475569', marginTop:3, fontSize:'0.85rem' }}>
            {new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
          </p>
        </div>
        <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
          {stats.expired > 0 && (
            <button id="dash-clear-expired" className="btn-danger" onClick={clearExpired}>🗑 Clear {stats.expired} Expired</button>
          )}
          <button id="dash-add-product" className="btn-primary" onClick={() => setShowAdd(true)}>+ Add Product</button>
        </div>
      </div>

      {/* ─── Banner ─── */}
      {banner && (
        <div style={{ padding:'0.75rem 1.25rem', borderRadius:10, fontSize:'0.875rem',
          background: banner.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          border:`1px solid ${banner.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          color: banner.type === 'success' ? '#86efac' : '#fca5a5',
        }}>{banner.msg}</div>
      )}

      {/* ─── Search Bar ─── */}
      <div className="glass-card" style={{ padding:'1rem 1.25rem', display:'flex', flexWrap:'wrap', gap:'1rem', alignItems:'center' }}>
        <div style={{ display:'flex', borderRadius:10, overflow:'hidden', border:'1px solid rgba(99,102,241,0.25)', height:38 }}>
          {[['id','ID'],['name','Name']].map(([v,l]) => (
            <button key={v} 
              onClick={() => { setMode(v); resetSearch(); }}
              style={{ padding:'0 1rem', fontSize:'0.75rem', fontWeight:600, cursor:'pointer', border:'none',
                background: mode === v ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'transparent',
                color: mode === v ? '#fff' : '#64748b',
                transition:'all 0.2s',
              }}>{l}</button>
          ))}
        </div>
        <div style={{ flex:1, display:'flex', gap:'0.75rem' }}>
          <input
            className="input-field"
            placeholder={mode === 'id' ? 'Enter product ID...' : 'Search by product name...'}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && runSearch()}
            style={{ flex:1, padding:'0.5rem 1rem' }}
          />
          <button className="btn-primary" onClick={runSearch} style={{ height:38, padding:'0 1.25rem' }}>🔍 Search</button>
          {searched && <button className="btn-secondary" onClick={resetSearch} style={{ height:38 }}>✕</button>}
        </div>
      </div>

      {/* ─── Search Results ─── */}
      {searched && (
        <div className="animate-in" style={{ display:'flex', flexDirection:'column', gap:'1rem', padding:'0.5rem', background:'rgba(99,102,241,0.03)', borderRadius:16, border:'1px dashed rgba(99,102,241,0.2)' }}>
          <div style={{ fontSize:'0.8rem', color:'#64748b', padding:'0 0.5rem' }}>
             {results?.length === 0 ? '❌ No products found.' : `✅ ${results?.length} result${results?.length !== 1 ? 's' : ''} found:` }
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))', gap:'1rem' }}>
            {results?.map(p => (
              <div key={p.id} className="glass-card" style={{ padding:'1rem', display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:'1.5rem' }}>{catIcon(p.category)}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'0.875rem', fontWeight:700 }}>{p.name}</div>
                  <div style={{ fontSize:'0.7rem', color:'#64748b' }}>{p.id} · {p.category}</div>
                </div>
                <PriceCell product={p} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Stat cards ─── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1.5rem' }}>
        {[
          { icon:'📦', label:'Total Products', val:stats.total,      col:'#818cf8' },
          { icon:'💀', label:'Expired',         val:stats.expired,    col:'#f87171' },
        ].map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* ─── Two-col row ─── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:'1.5rem' }}>
        {/* Next expiring */}
        <div className="glass-card" style={{ padding:'1.5rem' }}>
          <h3 style={{ fontWeight:700, marginBottom:'1rem', display:'flex', alignItems:'center', gap: 8 }}>⏰ Next Expiring Item</h3>
          {peak ? <PeakCard product={peak} /> : <Empty text="No products found" />}
        </div>

        {/* Expiring soon (30 days) */}
        <div className="glass-card" style={{ padding:'1.5rem' }}>
          <h3 style={{ fontWeight:700, marginBottom:'1rem', display:'flex', alignItems:'center', gap:8 }}>
            <span className="pulse-dot" style={{ background:'#fbbf24' }} />
            Expiring Soon (≤ 30 days)
          </h3>
          {getExpiringIn(30).length === 0
            ? <Empty text="✅ No products expiring soon" />
            : <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem', maxHeight: 310, overflowY: 'auto', paddingRight: 4 }}>
                {getExpiringIn(30).map(p => {
                  const days = MinHeap.daysRemaining(p.expiryDate);
                  return (
                    <div key={p.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.6rem 0.75rem', background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.16)', borderRadius:10 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:'1.1rem' }}>{catIcon(p.category)}</span>
                        <div>
                          <div style={{ fontSize:'0.875rem', fontWeight:600 }}>{p.name}</div>
                          <div style={{ fontSize:'0.7rem', color:'#475569' }}>{p.id} · {p.category}</div>
                        </div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <DaysChip days={days} />
                        <button id={`dash-del-${p.id}`} className="btn-danger" style={{ padding:'0.25rem 0.5rem', fontSize:'0.7rem' }} onClick={() => removeProduct(p.id)}>✕</button>
                      </div>
                    </div>
                  );
                })}
              </div>
          }
        </div>
      </div>

      {/* ─── All Products Table ─── */}
      <div className="glass-card" style={{ padding:'1.5rem' }}>
        <h3 style={{ fontWeight:700, marginBottom:'1rem' }}>📦 Full Inventory</h3>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid rgba(99,102,241,0.18)' }}>
                {['#','Product','Category','Expiry Date','Days Left','Price','Status'].map(h => (
                  <Th key={h}>{h}</Th>
                ))}
              </tr>
            </thead>
            <tbody>
              {getAllSorted().map((p, i) => {
                const days = MinHeap.daysRemaining(p.expiryDate);
                return (
                  <tr key={p.id} className="table-row" style={{ borderBottom:'1px solid rgba(99,102,241,0.07)' }}>
                    <td style={{ padding:'0.75rem 0.875rem', color:'#475569', fontSize:'0.8rem', fontWeight:700 }}>{i+1}</td>
                    <td style={{ padding:'0.75rem 0.875rem' }}>
                      <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:'1.25rem' }}>{catIcon(p.category)}</span>
                        <span>
                          <div style={{ fontSize:'0.875rem', fontWeight:600 }}>{p.name}</div>
                          <div style={{ fontSize:'0.7rem', color:'#475569' }}>ID: {p.id}</div>
                        </span>
                      </span>
                    </td>
                    <td style={{ padding:'0.75rem 0.875rem', fontSize:'0.8rem', color:'#94a3b8' }}>{p.category}</td>
                    <td style={{ padding:'0.75rem 0.875rem', fontSize:'0.8rem', color:'#94a3b8', whiteSpace:'nowrap' }}>{p.expiryDate}</td>
                    <td style={{ padding:'0.75rem 0.875rem' }}>
                      <span style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <ExpiryBar days={days} />
                        <DaysChip days={days} />
                      </span>
                    </td>
                    <td style={{ padding:'0.75rem 0.875rem' }}><PriceCell product={p} /></td>
                    <td style={{ padding:'0.75rem 0.875rem' }}><StatusBadge days={days} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && <AddProductModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}

function StatCard({ icon, label, val, col }) {
  return (
    <div className="stat-card">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.75rem' }}>
        <div style={{ width:40, height:40, borderRadius:10, background:`${col}1a`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.25rem' }}>{icon}</div>
        <div style={{ width:8, height:8, borderRadius:'50%', background:col, boxShadow:`0 0 8px ${col}` }} />
      </div>
      <div style={{ fontSize:'2rem', fontWeight:900, color:col }}>{val}</div>
      <div style={{ fontSize:'0.74rem', color:'#64748b', fontWeight:500, marginTop:3 }}>{label}</div>
    </div>
  );
}

function PeakCard({ product }) {
  const { categoryDiscounts } = useProducts();
  const days   = MinHeap.daysRemaining(product.expiryDate);
  const cd     = categoryDiscounts?.[product.category] || {};
  const catManual = cd.all;
  const pct    = MinHeap.computeDiscount(days, product.category, product.manualDiscount, catManual);
  const disc   = MinHeap.discountedPrice(product.price, pct);
  const isManual   = product.manualDiscount !== undefined && product.manualDiscount !== null && product.manualDiscount !== '';
  const isCatMan   = !isManual && (catManual !== undefined && catManual !== null && catManual !== '');

  return (
    <div style={{ background:'linear-gradient(135deg,rgba(239,68,68,0.08),rgba(99,102,241,0.08))', border:'1px solid rgba(239,68,68,0.2)', borderRadius:12, padding:'1.25rem' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:'1rem' }}>
        <span style={{ fontSize:'2.5rem' }}>{catIcon(product.category)}</span>
        <div>
          <div style={{ fontWeight:700, fontSize:'1rem' }}>{product.name}</div>
          <div style={{ fontSize:'0.73rem', color:'#64748b' }}>{product.id} · {product.category}</div>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.625rem' }}>
        {[
          ['EXPIRY',    <DaysChip days={days} />],
          ['QUANTITY',  <span style={{ fontWeight:700 }}>{product.quantity} units</span>],
          ['ORIGINAL',  <span style={{ fontWeight:700 }}>LKR {product.price.toFixed(2)}</span>],
          ['DISCOUNT',
            pct > 0
              ? <span style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                  <span className="discount-tag" style={{ background: isManual ? '#6366f1' : isCatMan ? '#8b5cf6' : 'linear-gradient(135deg,#f59e0b,#ef4444)' }}>
                    {isManual ? 'MANUAL' : isCatMan ? 'Discount' : `-${pct}%`}
                  </span>
                  <span style={{ color:'#86efac', fontWeight:700 }}>LKR {disc.toFixed(2)}</span>
                </span>
              : <span style={{ color:'#475569' }}>None</span>
          ],
        ].map(([lbl, node]) => (
          <div key={lbl} style={{ background:'rgba(0,0,0,0.25)', borderRadius:8, padding:'0.625rem' }}>
            <div style={{ fontSize:'0.65rem', color:'#64748b', marginBottom:3 }}>{lbl}</div>
            {node}
          </div>
        ))}
      </div>
    </div>
  );
}

function Empty({ text }) {
  return <div style={{ color:'#475569', textAlign:'center', padding:'2rem 0', fontSize:'0.875rem' }}>{text}</div>;
}

function Th({ children }) {
  return <th style={{ padding:'0.7rem 0.875rem', textAlign:'left', fontSize:'0.69rem', color:'#64748b', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{children}</th>;
}
