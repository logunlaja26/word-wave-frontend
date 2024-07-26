import { collection, query, limit, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
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

    console.log("user logged in", user);
    fetchNotes(currentUserId);
  } else {
    console.log("user logged out", user);
  }
});

console.log("notes user ID", currentUserId);

// Function to fetch and display notes
export async function fetchNotes(userId) {
  const notesContainer = document.getElementById("notes-container");
  const notesQuery = query(collection(db, `Users/${userId}/Notes`), limit(5));
  try {
    const querySnapshot = await getDocs(notesQuery);
    querySnapshot.forEach((doc) => {
      const noteData = doc.data();
      //   console.log("note data ", noteData);
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
  } catch (error) {
    console.error("Error fetching notes: ", error);
  }
}
