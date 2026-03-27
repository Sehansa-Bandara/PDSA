<?php
class DiscountModel {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getAll() {
        $stmt = $this->pdo->query("SELECT * FROM discount");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function update($category, $percentage) {
        // Use UPSERT (INSERT ... ON DUPLICATE KEY UPDATE)
        $sql = "INSERT INTO discount (category, discount_percentage) VALUES (?, ?) 
                ON DUPLICATE KEY UPDATE discount_percentage = VALUES(discount_percentage)";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([$category, $percentage]);
    }

    public function delete($category) {
        $stmt = $this->pdo->prepare("DELETE FROM discount WHERE category = ?");
        return $stmt->execute([$category]);
    }
}
?>
