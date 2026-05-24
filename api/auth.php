<?php
header('Content-Type: application/json');
require_once 'config.php';

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $action = isset($_POST['action']) ? validateInput($_POST['action']) : '';
    
    // LOGIN
    if ($action === 'login') {
        $username = isset($_POST['username']) ? validateInput($_POST['username']) : '';
        $password = isset($_POST['password']) ? validateInput($_POST['password']) : '';
        
        if (empty($username) || empty($password)) {
            sendResponse(false, 'Username dan password harus diisi');
        }
        
    
        // Query to get user (role-based)
        // Table `users`: email, password, role
        $stmt = $conn->prepare("SELECT id, nama, email, password, role FROM users WHERE email = ? LIMIT 1");
        $stmt->bind_param("s", $username);


        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();
            
            // Verify password
            if (password_verify($password, $user['password'])) {
                $_SESSION['admin_id'] = $user['id'];
                $_SESSION['admin_username'] = $user['nama'] ?? $user['email'];

                // Only admin role can access admin endpoints
                if (($user['role'] ?? '') !== 'admin') {
                    // Do not set auth session
                    unset($_SESSION['admin_id'], $_SESSION['admin_username']);
                    // This keeps session empty; admin endpoints will deny.
                    sendResponse(false, 'Forbidden - not admin');
                }

                sendResponse(true, 'Login berhasil', [
                    'admin_id' => $user['id'],
                    'username' => $_SESSION['admin_username']
                ]);


            } else {
                sendResponse(false, 'Password salah');
            }
        } else {
            sendResponse(false, 'Username tidak ditemukan');
        }
        
        $stmt->close();
    }
    
    // LOGOUT
    else if ($action === 'logout') {
        session_destroy();
        sendResponse(true, 'Logout berhasil');
    }
    
    // CHECK AUTH
    else if ($action === 'check') {
        if (isAdmin()) {
            sendResponse(true, 'Authenticated', [
                'admin_id' => $_SESSION['admin_id'],
                'username' => $_SESSION['admin_username']
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
    if (isAdmin()) {
        sendResponse(true, 'Authenticated', [
            'admin_id' => $_SESSION['admin_id'],
            'username' => $_SESSION['admin_username']
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
