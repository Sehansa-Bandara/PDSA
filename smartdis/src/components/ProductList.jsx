import { useState, useMemo, useEffect } from 'react';
import { useProducts } from '../context/ProductContext';
import { MinHeap } from '../utils/MinHeap';
import { bubbleSortByPrice, bubbleSortByPriceDesc } from '../utils/BubbleSort';
import { catIcon, StatusBadge, DaysChip, PriceCell, ExpiryBar, CATEGORIES } from './shared';
import AddProductModal from './AddProductModal';

const ALL_CATS = ['All', ...CATEGORIES];
const ALL_STATUS = ['All', 'One Month', 'Two Months', 'Expired'];
const SORT_OPTS = [
  { v: 'expiry-asc',  l: 'Expiry (Soonest First)'  },
  { v: 'expiry-desc', l: 'Expiry (Latest First)'    },
  { v: 'price-asc',   l: 'Price ↑ (Bubble Sort)'   },
  { v: 'price-desc',  l: 'Price ↓ (Bubble Sort)'   },
  { v: 'name-asc',    l: 'Name A → Z'               },
];

export default function ProductList() {
  const { getAllSorted, removeProduct, removeExpired } = useProducts();
  const [showAdd, setShowAdd] = useState(false);
  const [showCatDisc, setShowCatDisc] = useState(false);
  const [cat, setCat] = useState('All');
  const [status, setStatus] = useState('All');
  const [sort, setSort] = useState('expiry-asc');
  const [toDelete, setToDelete] = useState(null);
  const [toEdit, setToEdit] = useState(null);
  const [toast, setToast] = useState(null);
  const [tab, setTab] = useState('products');

  const notify = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const products = useMemo(() => {
    let list = getAllSorted();
    if (cat !== 'All') list = list.filter(p => p.category === cat);
    list = list.filter(p => {
      const d = MinHeap.daysRemaining(p.expiryDate);
      if (status === 'Expired') return d < 0;
      if (status === 'One Month') return d >= 0 && d <= 30;
      if (status === 'Two Months') return d > 30 && d <= 60;
      return true;
    });
    list = [...list];
    if (sort === 'expiry-asc') list.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
    if (sort === 'expiry-desc') list.sort((a, b) => new Date(b.expiryDate) - new Date(a.expiryDate));
    if (sort === 'price-asc')  list = bubbleSortByPrice(list);     
    if (sort === 'price-desc') list = bubbleSortByPriceDesc(list); 
    if (sort === 'name-asc') list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [getAllSorted, cat, status, sort]);

  const confirmDel = () => { //Removes a product from the Min Heap inventory.
    removeProduct(toDelete.id);
    notify(`"${toDelete.name}" deleted.`);
    setToDelete(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-in">
      {/* Tabs Navbar */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(99,102,241,0.18)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setTab('products')}
          style={{
            background: 'none', border: 'none', color: tab === 'products' ? '#6366f1' : '#64748b',
            fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', padding: '0.5rem 1rem',
            borderBottom: tab === 'products' ? '2px solid #6366f1' : 'none',
            transition: 'all 0.2s'
          }}
        >All Products</button>
        <button
          onClick={() => setTab('discounts')}
          style={{
            background: 'none', border: 'none', color: tab === 'discounts' ? '#6366f1' : '#64748b',
            fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', padding: '0.5rem 1rem',
            borderBottom: tab === 'discounts' ? '2px solid #6366f1' : 'none',
            transition: 'all 0.2s'
          }}
        >Discount Rate</button>
      </div>

      {tab === 'products' ? (
        <>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.9rem', fontWeight: 900 }} className="gradient-text">All Products</h1>
              <p style={{ color: '#475569', marginTop: 3, fontSize: '0.85rem' }}>{products.length} results · Min-Heap sorted</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button id="pl-clear-expired" className="btn-danger" onClick={() => { removeExpired(); notify('Expired products cleared.'); }}>🗑 Clear Expired</button>
              <button id="pl-add-product" className="btn-primary" onClick={() => setShowAdd(true)}>+ Add Product</button>
            </div>
          </div>

          {/* Toast */}
          {toast && (
            <div style={{
              padding: '0.75rem 1.25rem', borderRadius: 10, fontSize: '0.875rem',
              background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.28)', color: '#86efac'
            }}>
              {toast.msg}
            </div>
          )}

          {/* Filters */}
          <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <FilterSelect id="pl-filter-cat" label="Category" value={cat} onChange={setCat} options={ALL_CATS} />
            <FilterSelect id="pl-filter-status" label="Status" value={status} onChange={setStatus} options={ALL_STATUS} />
            <FilterSelect id="pl-sort" label="Sort By" value={sort} onChange={setSort} options={SORT_OPTS.map(o => ({ value: o.v, label: o.l }))} isObj />
          </div>

          {/* Table */}
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(99,102,241,0.07)', borderBottom: '1px solid rgba(99,102,241,0.18)' }}>
                    {['Name', 'Category', 'Expiry Date', 'QTY', 'Price', 'Discount Price', 'Status', ''].map(h => (
                      <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.69rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0
                    ? <tr><td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: '#475569' }}>No products match your filters.</td></tr>
                    : products.map(p => {
                      const days = MinHeap.daysRemaining(p.expiryDate);
                      return (
                        <tr key={p.id} className="table-row" style={{ borderBottom: '1px solid rgba(99,102,241,0.07)' }}>
                          <td style={{ padding: '0.875rem 1rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: '1.2rem' }}>{catIcon(p.category)}</span>
                              <span>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{p.name}</div>
                                <div style={{ fontSize: '0.69rem', color: '#475569' }}>{p.id}</div>
                              </span>
                            </span>
                          </td>
                          <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: '#94a3b8' }}>{p.category}</td>
                          <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{p.expiryDate}</td>
                          <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#94a3b8' }}>{p.quantity} units</td>
                          <td style={{ padding: '0.875rem 1rem' }}><PriceCell product={p} onlyOriginal={true} /></td>
                          <td style={{ padding: '0.875rem 1rem' }}><PriceCell product={p} /></td>
                          <td style={{ padding: '0.875rem 1rem' }}><StatusBadge days={days} /></td>
                          <td style={{ padding: '0.875rem 1rem' }}>
                            <span style={{ display: 'flex', gap: '0.4rem' }}>
                              <button id={`pl-edit-${p.id}`} className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }} onClick={() => setToEdit(p)}>✏️</button>
                              <button id={`pl-del-${p.id}`} className="btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }} onClick={() => setToDelete(p)}>🗑</button>
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  }
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <DiscountRateView onSetClick={() => setShowCatDisc(true)} />
      )}

      {/* Confirm delete */}
      {toDelete && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setToDelete(null)}>
          <div className="modal-box" style={{ maxWidth: 400, textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🗑️</div>
            <h2 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Delete Product?</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Remove <strong style={{ color: '#e2e8f0' }}>"{toDelete.name}"</strong> ({toDelete.id}) from the heap?
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button id="del-cancel" className="btn-secondary" style={{ flex: 1 }} onClick={() => setToDelete(null)}>Cancel</button>
              <button id="del-confirm" className="btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={confirmDel}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {showAdd && <AddProductModal onClose={() => setShowAdd(false)} />}
      {showCatDisc && <CategoryDiscountModal onClose={() => setShowCatDisc(false)} />}
      {toEdit && <EditProductModal product={toEdit} onClose={() => setToEdit(null)} onSave={() => { notify(`"${toEdit.name}" updated.`); setToEdit(null); }} />}
    </div>
  );
}

function FilterSelect({ id, label, value, onChange, options, isObj }) {
  return (
    <div style={{ flex: '1 1 160px' }}>
      <label style={{ display: 'block', fontSize: '0.69rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</label>
      <select id={id} className="input-field" style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}
        value={value} onChange={e => onChange(e.target.value)}>
        {isObj
          ? options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)
          : options.map(o => <option key={o}>{o}</option>)
        }
      </select>
    </div>
  );
}

function CategoryDiscountModal({ onClose }) {
  const { updateCategoryDiscount, categoryDiscounts } = useProducts();
  const [selectedCat, setSelectedCat] = useState(CATEGORIES[0]);
  
  const range = 'All'; 
  const [pct, setPct] = useState('');

  // Update pct when cat or range changes
  useEffect(() => {
    const cd = categoryDiscounts[selectedCat] || {};
    const val = range === 'Month 1' ? cd.month1 : range === 'Month 2' ? cd.month2 : cd.all;
    setPct(val || '');
  }, [selectedCat, range, categoryDiscounts]);

  const handleSave = (e) => {
    e.preventDefault();
    updateCategoryDiscount(selectedCat, pct === '' ? null : Number(pct), range);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 400 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }} className="gradient-text">Set Category Discount</h2>
          <button className="btn-secondary" style={{ padding: '0.35rem 0.7rem' }} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Select Category</label>
            <select className="input-field" value={selectedCat} onChange={e => setSelectedCat(e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>


          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Discount Percentage (%)</label>
            <input type="number" className="input-field" min="0" max="100" placeholder="e.g. 50" value={pct} onChange={e => setPct(e.target.value)} />
            <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 4 }}>
              Setting <strong>{pct || '0'}%</strong> for <strong>{selectedCat}</strong> items.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ flex: 2, justifyContent: 'center' }}>Save Discount</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DiscountRateView({ onSetClick }) {
  const { categoryDiscounts } = useProducts();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 900 }} className="gradient-text">Category Discounts</h1>
          <p style={{ color: '#475569', marginTop: 3, fontSize: '0.85rem' }}>View and manage active discounts across all product categories</p>
        </div>
        <button className="btn-primary" onClick={onSetClick}>🏷️ Set Category Discount</button>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(99,102,241,0.07)', borderBottom: '1px solid rgba(99,102,241,0.18)' }}>
              {['Category', 'Current Discount', 'Status', 'Action'].map(h => (
                <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.69rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.map(cat => {
              const disc = categoryDiscounts?.[cat]?.all || 0;
              return (
                <tr key={cat} className="table-row" style={{ borderBottom: '1px solid rgba(99,102,241,0.07)' }}>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: '1.5rem' }}>{catIcon(cat)}</span>
                      <span style={{ fontWeight: 700 }}>{cat}</span>
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span style={{
                      fontSize: '1.1rem', fontWeight: 900,
                      color: disc > 0 ? '#86efac' : '#475569'
                    }}>
                      {disc}%
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    {disc > 0
                      ? <span style={{ color: '#86efac', fontSize: '0.72rem', fontWeight: 800, background: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: 6 }}>ACTIVE</span>
                      : <span style={{ color: '#64748b', fontSize: '0.72rem', background: 'rgba(0,0,0,0.2)', padding: '2px 8px', borderRadius: 6 }}>OFF</span>
                    }
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <button className="btn-secondary" style={{ fontSize: '0.72rem', padding: '0.4rem 0.8rem' }} onClick={onSetClick}>
                      ✏️ Edit Percentage
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EditProductModal({ product, onClose, onSave }) {
  const { updateProduct } = useProducts();
  const [form, setForm] = useState({
    name: product.name,
    category: product.category,
    price: String(product.price),
    quantity: String(product.quantity),
    expiryDate: product.expiryDate,
    manualDiscount: product.manualDiscount ?? '',
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: null })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.price || +form.price <= 0) e.price = 'Valid price required';
    if (form.quantity === '' || +form.quantity < 0) e.quantity = 'Valid quantity required';
    if (!form.expiryDate) e.expiryDate = 'Expiry date required';
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    await updateProduct(product.id, {
      name: form.name,
      category: form.category,
      price: +form.price,
      quantity: +form.quantity,
      expiryDate: form.expiryDate,
      manualDiscount: form.manualDiscount === '' ? null : +form.manualDiscount,
    });
    onSave();
  };

  const Label = ({ children }) => (
    <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {children}
    </label>
  );
  const Err = ({ field }) => errors[field]
    ? <span style={{ color: '#f87171', fontSize: '0.72rem' }}>{errors[field]}</span>
    : null;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }} className="gradient-text">Edit Product</h2>
            <p style={{ color: '#475569', fontSize: '0.78rem', marginTop: 2 }}>ID: <strong style={{ color: '#e2e8f0' }}>{product.id}</strong></p>
          </div>
          <button id="edit-modal-close" className="btn-secondary" style={{ padding: '0.35rem 0.7rem' }} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Name */}
          <div>
            <Label>Name *</Label>
            <input id="ef-name" className="input-field" placeholder="Product name" value={form.name} onChange={e => set('name', e.target.value)} />
            <Err field="name" />
          </div>

          {/* Category */}
          <div>
            <Label>Category</Label>
            <select id="ef-category" className="input-field" value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Price + Qty */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <Label>Price (LKR) *</Label>
              <input id="ef-price" className="input-field" type="number" step="0.01" min="0" value={form.price} onChange={e => set('price', e.target.value)} />
              <Err field="price" />
            </div>
            <div>
              <Label>Quantity *</Label>
              <input id="ef-qty" className="input-field" type="number" min="0" value={form.quantity} onChange={e => set('quantity', e.target.value)} />
              <Err field="quantity" />
            </div>
          </div>

          {/* Expiry */}
          <div>
            <Label>Expiry Date *</Label>
            <input id="ef-expiry" className="input-field" type="date" value={form.expiryDate} onChange={e => set('expiryDate', e.target.value)} />
            <Err field="expiryDate" />
          </div>

          {/* Manual Discount */}
          <div>
            <Label>Manual Discount % (optional)</Label>
            <input id="ef-discount" className="input-field" type="number" min="0" max="100" placeholder="Leave blank to use auto" value={form.manualDiscount} onChange={e => set('manualDiscount', e.target.value)} />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button id="ef-cancel" type="button" className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancel</button>
            <button id="ef-submit" type="submit" className="btn-primary" style={{ flex: 2, justifyContent: 'center' }}>💾 Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
