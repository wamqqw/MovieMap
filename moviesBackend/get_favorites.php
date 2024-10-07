<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
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

    // Получаем ID пользователя из GET-параметра
    $userId = isset($_GET['userId']) ? intval($_GET['userId']) : 0;

    if ($userId === 0) {
        throw new Exception('User ID is required');
    }

    // Запрос для получения избранных фильмов пользователя
    $stmt = $pdo->prepare("SELECT f.id, f.movie_id, m.title, m.poster_path, m.release_date 
                           FROM favorites f
                           JOIN movies m ON f.movie_id = m.id
                           WHERE f.user_id = :userId");
    $stmt->execute(['userId' => $userId]);
    $favorites = $stmt->fetchAll();

    echo json_encode(['status' => 'success', 'data' => $favorites]);
} catch (\PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
} catch (\Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}