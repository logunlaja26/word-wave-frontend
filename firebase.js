import { initializeApp } from "firebase/app";
import { getFirestore, updateDoc, setDoc, doc } from "firebase/firestore";
import { getStorage, uploadBytes, getDownloadURL } from "firebase/storage";
import { uuidv4 } from "./main";
import { ref } from "firebase/storage";

const firebaseConfig = {
  apiKey: "",
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

const storageRef = ref(storage, `audio/${audioFilename}`);
const audioListRef = ref(storage, "audio/");

// Function to upload audio
export function uploadAudioToFirebase(audioBlob) {
  const audioFile = new File([audioBlob], "audio.mp3", {
    type: "audio/mpeg",
  });

  uploadBytes(storageRef, audioFile).then(async (snapshot) => {
    audioUrl = await getAudioUrl(snapshot);
    console.log("Audio URL in upload function ", audioUrl);
    console.log("uploading..");
    console.log("type of audioURL... ", typeof audioUrl);
    sendUrlToServerAndTranscribe(audioUrl);
  });
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
  fetch("http://localhost:8000/transcribe", {
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
        data.segments.map((segment, index) => segment.text)
      );
      document.getElementById("text").innerText = JSON.stringify(
        data.segments.map((segment, index) => segment.text)
      );
    })
    .catch((error) => {
      console.error("Error:....", error);
    });
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

export async function saveUserData() {
  addUpdateUser(userId, "testuser", "testuser@example.com");
  addUpdateNote(
    userId,
    noteId,
    "Meeting Summary",
    "Here's a detailed summary of the meeting held on...",
    "2024-06-10T10:00:00Z",
    "2024-06-10T15:00:00Z"
  );
  linkAudioToNote(userId, noteId, audioUrl);
}
