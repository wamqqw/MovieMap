<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: GET, POST, OPTIONS"); 
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include 'db_connect.php';

$data = json_decode(file_get_contents('php://input'), true);

$username = $data['username'];
$email = $data['email'];
$password = password_hash($data['password'], PASSWORD_DEFAULT);

// Проверка, существует ли email
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();

if($stmt->num_rows > 0){
    echo json_encode(['status' => 'error', 'message' => 'Email уже зарегистрирован']);
    exit();
}

$stmt = $conn->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $username, $email, $password);

if ($stmt->execute()) {
    echo json_encode(['status' => 'success', 'user_id' => $stmt->insert_id]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Не удалось зарегистрироваться']);
}

$stmt->close();
$conn->close();
?>
