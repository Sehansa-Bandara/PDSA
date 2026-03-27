<?php
class ProductModel {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getAll() {
        $stmt = $this->pdo->query("SELECT * FROM products ORDER BY expiry_date ASC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id) {
        $stmt = $this->pdo->prepare("SELECT * FROM products WHERE product_id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($data) {
        $stmt = $this->pdo->prepare("INSERT INTO products (product_id, name, category, price, quantity, expiry_date) VALUES (?, ?, ?, ?, ?, ?)");
        return $stmt->execute([
            $data['product_id'],
            $data['name'],
            $data['category'],
            $data['price'],
            $data['quantity'],
            $data['expiry_date']
        ]);
    }

    public function update($id, $data) {
        $stmt = $this->pdo->prepare("UPDATE products SET name=?, category=?, price=?, quantity=?, expiry_date=? WHERE product_id=?");
        return $stmt->execute([
            $data['name'],
            $data['category'],
            $data['price'],
            $data['quantity'],
            $data['expiry_date'],
            $id
        ]);
    }

    public function delete($id) {
        $stmt = $this->pdo->prepare("DELETE FROM products WHERE product_id = ?");
        return $stmt->execute([$id]);
    }
}
?>
