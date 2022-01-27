// let projectionType = 'ortho';

function initWebGL(canvas) {
  gl = null;

  try {
    // Попытаться получить стандартный контекст. Если не получится, попробовать получить экспериментальный.
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    gl.canvas.witdh = CANVAS_W;
    gl.canvas.height = CANVAS_H;
  }
  catch(e) {}

  // Если мы не получили контекст GL, завершить работу
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
    gl = null;
  } 

  return gl;
}

function getShader(gl, id) {
  var shaderScript, theSource, currentChild, shader;

  shaderScript = document.getElementById(id);

  if (!shaderScript) {
    return null;
  }

  theSource = "";
  currentChild = shaderScript.firstChild;

  while(currentChild) {
    if (currentChild.nodeType == currentChild.TEXT_NODE) {
      theSource += currentChild.textContent;
    }

    currentChild = currentChild.nextSibling;
  }

  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
     // неизвестный тип шейдера
     return null;
  }

  gl.shaderSource(shader, theSource);

  // скомпилировать шейдерную программу
  gl.compileShader(shader);

  // Проверить успешное завершение компиляции
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
      return null;
  }

  return shader;
}

function initShaders(gl) {
  var fragmentShader = getShader(gl, "shader-fs");
  var vertexShader = getShader(gl, "shader-vs");

  // создать шейдерную программу

  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // Если создать шейдерную программу не удалось, вывести предупреждение

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Unable to initialize the shader program.");
  }

  // gl.useProgram(shaderProgram);

  // vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  // gl.enableVertexAttribArray(vertexPositionAttribute);
  return shaderProgram;
}


function coneVertices(cx, cy, cz, r, h, n=10){
  const vertices = [];
  vertices.push(...[cx, cy + h, cz]);
  for(let angle = 0.0; angle <= 2 * Math.PI; angle += Math.PI / n){
    vertices.push(...[cx + Math.sin(angle) * r, cy, cz + Math.cos(angle) * r])
  }  
  return vertices;
}

function cilinderVertices(cx, cy, cz, r, h, n=10){
  const vertices = [];
  for(let angle = 0.0; angle <= 2 * Math.PI; angle += Math.PI / n){
    vertices.push(...[cx + Math.sin(angle) * r, cy, cz + Math.cos(angle) * r])
    vertices.push(...[cx + Math.sin(angle) * r, cy + h, cz + Math.cos(angle) * r])
  }  
  return vertices;
}

function createFigures(gl) {
  glass_r = 1
  col_r = 0.25
  top_r = 1.65



  //hourglass
  const vertices1 = coneVertices(0.0, -2, 0.0, glass_r, 2);
  const vertices2 = coneVertices(0.0, -2, 0.0, glass_r, -0.4);
  const vertices3 = coneVertices(0.0, 2, 0.0, glass_r, -2);
  const vertices4 = coneVertices(0.0, 2, 0.0, glass_r, 0.4);

  //columns 
  const vertices5 = cilinderVertices(-1, -2.2, -1, col_r, 4.4);
  const vertices6 = cilinderVertices(-1, -2.2, 1, col_r, 4.4);
  const vertices7 = cilinderVertices(1, -2.2, -1, col_r, 4.4);
  const vertices8 = cilinderVertices(1, -2.2, 1, col_r, 4.4);
  
  //top cillinder 
  const vertices9 = cilinderVertices(0, 2.2, 0, top_r, 0.4);

  //bottom cillinder 
  const vertices10 = cilinderVertices(0, -2.2, 0, top_r, -0.4);

  //top cillinder caps
  const vertices11 = coneVertices(0.0, 2.2, 0.0, top_r, 0);
  const vertices12 = coneVertices(0.0, 2.2 + 0.4, 0.0, top_r, 0);

  //bottom cillinder caps
  const vertices13 = coneVertices(0.0, -2.2, 0.0, top_r, 0);
  const vertices14 = coneVertices(0.0, -2.2 - 0.4, 0.0, top_r, 0);

  // var colors = [
  //   1.0,  1.0,  1.0,  1.0,    // white
  //   1.0,  0.0,  0.0,  1.0,    // red
  //   0.0,  1.0,  0.0,  1.0,    // green
  //   0.0,  0.0,  1.0,  1.0,    // blue
  // ] ;
  
  var colors1 = Array(vertices1.length / 3).fill(TEMP_COLORS.COLOR_3).flat();
  var colors2 = Array(vertices2.length / 3).fill(TEMP_COLORS.COLOR_3).flat();
  var colors3 = Array(vertices3.length / 3).fill(TEMP_COLORS.COLOR_3).flat();
  var colors4 = Array(vertices4.length / 3).fill(TEMP_COLORS.COLOR_3).flat();
  var colors1 = Array(vertices1.length / 3).fill(TEMP_COLORS.COLOR_3).flat();
  var colors5 = Array(vertices5.length / 3).fill(TEMP_COLORS.COLOR_1).flat();
  var colors6 = Array(vertices6.length / 3).fill(TEMP_COLORS.COLOR_1).flat();
  var colors7 = Array(vertices7.length / 3).fill(TEMP_COLORS.COLOR_1).flat();
  var colors8 = Array(vertices8.length / 3).fill(TEMP_COLORS.COLOR_1).flat();
  var colors9 = Array(vertices9.length / 3).fill(TEMP_COLORS.COLOR_2).flat();
  var colors10 = Array(vertices10.length / 3).fill(TEMP_COLORS.COLOR_2).flat();
  var colors11 = Array(vertices11.length / 3).fill(TEMP_COLORS.COLOR_2).flat();
  var colors12 = Array(vertices12.length / 3).fill(TEMP_COLORS.COLOR_2).flat();
  var colors13 = Array(vertices13.length / 3).fill(TEMP_COLORS.COLOR_2).flat();
  var colors14 = Array(vertices14.length / 3).fill(TEMP_COLORS.COLOR_2).flat();

  return {
    cone1: new DrawObject(gl, vertices1, colors1, gl.TRIANGLE_FAN),
    cone2: new DrawObject(gl, vertices2, colors2, gl.TRIANGLE_FAN),
    cone3: new DrawObject(gl, vertices3, colors3, gl.TRIANGLE_FAN),
    cone4: new DrawObject(gl, vertices4, colors4, gl.TRIANGLE_FAN),
    cone5: new DrawObject(gl, vertices11, colors11, gl.TRIANGLE_FAN),
    cone6: new DrawObject(gl, vertices12, colors12, gl.TRIANGLE_FAN),
    cone7: new DrawObject(gl, vertices13, colors13, gl.TRIANGLE_FAN),
    cone8: new DrawObject(gl, vertices14, colors14, gl.TRIANGLE_FAN),
    cillinder1: new DrawObject(gl, vertices5, colors5, gl.TRIANGLE_STRIP),
    cillinder2: new DrawObject(gl, vertices6, colors6, gl.TRIANGLE_STRIP),
    cillinder3: new DrawObject(gl, vertices7, colors7, gl.TRIANGLE_STRIP),
    cillinder4: new DrawObject(gl, vertices8, colors8, gl.TRIANGLE_STRIP),
    cillinder5: new DrawObject(gl, vertices9, colors9, gl.TRIANGLE_STRIP),
    cillinder6: new DrawObject(gl, vertices10, colors10, gl.TRIANGLE_STRIP),    
  }
}

function drawScene(gl, programInfo, figures) {  
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // Tell WebGL to use our program when drawing
  gl.useProgram(programInfo.program);

  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 1;
  const zFar = 500;
  const projectionMatrix = mat4.create();

  // mat4.perspective(projectionMatrix,
  //   fieldOfView,
  //   aspect,
  //   zNear,
  //   zFar);

  mat4.ortho(projectionMatrix, -aspect * TEMP_ORTHO, aspect * TEMP_ORTHO, -TEMP_ORTHO, TEMP_ORTHO, zNear, zFar);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix = mat4.create();

  const cameraMatrix = mat4.create();
  // mat4.fromRotation(cameraMatrix, -Math.PI / 5, [0, 1, 0]);
  // mat4.rotate(cameraMatrix, cameraMatrix, Math.PI / 4, [0, 1, 1]);
  mat4.translate(cameraMatrix, cameraMatrix, [0, 0, 8]);
  
  // Make a view matrix from the camera matrix
  mat4.invert(modelViewMatrix, cameraMatrix);
  mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, 0])

  for(const [_, f] of Object.entries(figures)){
    f.setProjectionMatrix(projectionMatrix);
    f.setModelViewMatrix(modelViewMatrix);
    f.draw(gl, programInfo);
  }
}

window.onload = () => {
  const canvas = document.getElementById("glcanvas");
  const form = document.getElementById('colorForm');

  gl = initWebGL(canvas);      // инициализация контекста GL

  // продолжать только если WebGL доступен и работает

  if (!gl) return;
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);                      // установить в качестве цвета очистки буфера цвета чёрный, полная непрозрачность
  // gl.enable(gl.CULL_FACE);
  // gl.cullFace(gl.FRONT_BACK);
  gl.enable(gl.DEPTH_TEST);                               // включает использование буфера глубины
  gl.depthFunc(gl.LEQUAL);                                // определяет работу буфера глубины: более ближние объекты перекрывают дальние
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);      // очистить буфер цвета и буфер глубины.

  console.log("WebGL initialized")

  let shaderProgram = initShaders(gl);
  let programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    },
  };
  
  form.addEventListener('submit', (event) => {
    t = event.target;
    event.preventDefault();
    const colorToChange = t.id_select.value;
    const colorR = t.id_select_color_r.value;
    const colorG = t.id_select_color_g.value;
    const colorB = t.id_select_color_b.value;
    const colorA = t.id_select_color_a.value;
    const dist = t.id_select_dist.value;
    TEMP_COLORS[colorToChange] = [parseInt(colorR) / 256, parseInt(colorG) / 256, parseInt(colorB) / 256, parseInt(colorA) / 256]
    TEMP_ORTHO = parseInt(dist);
    drawScene(gl, programInfo, createFigures(gl));
  });

  let figures = createFigures(gl);
  drawScene(gl, programInfo, figures);
}