<?php
header('Content-Type: application/json');
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_POST['action']) ? $_POST['action'] : (isset($_GET['action']) ? $_GET['action'] : '');

// In this project, registrations table is the only user-like storage for end-users.
// We store users implicitly by email; password is handled in a separate auth table.
// NOTE: If your DB does not have users table, run api/setup.php first and extend it accordingly.

// Helper: send error
function err($msg, $code = 200) {
    http_response_code($code);
    sendResponse(false, $msg);
}

// GET: me
if ($method === 'GET') {
    if ($action === 'me') {
        if (!isset($_SESSION['user_email']) || empty($_SESSION['user_email'])) {
            sendResponse(false, 'Not authenticated');
        }

        $email = $_SESSION['user_email'];
        // Get user info from users table
        $stmt = $conn->prepare(
            "SELECT id, nama, email, no_hp, asal_institusi, role FROM users WHERE email = ? LIMIT 1"
        );
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $res = $stmt->get_result();
        $user = $res ? $res->fetch_assoc() : null;

        $stmt->close();

        if (!$user) {
            sendResponse(false, 'User not found');
        }

        sendResponse(true, 'Authenticated', [
            'id' => $user['id'],
            'nama' => $user['nama'],
            'email' => $user['email'],
            'no_hp' => $user['no_hp'],
            'asal_institusi' => $user['asal_institusi'],
            'role' => $user['role']
        ]);
    }

    sendResponse(false, 'Invalid action');
}

// POST: register/login/logout/update_profile
if ($method === 'POST') {
    if ($action === 'register') {
        $nama = isset($_POST['nama']) ? validateInput($_POST['nama']) : '';
        $email = isset($_POST['email']) ? validateInput($_POST['email']) : '';
        $no_hp = isset($_POST['no_hp']) ? validateInput($_POST['no_hp']) : '';
        $asal_institusi = isset($_POST['asal_institusi']) ? validateInput($_POST['asal_institusi']) : '';
        $password = isset($_POST['password']) ? $_POST['password'] : '';

        if (empty($nama) || empty($email) || empty($no_hp) || empty($password)) {
            sendResponse(false, 'Nama, email, no HP, dan password harus diisi');
        }

        if (strlen($password) < 6) {
            sendResponse(false, 'Password minimal 6 karakter');
        }

        // Jangan buat tabel users di sini.
        // Tabel `users` (dengan kolom role) seharusnya dibuat dari `api/setup.php`.
        // Dengan cara ini struktur user/admin konsisten.


        // Check existing user by email
        $stmt = $conn->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $res = $stmt->get_result();
        if ($res && $res->num_rows > 0) {
            $stmt->close();
            sendResponse(false, 'Email sudah terdaftar');
        }
        $stmt->close();

        $hash = password_hash($password, PASSWORD_BCRYPT);

        $stmt = $conn->prepare(
            'INSERT INTO users (nama, email, no_hp, asal_institusi, password) VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->bind_param('sssss', $nama, $email, $no_hp, $asal_institusi, $hash);

        if ($stmt->execute()) {
            $userId = $stmt->insert_id;
            $stmt->close();

            $_SESSION['user_email'] = $email;

            sendResponse(true, 'Pendaftaran berhasil!', [
                'user_id' => $userId,
                'nama' => $nama,
                'email' => $email,
                'no_hp' => $no_hp,
                'asal_institusi' => $asal_institusi
            ]);
        }

        $stmt->close();
        sendResponse(false, 'Gagal mendaftar: ' . $conn->error);
    }

    else if ($action === 'login') {
        $email = isset($_POST['email']) ? validateInput($_POST['email']) : '';
        $password = isset($_POST['password']) ? $_POST['password'] : '';

        if (empty($email) || empty($password)) {
            sendResponse(false, 'Email dan password harus diisi');
        }

        $stmt = $conn->prepare('SELECT id, nama, email, no_hp, asal_institusi, password FROM users WHERE email = ? LIMIT 1');
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $res = $stmt->get_result();
        $user = $res ? $res->fetch_assoc() : null;
        $stmt->close();

        if (!$user) {
            sendResponse(false, 'Email tidak ditemukan');
        }

        if (!password_verify($password, $user['password'])) {
            sendResponse(false, 'Password salah');
        }

        $_SESSION['user_email'] = $user['email'];

        sendResponse(true, 'Login berhasil', [
            'nama' => $user['nama'],
            'email' => $user['email'],
            'no_hp' => $user['no_hp'],
            'asal_institusi' => $user['asal_institusi']
        ]);
    }

    else if ($action === 'logout') {
        session_destroy();
        sendResponse(true, 'Logout berhasil');
    }

    else if ($action === 'update_profile') {
        if (!isset($_SESSION['user_email']) || empty($_SESSION['user_email'])) {
            sendResponse(false, 'Not authenticated');
        }

        $nama = isset($_POST['nama']) ? validateInput($_POST['nama']) : '';
        $no_hp = isset($_POST['no_hp']) ? validateInput($_POST['no_hp']) : '';
        $asal_institusi = isset($_POST['asal_institusi']) ? validateInput($_POST['asal_institusi']) : '';

        if (empty($nama) || empty($no_hp)) {
            sendResponse(false, 'Nama dan no HP harus diisi');
        }

        $email = $_SESSION['user_email'];

        $stmt = $conn->prepare('UPDATE users SET nama = ?, no_hp = ?, asal_institusi = ? WHERE email = ?');
        $stmt->bind_param('ssss', $nama, $no_hp, $asal_institusi, $email);

        if ($stmt->execute()) {
            $stmt->close();
            sendResponse(true, 'Profil berhasil diperbarui', [
                'nama' => $nama,
                'email' => $email,
                'no_hp' => $no_hp,
                'asal_institusi' => $asal_institusi
            ]);
        }

        $stmt->close();
        sendResponse(false, 'Gagal update profil: ' . $conn->error);
    }

    else {
        sendResponse(false, 'Invalid action');
    }
}

sendResponse(false, 'Method not allowed');



