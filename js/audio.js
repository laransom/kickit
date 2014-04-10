var sounds = ['clap', 'crash', 'hi_hat', 'hi_tom', 'kick', 'low_tom', 'snare'];
var loadedSounds = [];
var loaded = false;

function getFiles(){
  var soundFiles = [];
  for(var i = 0; i < sounds.length; i++){
    soundFiles.push('../audio/' + sounds[i] + '.ogg')
  }
  return soundFiles;
}

function Track(name, buffer) {
  this.track = name;
  this.audio = audioContext.createBufferSource();
  this.audio.loop = true;
  this.audio.buffer = buffer;
  this.audio.gain.value = 1;
  this.audio.connect(submix);
}

var audioContext;
var audioAnalyser;
var submix;
var bufferLoader;

window.addEventListener('load', init, false);

function init() {
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
    loadedSounds.push(new Track(bufferList[i].name, bufferList[i]));
  }
  loadedSounds.forEach(function(sound){
    sound.audio.start(0);
  });
  loaded = true;
  // makeMusic();
}

// function makeMusic(){
//   loadedSounds.forEach(function(sound){
//     if($.inArray(sound.track, playOrder[currentStage]) != -1){
//       sound.audio.gain.value = 1;
//     }
//   })
// }
