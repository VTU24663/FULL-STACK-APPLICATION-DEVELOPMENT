<?php
session_start();
include("db.php");

$message="";

if(isset($_POST['add_exam'])){
    $conn->query("INSERT INTO exams (exam_name,duration) VALUES ('$_POST[exam_name]','$_POST[duration]')");
    $message="Exam Added Successfully!";
}

if(isset($_POST['add_question'])){
    $conn->query("INSERT INTO questions 
    (exam_id,question_text,option1,option2,option3,option4,correct_option)
    VALUES ('$_POST[exam_id]','$_POST[question_text]',
    '$_POST[option1]','$_POST[option2]',
    '$_POST[option3]','$_POST[option4]',
    '$_POST[correct_option]')");
    $message="Question Added Successfully!";
}
?>

<!DOCTYPE html>
<html>
<head>
<title>Admin Dashboard</title>

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>

<style>
body {
    background: linear-gradient(135deg, #667eea, #764ba2);
    font-family: 'Poppins', sans-serif;
    color: #fff;
}

/* Navbar */
.navbar {
    backdrop-filter: blur(10px);
    background: rgba(0,0,0,0.6) !important;
}

/* Glass Card */
.card {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    backdrop-filter: blur(15px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    border: 1px solid rgba(255,255,255,0.2);
    color: #fff;
    transition: 0.3s;
}

.card:hover {
    transform: translateY(-8px) scale(1.02);
}

/* Inputs */
input, select {
    border-radius: 10px !important;
}

/* Buttons */
.btn-primary {
    background: #00c6ff;
    border: none;
}
.btn-primary:hover {
    background: #0072ff;
}

.btn-success {
    background: #00f2c3;
    border: none;
}
.btn-success:hover {
    background: #00c9a7;
}

/* Alert */
.alert {
    border-radius: 10px;
}
</style>

</head>

<body>

<nav class="navbar navbar-dark px-4">
<span class="navbar-brand fw-bold">🎓 Admin Dashboard</span>
<a href="index.php" class="btn btn-danger btn-sm">Logout</a>
</nav>

<div class="container mt-5">

<?php if($message!=""): ?>
<div class="alert alert-success text-dark animate__animated animate__fadeIn">
<?php echo $message; ?>
</div>
<?php endif; ?>

<div class="row g-4">

<!-- ADD EXAM -->
<div class="col-md-6">
<div class="card p-4 animate__animated animate__fadeInLeft">
<h4 class="mb-3">➕ Add Exam</h4>

<form method="POST">
<input type="text" name="exam_name" class="form-control mb-3" placeholder="Exam Name" required>
<input type="number" name="duration" class="form-control mb-3" placeholder="Duration (minutes)" required>

<button class="btn btn-primary w-100" name="add_exam">Add Exam</button>
</form>

</div>
</div>

<!-- ADD QUESTION -->
<div class="col-md-6">
<div class="card p-4 animate__animated animate__fadeInRight">
<h4 class="mb-3">📝 Add Question</h4>

<form method="POST">

<select name="exam_id" class="form-control mb-3">
<?php
$r=$conn->query("SELECT * FROM exams");
while($row=$r->fetch_assoc()){
echo "<option value='$row[exam_id]'>$row[exam_name]</option>";
}
?>
</select>

<input type="text" name="question_text" class="form-control mb-2" placeholder="Question" required>
<input type="text" name="option1" class="form-control mb-2" placeholder="Option 1" required>
<input type="text" name="option2" class="form-control mb-2" placeholder="Option 2" required>
<input type="text" name="option3" class="form-control mb-2" placeholder="Option 3" required>
<input type="text" name="option4" class="form-control mb-3" placeholder="Option 4" required>

<select name="correct_option" class="form-control mb-3">
<option value="option1">Option 1</option>
<option value="option2">Option 2</option>
<option value="option3">Option 3</option>
<option value="option4">Option 4</option>
</select>

<button class="btn btn-success w-100" name="add_question">Add Question</button>

</form>

</div>
</div>

</div>
</div>

</body>
</html>