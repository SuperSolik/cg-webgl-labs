class DrawObject{
    positionBuffer = null
    colorBuffer = null
    normalsBuffer = null
    numVertices = null
    primitiveType = null
    projectionMatrix = mat4.create()
    modelViewMatrix = mat4.create()
    uniformData = null
    gl = null
    programInfo = null

    constructor(gl, vertices, normals, primitiveType){
        this.vertices = vertices;
        this.normals = normals;
        // console.log(vertices.length, normals.length);
        this.primitiveType = primitiveType;

        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);


        this.normalsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);
        // this.colorBuffer = gl.createBuffer();
        // gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

        this.numVertices = vertices.length / 3
    }

    setProjectionMatrix(projectionMatrix){
        this.projectionMatrix = projectionMatrix
    }

    setModelViewMatrix(modelViewMatrix){
        this.modelViewMatrix = modelViewMatrix
    }

    setUniformData(uniformData){
        this.uniformData = uniformData
    }

    draw(gl, programInfo){
        const numVertexComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numVertexComponents, 
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexNormal,
            numVertexComponents, 
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);

        // const numColorComponents = 4;
        
        // gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        // gl.vertexAttribPointer(
        //     programInfo.attribLocations.vertexColor,
        //     numColorComponents,
        //     type,
        //     normalize,
        //     stride,
        //     offset);
        // gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);

        // setUniformVariables(gl, programInfo, this.projectionMatrix, this.modelViewMatrix)
        setUniformVariables(gl, programInfo, this.uniformData);
        gl.drawArrays(this.primitiveType, 0, this.numVertices);
    }
}
