<?php
// Database Setup Script - Run this once to create tables
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "ikram_db";

// Create connection
$conn = new mysqli($servername, $username, $password);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Create database
$createDbSQL = "CREATE DATABASE IF NOT EXISTS $dbname";
if ($conn->query($createDbSQL) === TRUE) {
    echo "Database created successfully<br>";
} else {
    echo "Error creating database: " . $conn->error;
}

// Select database
$conn->select_db($dbname);

// Create admin_users table
$createAdminTableSQL = "CREATE TABLE IF NOT EXISTS admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if ($conn->query($createAdminTableSQL) === TRUE) {
    echo "admin_users table created successfully<br>";
} else {
    echo "Error creating admin_users table: " . $conn->error;
}

// Create events table
$createEventsTableSQL = "CREATE TABLE IF NOT EXISTS events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    judul VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    tanggal DATE NOT NULL,
    waktu TIME NOT NULL,
    lokasi VARCHAR(255),
    kategori VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)";

if ($conn->query($createEventsTableSQL) === TRUE) {
    echo "events table created successfully<br>";
} else {
    echo "Error creating events table: " . $conn->error;
}

// Create registrations table
$createRegistrationsTableSQL = "CREATE TABLE IF NOT EXISTS registrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    nama VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    no_hp VARCHAR(20) NOT NULL,
    asal_institusi VARCHAR(255),
    alasan_mendaftar TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    UNIQUE KEY unique_registration (event_id, email)
)";

if ($conn->query($createRegistrationsTableSQL) === TRUE) {
    echo "registrations table created successfully<br>";
} else {
    echo "Error creating registrations table: " . $conn->error;
}

// Insert default admin user (username: admin, password: admin123)
$adminUsername = "admin";
$adminPassword = password_hash("admin123", PASSWORD_BCRYPT);

$checkAdminSQL = "SELECT id FROM admin_users WHERE username = '$adminUsername'";
$result = $conn->query($checkAdminSQL);

if ($result->num_rows == 0) {
    $insertAdminSQL = "INSERT INTO admin_users (username, password) VALUES ('$adminUsername', '$adminPassword')";
    if ($conn->query($insertAdminSQL) === TRUE) {
        echo "Default admin user created (username: admin, password: admin123)<br>";
    } else {
        echo "Error creating admin user: " . $conn->error;
    }
} else {
    echo "Admin user already exists<br>";
}

echo "Database setup completed!<br>";
echo "<a href='../admin.html'>Go to Admin Panel</a>";

$conn->close();
?>
