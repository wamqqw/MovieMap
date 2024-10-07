<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include 'db_connect.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->id) || !isset($data->title) || !isset($data->overview) || !isset($data->release_date) || !isset($data->poster_path) || !isset($data->vote_average)) {
    echo json_encode(["status" => "error", "message" => "Недостаточно данных"]);
    exit();
}

$id = $data->id;
$title = $data->title;
$overview = $data->overview;
$release_date = $data->release_date;
$poster_path = $data->poster_path;
$vote_average = $data->vote_average;

try {
    $stmt = $conn->prepare("INSERT INTO movies (id, title, overview, release_date, poster_path, vote_average) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE title = VALUES(title), overview = VALUES(overview), release_date = VALUES(release_date), poster_path = VALUES(poster_path), vote_average = VALUES(vote_average)");
    $stmt->bind_param("issssd", $id, $title, $overview, $release_date, $poster_path, $vote_average);
    $stmt->execute();

    echo json_encode(["status" => "success", "message" => "Фильм успешно сохранен"]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Ошибка при сохранении фильма: " . $e->getMessage()]);
} finally {
    $stmt->close();
    $conn->close();
}
?>