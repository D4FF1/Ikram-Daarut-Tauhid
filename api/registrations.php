<?php
header('Content-Type: application/json');
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? validateInput($_GET['action']) : (isset($_POST['action']) ? validateInput($_POST['action']) : '');

// GET - Fetch registrations
if ($method === 'GET') {
    if ($action === 'all') {
        // Get all registrations (Admin only)
        if (!isAdmin()) {
            http_response_code(403);
            sendResponse(false, 'Unauthorized - Admin access required');
        }
        
        $sql = "SELECT r.*, e.judul as event_judul FROM registrations r 
                LEFT JOIN events e ON r.event_id = e.id 
                ORDER BY r.created_at DESC";
        $result = $conn->query($sql);
        
        if ($result) {
            $registrations = [];
            while ($row = $result->fetch_assoc()) {
                $registrations[] = $row;
            }
            sendResponse(true, 'Registrations retrieved successfully', $registrations);
        } else {
            sendResponse(false, 'Error fetching registrations: ' . $conn->error);
        }
    }
    else if ($action === 'event') {
        // Get registrations for a specific event
        $event_id = isset($_GET['event_id']) ? (int)$_GET['event_id'] : 0;
        
        if (empty($event_id)) {
            sendResponse(false, 'Event ID harus diisi');
        }
        
        $sql = "SELECT id, nama, email, no_hp, asal_institusi, alasan_mendaftar, status, created_at 
                FROM registrations 
                WHERE event_id = ? 
                ORDER BY created_at DESC";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $event_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $registrations = [];
        while ($row = $result->fetch_assoc()) {
            $registrations[] = $row;
        }
        
        sendResponse(true, 'Registrations retrieved successfully', $registrations);
        $stmt->close();
    }
    else if ($action === 'user') {
        // Get user's registrations (by email)
        $email = isset($_GET['email']) ? validateInput($_GET['email']) : '';
        
        if (empty($email)) {
            sendResponse(false, 'Email harus diisi');
        }
        
        $sql = "SELECT r.*, e.judul as event_judul, e.tanggal, e.waktu, e.lokasi, e.kategori, e.poster
                FROM registrations r 
                LEFT JOIN events e ON r.event_id = e.id 
                WHERE r.email = ? 
                ORDER BY r.created_at DESC";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $registrations = [];
        while ($row = $result->fetch_assoc()) {
            $registrations[] = $row;
        }
        
        sendResponse(true, 'User registrations retrieved successfully', $registrations);
        $stmt->close();
    }
    else if ($action === 'mine') {
        // Get current logged-in user's registrations
        if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
            sendResponse(false, 'Not authenticated');
        }
        
        $user_id = $_SESSION['user_id'];
        
        $sql = "SELECT r.*, e.judul as event_judul, e.tanggal, e.waktu, e.lokasi, e.kategori, e.poster
                FROM registrations r 
                LEFT JOIN events e ON r.event_id = e.id 
                WHERE r.user_id = ? 
                ORDER BY r.created_at DESC";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $registrations = [];
        while ($row = $result->fetch_assoc()) {
            $registrations[] = $row;
        }
        
        sendResponse(true, 'User registrations retrieved successfully', $registrations);
        $stmt->close();
    }
    else {
        sendResponse(false, 'Invalid action');
    }
}

// POST - Create new registration or approve/reject
else if ($method === 'POST') {
    if ($action === 'register') {
        // User registering for an event
        $event_id = isset($_POST['event_id']) ? (int)$_POST['event_id'] : 0;
        $alasan_mendaftar = isset($_POST['alasan_mendaftar']) ? validateInput($_POST['alasan_mendaftar']) : '';
        
        // Check if user is logged in
        if (isset($_SESSION['user_id']) && !empty($_SESSION['user_id'])) {
            // Logged-in user - use their info
            $user_id = $_SESSION['user_id'];
            $nama = $_SESSION['user_nama'];
            $email = $_SESSION['user_email'];
            
            // Get user's phone number from database
            $userStmt = $conn->prepare("SELECT no_hp, asal_institusi FROM users WHERE id = ?");
            $userStmt->bind_param("i", $user_id);
            $userStmt->execute();
            $userResult = $userStmt->get_result();
            $userData = $userResult->fetch_assoc();
            $userStmt->close();
            
            $no_hp = $userData['no_hp'];
            $asal_institusi = $userData['asal_institusi'];
        } else {
            // Guest user - get from POST
            $nama = isset($_POST['nama']) ? validateInput($_POST['nama']) : '';
            $email = isset($_POST['email']) ? validateInput($_POST['email']) : '';
            $no_hp = isset($_POST['no_hp']) ? validateInput($_POST['no_hp']) : '';
            $asal_institusi = isset($_POST['asal_institusi']) ? validateInput($_POST['asal_institusi']) : '';
            $user_id = null;
            
            // Validation
            if (empty($event_id) || empty($nama) || empty($email) || empty($no_hp)) {
                sendResponse(false, 'Event ID, nama, email, dan no HP harus diisi');
            }
        }
        
        if (empty($event_id)) {
            sendResponse(false, 'Event ID harus diisi');
        }
        
        // Check if user already registered for this event
        $checkSQL = "SELECT id FROM registrations WHERE event_id = ? AND email = ?";
        $checkStmt = $conn->prepare($checkSQL);
        $checkStmt->bind_param("is", $event_id, $email);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows > 0) {
            sendResponse(false, 'Anda sudah mendaftar untuk event ini');
            $checkStmt->close();
        } else {
            $checkStmt->close();
            
            // Insert registration
            if ($user_id !== null) {
                $stmt = $conn->prepare("INSERT INTO registrations (event_id, user_id, nama, email, no_hp, asal_institusi, alasan_mendaftar) 
                                        VALUES (?, ?, ?, ?, ?, ?, ?)");
                $stmt->bind_param("iisssss", $event_id, $user_id, $nama, $email, $no_hp, $asal_institusi, $alasan_mendaftar);
            } else {
                $stmt = $conn->prepare("INSERT INTO registrations (event_id, nama, email, no_hp, asal_institusi, alasan_mendaftar) 
                                        VALUES (?, ?, ?, ?, ?, ?)");
                $stmt->bind_param("isssss", $event_id, $nama, $email, $no_hp, $asal_institusi, $alasan_mendaftar);
            }
            
            if ($stmt->execute()) {
                $registration_id = $stmt->insert_id;
                sendResponse(true, 'Pendaftaran berhasil! Admin akan meninjau permintaan Anda', [
                    'id' => $registration_id,
                    'status' => 'pending'
                ]);
            } else {
                sendResponse(false, 'Error registering: ' . $stmt->error);
            }
            
            $stmt->close();
        }
    }
    else if ($action === 'approve' || $action === 'reject') {
        // Admin approving or rejecting registration
        if (!isAdmin()) {
            http_response_code(403);
            sendResponse(false, 'Unauthorized - Admin access required');
        }
        
        $registration_id = isset($_POST['registration_id']) ? (int)$_POST['registration_id'] : 0;
        $status = $action === 'approve' ? 'approved' : 'rejected';
        
        if (empty($registration_id)) {
            sendResponse(false, 'Registration ID harus diisi');
        }
        
        $stmt = $conn->prepare("UPDATE registrations SET status = ? WHERE id = ?");
        $stmt->bind_param("si", $status, $registration_id);
        
        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                sendResponse(true, 'Registration ' . $status . ' successfully', ['status' => $status]);
            } else {
                sendResponse(false, 'Registration not found');
            }
        } else {
            sendResponse(false, 'Error updating registration: ' . $stmt->error);
        }
        
        $stmt->close();
    }
    else {
        sendResponse(false, 'Invalid action');
    }
}

else {
    http_response_code(405);
    sendResponse(false, 'Method not allowed');
}

$conn->close();
?>
