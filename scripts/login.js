import { auth } from "./util.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

const login = document.getElementById("loginForm");
const signup = document.getElementById("signupForm");
const logout = document.getElementById("logoutButton");

// Sign Up Modal Logic
var modal = document.getElementById("signupModal");
var btn = document.getElementById("signupButton");
var span = document.getElementsByClassName("close")[0];

onAuthStateChanged(auth, (user) => {
  console.log(user);
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/auth.user
    const uid = user.uid;
    console.log("user logged in", user);
    // ...
  } else {
    console.log("user logged out", user);
    // ...
  }
});

login.addEventListener("submit", function (e) {
  e.preventDefault();
  // You can add real authentication here
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      // console.log(cred.user);
    })
    .catch(() => {
      const errorCode = error.code;
      const errorMessage = error.message;
    });

  // if (username === "user" && password === "pass") {
  //   window.location.href = "main.html";
  // } else {
  //   alert("Invalid credentials");
  // }
});

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

// sign up the user
signup.addEventListener("submit", function (e) {
  e.preventDefault();

  const newemail = document.getElementById("newuseremail").value;
  const newpassword = document.getElementById("newpassword").value;

  createUserWithEmailAndPassword(auth, newemail, newpassword)
    .then((cred) => {
      console.log("firebase auth user credentials", cred);
      const userEmail = cred.user.email;
      console.log("firebase auth user email ", userEmail);
      const userId = cred.user.uid;
      console.log("firebase auth user id ", userId);
      return userId;
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      // ..
    });

  alert("Sign-up successful for " + newemail);
  document.getElementById("newuseremail").value = "";
  document.getElementById("newpassword").value = "";
  modal.style.display = "none";
});

// logout the user
logout.addEventListener("click", (e) => {
  e.preventDefault();
  signOut(auth)
    .then(() => {})
    .catch((error) => {
      console.log(error);
    });
});
