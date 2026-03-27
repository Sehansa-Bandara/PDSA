import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { MinHeap } from '../utils/MinHeap';
import { CATEGORIES } from '../components/shared';

/* ────────────────────────────── Seed data ────────────────────────────── */
const SEED = [];

/* ────────────────────────────── Context ────────────────────────────── */
const Ctx = createContext(null);

const API_URL = 'http://localhost:8000/api/products';
const DISCOUNT_API_URL = 'http://localhost:8000/api/discounts';

export function ProductProvider({ children }) {
  const [heap] = useState(() => new MinHeap());
  const [rev, setRev] = useState(0); 
  const [categoryDiscounts, setCategoryDiscounts] = useState({});
  const [loading, setLoading] = useState(true);

  const tick = useCallback(() => setRev(r => r + 1), []);

  // Sync with Backend (MySQL) on mount
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        if (data && Array.isArray(data)) {
          heap.heap = []; // Clear
          data.forEach(p => {
            heap.insert({
              id: p.product_id,
              name: p.name,
              category: p.category,
              price: Number(p.price),
              quantity: Number(p.quantity),
              expiryDate: p.expiry_date ? p.expiry_date.split('T')[0] : '', // Format date
              discountEnabled: true, 
              manualDiscount: null
            });
          });
          tick();
        }
      } catch (e) {
        console.error('Failed to fetch from backend:', e);
      }
      setLoading(false);
    }
    fetchProducts();

    async function fetchDiscounts() {
      try {
        const res = await fetch(DISCOUNT_API_URL);
        const data = await res.json();
        if (data && Array.isArray(data)) {
          const dict = {};
          data.forEach(d => {
            dict[d.category] = { all: d.discount_percentage };
          });
          setCategoryDiscounts(dict);
          tick();
        }
      } catch (e) {
        console.error('Failed to fetch discounts:', e);
      }
    }
    fetchDiscounts();
  }, [heap, tick]);

  /* ── Mutations ── */
  const addProduct = useCallback(async (p) => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: p.id,
          name: p.name,
          category: p.category,
          price: Number(p.price),
          quantity: Number(p.quantity),
          expiry_date: p.expiryDate
        })
      });
      if (res.ok) { heap.insert(p); tick(); }
    } catch (e) { console.error('Add failed:', e); }
  }, [heap, tick]);

  const removeProduct = useCallback(async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (res.ok) { heap.removeById(id); tick(); }
    } catch (e) { console.error('Remove failed:', e); }
  }, [heap, tick]);

  const updateProduct = useCallback(async (id, upd) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: upd.name,
          category: upd.category,
          price: upd.price,
          quantity: upd.quantity,
          expiry_date: upd.expiryDate
        })
      });
      if (res.ok) { heap.updateById(id, upd); tick(); }
    } catch (e) { console.error('Update failed:', e); }
  }, [heap, tick]);

  const updateCategoryDiscount = useCallback(async (cat, pct, range = 'All') => {
    try {
      const res = await fetch(DISCOUNT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: cat, discount_percentage: pct || 0 })
      });
      if (res.ok) {
        setCategoryDiscounts(prev => {
          const current = prev[cat] || { all: null, month1: null, month2: null };
          const key = range === 'Month 1' ? 'month1' : range === 'Month 2' ? 'month2' : 'all';
          return { ...prev, [cat]: { ...current, [key]: pct } };
        });
        tick();
      }
    } catch (e) {
      console.error('Failed to save category discount:', e);
    }
  }, [tick]);

  const removeExpired = useCallback(async () => {
    const exp = heap.getExpired();
    const ids = exp.map(p => p.id);
    for (const id of ids) {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      heap.removeById(id);
    }
    tick();
    return exp.length;
  }, [heap, tick]);

  /* ── Queries (depend on `rev` so callers always get fresh data) ── */
  const getAllSorted = useCallback(() => heap.getSorted(), [heap, rev]); // eslint-disable-line
  const getExpiringIn = useCallback((days) => heap.getExpiringWithin(days), [heap, rev]); // eslint-disable-line
  const getExpired = useCallback(() => heap.getExpired(), [heap, rev]); // eslint-disable-line
  const getNextExpiring = useCallback(() => heap.peek(), [heap, rev]); // eslint-disable-line

  const searchById = useCallback((id) => heap.heap.find(p => p.id.toLowerCase() === id.toLowerCase()) ?? null, [heap, rev]); // eslint-disable-line
  const searchByName = useCallback((name) => heap.heap.filter(p => p.name.toLowerCase().includes(name.toLowerCase())), [heap, rev]); // eslint-disable-line

  const getDiscounted = useCallback(() =>
    getAllSorted()
      .filter(p => p.discountEnabled)
      .map(p => {
        const days = MinHeap.daysRemaining(p.expiryDate);
        const cd = categoryDiscounts[p.category] || {};
        const catManual = cd.all;

        const pct = MinHeap.computeDiscount(days, p.category, p.manualDiscount, catManual);
        return { ...p, daysRemaining: days, discountPct: pct, discountedPrice: MinHeap.discountedPrice(p.price, pct) };
      })
      .filter(p => p.discountPct > 0),
    [heap, rev, categoryDiscounts]); // eslint-disable-line

  const getStats = useCallback(() => {
    const all = heap.getSorted();
    return {
      total: all.length,
      expired: heap.getExpired().length,
      critical: heap.getExpiringWithin(3).length,
      warning: heap.getExpiringWithin(30).filter(p => MinHeap.daysRemaining(p.expiryDate) > 3).length,
      discounted: all.filter(p => {
        const d = MinHeap.daysRemaining(p.expiryDate);
        const cd = categoryDiscounts[p.category] || {};
        const catManual = cd.all;
        return p.discountEnabled && MinHeap.computeDiscount(d, p.category, p.manualDiscount, catManual) > 0;
      }).length,
    };
  }, [heap, rev, categoryDiscounts]);

  return (
    <Ctx.Provider value={{ rev, loading, CATEGORIES, MinHeap, categoryDiscounts, updateCategoryDiscount, addProduct, removeProduct, updateProduct, removeExpired, getAllSorted, getExpiringIn, getExpired, getNextExpiring, searchById, searchByName, getDiscounted, getStats }}>
      {children}
    </Ctx.Provider>
  );
}

export const useProducts = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useProducts must be used inside <ProductProvider>');
  return ctx;
};
