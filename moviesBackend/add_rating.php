<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'db_connect.php';

// Включаем отображение всех ошибок
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Логируем входящие данные
$input = file_get_contents("php://input");
error_log("Received data: " . $input);

$data = json_decode($input);

if (!isset($data->user_id) || !isset($data->movie_id) || !isset($data->rating)) {
    echo json_encode(["status" => "error", "message" => "Недостаточно данных"]);
    exit();
}

$user_id = $data->user_id;
$movie_id = $data->movie_id;
$rating = $data->rating;

// Проверяем валидность рейтинга
if (!is_numeric($rating) || $rating < 1 || $rating > 10) {
    echo json_encode(["status" => "error", "message" => "Недопустимое значение рейтинга"]);
    exit();
}

// Начинаем транзакцию
$conn->begin_transaction();

try {
    // Проверяем, существует ли фильм
    $stmt = $conn->prepare("SELECT id FROM movies WHERE id = ?");
    $stmt->bind_param("i", $movie_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception("Фильм не найден в базе данных");
    }

    // Проверяем, существует ли уже оценка
    $stmt = $conn->prepare("SELECT id FROM user_ratings WHERE user_id = ? AND movie_id = ?");
    $stmt->bind_param("ii", $user_id, $movie_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // Обновляем существующую оценку
        $stmt = $conn->prepare("UPDATE user_ratings SET rating = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND movie_id = ?");
        $stmt->bind_param("iii", $rating, $user_id, $movie_id);
    } else {
        // Добавляем новую оценку
        $stmt = $conn->prepare("INSERT INTO user_ratings (user_id, movie_id, rating) VALUES (?, ?, ?)");
        $stmt->bind_param("iii", $user_id, $movie_id, $rating);
    }

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

    // Если всё прошло успешно, фиксируем транзакцию
    $conn->commit();

    echo json_encode(["status" => "success", "message" => "Оценка успешно сохранена"]);
} catch (Exception $e) {
    // В случае ошибки откатываем транзакцию
    $conn->rollback();
    error_log("Database error: " . $e->getMessage());
    echo json_encode(["status" => "error", "message" => "Ошибка при сохранении оценки: " . $e->getMessage()]);
} finally {
    if (isset($stmt)) {
        $stmt->close();
    }
    $conn->close();
}
?>