<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "education_db";

// สร้างการเชื่อมต่อ
$conn = new mysqli($servername, $username, $password, $dbname);

// เช็คว่าเชื่อมติดไหม
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>

