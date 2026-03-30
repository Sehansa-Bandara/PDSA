

class BSTNode {  // represent a node in the binary search tree
  constructor(product, key) {
    this.product = product; 
   this.key = key;    
    this.left = null;
    this.right = null;
  }
}

export class BST {
  constructor() {
    this.root = null;
  }



  /**
  
   @param {object} product  
    @param {'id'|'name'} by  
   */
  insert(product, by = 'name') { // Insert a product into the BST, keyed by either ID or name
    const key = String(by === 'id' ? product.id : product.name).toLowerCase();
    this.root = this._insert(this.root, product, key);
  }

  _insert(node, product, key) { // Standard BST insert based on the key
    if (!node) return new BSTNode(product, key);
    if (key < node.key) node.left = this._insert(node.left, product, key);
    else if (key > node.key) node.right = this._insert(node.right, product, key);
    else {
      //  store product anyway (same-name or same-ID products)
      node.right = this._insert(node.right, product, key);
    }
    return node;
  }



  /**
   * Find a single product by exact ID.
   * @param {string} id
   * @returns {object|null}
   */
  searchById(id) {
    return this._searchExact(this.root, id.toLowerCase());
  }

  _searchExact(node, key) { //search start at the root
    if (!node) return null;
    if (key === node.key) return node.product;
    if (key < node.key) return this._searchExact(node.left, key);
    return this._searchExact(node.right, key);
  }


  /**
   
   * @param {string} query
   * @returns {object[]}
   */
  searchByName(query) {
    const results = []; // store matching products
    const q = query.toLowerCase();
    this._inOrder(this.root, q, results);
    return results;
  }

  _inOrder(node, query, results) { //in-order traversal to find all products whose name includes the query substrin
    if (!node) return;
    this._inOrder(node.left, query, results);
    if (node.key.includes(query)) results.push(node.product);
    this._inOrder(node.right, query, results);
  }



  /** 
   
   * @param {object[]} products
   * @param {'id'|'name'} by
   * @returns {BST}
   */
  static fromArray(products, by = 'name') { // auto-build a BST from an array of products, keyed by either ID or name
    const tree = new BST();
    products.forEach(p => tree.insert(p, by));
    return tree;
  }
}
