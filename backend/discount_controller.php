<?php
require_once 'discount_model.php';

class DiscountController {
    private $model;

    public function __construct($pdo) {
        $this->model = new DiscountModel($pdo);
    }

    public function handleRequest($method, $category = null) {
        // Headers are now handled in index.php
        header("Content-Type: application/json");

        switch ($method) {
            case 'GET':
                echo json_encode($this->model->getAll());
                break;

            case 'POST':
            case 'PUT':
                $data = json_decode(file_get_contents("php://input"), true);
                if (isset($data['category']) && isset($data['discount_percentage'])) {
                    if ($this->model->update($data['category'], $data['discount_percentage'])) {
                        echo json_encode(["message" => "Discount saved successfully"]);
                    } else {
                        http_response_code(500);
                        echo json_encode(["error" => "Could not save discount"]);
                    }
                } else {
                    http_response_code(400);
                    echo json_encode(["error" => "Missing data"]);
                }
                break;

            case 'DELETE':
                if ($category) {
                    if ($this->model->delete(urldecode($category))) {
                        echo json_encode(["message" => "Discount deleted successfully"]);
                    } else {
                        http_response_code(500);
                        echo json_encode(["error" => "Could not delete discount"]);
                    }
                }
                break;

            default:
                http_response_code(405);
                echo json_encode(["message" => "Method not allowed"]);
                break;
        }
    }
}
?>
