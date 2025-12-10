import * as THREE from 'three';
import { MeshAnalysis } from './types';

export function analyzeMesh(geometry: THREE.BufferGeometry): MeshAnalysis {
    const positions = geometry.getAttribute('position').array as Float32Array;
    const indices = geometry.getIndex()?.array as Uint32Array;

    if (!indices) throw new Error('Mesh must be indexed');

    // Build edge connectivity
    const edges = buildEdgeMap(indices);

    // Find boundaries
    const boundaries = findBoundaryLoops(edges);

    // Check topology
    // Euler characteristic X = V - E + F
    // Genus g = 1 - X/2 (for connected orientable surface with B boundaries)
    // Actually for surfaces with boundaries: X = 2 - 2g - b
    // So 2g = 2 - b - X => g = 1 - b/2 - X/2
    const numVertices = positions.length / 3;
    const numEdges = edges.size; // edges map stores unique edges if we handle keys right
    const numFaces = indices.length / 3;

    const eulerChar = numVertices - numEdges + numFaces;
    const numBoundaries = boundaries.length;
    const genus = 1 - (numBoundaries / 2) - (eulerChar / 2);

    return {
        boundaries,
        genus: Math.max(0, Math.round(genus)), // minor corrections for float math
        components: findConnectedComponents(numVertices, indices),
        distortionMetric: 0 // Will be calculated after unwrap
    };
}

function buildEdgeMap(indices: Uint32Array): Map<string, number[]> {
    const edges = new Map<string, number[]>();

    for (let i = 0; i < indices.length; i += 3) {
        const triangle = [indices[i], indices[i + 1], indices[i + 2]];

        // Add each edge
        for (let j = 0; j < 3; j++) {
            const v1 = triangle[j];
            const v2 = triangle[(j + 1) % 3];
            // Order sensitive key for boundary detection? 
            // Usually we want unordered for "is this edge shared?"
            // But for boundary detection, we often want to know if an edge has 1 or 2 incident faces.
            // If it has 1, it's a boundary.
            const edgeKey = `${Math.min(v1, v2)}-${Math.max(v1, v2)}`;

            if (!edges.has(edgeKey)) {
                edges.set(edgeKey, []);
            }
            edges.get(edgeKey)!.push(Math.floor(i / 3)); // triangle index
        }
    }

    return edges;
}

function findBoundaryLoops(edges: Map<string, number[]>): number[][] {
    const boundaryEdges: [number, number][] = [];

    // Identify boundary edges (only 1 incident face)
    for (const [key, faces] of edges.entries()) {
        if (faces.length === 1) {
            const [v1, v2] = key.split('-').map(Number);
            boundaryEdges.push([v1, v2]);
        }
    }

    if (boundaryEdges.length === 0) return [];

    // Chain edges into loops
    const loops: number[][] = [];
    const usedEdges = new Set<number>();

    // Convert to adjacency list for easier traversal
    const adj = new Map<number, number[]>();
    for (const [v1, v2] of boundaryEdges) {
        if (!adj.has(v1)) adj.set(v1, []);
        if (!adj.has(v2)) adj.set(v2, []);
        adj.get(v1)!.push(v2);
        adj.get(v2)!.push(v1);
    }

    const visitedVertices = new Set<number>();

    for (const startNode of adj.keys()) {
        if (visitedVertices.has(startNode)) continue;

        const loop: number[] = [];
        let current = startNode;

        // Naive depth-first traversal for simple loops
        // Real implementations might need to handle self-intersecting boundaries better
        while (true) {
            visitedVertices.add(current);
            loop.push(current);

            const neighbors = adj.get(current) || [];
            let next = -1;

            for (const n of neighbors) {
                if (!visitedVertices.has(n)) {
                    next = n;
                    break;
                }
            }

            // If no unvisited neighbors, check if we can close the loop
            if (next === -1) {
                for (const n of neighbors) {
                    if (n === startNode && loop.length > 2) {
                        // Loop closed
                        break;
                    }
                }
                break; // End of this chain
            }

            current = next;
        }

        if (loop.length > 0) {
            loops.push(loop);
        }
    }

    return loops;
}

function findConnectedComponents(numVertices: number, indices: Uint32Array): number[][] {
    // Union-Find or BFS to find connected components of faces
    const adj = new Map<number, number[]>();

    // Build vertex adjacency
    // (Optimization: can build face adjacency directly)
    // Here we just use vertex adjacency as proxy for simplicity

    // Note: This logic finds connected components of VERTICES.
    // Ideally we want connected components of FACES.
    // But usually they correspond 1:1 unless we have non-manifold geometry.

    // Let's implement a simple BFS on vertices
    for (let i = 0; i < indices.length; i += 3) {
        const v1 = indices[i];
        const v2 = indices[i + 1];
        const v3 = indices[i + 2];

        if (!adj.has(v1)) adj.set(v1, []);
        if (!adj.has(v2)) adj.set(v2, []);
        if (!adj.has(v3)) adj.set(v3, []);

        adj.get(v1)!.push(v2, v3);
        adj.get(v2)!.push(v1, v3);
        adj.get(v3)!.push(v1, v2);
    }

    const visited = new Set<number>();
    const components: number[][] = [];

    for (let i = 0; i < numVertices; i++) {
        // Only start if vertex is actually used in geometry (some index buffers skip vertices)
        if (!adj.has(i)) continue;
        if (visited.has(i)) continue;

        const component: number[] = [];
        const queue = [i];
        visited.add(i);

        while (queue.length > 0) {
            const v = queue.shift()!;
            component.push(v);

            const neighbors = adj.get(v) || [];
            for (const n of neighbors) {
                if (!visited.has(n)) {
                    visited.add(n);
                    queue.push(n);
                }
            }
        }
        components.push(component);
    }

    return components;
}
