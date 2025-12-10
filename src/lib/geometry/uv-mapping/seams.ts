import * as THREE from 'three';
import { MeshAnalysis, SeamPlacement } from './types';

export function findOptimalSeams(
    geometry: THREE.BufferGeometry,
    analysis: MeshAnalysis
): SeamPlacement {
    const positions = geometry.getAttribute('position').array as Float32Array;

    // For limb-like shapes (which are roughly cylindrical), we want a longitudinal seam.
    // A simple heuristic is to detect the principal axis and cut along the "back".

    // 1. Detect Principal Axis (PCA)
    // For now, let's assume the limb is roughly aligned with Y or Z axis, or just use bounding box
    // A more robust way is covariance matrix eigen decomposition, but let's start simple.

    // Calculate centroids to estimate "spine" of the cylinder
    const center = new THREE.Vector3();
    const bbox = new THREE.Box3();

    // convert positions to vector3s for easier math
    // (Optimization: avoid creating too many objects in loop if performance is key)

    // Let's assume standard prosthetic orientation: Up is Y.
    // We want a vertical seam.

    // Strategy:
    // 1. Convert to cylindrical coordinates (r, theta, h)
    // 2. Find a theta that has the least "features" or is the "back"
    // 3. Cut along that theta.

    return findCylindricalSeam(positions, analysis);
}

function findCylindricalSeam(
    positions: Float32Array,
    analysis: MeshAnalysis
): SeamPlacement {
    // Heuristic: "Back" of the limb is usually -Z or +Z depending on coordinate system.
    // Let's assume we cut at angle PI (180 degrees) relative to the centroid on the XZ plane.

    const seamAngle = Math.PI;
    const tolerance = 0.5; // Radians wide strip to look for vertices

    const seamVertices = new Set<number>();
    const vertexCount = positions.length / 3;

    // Calculate centroid of the mesh on XZ plane to center our angle calculation
    let cx = 0, cz = 0;
    for (let i = 0; i < vertexCount; i++) {
        cx += positions[i * 3];
        cz += positions[i * 3 + 2];
    }
    cx /= vertexCount;
    cz /= vertexCount;

    const candidates: { index: number, y: number, dist: number }[] = [];

    for (let i = 0; i < vertexCount; i++) {
        const x = positions[i * 3] - cx;
        const y = positions[i * 3 + 1];
        const z = positions[i * 3 + 2] - cz;

        const angle = Math.atan2(z, x); // -PI to PI

        // Check if angle is close to seamAngle (PI)
        // Handle wrapping at PI/-PI
        let diff = Math.abs(angle - seamAngle);
        if (diff > Math.PI) diff = 2 * Math.PI - diff;

        if (diff < tolerance) {
            candidates.push({ index: i, y, dist: diff });
        }
    }

    // Sort candidates by Y height to build a chain
    candidates.sort((a, b) => a.y - b.y);

    // Select the best line of vertices
    // This is a simplification. A true "cut" needs to follow edges.
    // We will select a chain of edges that is closest to our desired seam line.

    // Dijkstra / A* can be used here to find shortest path from bottom boundary to top boundary
    // running through the "high cost" zone (where cost is distance from seamAngle).

    // Let's implement a simple shortest path on the mesh graph
    // We need the boundaries from the analysis to know start/end points.

    // Identify top and bottom boundary loops
    // Assumes 2 boundaries for a cylinder (open top, open bottom)
    // If only 1 (sock), we go from boundary to geodesic extreme? 
    // Let's assume 2 boundaries for now.

    const resultEdges: [number, number][] = [];
    const cutVerts = new Set<number>();

    if (analysis.boundaries.length >= 1) {
        // If we have boundaries, try to connect them.
        // If 1 boundary, find a point far away? or just cut to the "tip"?
        // For generic mesh, let's just use the vertices we found aligned with the angle
        // and force a cut.

        // This is tricky without a proper mesh traversal structure (Half-edge).
        // Let's fall back to a "projection" method for the seam for this iteration
        // OR simpler: standard Dijkstra from min-Y boundary vertex to max-Y boundary vertex.

        // TODO: Implement proper Dijkstra seam finding. 
        // For now, returning a placeholder that effectively marks these vertices as "on seam" 
        // to guide the LSCM cutter.

        for (const c of candidates) {
            cutVerts.add(c.index);
        }

    }

    return {
        seamEdges: resultEdges,
        cutVertices: cutVerts,
        distortionScore: 0
    };
}
