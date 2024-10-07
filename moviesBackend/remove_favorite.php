<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Подключение к базе данных
$host = 'localhost';
$db   = 'your_database_name';
$user = 'your_username';
$pass = 'your_password';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);

    // Получаем данные из POST-запроса
    $data = json_decode(file_get_contents("php://input"), true);
    $movieId = isset($data['movieId']) ? intval($data['movieId']) : 0;
    $userId = isset($data['userId']) ? intval($data['userId']) : 0;

    if ($movieId === 0 || $userId === 0) {
        throw new Exception('Movie ID and User ID are required');
    }

    // Удаляем фильм из избранного
    $stmt = $pdo->prepare("DELETE FROM favorites WHERE movie_id = :movieId AND user_id = :userId");
    $result = $stmt->execute(['movieId' => $movieId, 'userId' => $userId]);

    if ($result) {
        echo json_encode(['status' => 'success', 'message' => 'Movie removed from favorites']);
    } else {
        throw new Exception('Failed to remove movie from favorites');
    }
} catch (\PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
} catch (\Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}