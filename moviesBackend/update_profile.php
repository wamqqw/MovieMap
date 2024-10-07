<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include 'db_connect.php';

$user_id = isset($_POST['user_id']) ? $_POST['user_id'] : null;
$new_username = isset($_POST['new_username']) ? $_POST['new_username'] : null;

if (!$user_id || !$new_username) {
    echo json_encode(["status" => "error", "message" => "Не предоставлены все необходимые данные"]);
    exit();
}

$stmt = $conn->prepare("UPDATE users SET username = ? WHERE id = ?");
$stmt->bind_param("si", $new_username, $user_id);

if ($stmt->execute()) {
    if (isset($_FILES['profile_image']) && $_FILES['profile_image']['error'] == 0) {
        $allowed = ['jpg', 'jpeg', 'png', 'gif'];
        $filename = $_FILES['profile_image']['name'];
        $ext = pathinfo($filename, PATHINFO_EXTENSION);
        
        if (in_array($ext, $allowed)) {
            $new_filename = uniqid() . '.' . $ext;
            $upload_path = 'uploads/' . $new_filename;
            
            if (move_uploaded_file($_FILES['profile_image']['tmp_name'], $upload_path)) {
                $stmt = $conn->prepare("UPDATE users SET profile_image = ? WHERE id = ?");
                $stmt->bind_param("si", $upload_path, $user_id);
                $stmt->execute();
            } else {
                echo json_encode(["status" => "error", "message" => "Ошибка при загрузке изображения"]);
                exit();
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Недопустимый формат файла"]);
            exit();
        }
    }
    
    echo json_encode(["status" => "success", "message" => "Профиль успешно обновлен"]);
} else {
    echo json_encode(["status" => "error", "message" => "Ошибка при обновлении профиля: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>