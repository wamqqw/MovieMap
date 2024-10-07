<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'db_connect.php';

$user_id = $_GET['user_id'] ?? '';
$movie_id = $_GET['movie_id'] ?? '';

if (empty($user_id) || empty($movie_id)) {
    echo json_encode(['status' => 'error', 'message' => 'Missing user_id or movie_id']);
    exit;
}

$stmt = $conn->prepare("SELECT * FROM favorites WHERE user_id = ? AND movie_id = ?");
$stmt->bind_param("ii", $user_id, $movie_id);
$stmt->execute();
$result = $stmt->get_result();

$is_favorite = $result->num_rows > 0;

echo json_encode(['status' => 'success', 'is_favorite' => $is_favorite]);