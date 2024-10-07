<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['user_id'])) {
        $user_id = intval($_GET['user_id']);

        $query = "SELECT m.id, m.title, m.poster_path, ur.rating as user_rating, r.review_text
                  FROM movies m
                  JOIN user_ratings ur ON m.id = ur.movie_id
                  LEFT JOIN reviews r ON m.id = r.movie_id AND r.user_id = ur.user_id
                  WHERE ur.user_id = ?
                  ORDER BY ur.rating DESC";

        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $movies = [];
        while ($row = $result->fetch_assoc()) {
            $movies[] = $row;
        }

        echo json_encode(["status" => "success", "movies" => $movies]);
    } else {
        echo json_encode(["status" => "error", "message" => "User ID is required"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
}

$conn->close();