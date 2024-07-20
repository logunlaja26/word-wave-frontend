import { collection, query, limit, getDocs } from "firebase/firestore";
import { db } from "./util.js";

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

// // Fetch notes on page load for a specific user
window.onload = () => {
  const userId = "testUserId"; // Replace with the actual user ID
  fetchNotes(userId);
};
