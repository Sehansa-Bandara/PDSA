/**
 * MinHeap — ordered by product expiry date (earliest = root)
 *
 * Complexity:
 *   insert      → O(log n)
 *   extractMin  → O(log n)
 *   peek        → O(1)
 *   removeById  → O(n) scan + O(log n) reheap
 */
export class MinHeap {
  constructor() {
    this.heap = [];   // internal array backing
  }

  /* ── Static helpers ── */

  /** Days remaining from today (negative = already expired) */
  static daysRemaining(expiryDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expiryDate);
    exp.setHours(0, 0, 0, 0);
    return Math.ceil((exp - today) / 86_400_000);
  }

  /**
   * Discount policy:
   * 0. Expired items (days < 0) — NO discount, return 0.
   * 1. If productManualDiscount is set (manualDiscount on product), use it.
   * 2. If categoryManualDiscount is set (via category discount tool), use it
   *    (applies only to items within 30 days of expiry, NOT expired).
   * 3. If expiring within 30 days (auto-tiered):
   *    - Dairy:  60%
   *    - Meat:   50%
   *    - 1–7 days:  40%
   *    - 8–14 days: 30%
   *    - 15–21 days: 20%
   *    - 22–30 days: 10%
   */
  static computeDiscount(days, category = 'Other', productManual = null, categoryManual = null) {
    // 0. Expired items never get a discount
    if (days < 0) return 0;

    // 1. Product Manual override — highest priority
    if (productManual !== null && productManual !== undefined && productManual !== '') {
      return Number(productManual);
    }

    // 2. Category Manual override — applies only within 30 days (not expired)
    if (categoryManual !== null && categoryManual !== undefined && categoryManual !== '' && days <= 30) {
      return Number(categoryManual);
    }

    // 3. Auto-tiered for items expiring within 30 days
    if (days <= 30) {
      if (category === 'Dairy') return 60;
      if (category === 'Meat') return 50;
      if (days <= 7) return 40;
      if (days <= 14) return 30;
      if (days <= 21) return 20;
      return 10; // 22–30 days
    }

    return 0;
  }

  static discountedPrice(price, pct) {
    return +(price - (price * pct) / 100).toFixed(2);
  }

  /* ── Index helpers ── */
  _parent(i) { return Math.floor((i - 1) / 2); }
  _left(i) { return 2 * i + 1; }
  _right(i) { return 2 * i + 2; }
  _cmp(a, b) { return new Date(a.expiryDate) - new Date(b.expiryDate); }
  _swap(i, j) { [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]]; }

  /* ── Reheap ── */
  _siftUp(i) {
    while (i > 0) {
      const p = this._parent(i);
      if (this._cmp(this.heap[i], this.heap[p]) < 0) {
        this._swap(i, p);
        i = p;
      } else break;
    }
  }

  _siftDown(i) {
    const n = this.heap.length;
    while (true) {
      let min = i;
      const l = this._left(i), r = this._right(i);
      if (l < n && this._cmp(this.heap[l], this.heap[min]) < 0) min = l;
      if (r < n && this._cmp(this.heap[r], this.heap[min]) < 0) min = r;
      if (min !== i) { this._swap(i, min); i = min; }
      else break;
    }
  }

  /* ── Public API ── */

  /** Insert one product — O(log n) */
  insert(product) {
    this.heap.push({ ...product });
    this._siftUp(this.heap.length - 1);
  }

  /** Earliest-expiry product without removal — O(1) */
  peek() {
    return this.heap[0] ?? null;
  }

  /** Remove & return earliest-expiry product — O(log n) */
  extractMin() {
    if (!this.heap.length) return null;
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length) { this.heap[0] = last; this._siftDown(0); }
    return top;
  }

  /** Remove product by id — O(n + log n) */
  removeById(id) {
    const idx = this.heap.findIndex(p => p.id === id);
    if (idx === -1) return false;
    const last = this.heap.pop();
    if (idx < this.heap.length) {
      this.heap[idx] = last;
      this._siftUp(idx);
      this._siftDown(idx);
    }
    return true;
  }

  /** Update product fields and re-heapify — O(n + log n) */
  updateById(id, updates) {
    const idx = this.heap.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.heap[idx] = { ...this.heap[idx], ...updates };
    this._siftUp(idx);
    this._siftDown(idx);
    return true;
  }

  /** All products sorted by expiry date (asc) */
  getSorted() {
    return [...this.heap].sort(this._cmp);
  }

  /** Products expiring within N days (≥ 0 days remaining) */
  getExpiringWithin(days) {
    return this.getSorted().filter(p => {
      const d = MinHeap.daysRemaining(p.expiryDate);
      return d >= 0 && d <= days;
    });
  }

  /** Products already expired */
  getExpired() {
    return this.getSorted().filter(p => MinHeap.daysRemaining(p.expiryDate) < 0);
  }

  get size() { return this.heap.length; }
  isEmpty() { return this.heap.length === 0; }
}

export default MinHeap;
