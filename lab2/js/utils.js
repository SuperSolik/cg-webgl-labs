const CANVAS_W = 1024;
const CANVAS_H = 768;

const COLORS = {
  COLUMNS: [1, 0, 0, 1],
  CAPS: [0, 1, 0, 1],
  GLASS: [0, 0, 1, 1],
}

const PERSPECTIVE = {
  ORTHO: 1,
  PROJECTION: 0,
}

const viewState = {
  scale: 1.0,
  translate: {
    x: 0,
    y: 0,
    z: 0,
  },
  eye: {
    x: 0,
    y: 0,
    z: 8
  },
  center: {
    x: 0,
    y: 0,
    z: 0,
  },
  up: {
    x: 0,
    y: 1,
    z: 0
  },
  angle: {
    x: 0,
    y: 0,
  },
  mouse: {
    dragging: false,
    lastX: -1,
    lastY: -1
  },
  pressedKeys: {}
};

let ORTHO_K = 3;
let currentPerspective = PERSPECTIVE.ORTHO;

function setMatrixUniforms(gl, programInfo, projectionMatrix, modelViewMatrix){
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix
  );
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix
  );
}

function mousedown(event) {
  var x = event.clientX;
  var y = event.clientY;
  var rect = event.target.getBoundingClientRect();
  // If we're within the rectangle, mouse is down within canvas.
  if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
    viewState.mouse.lastX = x;
    viewState.mouse.lastY = y;
    viewState.mouse.dragging = true;
  }
}

function mouseup(event) {
  viewState.mouse.dragging = false;
}

function mousemove(event) {
  var x = event.clientX;
  var y = event.clientY;
  if (viewState.mouse.dragging) {
    // The rotation speed factor
    // dx and dy here are how for in the x or y direction the mouse moved
    var rect = event.target.getBoundingClientRect();
    var factor = 5 / (rect.bottom - rect.top);
    var dx = factor * (x - viewState.mouse.lastX);
    var dy = factor * (y - viewState.mouse.lastY);

    // update the latest angle
    viewState.angle.x = viewState.angle.x + dy;
    viewState.angle.y = viewState.angle.y + dx;
  }
  // update the last mouse position
  viewState.mouse.lastX = x;
  viewState.mouse.lastY = y;
}

function mousewheel(event){
  event.preventDefault();
  viewState.scale += event.deltaY * 0.0005;
  viewState.scale = Math.min(Math.max(.125, viewState.scale), 1);
}

function keydown(event) {
  viewState.pressedKeys[event.keyCode] = true;
}

function keyup(event) {
  viewState.pressedKeys[event.keyCode] = false;
}