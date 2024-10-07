<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Обработка предварительного запроса OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'db_connect.php';

// Включаем отображение всех ошибок
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Получаем данные из тела запроса
$input = file_get_contents("php://input");
$data = json_decode($input);

// Логируем полученные данные
error_log("Received data: " . print_r($input, true));
error_log("Decoded data: " . print_r($data, true));

if (!$data || !isset($data->user_id) || !isset($data->review_id) || !isset($data->movie_id)) {
    $missing = [];
    if (!isset($data->user_id)) $missing[] = 'user_id';
    if (!isset($data->review_id)) $missing[] = 'review_id';
    if (!isset($data->movie_id)) $missing[] = 'movie_id';
    echo json_encode([
        "status" => "error",
        "message" => "Не предоставлены все необходимые данные",
        "missing" => $missing
    ]);
    exit();
}
// Check items
$user_id = intval($data->user_id);
$review_id = intval($data->review_id);
$movie_id = intval($data->movie_id);

$conn->begin_transaction();

try {
    // Проверяем, принадлежит ли отзыв пользователю
    $stmt = $conn->prepare("SELECT id FROM reviews WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $review_id, $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception("У вас нет прав на удаление этого отзыва");
    }

    // Удаляем отзыв
    $stmt = $conn->prepare("DELETE FROM reviews WHERE id = ?");
    $stmt->bind_param("i", $review_id);
    $stmt->execute();

    // Обновляем среднюю оценку фильма
    $stmt = $conn->prepare("
        UPDATE movies m
        SET average_rating = (
            SELECT AVG(rating)
            FROM user_ratings
            WHERE movie_id = ?
        )
        WHERE m.id = ?
    ");
    $stmt->bind_param("ii", $movie_id, $movie_id);
    $stmt->execute();

    $conn->commit();
    echo json_encode(["status" => "success", "message" => "Отзыв успешно удален"]);
} catch (Exception $e) {
    $conn->rollback();
    error_log("Error in delete_review.php: " . $e->getMessage());
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
} finally {
    if (isset($stmt)) {
        $stmt->close();
    }
    $conn->close();
}
?>