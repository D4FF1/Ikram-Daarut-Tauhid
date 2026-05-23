<?php
header('Content-Type: application/json');
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

// GET - Fetch all events
if ($method === 'GET') {
    $sql = "SELECT id, judul, deskripsi, tanggal, waktu, lokasi, kategori, created_at, updated_at FROM events ORDER BY tanggal DESC";
    $result = $conn->query($sql);
    
    if ($result) {
        $events = [];
        while ($row = $result->fetch_assoc()) {
            $events[] = $row;
        }
        sendResponse(true, 'Events retrieved successfully', $events);
    } else {
        sendResponse(false, 'Error fetching events: ' . $conn->error);
    }
}

// POST - Create new event (Admin only)
else if ($method === 'POST') {
    // Check if user is admin
    if (!isAdmin()) {
        http_response_code(403);
        sendResponse(false, 'Unauthorized - Admin access required');
    }
    
    $judul = isset($_POST['judul']) ? validateInput($_POST['judul']) : '';
    $deskripsi = isset($_POST['deskripsi']) ? validateInput($_POST['deskripsi']) : '';
    $tanggal = isset($_POST['tanggal']) ? validateInput($_POST['tanggal']) : '';
    $waktu = isset($_POST['waktu']) ? validateInput($_POST['waktu']) : '';
    $lokasi = isset($_POST['lokasi']) ? validateInput($_POST['lokasi']) : '';
    $kategori = isset($_POST['kategori']) ? validateInput($_POST['kategori']) : '';
    
    // Validation
    if (empty($judul) || empty($tanggal) || empty($waktu)) {
        sendResponse(false, 'Judul, tanggal, dan waktu harus diisi');
    }
    
    // Insert event
    $stmt = $conn->prepare("INSERT INTO events (judul, deskripsi, tanggal, waktu, lokasi, kategori) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssss", $judul, $deskripsi, $tanggal, $waktu, $lokasi, $kategori);
    
    if ($stmt->execute()) {
        $event_id = $stmt->insert_id;
        sendResponse(true, 'Event created successfully', [
            'id' => $event_id,
            'judul' => $judul,
            'deskripsi' => $deskripsi,
            'tanggal' => $tanggal,
            'waktu' => $waktu,
            'lokasi' => $lokasi,
            'kategori' => $kategori
        ]);
    } else {
        sendResponse(false, 'Error creating event: ' . $stmt->error);
    }
    
    $stmt->close();
}

// PUT - Update event (Admin only)
else if ($method === 'PUT') {
    // Check if user is admin
    if (!isAdmin()) {
        http_response_code(403);
        sendResponse(false, 'Unauthorized - Admin access required');
    }
    
    // Parse PUT data
    parse_str(file_get_contents("php://input"), $_PUT);
    
    $id = isset($_PUT['id']) ? validateInput($_PUT['id']) : '';
    $judul = isset($_PUT['judul']) ? validateInput($_PUT['judul']) : '';
    $deskripsi = isset($_PUT['deskripsi']) ? validateInput($_PUT['deskripsi']) : '';
    $tanggal = isset($_PUT['tanggal']) ? validateInput($_PUT['tanggal']) : '';
    $waktu = isset($_PUT['waktu']) ? validateInput($_PUT['waktu']) : '';
    $lokasi = isset($_PUT['lokasi']) ? validateInput($_PUT['lokasi']) : '';
    $kategori = isset($_PUT['kategori']) ? validateInput($_PUT['kategori']) : '';
    
    // Validation
    if (empty($id) || empty($judul) || empty($tanggal) || empty($waktu)) {
        sendResponse(false, 'ID, judul, tanggal, dan waktu harus diisi');
    }
    
    // Update event
    $stmt = $conn->prepare("UPDATE events SET judul = ?, deskripsi = ?, tanggal = ?, waktu = ?, lokasi = ?, kategori = ? WHERE id = ?");
    $stmt->bind_param("ssssssi", $judul, $deskripsi, $tanggal, $waktu, $lokasi, $kategori, $id);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            sendResponse(true, 'Event updated successfully', [
                'id' => $id,
                'judul' => $judul,
                'deskripsi' => $deskripsi,
                'tanggal' => $tanggal,
                'waktu' => $waktu,
                'lokasi' => $lokasi,
                'kategori' => $kategori
            ]);
        } else {
            sendResponse(false, 'Event not found');
        }
    } else {
        sendResponse(false, 'Error updating event: ' . $stmt->error);
    }
    
    $stmt->close();
}

// DELETE - Delete event (Admin only)
else if ($method === 'DELETE') {
    // Check if user is admin
    if (!isAdmin()) {
        http_response_code(403);
        sendResponse(false, 'Unauthorized - Admin access required');
    }
    
    // Parse DELETE data
    parse_str(file_get_contents("php://input"), $_DELETE);
    
    $id = isset($_DELETE['id']) ? validateInput($_DELETE['id']) : '';
    
    // Validation
    if (empty($id)) {
        sendResponse(false, 'ID harus diisi');
    }
    
    // Delete event
    $stmt = $conn->prepare("DELETE FROM events WHERE id = ?");
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            sendResponse(true, 'Event deleted successfully');
        } else {
            sendResponse(false, 'Event not found');
        }
    } else {
        sendResponse(false, 'Error deleting event: ' . $stmt->error);
    }
    
    $stmt->close();
}

else {
    http_response_code(405);
    sendResponse(false, 'Method not allowed');
}

$conn->close();
?>
