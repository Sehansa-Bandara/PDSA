/**
 * BST.js — Binary Search Tree for product search
 * -----------------------------------------------
 * Each node holds one product and is ordered by a string key
 * (product ID or product name, lowercase).
 *
 * Operations:
 *   insert(product, key)         → O(log n) average, O(n) worst
 *   searchById(id)               → O(log n) average — exact match on ID key
 *   searchByName(query)          → O(n) in-order traversal + substring filter
 *
 * Why BST for search?
 *   - ID search benefits from O(log n) exact-match traversal.
 *   - Name search uses in-order traversal (alphabetical) so results
 *     are returned in a predictable sorted order.
 */

class BSTNode {
  constructor(product, key) {
    this.product = product; // the full product object
    this.key     = key;     // lowercase string used for comparisons
    this.left    = null;
    this.right   = null;
  }
}

export class BST {
  constructor() {
    this.root = null;
  }

  /* ── Insert ── */

  /**
   * Insert a product into the tree.
   * @param {object} product  - product object
   * @param {'id'|'name'} by  - which field to use as the BST key
   */
  insert(product, by = 'name') {
    const key  = String(by === 'id' ? product.id : product.name).toLowerCase();
    this.root  = this._insert(this.root, product, key);
  }

  _insert(node, product, key) {
    if (!node) return new BSTNode(product, key);
    if (key < node.key)      node.left  = this._insert(node.left,  product, key);
    else if (key > node.key) node.right = this._insert(node.right, product, key);
    else {
      // Duplicate key — store product anyway (same-name or same-ID products)
      node.right = this._insert(node.right, product, key);
    }
    return node;
  }

  /* ── Search by ID (exact match) — O(log n) average ── */

  /**
   * Find a single product by exact ID.
   * @param {string} id
   * @returns {object|null}
   */
  searchById(id) {
    return this._searchExact(this.root, id.toLowerCase());
  }

  _searchExact(node, key) {
    if (!node)           return null;
    if (key === node.key) return node.product;
    if (key < node.key)  return this._searchExact(node.left,  key);
    return                      this._searchExact(node.right, key);
  }

  /* ── Search by name (substring match) — O(n) in-order traversal ── */

  /**
   * Find all products whose name contains the query string.
   * In-order traversal keeps results alphabetically sorted.
   * @param {string} query
   * @returns {object[]}
   */
  searchByName(query) {
    const results = [];
    const q = query.toLowerCase();
    this._inOrder(this.root, q, results);
    return results;
  }

  _inOrder(node, query, results) {
    if (!node) return;
    this._inOrder(node.left, query, results);
    if (node.key.includes(query)) results.push(node.product);
    this._inOrder(node.right, query, results);
  }

  /* ── Build from array ── */

  /**
   * Convenience: build a fresh BST from an array of products.
   * @param {object[]} products
   * @param {'id'|'name'} by
   * @returns {BST}
   */
  static fromArray(products, by = 'name') {
    const tree = new BST();
    products.forEach(p => tree.insert(p, by));
    return tree;
  }
}
