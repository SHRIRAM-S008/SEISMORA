import * as THREE from 'three';

// Main function to parse any supported file
export async function parseModelFile(
    file: File
): Promise<THREE.BufferGeometry> {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();

    switch (extension) {
        case 'stl':
            return parseSTL(arrayBuffer);
        case 'obj':
            const text = new TextDecoder().decode(arrayBuffer);
            return parseOBJ(text);
        case 'glb':
        case 'gltf':
            return parseGLTF(arrayBuffer);
        default:
            throw new Error(`Unsupported file format: ${extension}`);
    }
}

// Parse STL file (binary or ASCII)
export function parseSTL(buffer: ArrayBuffer): THREE.BufferGeometry {
    // Check if ASCII or binary
    const text = new TextDecoder().decode(buffer.slice(0, 80));
    const isASCII = text.startsWith('solid');

    if (isASCII) {
        return parseSTLASCII(new TextDecoder().decode(buffer));
    }
    return parseSTLBinary(buffer);
}

// Parse binary STL
function parseSTLBinary(buffer: ArrayBuffer): THREE.BufferGeometry {
    const view = new DataView(buffer);
    const triangleCount = view.getUint32(80, true);

    const vertices: number[] = [];
    const normals: number[] = [];

    let offset = 84;

    for (let i = 0; i < triangleCount; i++) {
        // Read normal
        const nx = view.getFloat32(offset, true); offset += 4;
        const ny = view.getFloat32(offset, true); offset += 4;
        const nz = view.getFloat32(offset, true); offset += 4;

        // Read 3 vertices
        for (let j = 0; j < 3; j++) {
            const x = view.getFloat32(offset, true); offset += 4;
            const y = view.getFloat32(offset, true); offset += 4;
            const z = view.getFloat32(offset, true); offset += 4;

            vertices.push(x, y, z);
            normals.push(nx, ny, nz);
        }

        offset += 2; // attribute byte count
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));

    return geometry;
}

// Parse ASCII STL
function parseSTLASCII(text: string): THREE.BufferGeometry {
    const vertices: number[] = [];
    const normals: number[] = [];

    const normalPattern = /facet\s+normal\s+([\d.e+-]+)\s+([\d.e+-]+)\s+([\d.e+-]+)/gi;
    const vertexPattern = /vertex\s+([\d.e+-]+)\s+([\d.e+-]+)\s+([\d.e+-]+)/gi;

    let normalMatch;
    let currentNormal = [0, 0, 0];

    while ((normalMatch = normalPattern.exec(text)) !== null) {
        currentNormal = [
            parseFloat(normalMatch[1]),
            parseFloat(normalMatch[2]),
            parseFloat(normalMatch[3])
        ];
    }

    let vertexMatch;
    let vertexCount = 0;

    while ((vertexMatch = vertexPattern.exec(text)) !== null) {
        vertices.push(
            parseFloat(vertexMatch[1]),
            parseFloat(vertexMatch[2]),
            parseFloat(vertexMatch[3])
        );
        normals.push(...currentNormal);
        vertexCount++;

        if (vertexCount % 3 === 0) {
            // Reset for next facet
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));

    return geometry;
}

// Parse OBJ file
export function parseOBJ(text: string): THREE.BufferGeometry {
    const vertices: number[] = [];
    const tempVertices: number[][] = [];
    const faces: number[][] = [];

    const lines = text.split('\n');

    for (const line of lines) {
        const parts = line.trim().split(/\s+/);

        if (parts[0] === 'v') {
            // Vertex position
            tempVertices.push([
                parseFloat(parts[1]),
                parseFloat(parts[2]),
                parseFloat(parts[3])
            ]);
        } else if (parts[0] === 'f') {
            // Face (triangle or quad)
            const faceIndices: number[] = [];

            for (let i = 1; i < parts.length; i++) {
                const index = parseInt(parts[i].split('/')[0]) - 1;
                faceIndices.push(index);
            }

            // Triangulate if quad
            if (faceIndices.length === 3) {
                faces.push(faceIndices);
            } else if (faceIndices.length === 4) {
                faces.push([faceIndices[0], faceIndices[1], faceIndices[2]]);
                faces.push([faceIndices[0], faceIndices[2], faceIndices[3]]);
            }
        }
    }

    // Build vertex array from faces
    for (const face of faces) {
        for (const index of face) {
            vertices.push(...tempVertices[index]);
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();

    return geometry;
}

// Parse GLTF/GLB (simplified - uses Three.js loader)
export async function parseGLTF(buffer: ArrayBuffer): Promise<THREE.BufferGeometry> {
    // For GLB, we need GLTFLoader from three/examples
    // This is a simplified version
    throw new Error('GLB parsing requires GLTFLoader - implement separately');
}
