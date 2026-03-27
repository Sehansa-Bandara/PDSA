<?php
$host = 'localhost';
$user = 'root';
$pass = ''; // Default XAMPP password is empty
$db = 'smartdiss';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    http_response_code(500);
    header("Content-Type: application/json");
    echo json_encode(["error" => "Database connection failed: " . $e->getMessage()]);
    exit;
}
?>
