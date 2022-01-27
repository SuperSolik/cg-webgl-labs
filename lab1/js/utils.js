const CANVAS_W = 1024;
const CANVAS_H = 768;

const TEMP_COLORS = {
  COLOR_1: [1, 0, 0, 1],
  COLOR_2: [0, 1, 0, 1],
  COLOR_3: [0, 0, 1, 1],
}

let TEMP_ORTHO = 3;

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