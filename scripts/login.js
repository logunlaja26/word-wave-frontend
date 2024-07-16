// import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

// const auth = getAuth();

document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();
  // You can add real authentication here
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (username === "user" && password === "pass") {
    window.location.href = "main.html";
  } else {
    alert("Invalid credentials");
  }
});

// Sign Up Modal Logic
var modal = document.getElementById("signupModal");
var btn = document.getElementById("signupButton");
var span = document.getElementsByClassName("close")[0];

btn.onclick = function () {
  modal.style.display = "block";
};

span.onclick = function () {
  modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

document.getElementById("signupForm").addEventListener("submit", function (e) {
  e.preventDefault();
  // You can add real sign-up logic here
  const newUsername = document.getElementById("newUsername").value;
  const newPassword = document.getElementById("newPassword").value;

  alert("Sign-up successful for " + newUsername);
  modal.style.display = "none";
});
