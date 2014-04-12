var WIDTH = $(document).width();
var PADWIDTH = WIDTH / 5;
var HEIGHT = view.size.height / 3;
var wavePath;
var points = 20;
var smooth= true;
var loaded = false;
var backgroundMultiplier = 1;
var padLayer;
var videoLayer = new Layer();

window.addEventListener('audioLoaded', drawPads, false);

function makeCircle(track, color, center, radius, offset){
  path = new Path.Circle({center: new Point(center), radius: radius});
  path.position.x += offset;
  path.strokeColor = color;
  path.fillColor = color;
  path.track = track;
  var text = new PointText(new Point(offset, center/2));
  text.fillColor = 'white';
  text.bounds = path.bounds;
  text.justification = 'center';
  text.fontSize = '16';
  text.content = track;
  text.track = track;
}

function makeRectangle(track, color, width, offset, row){
  from = new Point(offset, HEIGHT * (row - 1));
  to = new Point(offset + width, HEIGHT * row);
  var rectangle = new Rectangle(from, to);
  path = new Path.Rectangle(rectangle);
  path.fillColor = color;
  path.track = track;
  var text = new PointText(new Point(offset, width / 2));
  text.fillColor = 'white';
  text.bounds = path.bounds;
  text.justification = 'center';
  text.fontSize = '24';
  text.content = (_.invert(keys))[track];
  text.track = track;
};

function initializePath() {
  wavePath = new Path();
  wavePath.strokeColor = getRandomColor();
  center = view.center;
  width = view.size.width + view.size.width / 10;
  height = view.size.height / 2;
  wavePath.segments = [];
  wavePath.add(view.bounds.bottomLeft);
  for (var i = 1; i < points; i++) {
    var point = new Point((width / points * i) - view.size.width / 20, center.y);
    wavePath.add(point);
  }
  wavePath.add(view.bounds.bottomRight);
  wavePath.scaling = 1.2;
  loaded = true;
}

function animateBackground(){
  var freqByteData = new Uint8Array(audioAnalyser.frequencyBinCount);
  audioAnalyser.getByteFrequencyData(freqByteData);
  for (var i = 1; i < points; i++) {
    var item = wavePath.segments[i];
    var itemPoint = item.point.y;
    magnitude = freqByteData[i];
    // if((magnitude * backgroundMultiplier - 1 > itemPoint || itemPoint > magnitude * backgroundMultiplier + 1)){
      item.point.y = HEIGHT - (magnitude * backgroundMultiplier + HEIGHT / 4);
    // }
  }
  wavePath.smooth();
  wavePath.strokeColor.hue += 0.5;
}

function drawPads() {
  padLayer = new Layer();
  var counter = 0;
  $.each(sounds, function(key, value){
    // makeCircle(key, value.color, RADIUS, RADIUS, RADIUS * counter * 2);
    makeRectangle(key, value.color, PADWIDTH, PADWIDTH * (counter % 5), Math.floor(counter / 5) + 1);
    counter++;
  });
}

function changeColor(sound){
  var name = sound.track;
  var pads = padLayer.children;
  var pad = $.grep(pads, function(element, index){
    return element.track === name;
  })[0];
  // pad.fillColor = sounds[name].alternateColor;
  pad.fillColor.hue += 100;
}

function onMouseDown(event) {
  if (event.item) {
    playSound(window[event.item.track]);
    changeColor(window[event.item.track]);
  }
}

function onFrame(event){
  if (ramp){
    if (filter.frequency.value <= 100){
      clearInterval(ramp);
      ramp = null;
      filter.bypass = 1;
      filter.frequency.value = 8000;
    }
  }
}

function onKeyDown(event){
  event.preventDefault;
  if (event.key == 'space'){
    looping = !looping;
  }
  if (event.key == '1'){
    filterIt();
  }
  if (event.key == '2'){
    rampItUp();
  }
  var sample = keys[event.key];
  if (sample != undefined){
    playSound(window[sample]);
    changeColor(window[sample]);
  }
}

