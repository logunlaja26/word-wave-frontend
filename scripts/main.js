import { uploadAudioToFirebase, saveUserData } from "./firebase.js";
import { signOut } from "firebase/auth";
import { auth } from "./util.js";

export function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const record = document.getElementById("record");
//const transcribeBtn = document.getElementById("transcribe-btn");
const transcribeBtn19 = document.getElementById("transcribe-btn-19");
const spinner = document.getElementById("spinner");
const stopButton = document.getElementById("stopButton");
const playButton = document.getElementById("playButton");
const audio = document.getElementById("audio");
const user = document.getElementById("user-btn");
const controls = document.getElementById("timer");
const logout = document.getElementById("logout-btn");
const contact = document.getElementById("contact-btn");

let can_record = false;
let isRecording = false;
let recorder = false;
let audioBlob = null;

let chunks = [];

const FULL_DASH_ARRAY = 283;

const COLOR_CODES = {
  info: {
    color: "red",
  },
};

let remainingPathColor = COLOR_CODES.info.color;

const TIME_LIMIT = 1200;

// Initially, no time has passed, but this will count up
// and subtract from the TIME_LIMIT
let timePassed = 0;
let timeLeft = TIME_LIMIT;
let timerInterval = null;

function setupAudio() {
  console.log("setupAudio...");
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(SetupStream)
      .catch((err) => {
        console.log(err);
      });
  }
}

function SetupStream(stream) {
  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (e) => {
    chunks.push(e.data);
  };

  recorder.onstop = () => {
    audioBlob = new Blob(chunks, { type: "audio/mpeg" });
    const audioUrl = URL.createObjectURL(audioBlob);
    audio.src = audioUrl;
    //audio.play();
  };
  can_record = true;
}

setupAudio();

function startRecording() {
  isRecording = true;
  recorder.start();
  startTimer();
  console.log("recording has started....");
  record.classList.add("animate");
  transcribeBtn19.classList.add("button19-disabled");
  transcribeBtn19.disabled = true; // Disable the button for interactions

  //stopButton.disabled = false;
  playButton.disabled = true;
}

function stopRecording() {
  isRecording = false;
  recorder.stop();
  clearInterval(timerInterval); // Clear the existing timer interval
  timePassed = 0; // Reset the time passed
  timeLeft = TIME_LIMIT; // Reset the time left
  document.getElementById("base-timer-label").innerHTML = formatTime(timeLeft); // Update the timer label
  setCircleDasharray(); // Reset the circle dasharray
  console.log("recording has stopped.....");
  record.classList.remove("animate");
  transcribeBtn19.classList.remove("button19-disabled");
  transcribeBtn19.disabled = false; // Enable the button for interactions
  //stopButton.disabled = true;
  playButton.disabled = false;
}

function playRecordedAudio() {
  audio.play();
}

function pauseRecordedAudio() {
  audio.pause();
}

function stopRecordedAudio() {
  stopRecording();
}

export const newNoteId = "note-" + uuidv4(); // Generate a new note ID

function uploadAudioAndSaveData() {
  transcribeBtn19.disabled = true; // Disable the button to prevent multiple clicks
  transcribeBtn19.classList.add("button19-disabled");
  spinner.style.display = "block";
  //const newNoteId = "note-" + uuidv4(); // Generate a new note ID
  const audioFilename = "audio-" + uuidv4() + "-file.mp3";
  console.log("audio file name..", audioFilename);
  uploadAudioToFirebase(audioBlob, audioFilename)
    .then((audioUrl) => {
      // Now that we have the audio URL, we can save the user data
      saveUserData(audioUrl); // Pass the audioUrl to saveUserData if needed
    })
    .catch((error) => {
      console.error("Error uploading audio or saving data:", error);
    })
    .finally(() => {
      resetRecordingState(); // Reset the recording state
      spinner.style.display = "none";
      transcribeBtn19.disabled = false; // Re-enable the button after the response is received
      transcribeBtn19.classList.remove("button19-disabled");
    });
}

function resetRecordingState() {
  audioBlob = null; // Clear the audio content
  chunks = []; // Clear the recorded chunks
  audio.src = ""; // Clear the audio element source
  console.log("Recording state has been reset.");
}

function toggleRecording() {
  if (!can_record) return;
  isRecording = !isRecording;
  if (isRecording) {
    startRecording();
  } else {
    stopRecordedAudio();
  }
}

function formatTime(time) {
  // The largest round integer less than or equal to the result of time divided being by 60.
  const minutes = Math.floor(time / 60);

  // Seconds are the remainder of the time divided by 60 (modulus operator)
  let seconds = time % 60;

  // If the value of seconds is less than 10, then display seconds with a leading zero
  if (seconds < 10) {
    seconds = `0${seconds}`;
  }

  // The output in MM:SS format
  return `${minutes}:${seconds}`;
}

function startTimer() {
  timerInterval = setInterval(() => {
    // The amount of time passed increments by one
    timePassed = timePassed += 1;
    timeLeft = TIME_LIMIT - timePassed;

    // The time left label is updated
    document.getElementById("base-timer-label").innerHTML =
      formatTime(timeLeft);

    setCircleDasharray();

    // Check if timeLeft is zero and stop recording if it is
    if (timeLeft <= 0) {
      stopRecording();
    }
  }, 1000);
}

// Divides time left by the defined time limit.
function calculateTimeFraction() {
  return timeLeft / TIME_LIMIT;
}

// Update the dasharray value as time passes, starting with 283
function setCircleDasharray() {
  const circleDasharray = `${(
    calculateTimeFraction() * FULL_DASH_ARRAY
  ).toFixed(0)} 283`;
  document
    .getElementById("base-timer-path-remaining")
    .setAttribute("stroke-dasharray", circleDasharray);
}

controls.innerHTML = `
<div class="base-timer">
  <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g class="base-timer__circle">
      <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
    </g>
  </svg>
  <span id="base-timer-label" class="base-timer__label">
    ${formatTime(timeLeft)}
  </span>
</div>
`;

controls.innerHTML = `
<div class="base-timer">
  <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g class="base-timer__circle">
      <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
      <path
        id="base-timer-path-remaining"
        stroke-dasharray="283"
        class="base-timer__path-remaining ${remainingPathColor}"
        d="
          M 50, 50
          m -45, 0
          a 45,45 0 1,0 90,0
          a 45,45 0 1,0 -90,0
        "
      ></path>
    </g>
  </svg>
  <span id="base-timer-label" class="base-timer__label">
    ${formatTime(timeLeft)}
  </span>
</div>
`;

record.addEventListener("click", toggleRecording);
playButton.addEventListener("click", playRecordedAudio);
transcribeBtn19.addEventListener("click", uploadAudioAndSaveData);
document.getElementById("notes-btn").addEventListener("click", () => {
  // Update the URL to /notes
  history.pushState(null, null, "/notes");
  window.location.href = "notes.html";
});

document.getElementById("contact-btn").addEventListener("click", () => {
  // Update the URL to /notes
  history.pushState(null, null, "/contact");
  window.location.href = "contact.html";
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
