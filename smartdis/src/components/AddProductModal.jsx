import { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { CATEGORIES } from './shared';

function genId() { return 'P' + String(Math.floor(Math.random() * 9000 + 1000)); }

export default function AddProductModal({ onClose }) {
  const { addProduct } = useProducts();
  const [form, setForm] = useState({
    id: genId(), name: '', category: 'Dairy',
    price: '', quantity: '', expiryDate: '', discountEnabled: true,
    manualDiscount: '',
  });
  const [errors, setErrors] = useState({});
  const [done,   setDone]   = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: null })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim())                  e.name     = 'Name is required';
    if (!form.price || +form.price <= 0)    e.price    = 'Valid price required';
    if (form.quantity === '' || +form.quantity < 0) e.quantity = 'Valid quantity required';
    if (!form.expiryDate)                   e.expiryDate = 'Expiry date required';
    return e;
  };

  const submit = (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    addProduct({ 
      ...form, 
      price: +form.price, 
      quantity: +form.quantity,
      manualDiscount: form.manualDiscount === '' ? null : +form.manualDiscount 
    });
    setDone(true);
    setTimeout(onClose, 1400);
  };

  const Label = ({ children }) => (
    <label style={{ display:'block', fontSize:'0.72rem', color:'#94a3b8', fontWeight:600, marginBottom:'0.3rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>
      {children}
    </label>
  );
  const Err = ({ field }) => errors[field]
    ? <span style={{ color:'#f87171', fontSize:'0.72rem' }}>{errors[field]}</span>
    : null;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        {/* ── header ── */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem' }}>
          <div>
            <h2 style={{ fontSize:'1.2rem', fontWeight:800 }} className="gradient-text">Add New Product</h2>
            <p style={{ color:'#475569', fontSize:'0.78rem', marginTop:2 }}>Enter product details below</p>
          </div>
          <button id="modal-close" className="btn-secondary" style={{ padding:'0.35rem 0.7rem' }} onClick={onClose}>✕</button>
        </div>

        {done ? (
          <div style={{ textAlign:'center', padding:'2.5rem 0' }}>
            <div style={{ fontSize:'3.5rem', marginBottom:'0.75rem' }}>✅</div>
            <h3 style={{ color:'#86efac', fontWeight:700, fontSize:'1.1rem' }}>Product Added!</h3>
            <p style={{ color:'#64748b', fontSize:'0.8rem', marginTop:6 }}>ID: <strong style={{ color:'#e2e8f0' }}>{form.id}</strong> · {form.name}</p>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            {/* row: ID + Name */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:'0.75rem' }}>
              <div>
                <Label>Product ID</Label>
                <input id="f-id" className="input-field" value={form.id} onChange={e => set('id', e.target.value)} />
              </div>
              <div>
                <Label>Name *</Label>
                <input id="f-name" className="input-field" placeholder="e.g. Fresh Milk 1L" value={form.name} onChange={e => set('name', e.target.value)} />
                <Err field="name" />
              </div>
            </div>

            {/* Category */}
            <div>
              <Label>Category</Label>
              <select id="f-category" className="input-field" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Price + Qty */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
              <div>
                <Label>Price (LKR) *</Label>
                <input id="f-price" className="input-field" type="number" step="0.01" min="0" placeholder="0.00" value={form.price} onChange={e => set('price', e.target.value)} />
                <Err field="price" />
              </div>
              <div>
                <Label>Quantity *</Label>
                <input id="f-qty" className="input-field" type="number" min="0" placeholder="0" value={form.quantity} onChange={e => set('quantity', e.target.value)} />
                <Err field="quantity" />
              </div>
            </div>

            {/* Expiry */}
            <div>
              <Label>Expiry Date *</Label>
              <input id="f-expiry" className="input-field" type="date" value={form.expiryDate} onChange={e => set('expiryDate', e.target.value)} />
              <Err field="expiryDate" />
            </div>

            {/* Actions */}
            <div style={{ display:'flex', gap:'0.75rem', marginTop:'0.5rem' }}>
              <button id="f-cancel" type="button" className="btn-secondary" style={{ flex:1, justifyContent:'center' }} onClick={onClose}>Cancel</button>
              <button id="f-submit" type="submit" className="btn-primary"   style={{ flex:2, justifyContent:'center' }}>+ Add Product</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
