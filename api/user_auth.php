<?php
header('Content-Type: application/json');
require_once 'config.php';

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $action = isset($_POST['action']) ? validateInput($_POST['action']) : '';
    
    // REGISTER
    if ($action === 'register') {
        $nama = isset($_POST['nama']) ? validateInput($_POST['nama']) : '';
        $email = isset($_POST['email']) ? validateInput($_POST['email']) : '';
        $no_hp = isset($_POST['no_hp']) ? validateInput($_POST['no_hp']) : '';
        $asal_institusi = isset($_POST['asal_institusi']) ? validateInput($_POST['asal_institusi']) : '';
        $password = isset($_POST['password']) ? $_POST['password'] : '';
        
        // Validation
        if (empty($nama) || empty($email) || empty($no_hp) || empty($password)) {
            sendResponse(false, 'Semua field wajib diisi kecuali asal institusi');
        }
        
        if (strlen($password) < 6) {
            sendResponse(false, 'Password harus minimal 6 karakter');
        }
        
        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            sendResponse(false, 'Format email tidak valid');
        }
        
        // Check if email already exists
        $checkEmailStmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
        $checkEmailStmt->bind_param("s", $email);
        $checkEmailStmt->execute();
        $checkEmailResult = $checkEmailStmt->get_result();
        
        if ($checkEmailResult->num_rows > 0) {
            sendResponse(false, 'Email sudah terdaftar, gunakan email lain');
        }
        $checkEmailStmt->close();
        
        // Hash password
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        
        // Insert user
        $stmt = $conn->prepare("INSERT INTO users (nama, email, no_hp, asal_institusi, password) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("sssss", $nama, $email, $no_hp, $asal_institusi, $hashedPassword);
        
        if ($stmt->execute()) {
            $user_id = $stmt->insert_id;
            $_SESSION['user_id'] = $user_id;
            $_SESSION['user_email'] = $email;
            $_SESSION['user_nama'] = $nama;
            
            sendResponse(true, 'Pendaftaran berhasil', [
                'user_id' => $user_id,
                'email' => $email,
                'nama' => $nama
            ]);
        } else {
            sendResponse(false, 'Gagal mendaftar. Coba lagi');
        }
        $stmt->close();
    }
    
    // LOGIN
    else if ($action === 'login') {
        $email = isset($_POST['email']) ? validateInput($_POST['email']) : '';
        $password = isset($_POST['password']) ? $_POST['password'] : '';
        
        if (empty($email) || empty($password)) {
            sendResponse(false, 'Email dan password harus diisi');
        }
        
        // Query to get user
        $stmt = $conn->prepare("SELECT id, nama, email, password FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();
            
            // Verify password
            if (password_verify($password, $user['password'])) {
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['user_email'] = $user['email'];
                $_SESSION['user_nama'] = $user['nama'];
                
                sendResponse(true, 'Login berhasil', [
                    'user_id' => $user['id'],
                    'email' => $user['email'],
                    'nama' => $user['nama']
                ]);
            } else {
                sendResponse(false, 'Password salah');
            }
        } else {
            sendResponse(false, 'Email tidak ditemukan');
        }
        
        $stmt->close();
    }
    
    // LOGOUT
    else if ($action === 'logout') {
        session_destroy();
        sendResponse(true, 'Logout berhasil');
    }
    
    // GET USER PROFILE (similar to check)
    else if ($action === 'me') {
        if (isset($_SESSION['user_id']) && !empty($_SESSION['user_id'])) {
            $user_id = $_SESSION['user_id'];
            $stmt = $conn->prepare("SELECT id, nama, email, no_hp, asal_institusi FROM users WHERE id = ?");
            $stmt->bind_param("i", $user_id);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                $user = $result->fetch_assoc();
                sendResponse(true, 'Authenticated', $user);
            } else {
                sendResponse(false, 'User not found');
            }
            $stmt->close();
        } else {
            sendResponse(false, 'Not authenticated');
        }
    }
    
    // UPDATE PROFILE
    else if ($action === 'update_profile') {
        if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
            sendResponse(false, 'Not authenticated');
        }
        
        $user_id = $_SESSION['user_id'];
        $nama = isset($_POST['nama']) ? validateInput($_POST['nama']) : '';
        $no_hp = isset($_POST['no_hp']) ? validateInput($_POST['no_hp']) : '';
        $asal_institusi = isset($_POST['asal_institusi']) ? validateInput($_POST['asal_institusi']) : '';
        $current_password = isset($_POST['current_password']) ? $_POST['current_password'] : '';
        $new_password = isset($_POST['new_password']) ? $_POST['new_password'] : '';
        
        if (empty($nama) || empty($no_hp)) {
            sendResponse(false, 'Nama dan No HP harus diisi');
        }
        
        // If trying to change password
        if (!empty($new_password)) {
            if (empty($current_password)) {
                sendResponse(false, 'Password lama harus diisi untuk mengubah password');
            }
            
            if (strlen($new_password) < 6) {
                sendResponse(false, 'Password baru harus minimal 6 karakter');
            }
            
            // Verify current password
            $stmt = $conn->prepare("SELECT password FROM users WHERE id = ?");
            $stmt->bind_param("i", $user_id);
            $stmt->execute();
            $result = $stmt->get_result();
            $user = $result->fetch_assoc();
            $stmt->close();
            
            if (!password_verify($current_password, $user['password'])) {
                sendResponse(false, 'Password lama salah');
            }
            
            $hashedPassword = password_hash($new_password, PASSWORD_BCRYPT);
            $stmt = $conn->prepare("UPDATE users SET nama = ?, no_hp = ?, asal_institusi = ?, password = ? WHERE id = ?");
            $stmt->bind_param("ssssi", $nama, $no_hp, $asal_institusi, $hashedPassword, $user_id);
        } else {
            $stmt = $conn->prepare("UPDATE users SET nama = ?, no_hp = ?, asal_institusi = ? WHERE id = ?");
            $stmt->bind_param("sssi", $nama, $no_hp, $asal_institusi, $user_id);
        }
        
        if ($stmt->execute()) {
            $_SESSION['user_nama'] = $nama;
            
            sendResponse(true, 'Profil berhasil diperbarui', [
                'user_id' => $user_id,
                'nama' => $nama,
                'email' => $_SESSION['user_email'],
                'no_hp' => $no_hp,
                'asal_institusi' => $asal_institusi
            ]);
        } else {
            sendResponse(false, 'Gagal memperbarui profil');
        }
        $stmt->close();
    }
    
    // CHECK AUTH
    else if ($action === 'check') {
        if (isset($_SESSION['user_id']) && !empty($_SESSION['user_id'])) {
            sendResponse(true, 'Authenticated', [
                'user_id' => $_SESSION['user_id'],
                'email' => $_SESSION['user_email'],
                'nama' => $_SESSION['user_nama']
            ]);
        } else {
            sendResponse(false, 'Not authenticated');
        }
    }
    
    else {
        sendResponse(false, 'Invalid action');
    }
}

// GET method for checking auth status
else if ($method === 'GET') {
    if (isset($_SESSION['user_id']) && !empty($_SESSION['user_id'])) {
        sendResponse(true, 'Authenticated', [
            'user_id' => $_SESSION['user_id'],
            'email' => $_SESSION['user_email'],
            'nama' => $_SESSION['user_nama']
        ]);
    } else {
        sendResponse(false, 'Not authenticated');
    }
}

else {
    sendResponse(false, 'Method not allowed');
}

$conn->close();
?>
