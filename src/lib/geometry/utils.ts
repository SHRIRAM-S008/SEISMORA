import * as THREE from 'three';

// Merge duplicate vertices (needed for non-indexed geometry)
export function mergeVertices(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
    const positions = geometry.getAttribute('position').array as Float32Array;

    const vertexMap = new Map<string, number>();
    const newPositions: number[] = [];
    const newIndices: number[] = [];

    for (let i = 0; i < positions.length; i += 3) {
        const key = `${positions[i].toFixed(6)},${positions[i + 1].toFixed(6)},${positions[i + 2].toFixed(6)}`;

        if (!vertexMap.has(key)) {
            vertexMap.set(key, newPositions.length / 3);
            newPositions.push(positions[i], positions[i + 1], positions[i + 2]);
        }

        newIndices.push(vertexMap.get(key)!);
    }

    const newGeometry = new THREE.BufferGeometry();
    newGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
    newGeometry.setIndex(newIndices);
    newGeometry.computeVertexNormals();

    return newGeometry;
}
