<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Подключение к базе данных
include 'db_connect.php';

// Получаем параметры из GET-запроса
$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;
$movie_id = isset($_GET['movie_id']) ? $_GET['movie_id'] : null;

// Проверяем, что все необходимые данные предоставлены
if (!$user_id || !$movie_id) {
    echo json_encode(["status" => "error", "message" => "Не предоставлены все необходимые данные"]);
    exit();
}

// Подготавливаем и выполняем запрос
$stmt = $conn->prepare("SELECT rating FROM user_ratings WHERE user_id = ? AND movie_id = ?");
$stmt->bind_param("ii", $user_id, $movie_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    echo json_encode(["status" => "success", "rating" => $row['rating']]);
} else {
    echo json_encode(["status" => "success", "rating" => 0]);
}

$stmt->close();
$conn->close();
?>