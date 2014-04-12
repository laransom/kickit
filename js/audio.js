var lastCalled = Date.now();
var blue = '#4765b5';
var alternateBlue = '#7b46b2';
var purple = '#bd4ba3';
var alternatePurple = '#bc494a';
var gold = '#c3a452';
var alternateGold = '#8ac24f';
var darkGreen = '#59c972';
var alternateDarkGreen = '#56c9c8';
var lightGreen = '#60cf79';
var alternateLightGreen = '#5dcece';
var sounds = {
  'synth_1': {color: alternateBlue, type: 'synth'},
  'synth_2': {color: alternatePurple, type: 'synth'},
  'synth_3': {color: alternateGold, type: 'synth'},
  'synth_4': {color: alternateDarkGreen, type: 'synth'},
  'synth_5': {color: alternateLightGreen, type: 'synth'},
  'bass_1': {color: getRandomColor(), type: 'bass'},
  'bass_2': {color: getRandomColor(), type: 'bass'},
  'bass_3': {color: getRandomColor(), type: 'bass'},
  'bass_4': {color: getRandomColor(), type: 'bass'},
  'bass_5': {color: getRandomColor(), type: 'bass'},
  'kick': {color: blue, type: 'drum'}, 
  'snare': {color: purple, type: 'drum'}, 
  'clap': {color: gold, type: 'drum'}, 
  'hi_hat': {color: darkGreen, type: 'drum'}, 
  'snap': {color: lightGreen, type: 'drum'}
} 
var playingSounds = [];
var loadedSounds = [];
var synthPlaying = false;
var bassPlaying = false;
var nextBass;
var currentLoops = {synth: null, bass: null};
var looping = false;
var clap,
    snap,
    hi_hat,
    hi_tom,
    kick,
    low_tom,
    snare,
    synth_1,
    synth_2,
    synth_3,
    synth_4,
    synth_5,
    nextSynth,
    ramp;
var audioLoaded = new Event('audioLoaded');

function getFiles(){
  var soundFiles = [];
  $.each(sounds, function(key, value){
    soundFiles.push('../audio/' + key + '.ogg')
  });
  return soundFiles;
}

function Track(name, buffer) {
  this.track = name;
  this.buffer = buffer;
  this.type = sounds[name].type;
}

window.AudioContext = window.AudioContext||window.webkitAudioContext;
var audioContext = new AudioContext();
var tuna = new Tuna(audioContext);
var audioAnalyser;
var submix;
var bufferLoader;

window.addEventListener('load', audioInit, false);

function audioInit() {
  submix = audioContext.createGain();
  audioAnalyser = audioContext.createAnalyser();
  audioAnalyser.smoothingTimeConstant = 0.85;
  submix.connect(filter.input);
  filter.connect(audioContext.destination);

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
  loaded = true;
}

function loopPlaying(track, force){
  if (!(track.type === 'synth' || track.type === 'bass')){
    return false;
  }
  if (!force){
    if (synthPlaying || bassPlaying){
      queueTrack(track);
      return true;
    }
  } else {
    return false;
  }
}

function queueTrack(track){
  switch(track.type){
    case 'synth':
      nextSynth = track;
      break;
    case 'bass':
      nextBass = track;
      break;
    default:
  }
}

function playSound(track, force) {
  if (loopPlaying(track, force)){
    return true;
  }
  var buffer = track.buffer;
  var source = audioContext.createBufferSource(); // creates a sound source
  source.buffer = buffer;                    // tell the source which sound to play
  source.connect(submix);       // connect the source to the context's destination (the speakers)
  source.type = track.type;
  if (source.type === 'synth'){
    synthPlaying = true;
    currentLoops.synth = track;
  } else if (source.type === 'bass'){
    bassPlaying = true;
    currentLoops.bass = track;
  }
  source.onended = function(){finishedPlaying(source)};
  source.start(0);                           // play the source now
  playingSounds.push(source);
}

function loopOver(){
  synthPlaying = false;
  bassPlaying = false;
  if (looping){
    if (currentLoops.synth === nextSynth){
      nextSynth = null;
    } else {
      nextSynth = nextSynth ? nextSynth : currentLoops.synth;
    }
    if (currentLoops.bass === nextBass){
      nextBass = null;
    } else {
      nextBass = nextBass ? nextBass : currentLoops.bass;
    }
  }
  currentLoops.synth = null;
  currentLoops.bass = null;
  if (nextSynth){
    playSound(nextSynth, true);
    nextSynth = null;
  }
  if (nextBass){
    playSound(nextBass, true);
    nextBass = null;
  }
}
function finishedPlaying(source){
  if (source.type === 'synth' || source.type === 'bass'){
    playingSounds.forEach(function(source){
      source.stop();
    });
    if (Date.now() - lastCalled > 100){
      loopOver();
    }
    lastCalled = Date.now();
    playingSounds = [];
  }
};

function getRandomColor() {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
    color += letters[Math.round(Math.random() * 15)];
  }
  return color;
}

function filterIt() {
  filter.bypass = 1 - filter.bypass;
}

function rampItUp() {
  filter.bypass = 0;
  ramp = setInterval(function(){
    filter.frequency.value -= 50;
  }, 10);
}


var filter = new tuna.Filter({
  frequency: 8000,         //20 to 22050
  Q: 1,                  //0.001 to 100
  gain: 0,               //-40 to 40
  filterType: 0,         //0 to 7, corresponds to the filter types in the native filter node: lowpass, highpass, bandpass, lowshelf, highshelf, peaking, notch, allpass in that order
  bypass: 1
});
