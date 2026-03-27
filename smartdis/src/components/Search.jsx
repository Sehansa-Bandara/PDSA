import { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { MinHeap } from '../utils/MinHeap';
import { catIcon, StatusBadge, DaysChip, PriceCell } from './shared';

export default function Search() {
  const { searchById, searchByName } = useProducts();
  const [query,    setQuery]   = useState('');
  const [mode,     setMode]    = useState('name'); // 'name' | 'id'
  const [results,  setResults] = useState(null);
  const [searched, setSearched]= useState(false);

  const run = () => {
    if (!query.trim()) return;
    if (mode === 'id') {
      const r = searchById(query.trim());
      setResults(r ? [r] : []);
    } else {
      setResults(searchByName(query.trim()));
    }
    setSearched(true);
  };

  const reset = () => { setQuery(''); setResults(null); setSearched(false); };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }} className="animate-in">
      <div>
        <h1 style={{ fontSize:'1.9rem', fontWeight:900 }} className="gradient-text">Search Products</h1>
        <p style={{ color:'#475569', marginTop:3, fontSize:'0.85rem' }}>Find products by ID or name</p>
      </div>

      {/* Search box */}
      <div className="glass-card" style={{ padding:'1.5rem' }}>
        <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap', marginBottom:'0.875rem' }}>
          {/* Mode toggle */}
          <div style={{ display:'flex', borderRadius:10, overflow:'hidden', border:'1px solid rgba(99,102,241,0.25)' }}>
            {[['id','By ID'],['name','By Name']].map(([v,l]) => (
              <button key={v} id={`search-mode-${v}`}
                onClick={() => { setMode(v); reset(); }}
                style={{ padding:'0.5rem 1.1rem', fontSize:'0.82rem', fontWeight:600, cursor:'pointer', border:'none', fontFamily:'Inter,sans-serif',
                  background: mode === v ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'transparent',
                  color: mode === v ? '#fff' : '#64748b',
                  transition:'all 0.2s',
                }}>{l}</button>
            ))}
          </div>
        </div>

        <div style={{ display:'flex', gap:'0.75rem' }}>
          <input
            id="search-input"
            className="input-field"
            placeholder={mode === 'id' ? 'Enter product ID  e.g. P001' : 'Type product name…'}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && run()}
            style={{ flex:1 }}
          />
          <button id="search-btn"   className="btn-primary"   onClick={run}  style={{ whiteSpace:'nowrap' }}>🔍 Search</button>
          {searched && <button id="search-clear" className="btn-secondary" onClick={reset} style={{ whiteSpace:'nowrap' }}>Clear</button>}
        </div>
      </div>

      {/* Results */}
      {results !== null && (
        <>
          <div style={{ fontSize:'0.85rem', color:'#64748b' }}>
            {results.length === 0 ? '❌ No products found.' : `✅ ${results.length} result${results.length !== 1 ? 's' : ''} found.`}
          </div>
          {results.map(p => <ProductCard key={p.id} product={p} />)}
        </>
      )}

      {results === null && (
        <div className="glass-card" style={{ padding:'3rem', textAlign:'center', color:'#475569' }}>
          <div style={{ fontSize:'3rem', marginBottom:'0.75rem' }}>🔍</div>
          <p>Use the search bar above to find products by their ID or name.</p>
        </div>
      )}
    </div>
  );
}

function ProductCard({ product: p }) {
  const days = MinHeap.daysRemaining(p.expiryDate);
  const pct  = p.discountEnabled ? MinHeap.computeDiscount(days) : 0;
  const disc = MinHeap.discountedPrice(p.price, pct);

  return (
    <div className="glass-card" style={{ padding:'1.5rem' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:'1.25rem' }}>
        <span style={{ fontSize:'2.8rem' }}>{catIcon(p.category)}</span>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
            <h2 style={{ fontSize:'1.1rem', fontWeight:800 }}>{p.name}</h2>
            <StatusBadge days={days} />
            {pct > 0 && <span className="discount-tag">-{pct}%</span>}
          </div>
          <div style={{ fontSize:'0.78rem', color:'#475569', marginTop:3 }}>{p.id} · {p.category}</div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:'0.75rem' }}>
        {[
          ['📅 Expiry Date', p.expiryDate],
          ['⏱ Days Remaining', <DaysChip days={days} />],
          ['📦 Quantity', `${p.quantity} units`],
          ['💰 Original Price', `LKR ${p.price.toFixed(2)}`],
          ['🏷 Discount', pct > 0 ? `${pct}%` : 'None'],
          ['✅ Final Price', pct > 0 ? <span style={{ color:'#86efac', fontWeight:700 }}>LKR {disc.toFixed(2)}</span> : `LKR ${p.price.toFixed(2)}`],
        ].map(([label, value]) => (
          <div key={label} style={{ background:'rgba(99,102,241,0.06)', borderRadius:10, padding:'0.75rem', border:'1px solid rgba(99,102,241,0.12)' }}>
            <div style={{ fontSize:'0.69rem', color:'#64748b', marginBottom:4 }}>{label}</div>
            <div style={{ fontWeight:600, fontSize:'0.9rem' }}>{value}</div>
          </div>
        ))}
      </div>

      {pct > 0 && (
        <div style={{ marginTop:'1rem', padding:'0.75rem 1rem', background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)', borderRadius:10, fontSize:'0.85rem', color:'#86efac', display:'flex', alignItems:'center', gap:8 }}>
          💡 Save LKR {(p.price - disc).toFixed(2)} per unit — expires in {days < 0 ? 'already expired' : `${days} day${days !== 1 ? 's' : ''}`}
        </div>
      )}
    </div>
  );
}
