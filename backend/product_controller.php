<?php
require_once 'product_model.php';

class ProductController {
    private $model;

    public function __construct($pdo) {
        $this->model = new ProductModel($pdo);
    }

    public function handleRequest($method, $id = null) {
        // Headers are now handled in index.php
        header("Content-Type: application/json");

        switch ($method) {
            case 'GET':
                if ($id) {
                    $product = $this->model->getById($id);
                    if ($product) echo json_encode($product);
                    else { http_response_code(404); echo json_encode(["message" => "Product not found"]); }
                } else {
                    echo json_encode($this->model->getAll());
                }
                break;

            case 'POST':
                $data = json_decode(file_get_contents("php://input"), true);
                if ($this->model->create($data)) {
                    http_response_code(201);
                    echo json_encode(["message" => "Product saved successfully", "id" => $data['product_id']]);
                } else {
                    http_response_code(500);
                    echo json_encode(["error" => "Could not save product"]);
                }
                break;

            case 'PUT':
                if ($id) {
                    $data = json_decode(file_get_contents("php://input"), true);
                    if ($this->model->update($id, $data)) {
                        echo json_encode(["message" => "Product updated successfully"]);
                    } else {
                        http_response_code(500);
                        echo json_encode(["error" => "Could not update product"]);
                    }
                }
                break;

            case 'DELETE':
                if ($id) {
                    if ($this->model->delete($id)) {
                        echo json_encode(["message" => "Product deleted successfully"]);
                    } else {
                        http_response_code(500);
                        echo json_encode(["error" => "Could not delete product"]);
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
