<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include 'db_connect.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->user_id) || !isset($data->movie_id) || !isset($data->rating)) {
    echo json_encode(["status" => "error", "message" => "Недостаточно данных"]);
    exit();
}

$user_id = $data->user_id;
$movie_id = $data->movie_id;
$rating = $data->rating;

// Проверяем, существует ли уже оценка
$stmt = $conn->prepare("SELECT id FROM user_ratings WHERE user_id = ? AND movie_id = ?");
$stmt->bind_param("ii", $user_id, $movie_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    // Обновляем существующую оценку
    $stmt = $conn->prepare("UPDATE user_ratings SET rating = ? WHERE user_id = ? AND movie_id = ?");
    $stmt->bind_param("iii", $rating, $user_id, $movie_id);
} else {
    // Добавляем новую оценку
    $stmt = $conn->prepare("INSERT INTO user_ratings (user_id, movie_id, rating) VALUES (?, ?, ?)");
    $stmt->bind_param("iii", $user_id, $movie_id, $rating);
}

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Оценка успешно сохранена"]);
} else {
    echo json_encode(["status" => "error", "message" => "Ошибка при сохранении оценки: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>