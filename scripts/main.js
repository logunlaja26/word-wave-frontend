import { uploadAudioToFirebase, saveUserData } from "./firebase.js";

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
const playPauseBtn = document.getElementById("playPauseBtn");
const controls = document.getElementById("timer");

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
  // transcribeBtn.classList.add("button-disabled");
  // transcribeBtn.disabled = true; // Disable the button for interactions
  transcribeBtn19.classList.add("button19-disabled");
  transcribeBtn19.disabled = true; // Disable the button for interactions
  spinner.style.display = "block";

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
  // transcribeBtn.classList.remove("button-disabled");
  // transcribeBtn.disabled = false; // Enable the button for interactions
  transcribeBtn19.classList.remove("button19-disabled");
  transcribeBtn19.disabled = false; // Enable the button for interactions
  spinner.style.display = "none";

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

function uploadAudioAndSaveData() {
  uploadAudioToFirebase(audioBlob)
    .then((audioUrl) => {
      // Now that we have the audio URL, we can save the user data
      saveUserData(audioUrl); // Pass the audioUrl to saveUserData if needed
    })
    .catch((error) => {
      console.error("Error uploading audio or saving data:", error);
    });
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

function playpause() {
  console.log(
    "play attempt, current state:",
    audio.paused ? "paused" : "playing"
  );
  if (audio.paused) {
    audio.play();
    playPauseBtn.innerHTML = '<i class="fa fa-pause"></i>';
  } else {
    audio.pause();
    playPauseBtn.innerHTML = '<i class="fa fa-play"></i>';
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
//stopButton.addEventListener("click", stopRecordedAudio);
//transcribeBtn.addEventListener("click", uploadAudioAndSaveData);
transcribeBtn19.addEventListener("click", uploadAudioAndSaveData);
//user.addEventListener("click", addNewUser);
//user.addEventListener("click", saveUserData);
playPauseBtn.addEventListener("click", playpause);

audio.addEventListener("ended", () => {
  playPauseBtn.innerHTML = '<i class="fa fa-play"></i>';
});

document.getElementById("logoutButton").addEventListener("click", function () {
  window.location.href = "login.html";
});
