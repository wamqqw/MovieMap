<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (isset($data['user_id']) && isset($data['movie_id'])) {
        $user_id = filter_var($data['user_id'], FILTER_SANITIZE_NUMBER_INT);
        $movie_id = filter_var($data['movie_id'], FILTER_SANITIZE_NUMBER_INT);
        
        $stmt = $pdo->prepare("INSERT INTO favorites (user_id, movie_id) VALUES (:user_id, :movie_id)");
        $result = $stmt->execute(['user_id' => $user_id, 'movie_id' => $movie_id]);
        
        if ($result) {
            echo json_encode(['status' => 'success', 'message' => 'Movie added to favorites']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to add movie to favorites']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'User ID and Movie ID are required']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
}