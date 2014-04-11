window.addEventListener('audioLoaded', drawPads, false);

function makeCircle(track, center, radius, offset){
  path = new Path.Circle({center: new Point(center), radius: radius});
  path.position.x += offset;
  path.strokeColor = getRandomColor();
  path.fillColor = getRandomColor();
  path.track = track;
}

function drawPads() {
  sounds.forEach(function(sound, counter){
    makeCircle(sound, 75, 75, 75 * counter * 2);
  });
}

function getRandomColor() {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
    color += letters[Math.round(Math.random() * 15)];
  }
  return color;
}

function onMouseDown(event) {
  if (event.item)
    playSound(window[event.item.track]);
}


function onFrame(event){
}
