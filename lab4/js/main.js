// let projectionType = 'ortho';

function initWebGL(canvas) {
  gl = null;

  try {
    // Попытаться получить стандартный контекст. Если не получится, попробовать получить экспериментальный.
    gl = canvas.getContext("webgl", {antialias: true}) || canvas.getContext("experimental-webgl", {antialias: true});
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

function initShaders(gl, vertexShaderId, fragmentShaderId) {
  var vertexShader = getShader(gl, vertexShaderId);
  var fragmentShader = getShader(gl, fragmentShaderId);

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


function coneVertices(cx, cy, cz, r, h, n=20){
  let vertices = [];
  let normals = []

  const slant = Math.atan2(r, Math.abs(h));
  const cosSlant = Math.cos(slant);
  const sinSlant = Math.sin(slant);

  vertices.push(...[cx, cy + h, cz]);
  normals.push(...[0, 1, 0]);
  let sin;
  let cos;
  for(let angle = 0.0; angle <= 2 * Math.PI; angle += Math.PI / n){
    sin = Math.sin(angle);
    cos = Math.cos(angle);
    vertices.push(...[cx + sin * r, cy, cz + cos * r])
    normals.push(...[sin * cosSlant, sinSlant, cos * cosSlant]);
  }  
  return [vertices, normals];
}

function cilinderVertices(cx, cy, cz, r, h, n=10){
  let vertices = [];
  let normals = [];
  for(let angle = 0.0; angle <= 2 * Math.PI; angle += Math.PI / n){
    vertices.push(...[cx + Math.sin(angle) * r, cy, cz + Math.cos(angle) * r])
    vertices.push(...[cx + Math.sin(angle) * r, cy + h, cz + Math.cos(angle) * r])
    normals.push(...[Math.sin(angle), 0, Math.cos(angle)]);
    normals.push(...[Math.sin(angle), 0, Math.cos(angle)]);
  }  
  return [vertices, normals];
}

function createFigures(gl, programs) {
  glass_r = 1
  col_r = 0.25
  top_r = 1.65

  //hourglass
  const [vertices1, normals1] = coneVertices(0.0, -2, 0.0, glass_r, 2);
  const [vertices2, normals2] = coneVertices(0.0, -2, 0.0, glass_r, -0.4);
  const [vertices3, normals3] = coneVertices(0.0, 2, 0.0, glass_r, -2);
  const [vertices4, normals4] = coneVertices(0.0, 2, 0.0, glass_r, 0.4);

  //columns 
  const [vertices5, normals5] = cilinderVertices(-1, -2.2, -1, col_r, 4.4);
  const [vertices6, normals6] = cilinderVertices(-1, -2.2, 1, col_r, 4.4);
  const [vertices7, normals7] = cilinderVertices(1, -2.2, -1, col_r, 4.4);
  const [vertices8, normals8] = cilinderVertices(1, -2.2, 1, col_r, 4.4);
  
  //top cillinder 
  const [vertices9, normals9] = cilinderVertices(0, 2.2, 0, top_r, 0.4);

  //bottom cillinder 
  const [vertices10, normals10] = cilinderVertices(0, -2.2, 0, top_r, -0.4);

  //top cillinder caps
  const [vertices11, normals11] = coneVertices(0.0, 2.2, 0.0, top_r, 0);
  const [vertices12, normals12] = coneVertices(0.0, 2.2 + 0.4, 0.0, top_r, 0);

  //bottom cillinder caps
  const [vertices13, normals13] = coneVertices(0.0, -2.2, 0.0, top_r, 0);
  const [vertices14, normals14] = coneVertices(0.0, -2.2 - 0.4, 0.0, top_r, 0);

  const board_y = -2.61;
  const board_k = 1200;

  const chessBoardsVertices = [
    -board_k, board_y, -board_k,
    -board_k, board_y, board_k,
    board_k, board_y, -board_k,
    board_k, board_y, board_k,
  ]

  const chessBoardsNormals = [
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
  ]

  const chessBoardTexCoords = [
    0.0,  0.0,
    0.0,  board_k / 10,
    board_k / 10,  0.0,
    board_k / 10,  board_k / 10,
  ]

  const chessBoard = new DrawObject(gl, chessBoardsVertices, chessBoardsNormals, gl.TRIANGLE_STRIP);
  chessBoard.setTexture(chessBoardTexCoords, loadTexture(gl, 'images/chessboard.jpg'))

  const chessBoardsVertices2 = [
    -board_k, -board_y * 2, -board_k,
    -board_k, -board_y * 2, board_k,
    board_k, -board_y * 2, -board_k,
    board_k, -board_y * 2, board_k,
  ]

  const chessBoard2 = new DrawObject(gl, chessBoardsVertices2, chessBoardsNormals, gl.TRIANGLE_STRIP);
  chessBoard2.setTexture(chessBoardTexCoords, loadTexture(gl, 'images/chessboard.jpg'))

  const sceneObjects = {
    glass: {
      figures: [
        new DrawObject(gl, vertices1, normals1, gl.TRIANGLE_FAN),
        new DrawObject(gl, vertices2, normals2, gl.TRIANGLE_FAN),
        new DrawObject(gl, vertices3, normals3, gl.TRIANGLE_FAN),
        new DrawObject(gl, vertices4, normals4, gl.TRIANGLE_FAN),
      ],
      color: СOLORS.GLASS,
      programInfo: programs.color,
    },
    wood: {
      figures: [
        new DrawObject(gl, vertices11, normals11, gl.TRIANGLE_FAN),
        new DrawObject(gl, vertices12, normals12, gl.TRIANGLE_FAN),
        new DrawObject(gl, vertices13, normals13, gl.TRIANGLE_FAN),
        new DrawObject(gl, vertices14, normals14, gl.TRIANGLE_FAN),
        new DrawObject(gl, vertices5, normals5, gl.TRIANGLE_STRIP),
        new DrawObject(gl, vertices6, normals6, gl.TRIANGLE_STRIP),
        new DrawObject(gl, vertices7, normals7, gl.TRIANGLE_STRIP),
        new DrawObject(gl, vertices8, normals8, gl.TRIANGLE_STRIP),
        new DrawObject(gl, vertices9, normals9, gl.TRIANGLE_STRIP),
        new DrawObject(gl, vertices10, normals10, gl.TRIANGLE_STRIP)
      ],
      color: СOLORS.WOOD,
      programInfo: programs.color,
    },
    floor: {
      figures: [
        chessBoard,
        // chessBoard2
      ],
      color: [1, 0, 0, 1],
      programInfo: programs.texture,
    }
  }
  return sceneObjects;
}

function updateState() {
  if (viewState.pressedKeys[65]) {
    // A
    viewState.translate.x += 0.1;
  } else if (viewState.pressedKeys[68]) {
    // D
    viewState.translate.x -= 0.1;
  } else if (viewState.pressedKeys[87]) {
    // W
    viewState.translate.y -= 0.1;
  } else if (viewState.pressedKeys[83]) {
    // S
    viewState.translate.y += 0.1;
  }
}

function drawScene(gl, programs, sceneObjects) {  
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // Tell WebGL to use our program when drawing

  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 1;
  const zFar = 500;
  const projectionMatrix = mat4.create();

  if (currentPerspective == PERSPECTIVE.PROJECTION){
    mat4.perspective(projectionMatrix,
      fieldOfView,
      aspect,
      zNear,
      zFar);
  } else if (currentPerspective == PERSPECTIVE.ORTHO) {
    mat4.ortho(projectionMatrix, -aspect * ORTHO_K, aspect * ORTHO_K, -ORTHO_K, ORTHO_K, zNear, zFar);
  }

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix = mat4.create();

  mat4.lookAt(
    modelViewMatrix, 
    [
      viewState.eye.x, viewState.eye.y, viewState.eye.z
    ], 
    [
      viewState.center.x, viewState.center.y, viewState.center.z
    ], 
    [
      viewState.up.x, viewState.up.y, viewState.up.z
    ]
  )

  mat4.rotateX(modelViewMatrix, modelViewMatrix, viewState.angle.x);
  mat4.rotateY(modelViewMatrix, modelViewMatrix, viewState.angle.y);

  mat4.translate(
    modelViewMatrix, 
    modelViewMatrix, 
    [
      viewState.translate.x, viewState.translate.y, viewState.translate.z
    ]);

  mat4.scale(modelViewMatrix, modelViewMatrix, [viewState.scale, viewState.scale, viewState.scale]);

  const uniformData = {
    projectionMatrix: projectionMatrix,
    modelViewMatrix: modelViewMatrix,
    color: [],
    texture: null,
    useTexture: false,
    lights: [
      {
        diffuse: viewState.light.diffuse,
        ambient: viewState.light.ambient,
        position: [10, 1, 5],
      }
    ]
  }
  for(const [groupName, group] of Object.entries(sceneObjects)){
    gl.useProgram(group.programInfo.program);
    for(const f of group.figures){
      uniformData.color = group.color;

      f.setUniformData(uniformData);
      f.draw(gl, group.programInfo);
    }
  }

  window.requestAnimationFrame(() => {
    updateState();
    drawScene(gl, programs, sceneObjects)
  });
}

window.onload = () => {
  currentPerspective = PERSPECTIVE.PROJECTION;
  var canvas = document.getElementById("glcanvas");
  const oSwitch = document.getElementById("oSwitch");
  const pSwitch = document.getElementById("pSwitch");
  pSwitch.checked = true;
  const lAmbient = document.getElementById("lAmbient");
  const lDiffuse = document.getElementById("lDiffuse");

  document.onkeydown = keydown;
  document.onkeyup = keyup;
  canvas.onmousedown = mousedown;
  canvas.onmouseup = mouseup;
  canvas.onmousemove = mousemove;
  canvas.addEventListener("wheel", mousewheel);

  gl = initWebGL(canvas);      // инициализация контекста GL

  // продолжать только если WebGL доступен и работает

  if (!gl) return;
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1, 1, 1, 1);                      // установить в качестве цвета очистки буфера цвета чёрный, полная непрозрачность
  // gl.enable(gl.CULL_FACE);
  // gl.cullFace(gl.FRONT_BACK);
  gl.enable(gl.DEPTH_TEST);   
  gl.depthFunc(gl.LEQUAL);                                // определяет работу буфера глубины: более ближние объекты перекрывают дальние
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);      // очистить буфер цвета и буфер глубины.

  console.log("WebGL initialized")


  const colorProgram = initShaders(gl, "shader-vs", "shader-fs");
  const textureProgram = initShaders(gl, "shader-vs", "shader-fs-texture");

  const programs = {
    color: {
      program: colorProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(colorProgram, 'aVertexPosition'),
        vertexNormal: gl.getAttribLocation(colorProgram, 'aVertexNormal'),
        textureCoord: gl.getAttribLocation(colorProgram, 'aTexCoord')
      },
      uniformLocations: {
        vertexColor: gl.getUniformLocation(colorProgram, 'uVertexColor'),
        projectionMatrix: gl.getUniformLocation(colorProgram, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(colorProgram, 'uModelViewMatrix'),
        lights: [
          {
            diffuse: gl.getUniformLocation(colorProgram, 'lights[0].diffuse'),
            ambient: gl.getUniformLocation(colorProgram, 'lights[0].ambient'),
            position: gl.getUniformLocation(colorProgram, 'lights[0].position'),
          }
        ],
      },
    },
    texture: {
      program: textureProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(textureProgram, 'aVertexPosition'),
        vertexNormal: gl.getAttribLocation(textureProgram, 'aVertexNormal'),
        textureCoord: gl.getAttribLocation(textureProgram, 'aTexCoord')
      },
      uniformLocations: {
        uTexture: gl.getUniformLocation(textureProgram, "uTexture") || null,
        vertexColor: gl.getUniformLocation(textureProgram, 'uVertexColor'),
        projectionMatrix: gl.getUniformLocation(textureProgram, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(textureProgram, 'uModelViewMatrix'),
        lights: [
          {
            diffuse: gl.getUniformLocation(textureProgram, 'lights[0].diffuse'),
            ambient: gl.getUniformLocation(textureProgram, 'lights[0].ambient'),
            position: gl.getUniformLocation(textureProgram, 'lights[0].position'),
          }
        ],
      },
    },
  }


  const sceneObjects = createFigures(gl, programs);

  oSwitch.addEventListener('change', () => {
    if(oSwitch.checked) {
      currentPerspective = PERSPECTIVE.ORTHO;
      pSwitch.checked = false;
    } else {
      currentPerspective = PERSPECTIVE.PROJECTION;
      pSwitch.checked = true;
    }
  });

  pSwitch.addEventListener('change', () => {
    if(pSwitch.checked) {
      currentPerspective = PERSPECTIVE.PROJECTION;
      oSwitch.checked = false;
    } else {
      currentPerspective = PERSPECTIVE.ORTHO;
      oSwitch.checked = true;
    }
  });

  lAmbient.addEventListener('input', (e) => {
    const a = e.target.value / 100;
    viewState.light.ambient = [a, a, a];
  });

  lDiffuse.addEventListener('input', (e) => {
    const d = e.target.value / 100;
    viewState.light.diffuse = [d, d, d];
  });

  window.requestAnimationFrame(() => {
    updateState();
    drawScene(gl, programs, sceneObjects)
  });
}