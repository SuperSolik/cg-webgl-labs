function main() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  const canvas = document.querySelector('#canvas');
  const gl = canvas.getContext('webgl');
  if (!gl) {
    return;
  }

  const ext = gl.getExtension('WEBGL_depth_texture');
  if (!ext) {
    return alert('need WEBGL_depth_texture');  // eslint-disable-line
  }

  const a = 100;

  // setup GLSL programs
  const textureProgramInfo = webglUtils.createProgramInfo(gl, ['vertex-shader-3d', 'fragment-shader-3d']);
  const colorProgramInfo = webglUtils.createProgramInfo(gl, ['color-vertex-shader', 'color-fragment-shader']);

  const coneBuffersInfo = [];
  for (let i = 0; i < 2; i ++){
    coneBuffersInfo.push(primitives.createTruncatedConeBufferInfo(gl, 1.5, 0, 3.5, a, 1, true, false));
  }
  for (let i = 0; i < 2; i ++){
    coneBuffersInfo.push(primitives.createTruncatedConeBufferInfo(gl, 1.5, 0, 0.5, a, 1, true, false));
  }


  const columnsBuffersInfo = []
  for (let i = 0; i < 4; i ++){
    columnsBuffersInfo.push(primitives.createTruncatedConeBufferInfo(gl, 0.35, 0.3, 8, a, 1, true, true));
  }

  columnsBuffersInfo.push(primitives.createTruncatedConeBufferInfo(gl, 2.5, 2.5, 0.5, a, 1, true, true));
  columnsBuffersInfo.push(primitives.createTruncatedConeBufferInfo(gl, 2.5, 2.5, 0.5, a, 1, true, true));

  // const sphereBufferInfo = primitives.createSphereBufferInfo(
  //     gl,
  //     1,  // radius
  //     32, // subdivisions around
  //     24, // subdivisions down
  // );
  const planeBufferInfo = primitives.createPlaneBufferInfo(
      gl,
      40,  // width
      40,  // height
      2,   // subdivisions across
      2,   // subdivisions down
  );
  // const cubeBufferInfo = primitives.createCubeBufferInfo(
  //     gl,
  //     2,  // size
  // );
  const cubeLinesBufferInfo = webglUtils.createBufferInfoFromArrays(gl, {
    position: [
      -1, -1, -1,
       1, -1, -1,
      -1,  1, -1,
       1,  1, -1,
      -1, -1,  1,
       1, -1,  1,
      -1,  1,  1,
       1,  1,  1,
    ],
    indices: [
      0, 1,
      1, 3,
      3, 2,
      2, 0,

      4, 5,
      5, 7,
      7, 6,
      6, 4,

      0, 4,
      1, 5,
      3, 7,
      2, 6,
    ],
  });

  // make a 8x8 checkerboard texture
  const checkerboardTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, checkerboardTexture);
  gl.texImage2D(
      gl.TEXTURE_2D,
      0,                // mip level
      gl.LUMINANCE,     // internal format
      8,                // width
      8,                // height
      0,                // border
      gl.LUMINANCE,     // format
      gl.UNSIGNED_BYTE, // type
      new Uint8Array([  // data
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
      ]));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.generateMipmap(gl.TEXTURE_2D);

  const simpleTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, simpleTexture);
  gl.texImage2D(
      gl.TEXTURE_2D,
      0,                // mip level
      gl.LUMINANCE,     // internal format
      1,                // width
      1,                // height
      0,                // border
      gl.LUMINANCE,     // format
      gl.UNSIGNED_BYTE, // type
      new Uint8Array([  // data
        0xFF
      ]));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.generateMipmap(gl.TEXTURE_2D);

  const depthTexture = gl.createTexture();
  const depthTextureSize = 512;
  gl.bindTexture(gl.TEXTURE_2D, depthTexture);
  gl.texImage2D(
      gl.TEXTURE_2D,      // target
      0,                  // mip level
      gl.DEPTH_COMPONENT, // internal format
      depthTextureSize,   // width
      depthTextureSize,   // height
      0,                  // border
      gl.DEPTH_COMPONENT, // format
      gl.UNSIGNED_INT,    // type
      null);              // data
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const depthFramebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
  gl.framebufferTexture2D(
      gl.FRAMEBUFFER,       // target
      gl.DEPTH_ATTACHMENT,  // attachment point
      gl.TEXTURE_2D,        // texture target
      depthTexture,         // texture
      0);                   // mip level

  // create a color texture of the same size as the depth texture
  // see article why this is needed_
  const unusedTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, unusedTexture);
  gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      depthTextureSize,
      depthTextureSize,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null,
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // attach it to the framebuffer
  gl.framebufferTexture2D(
      gl.FRAMEBUFFER,        // target
      gl.COLOR_ATTACHMENT0,  // attachment point
      gl.TEXTURE_2D,         // texture target
      unusedTexture,         // texture
      0);                    // mip level

  function degToRad(d) {
    return d * Math.PI / 180;
  }

  const settings = {
    cameraX: 6,
    cameraY: 12,
    cameraZ: 15,
    posX: -2,
    posY: 12,
    posZ: 7,
    targetX: 5,
    targetY: -0.5,
    targetZ: -12,
    projWidth: 20,
    projHeight: 20,
    perspective: false,
    frustum: false,
    fieldOfView: 120,
    bias: -0.006,
  };
  webglLessonsUI.setupUI(document.querySelector('#ui'), settings, [
    { type: 'slider',   key: 'cameraX',    min: -10, max: 10, change: render, precision: 2, step: 0.001, },
    { type: 'slider',   key: 'cameraY',    min:   -20, max: 20, change: render, precision: 2, step: 0.001, },
    { type: 'slider',   key: 'cameraZ',    min:   -20, max: 20, change: render, precision: 2, step: 0.001, },
    { type: 'slider',   key: 'posX',       min: -10, max: 10, change: render, precision: 2, step: 0.001, },
    { type: 'slider',   key: 'posY',       min:   -20, max: 20, change: render, precision: 2, step: 0.001, },
    { type: 'slider',   key: 'posZ',       min:  -20, max: 20, change: render, precision: 2, step: 0.001, },
    { type: 'slider',   key: 'targetX',    min: -10, max: 10, change: render, precision: 2, step: 0.001, },
    { type: 'slider',   key: 'targetY',    min:   -20, max: 20, change: render, precision: 2, step: 0.001, },
    { type: 'slider',   key: 'targetZ',    min: -20, max: 20, change: render, precision: 2, step: 0.001, },
    { type: 'slider',   key: 'projWidth',  min:   0, max: 100, change: render, precision: 2, step: 0.001, },
    { type: 'slider',   key: 'projHeight', min:   0, max: 100, change: render, precision: 2, step: 0.001, },
    // { type: 'checkbox', key: 'perspective', change: render, },
    { type: 'checkbox', key: 'frustum', change: render, },
    // { type: 'slider',   key: 'fieldOfView', min:  1, max: 179, change: render, },
    { type: 'slider',   key: 'bias',       min:  -0.01, max: 0.00001, change: render, precision: 4, step: 0.0001, },
  ]);

  const fieldOfViewRadians = degToRad(60);
  const coneUniforms = []
  coneUniforms.push({
    u_colorMult: [135 / 256, 206 / 256, 250 / 256, 1],
    u_color: [1, 0, 0, 1],
    u_texture: simpleTexture,
    u_world: m4.translation(0, 0.5 + 0.5 +3.5 / 2, 0),
  });

  coneUniforms.push({
    u_colorMult: [135 / 256, 206 / 256, 250 / 256, 1],
    u_color: [1, 0, 0, 1],
    u_texture: simpleTexture,
    u_world: m4.axisRotate(m4.translation(0, 0.5 + 0.5 + 3.5 + 3.5 / 2, 0), [1, 0, 0], Math.PI),
  });

  coneUniforms.push({
    u_colorMult: [135 / 256, 206 / 256, 250 / 256, 1],
    u_color: [1, 0, 0, 1],
    u_texture: simpleTexture,
    u_world: m4.axisRotate(m4.translation(0, 0.5 + 0.5 / 2, 0), [1, 0, 0], Math.PI),
  });


  coneUniforms.push({
    u_colorMult: [135 / 256, 206 / 256, 250 / 256, 1],
    u_color: [1, 0, 0, 1],
    u_texture: simpleTexture,
    u_world: m4.translation(0, 0.5 + 0.5 + 3.5 + 3.5 + 0.5 / 2, 0),
  });

  const columnsUniformsArray = [];
  const r = 2;
  for(let angle = 0; angle < 2 * Math.PI; angle += Math.PI / 2){
    columnsUniformsArray.push({
      u_colorMult: [139 / 255, 69 / 256, 19 / 256, 1],  // lightblue
      u_color: [1, 0, 0, 1],
      u_texture: simpleTexture,
      u_world: m4.translation(r * Math.sin(angle + Math.PI / 4), 0.5 + 8 / 2, r * Math.cos(angle + Math.PI / 4)),
    })
  }

  columnsUniformsArray.push({
    u_colorMult: [139 / 255, 69 / 256, 19 / 256, 1],  // lightblue
    u_color: [1, 0, 0, 1],
    u_texture: simpleTexture,
    u_world: m4.translation(0, 0.5 / 2, 0),
  })

  columnsUniformsArray.push({
    u_colorMult: [139 / 255, 69 / 256, 19 / 256, 1],  // lightblue
    u_color: [1, 0, 0, 1],
    u_texture: simpleTexture,
    u_world: m4.translation(0, 0.5 + 8 + 0.5 / 2, 0),
  })

  // Uniforms for each object.
  const planeUniforms = {
    u_colorMult: [1, 1, 1, 1],  // lightblue
    u_color: [1, 0, 0, 1],
    u_texture: checkerboardTexture,
    u_world: m4.translation(0, 0, 0),
  };

  function drawScene(
      projectionMatrix,
      cameraMatrix,
      textureMatrix,
      lightWorldMatrix,
      programInfo) {
    // Make a view matrix from the camera matrix.
    const viewMatrix = m4.inverse(cameraMatrix);

    gl.useProgram(programInfo.program);

    // set uniforms that are the same for both the sphere and plane
    // note: any values with no corresponding uniform in the shader
    // are ignored.
    webglUtils.setUniforms(programInfo, {
      u_view: viewMatrix,
      u_projection: projectionMatrix,
      u_bias: settings.bias,
      u_textureMatrix: textureMatrix,
      u_projectedTexture: depthTexture,
      u_reverseLightDirection: lightWorldMatrix.slice(8, 11),
    });

    // ------ Draw the cones --------
    for(let i = 0; i < coneUniforms.length; i++){
      webglUtils.setBuffersAndAttributes(gl, programInfo, coneBuffersInfo[i]);
      webglUtils.setUniforms(programInfo, coneUniforms[i]);
      webglUtils.drawBufferInfo(gl, coneBuffersInfo[i]);
    }

    for(let i = 0; i < 6; i++){
      webglUtils.setBuffersAndAttributes(gl, programInfo, columnsBuffersInfo[i]);
      webglUtils.setUniforms(programInfo, columnsUniformsArray[i]);
      webglUtils.drawBufferInfo(gl, columnsBuffersInfo[i]);
    }


    // ------ Draw the plane --------

    // Setup all the needed attributes.
    webglUtils.setBuffersAndAttributes(gl, programInfo, planeBufferInfo);

    // Set the uniforms unique to the cube
    webglUtils.setUniforms(programInfo, planeUniforms);

    // calls gl.drawArrays or gl.drawElements
    webglUtils.drawBufferInfo(gl, planeBufferInfo);
  }

  // Draw the scene.
  function render() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    // first draw from the POV of the light
    const lightWorldMatrix = m4.lookAt(
        [settings.posX, settings.posY, settings.posZ],          // position
        [settings.targetX, settings.targetY, settings.targetZ], // target
        [0, 1, 0],                                              // up
    );
    const lightProjectionMatrix = settings.perspective
        ? m4.perspective(
            degToRad(settings.fieldOfView),
            settings.projWidth / settings.projHeight,
            0.5,  // near
            10)   // far
        : m4.orthographic(
            -settings.projWidth / 2,   // left
             settings.projWidth / 2,   // right
            -settings.projHeight / 2,  // bottom
             settings.projHeight / 2,  // top
             0.1,                      // near
             50);                      // far

    // draw to the depth texture
    gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
    gl.viewport(0, 0, depthTextureSize, depthTextureSize);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    drawScene(
        lightProjectionMatrix,
        lightWorldMatrix,
        m4.identity(),
        lightWorldMatrix,
        colorProgramInfo);

    // now draw scene to the canvas projecting the depth texture into the scene
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let textureMatrix = m4.identity();
    textureMatrix = m4.translate(textureMatrix, 0.5, 0.5, 0.5);
    textureMatrix = m4.scale(textureMatrix, 0.5, 0.5, 0.5);
    textureMatrix = m4.multiply(textureMatrix, lightProjectionMatrix);
    // use the inverse of this world matrix to make
    // a matrix that will transform other positions
    // to be relative this world space.
    textureMatrix = m4.multiply(
        textureMatrix,
        m4.inverse(lightWorldMatrix));

    // Compute the projection matrix
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const projectionMatrix =
        m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

    // Compute the camera's matrix using look at.
    const cameraPosition = [settings.cameraX, settings.cameraY, settings.cameraZ];
    const target = [0, 2 * 0.5 + 3.5, 0];
    const up = [0, 1, 0];
    const cameraMatrix = m4.lookAt(cameraPosition, target, up);

    drawScene(
        projectionMatrix,
        cameraMatrix,
        textureMatrix,
        lightWorldMatrix,
        textureProgramInfo);

    // ------ Draw the frustum ------
    if (settings.frustum)
    {
      const viewMatrix = m4.inverse(cameraMatrix);

      gl.useProgram(colorProgramInfo.program);

      // Setup all the needed attributes.
      webglUtils.setBuffersAndAttributes(gl, colorProgramInfo, cubeLinesBufferInfo);

      // scale the cube in Z so it's really long
      // to represent the texture is being projected to
      // infinity
      const mat = m4.multiply(
          lightWorldMatrix, m4.inverse(lightProjectionMatrix));

      // Set the uniforms we just computed
      webglUtils.setUniforms(colorProgramInfo, {
        u_color: [1, 0, 1, 1],
        u_view: viewMatrix,
        u_projection: projectionMatrix,
        u_world: mat,
      });

      // calls gl.drawArrays or gl.drawElements
      webglUtils.drawBufferInfo(gl, cubeLinesBufferInfo, gl.LINES);
    }
  }
  render();
}

window.onload = () => {
    main();
}
