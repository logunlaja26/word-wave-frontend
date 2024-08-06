import { updateDoc, setDoc, doc } from "firebase/firestore";
import { getStorage, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import { app, db, auth } from "./util.js";
import { uuidv4, newNoteId as noteId } from "./main.js";
import { ref } from "firebase/storage";

const random_uuid = uuidv4();
const audioFilename = "audio-" + uuidv4() + "-file.mp3";
//const noteId = "note-" + uuidv4();
console.log(audioFilename);
console.log("db instance ", db);

const storage = getStorage(app);

const storageRef = ref(storage, `audio/${audioFilename}`);
const audioListRef = ref(storage, "audio/");

export let currentUserId = null;
let currentUserEmail = null;

onAuthStateChanged(auth, (user) => {
  console.log(user);
  if (user) {
    currentUserId = user.uid;
    currentUserEmail = user.email;
    console.log("user ID in firebase ", currentUserId);
    console.log("Email in firebase ", currentUserEmail);
    const uid = user.uid;
    console.log("user logged in", user);
  } else {
    console.log("user logged out", user);
  }
});

// Function to upload audio
export async function uploadAudioToFirebase(audioBlob) {
  const audioFile = new File([audioBlob], "audio.mp3", {
    type: "audio/mpeg",
  });

  try {
    const snapshot = await uploadBytes(storageRef, audioFile);
    const audioUrl = await getAudioUrl(snapshot);
    console.log("uploading audio to firebase..");
    const transcription = await sendUrlToServerAndTranscribe(audioUrl);
    console.log("transcription details..", transcription);
    const summary = await summarizeSegments(transcription);
    console.log("Summary results ", summary);

    const now = new Date().toLocaleString(); // Get current date and time in ISO format

    await addUpdateNote(
      currentUserId,
      noteId,
      "Meeting Notes & Summary",
      transcription, // Use the transcription as the content
      summary,
      now,
      "2024-06-11T15:00:00Z"
    );
    return audioUrl;
  } catch (error) {
    console.error("Error in uploading audio or updating note:", error);
    throw error; // Ensure errors are propagated
  }
}

export async function getAudioUrl(snapshot) {
  try {
    const url = await getDownloadURL(snapshot.ref);
    console.log("audio url...", url);
    return url;
  } catch (error) {
    console.error("Error getting audio URL:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
}

function sendUrlToServerAndTranscribe(url) {
  return fetch("http://localhost:8000/transcribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url: url }),
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((data) => {
          console.log("data error message...", data);
          throw new Error(data.message || "Transcription failed");
        });
      }
      return response.json();
    })
    .then((data) => {
      console.log("Response...", data);
      console.log("spoken language..", data.language);
      document.getElementById("text").innerText = JSON.stringify(
        data.segments
          .map((segment, index) => `${segment.speaker}: ${segment.text}`)
          .join("\n")
      );
      const transcription = data.segments
        .map((segment) => `${segment.speaker}: ${segment.text}`)
        .join("\n");

      return transcription;
    })
    .catch((error) => {
      console.error("Error: ", error);
      document.getElementById("text").innerText = `Error: ${error.message}`;
      throw error;
    });
}

// Adjusted summarizeSegments to accept a single string of all segments and return a string
async function summarizeSegments(transcription) {
  try {
    const response = await fetch("http://localhost:8000/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        notes: transcription,
      }),
    });
    const summary = await response.json();
    console.log("Summary after api call: ", summary);
    const summaryText = summary || "No result available";
    document.getElementById("summary").innerText = JSON.stringify(summaryText);

    console.log("current summaryText: ", summaryText);
    document.getElementById("summary").innerText = JSON.stringify(summaryText);
    return summaryText; // Return the summary text
  } catch (error) {
    console.error("Error summarizing: ", error);
    return "Error in summarization"; // Return error message as string
  }
}

//const noteId = "note-" + uuidv4(); // Generate a new note ID
export async function addUpdateUser(userId, username, email) {
  try {
    await setDoc(
      doc(db, "Users", userId),
      {
        userInfo: {
          username: username,
          email: email,
        },
      },
      { merge: true }
    );
    console.log(`User information updated for ${userId}`);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export async function addUpdateNote(
  currentUserId,
  noteId,
  title,
  content,
  summary,
  createdOn,
  lastModified
) {
  const noteRef = doc(db, "Users", currentUserId, "Notes", noteId);
  try {
    await setDoc(
      noteRef,
      {
        title: title,
        content: content,
        summary: summary,
        createdOn: createdOn,
        lastModified: lastModified,
      },
      { merge: true }
    );
    console.log(
      `Note updated for ${currentUserId} under user ${currentUserId}`
    );
  } catch (error) {
    console.error("Error updating note: ", error);
  }
}

// Function to link audio blobs to a note
export async function linkAudioToNote(userId, noteId, audioPath) {
  const noteRef = doc(db, "Users", userId, "Notes", noteId);
  try {
    await updateDoc(noteRef, {
      audioBlob: audioPath,
    });
    console.log(`Audio blobs linked to note ${noteId}`);
  } catch (error) {
    console.error("Error linking audio blobs: ", error);
  }
}

export async function saveUserData(audioUrl) {
  await addUpdateUser(currentUserId, currentUserEmail, currentUserEmail);
  await linkAudioToNote(currentUserId, noteId, audioUrl);
}
