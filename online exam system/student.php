<?php
session_start();
include("db.php");

$message="";
$show_exam=false;

if(isset($_POST['submit_exam'])){
    $score=0;
    $exam_id=$_POST['exam_id'];
    $student_id = $_SESSION['user_id'];

    foreach($_POST['answers'] as $qid=>$ans){
        $r=$conn->query("SELECT correct_option FROM questions WHERE question_id='$qid'");
        $row=$r->fetch_assoc();
        if($row['correct_option']==$ans) $score++;
    }

    $conn->query("INSERT INTO results (student_id, exam_id, score)
                  VALUES ('$student_id', '$exam_id', '$score')");

    $message="🎉 Your Score: $score";
}

if(isset($_POST['start_exam'])){
    $exam_id=$_POST['exam_id'];
    $show_exam=true;
}
?>

<!DOCTYPE html>
<html>
<head>
<title>Student Dashboard</title>

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">

<style>
body {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color:white;
    font-family: 'Poppins', sans-serif;
}

/* Navbar */
.navbar {
    background: rgba(0,0,0,0.6) !important;
}

/* Glass Card */
.card {
    background: rgba(255,255,255,0.1);
    border-radius:20px;
    backdrop-filter: blur(15px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    color:white;
}

/* Question Box */
.question-box {
    background: rgba(255,255,255,0.15);
    padding:15px;
    margin-bottom:15px;
    border-radius:15px;
    transition:0.3s;
}

.question-box:hover {
    transform:scale(1.02);
}

/* Timer */
#timer {
    position:fixed;
    top:20px;
    right:20px;
    background:red;
    padding:10px 15px;
    border-radius:10px;
    font-weight:bold;
}

/* Button */
.btn-primary {
    background:#00c6ff;
    border:none;
}
.btn-success {
    background:#00f2c3;
    border:none;
}
</style>

</head>

<body>

<nav class="navbar navbar-dark px-4">
<span class="navbar-brand">🎓 Student Dashboard</span>
<a href="index.php" class="btn btn-danger btn-sm">Logout</a>
</nav>

<div class="container mt-5">

<?php if($message!=""): ?>
<div class="alert alert-light text-center text-dark">
<h4><?php echo $message; ?></h4>
</div>
<?php endif; ?>

<!-- SELECT EXAM -->
<div class="card p-4 mb-4">
<h4>Select Exam</h4>
<form method="POST">

<select name="exam_id" class="form-control mb-3" required>
<?php
$r=$conn->query("SELECT * FROM exams");
while($row=$r->fetch_assoc()){
echo "<option value='".$row['exam_id']."'>".$row['exam_name']."</option>";
}
?>
</select>

<button class="btn btn-primary w-100" name="start_exam">Start Exam</button>
</form>
</div>

<!-- EXAM -->
<?php if($show_exam): ?>

<div id="timer">Time Left: 60</div>

<div class="card p-4">
<h4 class="mb-4">📝 Exam Questions</h4>

<form method="POST">
<input type="hidden" name="exam_id" value="<?php echo $exam_id; ?>">

<?php
$q=$conn->query("SELECT * FROM questions WHERE exam_id='$exam_id'");
while($row=$q->fetch_assoc()){
?>

<div class="question-box">
<p><b><?php echo $row['question_text']; ?></b></p>

<label><input type="radio" name="answers[<?php echo $row['question_id']; ?>]" value="option1" required> <?php echo $row['option1']; ?></label><br>
<label><input type="radio" name="answers[<?php echo $row['question_id']; ?>]" value="option2"> <?php echo $row['option2']; ?></label><br>
<label><input type="radio" name="answers[<?php echo $row['question_id']; ?>]" value="option3"> <?php echo $row['option3']; ?></label><br>
<label><input type="radio" name="answers[<?php echo $row['question_id']; ?>]" value="option4"> <?php echo $row['option4']; ?></label>

</div>

<?php } ?>

<button class="btn btn-success w-100 mt-3" name="submit_exam">Submit Exam</button>

</form>
</div>

<?php endif; ?>

</div>

<!-- TIMER SCRIPT -->
<script>
let time = 60;
let timer = document.getElementById("timer");

if(timer){
    let interval = setInterval(() => {
        time--;
        timer.innerHTML = "Time Left: " + time;

        if(time <= 0){
            clearInterval(interval);
            alert("Time's up! Submitting exam...");
            document.forms[1].submit();
        }
    }, 1000);
}
</script>

</body>
</html>