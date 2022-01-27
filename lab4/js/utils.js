const CANVAS_W = 1024;
const CANVAS_H = 768;

const СOLORS = {
  WOOD : [139 / 255, 69 / 256, 19 / 256, 1],
  GLASS: [135 / 256, 206 / 256, 250 / 256, 1],
}

const PERSPECTIVE = {
  ORTHO: 1,
  PROJECTION: 0,
}

const viewState = {
  scale: 0.6,
  translate: {
    x: 0,
    y: 0,
    z: 0,
  },
  eye: {
    x: 0,
    y: 0,
    z: 7.5
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
    x: 0.4,
    y: 0.4,
  },
  mouse: {
    dragging: false,
    lastX: -1,
    lastY: -1
  },
  light: {
    ambient: [1, 1, 1],
    diffuse: [0.1, 0.1, 0.1],
  },
  pressedKeys: {}
};

let ORTHO_K = 3;
let currentPerspective = PERSPECTIVE.PERSPECTIVE;
let useLighting = false;

function setUniformVariables(gl, programInfo, uniformData) {
  if(uniformData.texture){
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, uniformData.texture);
    gl.uniform1i(programInfo.uniformLocations.uTexture, 0);
  }

  gl.uniform4fv(programInfo.uniformLocations.vertexColor, uniformData.color);
  const l = programInfo.uniformLocations.lights;

  for(let i in l){
    gl.uniform3fv(l[i].ambient, uniformData.lights[i].ambient);
    gl.uniform3fv(l[i].diffuse, uniformData.lights[i].diffuse);
    gl.uniform3fv(l[i].position, uniformData.lights[i].position);
  }

  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    uniformData.projectionMatrix
  );
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    uniformData.modelViewMatrix
  );
}

function loadTexture(gl, url){
  // Create a texture.
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // Fill the texture with a 1x1 blue pixel.
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                new Uint8Array([0, 0, 255, 255]));
  // Asynchronously load an image
  var image = new Image();
  image.src = url;
  image.addEventListener('load', function() {
    // Now that the image has loaded make copy it to the texture.
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
    //infinite texture
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    var ext = (
      gl.getExtension('EXT_texture_filter_anisotropic') ||
      gl.getExtension('MOZ_EXT_texture_filter_anisotropic') ||
      gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic')
    );
    if (ext){
      gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, 16);
    }
    //
    gl.generateMipmap(gl.TEXTURE_2D);
    console.log(`Texture from "${url}" loaded`)
  });
  return texture;
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
    // console.log(viewState.angle.x, viewState.angle.y);
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