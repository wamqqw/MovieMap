<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: GET, POST, OPTIONS"); 
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include 'db_connect.php';

$data = json_decode(file_get_contents('php://input'), true);

$email = $data['email'];
$password = $data['password'];

$stmt = $conn->prepare("SELECT id, password FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();

if($stmt->num_rows == 1){
    $stmt->bind_result($id, $hashed_password);
    $stmt->fetch();

    if(password_verify($password, $hashed_password)){
        echo json_encode(['status' => 'success', 'user_id' => $id]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Неверный пароль']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Email не найден']);
}

$stmt->close();
$conn->close();
?>
