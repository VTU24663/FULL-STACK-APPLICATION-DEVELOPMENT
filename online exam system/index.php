<?php
session_start();
include("db.php");

$error = "";

if(isset($_POST['login'])){
    $email = $_POST['email'];
    $password = $_POST['password'];

    $query = "SELECT * FROM users WHERE email='$email' AND password='$password'";
    $result = $conn->query($query);

    if($result->num_rows > 0){
        $row = $result->fetch_assoc();
        $_SESSION['user_id'] = $row['userid'];
        $_SESSION['role'] = $row['role'];

        if($row['role'] == 'admin'){
            header("Location: admin.php");
        } else {
            header("Location: student.php");
        }
        exit();
    } else {
        $error = "Invalid Login!";
    }
}
?>

<!DOCTYPE html>
<html>
<head>
<title>Online Exam System</title>

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">

<style>
body {
    margin:0;
    font-family: 'Poppins', sans-serif;
    height:100vh;
    display:flex;
}

/* LEFT SIDE */
.left-panel {
    width:50%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color:white;
    display:flex;
    flex-direction:column;
    justify-content:center;
    align-items:center;
    text-align:center;
    padding:40px;
}

.left-panel h1 {
    font-size:40px;
    font-weight:600;
}

.left-panel p {
    opacity:0.8;
}

/* RIGHT SIDE */
.right-panel {
    width:50%;
    display:flex;
    justify-content:center;
    align-items:center;
    background:#f5f7fa;
}

/* LOGIN CARD */
.login-card {
    width:350px;
    padding:30px;
    border-radius:20px;
    background:white;
    box-shadow:0 10px 30px rgba(0,0,0,0.2);
}

/* FLOATING INPUT */
.form-group {
    position:relative;
    margin-bottom:20px;
}

.form-group input {
    width:100%;
    padding:10px;
    border-radius:8px;
    border:1px solid #ccc;
}

.form-group label {
    position:absolute;
    top:50%;
    left:10px;
    transform:translateY(-50%);
    background:white;
    padding:0 5px;
    color:#999;
    transition:0.3s;
}

.form-group input:focus + label,
.form-group input:valid + label {
    top:-8px;
    font-size:12px;
    color:#764ba2;
}

/* BUTTON */
.btn-login {
    width:100%;
    background:#667eea;
    color:white;
    border:none;
    padding:10px;
    border-radius:8px;
    transition:0.3s;
}

.btn-login:hover {
    background:#5a67d8;
    transform:scale(1.05);
}
</style>

</head>

<body>

<!-- LEFT SIDE -->
<div class="left-panel">
    <h1>🎓 Online Exam System</h1>
    <p>Test your knowledge. Track your progress. Succeed smarter.</p>
</div>

<!-- RIGHT SIDE -->
<div class="right-panel">

<div class="login-card">

<h4 class="text-center mb-4">Login</h4>

<?php if($error!=""): ?>
<div class="alert alert-danger"><?php echo $error; ?></div>
<?php endif; ?>

<form method="POST">

<div class="form-group">
    <input type="email" name="email" required>
    <label>Email</label>
</div>

<div class="form-group">
    <input type="password" name="password" required>
    <label>Password</label>
</div>

<button type="submit" name="login" class="btn-login">Login</button>

</form>

</div>

</div>

</body>
</html>