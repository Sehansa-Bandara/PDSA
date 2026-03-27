<?php
require_once 'product_controller.php';
require_once 'discount_controller.php';

class ProductRouter {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function run() {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $parts = explode('/', trim($path, '/'));

        // Handle /api/products
        if (count($parts) >= 2 && $parts[0] === 'api' && $parts[1] === 'products') {
            $id = isset($parts[2]) ? $parts[2] : null;
            $controller = new ProductController($this->pdo);
            $controller->handleRequest($method, $id);
        } 
        // Handle /api/discounts
        else if (count($parts) >= 2 && $parts[0] === 'api' && $parts[1] === 'discounts') {
            $category = isset($parts[2]) ? $parts[2] : null;
            $controller = new DiscountController($this->pdo);
            $controller->handleRequest($method, $category);
        }
        else {
            http_response_code(404);
            header("Content-Type: application/json");
            echo json_encode(["message" => "Endpoint not found"]);
        }
    }
}
?>
