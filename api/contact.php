<?php
  $fullName = $_POST['fullName'];
  $email = $_POST['email'];
  $message = $_POST['message'];

  $to = 'me@ilmarlopez.com';
  $subject = 'New message from contact form';
  $body = "Full Name: $fullName\nEmail: $email\Message: $message";
  $headers = "From: $email\r\nReply-To: $email\r\n";

  mail($to, $subject, $body, $headers);

  header('Location: index.html')
?>