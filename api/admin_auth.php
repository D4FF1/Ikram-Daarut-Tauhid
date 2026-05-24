<?php
header('Content-Type: application/json');
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_POST['action']) ? $_POST['action'] : (isset($_GET['action']) ? $_GET['action'] : '');

// Helper: send error
function err($msg, $code = 200) {
    http_response_code($code);
    sendResponse(false, $msg);
}

// POST: login/logout
if ($method === 'POST') {
    if ($action === 'login') {
        $email = isset($_POST['email']) ? validateInput($_POST['email']) : '';
        $password = isset($_POST['password']) ? $_POST['password'] : '';

        if (empty($email) || empty($password)) {
            sendResponse(false, 'Email dan password harus diisi');
        }

        $stmt = $conn->prepare('SELECT id, nama, email, no_hp, asal_institusi, password, role FROM users WHERE email = ? AND role = ? LIMIT 1');
        $role = 'admin';
        $stmt->bind_param('ss', $email, $role);
        $stmt->execute();
        $res = $stmt->get_result();
        $user = $res ? $res->fetch_assoc() : null;
        $stmt->close();

        if (!$user) {
            sendResponse(false, 'Email admin tidak ditemukan');
        }

        if (!password_verify($password, $user['password'])) {
            sendResponse(false, 'Password salah');
        }

        $_SESSION['admin_id'] = $user['id'];
        $_SESSION['admin_email'] = $user['email'];
        $_SESSION['admin_nama'] = $user['nama'];

        sendResponse(true, 'Admin login berhasil', [
            'id' => $user['id'],
            'nama' => $user['nama'],
            'email' => $user['email'],
            'no_hp' => $user['no_hp']
        ]);
    }

    else if ($action === 'logout') {
        session_destroy();
        sendResponse(true, 'Admin logout berhasil');
    }

    else {
        sendResponse(false, 'Invalid action');
    }
}

// GET: check auth status
else if ($method === 'GET') {
    if ($action === 'me') {
        if (!isset($_SESSION['admin_id']) || empty($_SESSION['admin_id'])) {
            sendResponse(false, 'Not authenticated as admin');
        }

        $admin_id = $_SESSION['admin_id'];
        $stmt = $conn->prepare('SELECT id, nama, email, no_hp, asal_institusi, role FROM users WHERE id = ? AND role = ? LIMIT 1');
        $role = 'admin';
        $stmt->bind_param('is', $admin_id, $role);
        $stmt->execute();
        $res = $stmt->get_result();
        $admin = $res ? $res->fetch_assoc() : null;
        $stmt->close();

        if (!$admin) {
            sendResponse(false, 'Admin not found');
        }

        sendResponse(true, 'Admin authenticated', $admin);
    } else {
        sendResponse(false, 'Invalid action');
    }
}

sendResponse(false, 'Method not allowed');
