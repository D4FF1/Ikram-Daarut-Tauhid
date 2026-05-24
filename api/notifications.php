<?php
header('Content-Type: application/json');
require_once 'config.php';

// User must be authenticated
if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
    sendResponse(false, 'Not authenticated');
}

$user_id = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Get notifications for user
    $stmt = $conn->prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $items = [];
    $unread = 0;
    
    while ($row = $result->fetch_assoc()) {
        $items[] = $row;
        if ($row['is_read'] == 0) {
            $unread++;
        }
    }
    
    sendResponse(true, 'Success', [
        'items' => $items,
        'unread' => $unread
    ]);
    $stmt->close();
}

else if ($method === 'POST') {
    $action = isset($_POST['action']) ? validateInput($_POST['action']) : '';
    
    if ($action === 'mark_read') {
        $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
        
        if ($id <= 0) {
            sendResponse(false, 'Invalid notification ID');
        }
        
        $stmt = $conn->prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?");
        $stmt->bind_param("ii", $id, $user_id);
        
        if ($stmt->execute()) {
            sendResponse(true, 'Marked as read');
        } else {
            sendResponse(false, 'Failed to mark as read');
        }
        $stmt->close();
    }
    
    else if ($action === 'mark_all_read') {
        $stmt = $conn->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?");
        $stmt->bind_param("i", $user_id);
        
        if ($stmt->execute()) {
            sendResponse(true, 'All marked as read');
        } else {
            sendResponse(false, 'Failed to mark all as read');
        }
        $stmt->close();
    }
    
    else {
        sendResponse(false, 'Invalid action');
    }
}

else {
    sendResponse(false, 'Method not allowed');
}

$conn->close();
?>
