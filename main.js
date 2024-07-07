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

let can_record = false;
let isRecording = false;
let recorder = false;
let audioBlob = null;

let chunks = [];

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
