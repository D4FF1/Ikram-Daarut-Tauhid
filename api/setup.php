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

// Create users table with roles (admin/user)
$createUsersTableSQL = "CREATE TABLE IF NOT EXISTS users (\n    id INT PRIMARY KEY AUTO_INCREMENT,\n    nama VARCHAR(255) NOT NULL,\n    email VARCHAR(255) UNIQUE NOT NULL,\n    no_hp VARCHAR(20) NOT NULL,\n    asal_institusi VARCHAR(255),\n    password VARCHAR(255) NOT NULL,\n    role ENUM('admin','user') DEFAULT 'user',\n    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n)";

if ($conn->query($createUsersTableSQL) === TRUE) {
    echo "users table created successfully<br>";
} else {
    echo "Error creating users table: " . $conn->error;
}

// Create events table
$createEventsTableSQL = "CREATE TABLE IF NOT EXISTS events (\n    id INT PRIMARY KEY AUTO_INCREMENT,\n    judul VARCHAR(255) NOT NULL,\n    deskripsi TEXT,\n    tanggal DATE NOT NULL,\n    waktu TIME NOT NULL,\n    lokasi VARCHAR(255),\n    kategori VARCHAR(50),\n    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n)";


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

// Insert default admin users (2 akun)
$admins = [
    [
        'nama' => 'Admin 1',
        'email' => 'admin1@ikram.test',
        'no_hp' => '0000000001',
        'password' => 'admin123'
    ],
    [
        'nama' => 'Admin 2',
        'email' => 'admin2@ikram.test',
        'no_hp' => '0000000002',
        'password' => 'admin123'
    ]
];

foreach ($admins as $adm) {
    $adminEmail = $adm['email'];
    $adminPassword = password_hash($adm['password'], PASSWORD_BCRYPT);

    $checkAdminSQL = "SELECT id FROM users WHERE email = '$adminEmail'";
    $result = $conn->query($checkAdminSQL);

    if ($result->num_rows == 0) {
        $adminNama = $adm['nama'];
        $adminNoHp = $adm['no_hp'];
        $adminRole = 'admin';
        $insertAdminSQL = "INSERT INTO users (nama, email, no_hp, asal_institusi, password, role) VALUES ('$adminNama', '$adminEmail', '$adminNoHp', NULL, '$adminPassword', '$adminRole')";
        if ($conn->query($insertAdminSQL) === TRUE) {
            echo "Default admin user created: ($adminEmail / admin123)<br>";
        } else {
            echo "Error creating admin user: " . $conn->error;
        }
    } else {
        echo "Admin user already exists: $adminEmail<br>";
    }
}


echo "Database setup completed!<br>";
echo "<a href='../admin.html'>Go to Admin Panel</a>";


$conn->close();
?>
