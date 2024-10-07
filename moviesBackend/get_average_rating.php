<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'db_connect.php';

if (!isset($_GET['movie_id'])) {
    echo json_encode(["status" => "error", "message" => "Не указан ID фильма"]);
    exit();
}

$movie_id = $_GET['movie_id'];

try {
    $stmt = $conn->prepare("SELECT average_rating FROM movies WHERE id = ?");
    $stmt->bind_param("i", $movie_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $average_rating = $row['average_rating'] !== null ? floatval($row['average_rating']) : 0;
        echo json_encode(["status" => "success", "average_rating" => $average_rating]);
    } else {
        echo json_encode(["status" => "error", "message" => "Фильм не найден"]);
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Ошибка при получении средней оценки: " . $e->getMessage()]);
} finally {
    $stmt->close();
    $conn->close();
}
?>