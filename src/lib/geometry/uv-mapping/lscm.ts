import * as THREE from 'three';
import { SeamPlacement, LSCMResult, CutMesh } from './types';

export function lscmUnwrap(
    geometry: THREE.BufferGeometry,
    seamPlacement: SeamPlacement
): LSCMResult {
    const indices = geometry.getIndex()?.array as Uint32Array;
    const positions = geometry.getAttribute('position').array as Float32Array;

    if (!indices) throw new Error('Indexed geometry required');

    // 1. Cut the mesh along seams (topological surgery)
    // This duplicates vertices along the cut path so the mesh is effectively a disk
    const cutMesh = cutMeshAlongSeams(positions, indices, seamPlacement);

    // 2. Pin two vertices to fix rotation/translation/scale
    // Usually longest boundary geometrical distance
    const pinned = selectPinnedVertices(cutMesh);

    // 3. Build Matrices for LSCM (A x = b)
    // We are solving for (u, v) coordinates that minimize conformal distortion
    const { A, b, map } = buildLSCMSystem(cutMesh, pinned);

    // 4. Solve the linear system
    const x = solveConjugateGradient(A, b);

    // 5. Map solution back to UVs
    const uvCoordinates = mapSolutionToUVs(x, cutMesh.vertices.length / 3, map);

    return {
        uvCoordinates,
        distortion: 0, // Calculated later
        seamLength: 0
    };
}

// --- Helpers ---

function cutMeshAlongSeams(
    positions: Float32Array,
    indices: Uint32Array,
    seam: SeamPlacement
): CutMesh {
    // Basic implementation: 
    // If a vertex is "cut", it might need duplication.
    // For now, let's assume the seam input already gives us a topological cut or we simply return the mesh as-is 
    // if the seam detection isn't fully robust yet.
    // Real topological cutting is complex; we'll create a placeholder that passes through data.

    // In a real implementation: check each triangle. If an edge crosses a seam, duplicate vertices.

    return {
        vertices: positions,
        triangles: indices,
        seamEdges: seam.seamEdges
    };
}

function selectPinnedVertices(mesh: CutMesh): Map<number, [number, number]> {
    const pinned = new Map<number, [number, number]>();

    // Pin 0 to (0,0) and another distant boundary vertex to (1,0)
    // Just finding two arbitrary point for now to make system solvable
    const v1 = 0;
    let v2 = 1;
    // Try to find a v2 far from v1
    let maxDistSq = 0;

    for (let i = 0; i < mesh.vertices.length / 3; i += 10) { // stride for speed
        const dx = mesh.vertices[i * 3] - mesh.vertices[v1 * 3];
        const dy = mesh.vertices[i * 3 + 1] - mesh.vertices[v1 * 3 + 1];
        const dz = mesh.vertices[i * 3 + 2] - mesh.vertices[v1 * 3 + 2];
        const dsq = dx * dx + dy * dy + dz * dz;
        if (dsq > maxDistSq) {
            maxDistSq = dsq;
            v2 = i;
        }
    }

    pinned.set(v1, [0, 0]);
    pinned.set(v2, [1, 0]); // Arbitrary scale
    return pinned;
}

interface SparseMatrix {
    // simplified CSR or similar for internal solver
    // keys: row index, values: list of {col, val}
    rows: Map<number, { col: number, val: number }[]>;
    size: number;
}

function buildLSCMSystem(mesh: CutMesh, pinned: Map<number, [number, number]>) {
    const numVerts = mesh.vertices.length / 3;
    const size = numVerts * 2; // u and v variables

    const A: SparseMatrix = { rows: new Map(), size };
    const b = new Float64Array(size).fill(0);

    // We enforce conformal energy minimization:
    // For each triangle, the gradient of the map should be a similarity transform.
    // This creates a global stiffness matrix.

    // PINNING: For pinned vertices, we add hard constraints or penalty method.
    // Penalty method is easier for this structure: Add large Number to diagonal, and Large * Target to b
    const PENALTY = 1e8;

    // ... System building code would go here ...
    // This involves iterating triangles and computing local gradients
    // placeholder:
    for (let i = 0; i < size; i++) {
        setMatrixValue(A, i, i, 1); // Identity for now (fallback)
    }

    for (const [v, [u_val, v_val]] of pinned.entries()) {
        const u_idx = v;
        const v_idx = v + numVerts;

        // Hard constraint simulation via penalty
        setMatrixValue(A, u_idx, u_idx, PENALTY);
        b[u_idx] = PENALTY * u_val;

        setMatrixValue(A, v_idx, v_idx, PENALTY);
        b[v_idx] = PENALTY * v_val;
    }

    return { A, b, map: { numVerts } };
}

function setMatrixValue(A: SparseMatrix, row: number, col: number, val: number) {
    if (!A.rows.has(row)) A.rows.set(row, []);
    A.rows.get(row)!.push({ col, val });
}

function solveConjugateGradient(A: SparseMatrix, b: Float64Array, iterations = 200): Float64Array {
    const n = b.length;
    const x = new Float64Array(n); // Initial guess: zeros
    const r = new Float64Array(n); // Residual
    const p = new Float64Array(n); // Search direction
    const Ap = new Float64Array(n); // A * p

    // r = b - A*x (initially r = b since x = 0)
    for (let i = 0; i < n; i++) {
        r[i] = b[i];
        p[i] = r[i];
    }

    let rsold = 0;
    for (let i = 0; i < n; i++) {
        rsold += r[i] * r[i];
    }

    for (let iter = 0; iter < iterations; iter++) {
        // Ap = A * p
        matrixVectorMultiply(A, p, Ap);

        // alpha = rsold / (p' * Ap)
        let pAp = 0;
        for (let i = 0; i < n; i++) {
            pAp += p[i] * Ap[i];
        }

        if (Math.abs(pAp) < 1e-10) break; // Avoid division by zero

        const alpha = rsold / pAp;

        // x = x + alpha * p
        // r = r - alpha * Ap
        for (let i = 0; i < n; i++) {
            x[i] += alpha * p[i];
            r[i] -= alpha * Ap[i];
        }

        let rsnew = 0;
        for (let i = 0; i < n; i++) {
            rsnew += r[i] * r[i];
        }

        if (Math.sqrt(rsnew) < 1e-6) break; // Converged

        const beta = rsnew / rsold;

        // p = r + beta * p
        for (let i = 0; i < n; i++) {
            p[i] = r[i] + beta * p[i];
        }

        rsold = rsnew;
    }

    return x;
}

function matrixVectorMultiply(A: SparseMatrix, x: Float64Array, result: Float64Array) {
    result.fill(0);
    for (const [row, entries] of A.rows.entries()) {
        let sum = 0;
        for (const { col, val } of entries) {
            sum += val * x[col];
        }
        result[row] = sum;
    }
}

function mapSolutionToUVs(x: Float64Array, numVerts: number, map: any): Float32Array {
    const uvs = new Float32Array(numVerts * 2);
    for (let i = 0; i < numVerts; i++) {
        uvs[i * 2] = x[i];           // u
        uvs[i * 2 + 1] = x[i + numVerts]; // v
    }
    return uvs;
}
