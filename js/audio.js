var sounds = ['kick', 'snare', 'clap', 'hi_hat', 'crash', 'hi_tom', 'low_tom'];
var loadedSounds = [];
var clap,
    crash,
    hi_hat,
    hi_tom,
    kick,
    low_tom,
    snare;
var audioLoaded = new Event('audioLoaded');

function getFiles(){
  var soundFiles = [];
  for(var i = 0; i < sounds.length; i++){
    soundFiles.push('../audio/' + sounds[i] + '.ogg')
  }
  return soundFiles;
}

function Track(name, buffer) {
  this.track = name;
  this.buffer = buffer;
}

var audioContext;
var audioAnalyser;
var submix;
var bufferLoader;

window.addEventListener('load', audioInit, false);

function audioInit() {
  window.AudioContext = window.AudioContext||window.webkitAudioContext;
  audioContext = new AudioContext();
  submix = audioContext.createGain();
  audioAnalyser = audioContext.createAnalyser();
  audioAnalyser.smoothingTimeConstant = 0.85;
  submix.connect(audioAnalyser);
  audioAnalyser.connect(audioContext.destination);

  bufferLoader = new BufferLoader(
    audioContext,
    getFiles(),
    finishedLoading
  );

  bufferLoader.load();
}

function finishedLoading(bufferList){
  for(var i=0;i<bufferList.length;i++){
    window[bufferList[i].name] = new Track(bufferList[i].name, bufferList[i]);
  }
  window.dispatchEvent(audioLoaded);
}

function playSound(track) {
  var buffer = track.buffer;
  var source = audioContext.createBufferSource(); // creates a sound source
  source.buffer = buffer;                    // tell the source which sound to play
  source.connect(submix);       // connect the source to the context's destination (the speakers)
  source.start(0);                           // play the source now
}

// function makeMusic(){
//   loadedSounds.forEach(function(sound){
//     if($.inArray(sound.track, playOrder[currentStage]) != -1){
//       sound.audio.gain.value = 1;
//     }
//   })
// }
