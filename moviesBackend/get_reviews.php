<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: GET, POST, OPTIONS"); 
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include 'db_connect.php';

$movie_id = $_GET['movie_id'];

$stmt = $conn->prepare("SELECT users.username, reviews.review_text FROM reviews JOIN users ON reviews.user_id = users.id WHERE reviews.movie_id = ?");
$stmt->bind_param("i", $movie_id);
$stmt->execute();
$result = $stmt->get_result();

$reviews = [];

while($row = $result->fetch_assoc()){
    $reviews[] = $row;
}

echo json_encode(['reviews' => $reviews]);

$stmt->close();
$conn->close();
?>
