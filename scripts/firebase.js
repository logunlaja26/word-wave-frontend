import { initializeApp } from "firebase/app";
import { getFirestore, updateDoc, setDoc, doc } from "firebase/firestore";
import { getStorage, uploadBytes, getDownloadURL } from "firebase/storage";
import { FIREBASE_API_KEY } from "../apikey.js";
import { uuidv4 } from "./main.js";
import { ref } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: "word-wave-app.firebaseapp.com",
  projectId: "word-wave-app",
  storageBucket: "word-wave-app.appspot.com",
  messagingSenderId: "362869482472",
  appId: "1:362869482472:web:63d07fa6a2b9c3c243ba5d",
  measurementId: "G-8EZT8KQD0T",
};
let audioUrl;

const random_uuid = uuidv4();
const audioFilename = "audio-" + random_uuid + "-file.mp3";
console.log(audioFilename);
// Initialize Firebase
const app = initializeApp(firebaseConfig);

const storage = getStorage(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

const storageRef = ref(storage, `audio/${audioFilename}`);
const audioListRef = ref(storage, "audio/");

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
    await addUpdateNote(
      userId,
      noteId,
      "Meeting Summary",
      transcription, // Use the transcription as the content
      summary,
      "2024-06-11T10:00:00Z",
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
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:...", data);
      console.log("spoken language..", data.language);
      console.log(
        "audio text transcription",
        data.segments.map(
          (segment, index) => `${segment.speaker}: ${segment.text}`
        )
      );
      document.getElementById("text").innerText = JSON.stringify(
        data.segments
          .map((segment, index) => `${segment.speaker}: ${segment.text}`)
          .join("\n")
      );
      const transcription = data.segments
        .map((segment) => `${segment.speaker}: ${segment.text}`)
        .join("\n");

      //summarizeSegments(transcription); // Call summarizeSegments without returning its result
      return transcription; // Continue to return the transcription text
    })
    .catch((error) => {
      console.error("Error: ", error);
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

const userId = "user-" + random_uuid;
const noteId = "note-" + random_uuid;
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
  userId,
  noteId,
  title,
  content,
  summary,
  createdOn,
  lastModified
) {
  const noteRef = doc(db, "Users", userId, "Notes", noteId);
  try {
    await setDoc(
      noteRef,
      {
        title: title,
        content: content,
        summary: summary,
        createdOn: createdOn,
        lastModified: lastModified,
        // audioBlobs: [],
      },
      { merge: true }
    );
    console.log(`Note updated for ${noteId} under user ${userId}`);
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
  addUpdateUser(userId, "testuser", "testuser@example.com");
  linkAudioToNote(userId, noteId, audioUrl);
}

//Authentication code
