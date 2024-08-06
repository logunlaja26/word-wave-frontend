import { auth } from "./util.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

window.onload = function () {
  const login = document.getElementById("loginForm");
  const signup = document.getElementById("signupForm");
  const logout = document.getElementById("logoutButton");

  // Debugging statements
  console.log("loginForm:", login);
  console.log("signupForm:", signup);
  console.log("logoutButton:", logout);

  if (!signup || !logout) {
    console.error("One or more elements are not found in the DOM.");
    return;
  }

  // Sign Up Modal Logic
  var modal = document.getElementById("signupModal");
  var btn = document.getElementById("signupButton");
  var span = document.getElementsByClassName("close")[0];

  onAuthStateChanged(auth, (user) => {
    console.log(user);
    if (user) {
      let currentUserId = user.uid;
      let currentUserEmail = user.email;
      console.log("user ID in login email ", currentUserId);
      console.log("user ID in login email ", currentUserEmail);
      // User is signed in, show main content
      document.getElementById("login-container").style.display = "none";
      document.getElementById("main").style.display = "block";
      console.log("user logged in", user);
    } else {
      // No user is signed in, show login form
      document.getElementById("login-container").style.display = "block";
      document.getElementById("main").style.display = "none";
      console.log("user logged out", user);
    }
  });

  login.addEventListener("submit", function (e) {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
      .then((cred) => {
        // console.log(cred.user);
        console.log("user ID in login page ", cred.uid);
        // Hide login form and show main content
        document.getElementById("login-container").style.display = "none";
        document.getElementById("main").style.display = "block";
        // history.pushState(null, null, "/main");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });
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

  async function createNewUser(newemail, newpassword) {
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        newemail,
        newpassword
      );
      console.log("firebase auth user credentials", cred);
      const userEmail = cred.user.email;
      console.log("firebase auth user email ", userEmail);
      const userId = cred.user.uid;
      console.log("firebase auth user id ", userId);
      return { userId, userEmail };
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Error during sign-up: ", errorMessage);
      throw error;
    }
  }

  const newUser = async function (e) {
    e.preventDefault();

    const newemail = document.getElementById("newuseremail").value;
    const newpassword = document.getElementById("newpassword").value;

    try {
      const { userId, userEmail } = await createNewUser(newemail, newpassword);
    } catch (error) {
      console.log(error);
    }

    alert("Sign-up successful for " + newemail);
    document.getElementById("newuseremail").value = "";
    document.getElementById("newpassword").value = "";
    modal.style.display = "none";
  };

  // sign up the user
  signup.addEventListener("submit", newUser);

  // logout the user
  logout.addEventListener("click", (e) => {
    e.preventDefault();
    signOut(auth)
      .then(() => {})
      .catch((error) => {
        console.log(error);
      });
  });
};
