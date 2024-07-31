import { collection, query, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firocsebase/auth";
import { db, auth } from "./util.js";

let currentUserId = null;
let currentUserEmail = null;
onAuthStateChanged(auth, (user) => {
  console.log("user in notes page", user);
  if (user) {
    currentUserId = user.uid;
    currentUserEmail = user.email;
    console.log("user ID in notes page  ", currentUserId);
    console.log("user ID in notes page", currentUserEmail);
    fetchNotes(currentUserId);
  } else {
    console.log("user logged out", user);
  }
});

console.log("notes user ID", currentUserId);

// Function to fetch and display notes
export async function fetchNotes(userId) {
  const notesContainer = document.getElementById("notes-container");
  const notesQuery = query(collection(db, `Users/${userId}/Notes`));
  notesContainer.innerHTML = "";

  // Listen for real-time updates
  onSnapshot(
    notesQuery,
    (querySnapshot) => {
      notesContainer.innerHTML = ""; // Clear container before adding updated notes
      querySnapshot.forEach((doc) => {
        const noteData = doc.data();
        const noteElement = document.createElement("div");
        noteElement.classList.add("note");
        noteElement.innerHTML = `
          <h3>${noteData.title}</h3>
          <p>${noteData.content}</p>
          <small>Created on: ${noteData.createdOn}</small>
          <small>Last modified: ${noteData.lastModified}</small>
        `;
        notesContainer.appendChild(noteElement);
      });
    },
    (error) => {
      console.error("Error fetching notes: ", error);
    }
  );
}

document.getElementById("back-to-main-btn").addEventListener("click", () => {
  // Update the URL to /main-content
  history.pushState(null, null, "/main-content");
  window.location.href = "index.html";
});
