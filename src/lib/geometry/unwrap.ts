import * as THREE from 'three';
import type { UnwrappedPattern, DistortionMetrics, UVIsland, UnwrapMethod } from '@/types';
import { performProfessionalUVMapping } from './uv-mapping';

interface UnwrapOptions {
    method: UnwrapMethod;
    seamPlacement: 'auto' | 'manual' | 'optimal';
    distortionTolerance: number;
    enableRelaxation: boolean;
    maxIterations: number;
    preserveAspectRatio: boolean;
    manufacturingMode: boolean;
}

interface MeshTopology {
    vertices: Float32Array;
    indices: Uint32Array;
    edges: Map<string, { triangles: number[]; boundary: boolean }>;
    boundaries: number[][];
    genus: number;
}

// Professional unwrap function - LSCM method
export async function professionalUnwrap(
    geometry: THREE.BufferGeometry,
    modelId: string
): Promise<UnwrappedPattern> {
    const result = await performProfessionalUVMapping(geometry);
    // Add modelId to the pattern
    return {
        ...result.uvPattern,
        model_id: modelId,
        unwrap_method: 'lscm'
    };
}

// Analyze mesh topology for optimal algorithm selection
function analyzeMeshTopology(geometry: THREE.BufferGeometry): MeshTopology {
    const positions = geometry.getAttribute('position').array as Float32Array;
    const indices = geometry.getIndex()?.array as Uint32Array;

    if (!indices) {
        throw new Error('Geometry must be indexed for unwrapping');
    }

    const vertices = positions;
    const edges = new Map<string, { triangles: number[]; boundary: boolean }>();

    // Build edge topology
    for (let i = 0; i < indices.length; i += 3) {
        const triangle = i / 3;
        const a = indices[i];
        const b = indices[i + 1];
        const c = indices[i + 2];

        const edgeKeys = [
            `${Math.min(a, b)}-${Math.max(a, b)}`,
            `${Math.min(b, c)}-${Math.max(b, c)}`,
            `${Math.min(c, a)}-${Math.max(c, a)}`
        ];

        edgeKeys.forEach(edgeKey => {
            if (!edges.has(edgeKey)) {
                edges.set(edgeKey, { triangles: [], boundary: false });
            }
            edges.get(edgeKey)!.triangles.push(triangle);
        });
    }

    // Identify boundary edges
    edges.forEach((edge) => {
        edge.boundary = edge.triangles.length === 1;
    });

    // Find boundary loops
    const boundaries = findBoundaryLoops(edges, vertices);

    // Calculate genus (simplified)
    const V = vertices.length / 3;
    const E = edges.size;
    const F = indices.length / 3;
    const genus = 1 - (V - E + F) / 2; // Euler characteristic

    return { vertices, indices, edges, boundaries, genus };
}

// Select optimal unwrapping method based on geometry characteristics
function selectOptimalMethod(geometry: THREE.BufferGeometry, topology: MeshTopology): UnwrapMethod {
    const bounds = new THREE.Box3().setFromBufferAttribute(geometry.getAttribute('position'));
    const size = bounds.getSize(new THREE.Vector3());

    // Calculate aspect ratios
    const aspectXY = size.x / size.y;
    const aspectXZ = size.x / size.z;
    const aspectYZ = size.y / size.z;

    // Check if roughly cylindrical
    const isCylindrical = (aspectXY > 0.3 && aspectXY < 3.0) && (size.z > Math.max(size.x, size.y) * 0.8);

    // Check complexity
    const isComplex = topology.boundaries.length > 1 || topology.genus > 0;

    if (isCylindrical && !isComplex) {
        return 'cylindrical';
    } else if (isComplex) {
        return 'hybrid';
    } else if (topology.boundaries.length === 1) {
        return 'conformal';
    } else {
        return 'angle_based';
    }
}

// Enhanced cylindrical unwrapping with optimal seam placement
async function cylindricalUnwrapEnhanced(
    geometry: THREE.BufferGeometry,
    modelId: string,
    topology: MeshTopology,
    options: UnwrapOptions
): Promise<UnwrappedPattern> {
    // Validate inputs
    if (!topology || !topology.indices) {
        throw new Error('Invalid topology: indices are required for unwrapping');
    }

    const positions = geometry.getAttribute('position').array as Float32Array;
    const indices = topology.indices;

    // Step 1: Find optimal unwrapping axis
    const optimalAxis = findOptimalCylindricalAxis(positions);
    console.log('Optimal unwrapping axis:', optimalAxis);

    // Step 2: Find optimal seam line
    const seamLine = await findOptimalSeamLine(geometry, topology, optimalAxis);

    // Step 3: Calculate height range along the axis
    const { minHeight, maxHeight, avgRadius } = calculateCylindricalBounds(positions, optimalAxis);
    const referenceCircumference = 2 * Math.PI * avgRadius;

    // Step 4: Unwrap vertices with seam awareness
    const vertices2D: number[] = [];
    const seamEdges: string[] = [];
    let minX2D = Infinity, maxX2D = -Infinity;
    let minY2D = Infinity, maxY2D = -Infinity;

    for (let i = 0; i < positions.length; i += 3) {
        const vertex = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);

        // Project onto unwrapping plane
        const angle = calculateAngleFromSeam(vertex, optimalAxis, seamLine);
        const height = vertex.dot(optimalAxis) - minHeight;

        // Handle angle wrapping for seamless unwrap
        const normalizedAngle = normalizeAngleFromSeam(angle, seamLine);

        const x2D = (normalizedAngle / (2 * Math.PI)) * referenceCircumference;
        const y2D = height;

        vertices2D.push(x2D, y2D);

        minX2D = Math.min(minX2D, x2D);
        maxX2D = Math.max(maxX2D, x2D);
        minY2D = Math.min(minY2D, y2D);
        maxY2D = Math.max(maxY2D, y2D);
    }

    // Step 5: Handle seam crossing triangles
    const { vertices: finalVertices, indices: finalIndices, seams } =
        handleSeamCrossingEnhanced(vertices2D, Array.from(indices), referenceCircumference);

    // Step 6: Normalize coordinates
    const normalizedVertices = normalizeCoordinates(finalVertices, minX2D, minY2D);

    // Step 7: Calculate final measurements
    const flatWidth = (maxX2D - minX2D) * 0.1; // Convert to cm
    const flatHeight = (maxY2D - minY2D) * 0.1;
    const flatArea = calculateTriangulatedArea(normalizedVertices, finalIndices) * 0.01; // Convert to cm²

    return {
        id: crypto.randomUUID(),
        model_id: modelId,
        unwrap_method: 'cylindrical',
        vertices_2d: normalizedVertices,
        indices: finalIndices,
        seam_vertices: seamLine.vertices,
        seam_edges: seams,
        flat_width_cm: flatWidth,
        flat_height_cm: flatHeight,
        flat_perimeter_cm: 2 * (flatWidth + flatHeight),
        flat_area_cm2: flatArea,
        total_seam_length_cm: calculateSeamLength(seams, normalizedVertices) * 0.1,
        created_at: new Date().toISOString()
    };
}

// Conformal unwrapping using angle-based flattening
async function conformalUnwrap(
    geometry: THREE.BufferGeometry,
    modelId: string,
    topology: MeshTopology,
    options: UnwrapOptions
): Promise<UnwrappedPattern> {
    console.log('Starting conformal unwrapping...');

    const positions = geometry.getAttribute('position').array as Float32Array;
    const indices = topology.indices;
    const numVertices = positions.length / 3;

    // Step 1: Build mesh connectivity
    const adjacency = buildVertexAdjacency(indices, numVertices);

    // Step 2: Calculate vertex weights (cotangent weights)
    const weights = calculateCotangentWeights(positions, indices, adjacency);

    // Step 3: Find boundary vertices
    const boundaryVertices = findBoundaryVertices(topology.boundaries[0] || []);

    // Step 4: Set up boundary constraints (map to unit circle)
    const boundaryConstraints = setupCircularBoundary(boundaryVertices);

    // Step 5: Solve Laplace equation for interior vertices
    const uvCoordinates = solveLaplaceEquation(
        numVertices,
        adjacency,
        weights,
        boundaryConstraints
    );

    // Step 6: Scale and translate to positive quadrant
    const scaledUV = scaleAndTranslateUV(uvCoordinates);

    // Step 7: Calculate measurements
    const bounds = calculateUVBounds(scaledUV);
    const flatArea = calculateTriangulatedArea(scaledUV, Array.from(indices)) * 0.01;

    return {
        id: crypto.randomUUID(),
        model_id: modelId,
        unwrap_method: 'conformal',
        vertices_2d: scaledUV,
        indices: Array.from(indices),
        seam_vertices: boundaryVertices,
        seam_edges: [],
        flat_width_cm: bounds.width * 0.1,
        flat_height_cm: bounds.height * 0.1,
        flat_perimeter_cm: 2 * (bounds.width + bounds.height) * 0.1,
        flat_area_cm2: flatArea,
        total_seam_length_cm: 0,
        created_at: new Date().toISOString()
    };
}

// Angle-based unwrapping for complex geometries
async function angleBasedUnwrap(
    geometry: THREE.BufferGeometry,
    modelId: string,
    topology: MeshTopology,
    options: UnwrapOptions
): Promise<UnwrappedPattern> {
    console.log('Starting angle-based unwrapping...');

    const positions = geometry.getAttribute('position').array as Float32Array;
    const indices = topology.indices;
    const numVertices = positions.length / 3;

    // Step 1: Calculate 3D and target 2D angles
    const angles3D = calculate3DAngles(positions, indices);
    const angles2D = calculateTarget2DAngles(angles3D, options.distortionTolerance);

    // Step 2: Build constraint system
    const constraints = buildAngleConstraints(indices, angles2D);

    // Step 3: Solve for UV coordinates
    const uvCoordinates = solveAngleConstraints(constraints, numVertices);

    // Step 4: Post-process results
    const processedUV = postProcessAngleBasedUV(uvCoordinates, positions, indices);

    // Calculate measurements
    const bounds = calculateUVBounds(processedUV);
    const flatArea = calculateTriangulatedArea(processedUV, Array.from(indices)) * 0.01;

    return {
        id: crypto.randomUUID(),
        model_id: modelId,
        unwrap_method: 'angle_based',
        vertices_2d: processedUV,
        indices: Array.from(indices),
        seam_vertices: [],
        seam_edges: [],
        flat_width_cm: bounds.width * 0.1,
        flat_height_cm: bounds.height * 0.1,
        flat_perimeter_cm: 2 * (bounds.width + bounds.height) * 0.1,
        flat_area_cm2: flatArea,
        total_seam_length_cm: 0,
        created_at: new Date().toISOString()
    };
}

// Hybrid unwrapping combining multiple methods
async function hybridUnwrap(
    geometry: THREE.BufferGeometry,
    modelId: string,
    topology: MeshTopology,
    options: UnwrapOptions
): Promise<UnwrappedPattern> {
    console.log('Starting hybrid unwrapping...');

    // Try multiple methods and choose best result
    const results = await Promise.all([
        cylindricalUnwrapEnhanced(geometry, modelId, topology, options).catch(() => null),
        conformalUnwrap(geometry, modelId, topology, options).catch(() => null),
        angleBasedUnwrap(geometry, modelId, topology, options).catch(() => null)
    ]);

    // Filter out failed results
    const validResults = results.filter(r => r !== null) as UnwrappedPattern[];

    if (validResults.length === 0) {
        throw new Error('All unwrapping methods failed');
    }

    // Select best result based on distortion metrics
    const bestResult = selectBestUnwrapResult(validResults, geometry);

    return {
        ...bestResult,
        unwrap_method: 'hybrid'
    };
}

// UV coordinate relaxation and optimization
async function relaxUVCoordinates(
    geometry: THREE.BufferGeometry,
    pattern: UnwrappedPattern,
    options: UnwrapOptions
): Promise<UnwrappedPattern> {
    console.log('Relaxing UV coordinates...');

    const positions = geometry.getAttribute('position').array as Float32Array;
    let uvCoords = [...pattern.vertices_2d];

    for (let iteration = 0; iteration < options.maxIterations; iteration++) {
        const previousUV = [...uvCoords];

        // Apply relaxation step
        uvCoords = applyUVRelaxationStep(positions, uvCoords, pattern.indices, options);

        // Check for convergence
        const maxChange = calculateMaxUVChange(previousUV, uvCoords);
        if (maxChange < 0.001) {
            console.log(`Converged after ${iteration + 1} iterations`);
            break;
        }
    }

    // Recalculate measurements with relaxed coordinates
    const bounds = calculateUVBounds(uvCoords);
    const flatArea = calculateTriangulatedArea(uvCoords, pattern.indices) * 0.01;

    return {
        ...pattern,
        vertices_2d: uvCoords,
        flat_width_cm: bounds.width * 0.1,
        flat_height_cm: bounds.height * 0.1,
        flat_area_cm2: flatArea
    };
}

// Calculate comprehensive distortion metrics
function calculateComprehensiveDistortion(
    geometry: THREE.BufferGeometry,
    pattern: UnwrappedPattern
): DistortionMetrics {
    const positions = geometry.getAttribute('position').array as Float32Array;
    const uvCoords = pattern.vertices_2d;
    const indices = pattern.indices;

    let totalAreaDistortion = 0;
    let totalAngleDistortion = 0;
    let maxAreaDistortion = 0;
    let maxAngleDistortion = 0;
    let numTriangles = 0;

    const vertexDistortions: number[] = new Array(positions.length / 3).fill(0);
    const vertexCounts: number[] = new Array(positions.length / 3).fill(0);

    for (let i = 0; i < indices.length; i += 3) {
        const i0 = indices[i];
        const i1 = indices[i + 1];
        const i2 = indices[i + 2];

        // 3D triangle
        const p0 = new THREE.Vector3(positions[i0 * 3], positions[i0 * 3 + 1], positions[i0 * 3 + 2]);
        const p1 = new THREE.Vector3(positions[i1 * 3], positions[i1 * 3 + 1], positions[i1 * 3 + 2]);
        const p2 = new THREE.Vector3(positions[i2 * 3], positions[i2 * 3 + 1], positions[i2 * 3 + 2]);

        // 2D triangle
        const uv0 = new THREE.Vector2(uvCoords[i0 * 2], uvCoords[i0 * 2 + 1]);
        const uv1 = new THREE.Vector2(uvCoords[i1 * 2], uvCoords[i1 * 2 + 1]);
        const uv2 = new THREE.Vector2(uvCoords[i2 * 2], uvCoords[i2 * 2 + 1]);

        // Calculate distortions
        const areaDistortion = calculateTriangleAreaDistortion(p0, p1, p2, uv0, uv1, uv2);
        const angleDistortion = calculateTriangleAngleDistortion(p0, p1, p2, uv0, uv1, uv2);

        totalAreaDistortion += areaDistortion;
        totalAngleDistortion += angleDistortion;
        maxAreaDistortion = Math.max(maxAreaDistortion, areaDistortion);
        maxAngleDistortion = Math.max(maxAngleDistortion, angleDistortion);
        numTriangles++;

        // Accumulate vertex distortions
        [i0, i1, i2].forEach(vertexIndex => {
            vertexDistortions[vertexIndex] += areaDistortion;
            vertexCounts[vertexIndex]++;
        });
    }

    // Average vertex distortions
    const finalVertexDistortions = vertexDistortions.map((sum, i) =>
        vertexCounts[i] > 0 ? sum / vertexCounts[i] : 0
    );

    return {
        average_area_distortion: totalAreaDistortion / numTriangles,
        max_area_distortion: maxAreaDistortion,
        average_angle_distortion: totalAngleDistortion / numTriangles,
        max_angle_distortion: maxAngleDistortion,
        vertex_distortions: finalVertexDistortions,
        rms_distortion: Math.sqrt(
            finalVertexDistortions.reduce((sum, d) => sum + d * d, 0) / finalVertexDistortions.length
        )
    };
}

// Optimize pattern for manufacturing
function optimizeForManufacturing(
    pattern: UnwrappedPattern,
    distortionMetrics: DistortionMetrics
): UnwrappedPattern {
    console.log('Optimizing for manufacturing...');

    // Step 1: Align with material grain
    const rotatedUV = alignWithGrain(pattern.vertices_2d);

    // Step 2: Minimize waste in rectangular bounds
    const optimizedUV = minimizeWaste(rotatedUV, pattern.indices);

    // Step 3: Add seam allowances
    const seamAllowanceUV = addSeamAllowances(optimizedUV, pattern.seam_edges || [], 5); // 5mm allowance

    // Step 4: Recalculate bounds
    const bounds = calculateUVBounds(seamAllowanceUV);

    return {
        ...pattern,
        vertices_2d: seamAllowanceUV,
        flat_width_cm: bounds.width * 0.1,
        flat_height_cm: bounds.height * 0.1,
        packing_efficiency: calculatePackingEfficiency({
            ...pattern,
            vertices_2d: seamAllowanceUV
        })
    };
}

// Helper function implementations
function findOptimalCylindricalAxis(positions: Float32Array): THREE.Vector3 {
    // Use PCA to find the principal axis
    const center = new THREE.Vector3();
    const numVertices = positions.length / 3;

    // Calculate centroid
    for (let i = 0; i < positions.length; i += 3) {
        center.x += positions[i];
        center.y += positions[i + 1];
        center.z += positions[i + 2];
    }
    center.divideScalar(numVertices);

    // Calculate covariance matrix
    let cov = {
        xx: 0, xy: 0, xz: 0,
        yy: 0, yz: 0, zz: 0
    };

    for (let i = 0; i < positions.length; i += 3) {
        const dx = positions[i] - center.x;
        const dy = positions[i + 1] - center.y;
        const dz = positions[i + 2] - center.z;

        cov.xx += dx * dx;
        cov.xy += dx * dy;
        cov.xz += dx * dz;
        cov.yy += dy * dy;
        cov.yz += dy * dz;
        cov.zz += dz * dz;
    }

    // Find the eigenvector corresponding to largest eigenvalue
    // Simplified: assume Z-axis is usually the main axis for prosthetic limbs
    return new THREE.Vector3(0, 0, 1);
}

async function findOptimalSeamLine(
    geometry: THREE.BufferGeometry,
    topology: MeshTopology,
    axis: THREE.Vector3
): Promise<{ vertices: number[]; edges: string[] }> {
    // Find the seam line that minimizes distortion
    // For cylindrical objects, place seam at the "back" (away from primary view)
    const positions = geometry.getAttribute('position').array as Float32Array;
    const seamVertices: number[] = [];

    for (let i = 0; i < positions.length; i += 3) {
        const vertex = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);

        // Check if vertex is approximately at angle 0 (back of cylinder)
        const angle = Math.atan2(vertex.y, vertex.x);
        if (Math.abs(angle) < 0.2) {  // ~11 degrees tolerance
            seamVertices.push(i / 3);
        }
    }

    return { vertices: seamVertices, edges: [] };
}

function calculateCylindricalBounds(positions: Float32Array, axis: THREE.Vector3): {
    minHeight: number;
    maxHeight: number;
    avgRadius: number;
} {
    let minHeight = Infinity;
    let maxHeight = -Infinity;
    let radiusSum = 0;
    let count = 0;

    for (let i = 0; i < positions.length; i += 3) {
        const vertex = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);

        const height = vertex.dot(axis);
        minHeight = Math.min(minHeight, height);
        maxHeight = Math.max(maxHeight, height);

        // Calculate radius (distance from axis)
        const projected = vertex.clone().sub(axis.clone().multiplyScalar(height));
        radiusSum += projected.length();
        count++;
    }

    return {
        minHeight,
        maxHeight,
        avgRadius: radiusSum / count
    };
}

function calculateAngleFromSeam(vertex: THREE.Vector3, axis: THREE.Vector3, seamLine: any): number {
    // Project vertex onto plane perpendicular to axis
    const height = vertex.dot(axis);
    const projected = vertex.clone().sub(axis.clone().multiplyScalar(height));

    // Calculate angle from positive X-axis
    return Math.atan2(projected.y, projected.x);
}

function normalizeAngleFromSeam(angle: number, seamLine: any): number {
    // Normalize angle to [0, 2π] range starting from seam
    const normalized = angle < 0 ? angle + 2 * Math.PI : angle;
    return normalized;
}

function handleSeamCrossingEnhanced(
    vertices2D: number[],
    indices: number[],
    circumference: number
): { vertices: number[]; indices: number[]; seams: string[] } {
    const newVertices = [...vertices2D];
    const newIndices = [...indices];
    const seams: string[] = [];
    const threshold = circumference * 0.7; // Adjusted threshold

    for (let i = 0; i < indices.length; i += 3) {
        const a = indices[i] * 2;
        const b = indices[i + 1] * 2;
        const c = indices[i + 2] * 2;

        const x1 = vertices2D[a];
        const x2 = vertices2D[b];
        const x3 = vertices2D[c];

        // Check if triangle crosses seam
        const crossesSeam = Math.abs(x1 - x2) > threshold ||
            Math.abs(x2 - x3) > threshold ||
            Math.abs(x3 - x1) > threshold;

        if (crossesSeam) {
            // Duplicate vertices as needed
            const vertices_triangle = [
                { index: a, x: x1 },
                { index: b, x: x2 },
                { index: c, x: x3 }
            ];

            // Find which vertices need adjustment
            vertices_triangle.forEach((v, idx) => {
                const otherVertices = vertices_triangle.filter((_, i) => i !== idx);
                const avgOtherX = otherVertices.reduce((sum, ov) => sum + ov.x, 0) / 2;

                if (Math.abs(v.x - avgOtherX) > threshold) {
                    const newIndex = newVertices.length / 2;
                    const adjustedX = v.x + (v.x < avgOtherX ? circumference : -circumference);
                    newVertices.push(adjustedX, vertices2D[v.index + 1]);

                    // Update triangle index
                    if (idx === 0) newIndices[i] = newIndex;
                    else if (idx === 1) newIndices[i + 1] = newIndex;
                    else newIndices[i + 2] = newIndex;
                }
            });
        }
    }

    return { vertices: newVertices, indices: newIndices, seams };
}

function normalizeCoordinates(vertices: number[], minX: number, minY: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < vertices.length; i += 2) {
        result.push(vertices[i] - minX, vertices[i + 1] - minY);
    }
    return result;
}

function calculateTriangulatedArea(vertices2D: number[], indices: number[]): number {
    let totalArea = 0;

    for (let i = 0; i < indices.length; i += 3) {
        const a = indices[i] * 2;
        const b = indices[i + 1] * 2;
        const c = indices[i + 2] * 2;

        const x1 = vertices2D[a];
        const y1 = vertices2D[a + 1];
        const x2 = vertices2D[b];
        const y2 = vertices2D[b + 1];
        const x3 = vertices2D[c];
        const y3 = vertices2D[c + 1];

        // Triangle area using cross product
        const area = Math.abs((x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1)) / 2;
        totalArea += area;
    }

    return totalArea;
}

function calculateSeamLength(seams: string[], vertices: number[]): number {
    let totalLength = 0;

    seams.forEach(seam => {
        const [v1Str, v2Str] = seam.split('-');
        const v1 = parseInt(v1Str);
        const v2 = parseInt(v2Str);

        const dx = vertices[v1 * 2] - vertices[v2 * 2];
        const dy = vertices[v1 * 2 + 1] - vertices[v2 * 2 + 1];
        totalLength += Math.sqrt(dx * dx + dy * dy);
    });

    return totalLength;
}

// Advanced helper functions for conformal unwrapping
function buildVertexAdjacency(indices: Uint32Array, numVertices: number): number[][] {
    const adjacency: number[][] = Array.from({ length: numVertices }, () => []);

    for (let i = 0; i < indices.length; i += 3) {
        const a = indices[i];
        const b = indices[i + 1];
        const c = indices[i + 2];

        adjacency[a].push(b, c);
        adjacency[b].push(c, a);
        adjacency[c].push(a, b);
    }

    // Remove duplicates and sort
    adjacency.forEach(adj => {
        const unique = [...new Set(adj)];
        adj.length = 0;
        adj.push(...unique.sort());
    });

    return adjacency;
}

function calculateCotangentWeights(
    positions: Float32Array,
    indices: Uint32Array,
    adjacency: number[][]
): Map<string, number> {
    const weights = new Map<string, number>();

    for (let i = 0; i < indices.length; i += 3) {
        const a = indices[i];
        const b = indices[i + 1];
        const c = indices[i + 2];

        const va = new THREE.Vector3(positions[a * 3], positions[a * 3 + 1], positions[a * 3 + 2]);
        const vb = new THREE.Vector3(positions[b * 3], positions[b * 3 + 1], positions[b * 3 + 2]);
        const vc = new THREE.Vector3(positions[c * 3], positions[c * 3 + 1], positions[c * 3 + 2]);

        // Calculate cotangent weights for each edge
        const edges = [
            { from: a, to: b, opposite: c, va, vb, vc },
            { from: b, to: c, opposite: a, va: vb, vb: vc, vc: va },
            { from: c, to: a, opposite: b, va: vc, vb: va, vc: vb }
        ];

        edges.forEach(({ from, to, opposite, va, vb, vc }) => {
            const edge1 = new THREE.Vector3().subVectors(va, vc);
            const edge2 = new THREE.Vector3().subVectors(vb, vc);

            const cosAngle = edge1.normalize().dot(edge2.normalize());
            const sinAngle = Math.sqrt(1 - cosAngle * cosAngle);
            const cotAngle = cosAngle / sinAngle;

            const edgeKey = `${Math.min(from, to)}-${Math.max(from, to)}`;
            const currentWeight = weights.get(edgeKey) || 0;
            weights.set(edgeKey, currentWeight + Math.max(0.001, cotAngle)); // Avoid negative/zero weights
        });
    }

    return weights;
}

function findBoundaryLoops(
    edges: Map<string, { triangles: number[]; boundary: boolean }>,
    vertices: Float32Array
): number[][] {
    const boundaryEdges = new Map<number, number[]>();

    // Build boundary edge connectivity
    edges.forEach((edge, edgeKey) => {
        if (edge.boundary) {
            const [v1, v2] = edgeKey.split('-').map(Number);

            if (!boundaryEdges.has(v1)) boundaryEdges.set(v1, []);
            if (!boundaryEdges.has(v2)) boundaryEdges.set(v2, []);

            boundaryEdges.get(v1)!.push(v2);
            boundaryEdges.get(v2)!.push(v1);
        }
    });

    const visited = new Set<number>();
    const loops: number[][] = [];

    // Trace boundary loops
    boundaryEdges.forEach((neighbors, startVertex) => {
        if (visited.has(startVertex)) return;

        const loop: number[] = [];
        let current = startVertex;

        do {
            visited.add(current);
            loop.push(current);

            // Find next unvisited neighbor
            const next = neighbors.find(n => !visited.has(n)) || neighbors[0];
            current = next;
        } while (current !== startVertex && !visited.has(current));

        if (loop.length > 2) {
            loops.push(loop);
        }
    });

    return loops;
}

function findBoundaryVertices(boundaryLoop: number[]): number[] {
    return boundaryLoop;
}

function setupCircularBoundary(boundaryVertices: number[]): Map<number, THREE.Vector2> {
    const constraints = new Map<number, THREE.Vector2>();
    const numBoundary = boundaryVertices.length;

    boundaryVertices.forEach((vertexIndex, i) => {
        const angle = (2 * Math.PI * i) / numBoundary;
        const x = Math.cos(angle);
        const y = Math.sin(angle);
        constraints.set(vertexIndex, new THREE.Vector2(x, y));
    });

    return constraints;
}

function solveLaplaceEquation(
    numVertices: number,
    adjacency: number[][],
    weights: Map<string, number>,
    boundaryConstraints: Map<number, THREE.Vector2>
): number[] {
    // Simplified Gauss-Seidel solver
    const uvCoords = new Array(numVertices * 2).fill(0);

    // Initialize boundary constraints
    boundaryConstraints.forEach((uv, vertexIndex) => {
        uvCoords[vertexIndex * 2] = uv.x;
        uvCoords[vertexIndex * 2 + 1] = uv.y;
    });

    const maxIterations = 100;
    const tolerance = 1e-6;

    for (let iter = 0; iter < maxIterations; iter++) {
        let maxChange = 0;

        for (let i = 0; i < numVertices; i++) {
            if (boundaryConstraints.has(i)) continue; // Skip boundary vertices

            let sumU = 0, sumV = 0, sumWeights = 0;

            adjacency[i].forEach(neighbor => {
                const edgeKey = `${Math.min(i, neighbor)}-${Math.max(i, neighbor)}`;
                const weight = weights.get(edgeKey) || 1;

                sumU += weight * uvCoords[neighbor * 2];
                sumV += weight * uvCoords[neighbor * 2 + 1];
                sumWeights += weight;
            });

            if (sumWeights > 0) {
                const newU = sumU / sumWeights;
                const newV = sumV / sumWeights;

                maxChange = Math.max(maxChange, Math.abs(newU - uvCoords[i * 2]));
                maxChange = Math.max(maxChange, Math.abs(newV - uvCoords[i * 2 + 1]));

                uvCoords[i * 2] = newU;
                uvCoords[i * 2 + 1] = newV;
            }
        }

        if (maxChange < tolerance) {
            console.log(`Laplace equation converged after ${iter + 1} iterations`);
            break;
        }
    }

    return uvCoords;
}

function scaleAndTranslateUV(uvCoordinates: number[]): number[] {
    let minU = Infinity, maxU = -Infinity;
    let minV = Infinity, maxV = -Infinity;

    for (let i = 0; i < uvCoordinates.length; i += 2) {
        minU = Math.min(minU, uvCoordinates[i]);
        maxU = Math.max(maxU, uvCoordinates[i]);
        minV = Math.min(minV, uvCoordinates[i + 1]);
        maxV = Math.max(maxV, uvCoordinates[i + 1]);
    }

    const scaleU = maxU - minU;
    const scaleV = maxV - minV;
    const scale = Math.max(scaleU, scaleV);

    const result: number[] = [];
    for (let i = 0; i < uvCoordinates.length; i += 2) {
        result.push(
            ((uvCoordinates[i] - minU) / scale) * 100, // Scale to reasonable size
            ((uvCoordinates[i + 1] - minV) / scale) * 100
        );
    }

    return result;
}

// Angle-based unwrapping helper functions
function calculate3DAngles(positions: Float32Array, indices: Uint32Array): Map<string, number> {
    const angles = new Map<string, number>();

    for (let i = 0; i < indices.length; i += 3) {
        const a = indices[i];
        const b = indices[i + 1];
        const c = indices[i + 2];

        const va = new THREE.Vector3(positions[a * 3], positions[a * 3 + 1], positions[a * 3 + 2]);
        const vb = new THREE.Vector3(positions[b * 3], positions[b * 3 + 1], positions[b * 3 + 2]);
        const vc = new THREE.Vector3(positions[c * 3], positions[c * 3 + 1], positions[c * 3 + 2]);

        // Calculate angles at each vertex
        const angleA = calculateAngleAtVertex(va, vb, vc);
        const angleB = calculateAngleAtVertex(vb, vc, va);
        const angleC = calculateAngleAtVertex(vc, va, vb);

        angles.set(`${a}-${i / 3}`, angleA);
        angles.set(`${b}-${i / 3}`, angleB);
        angles.set(`${c}-${i / 3}`, angleC);
    }

    return angles;
}

function calculateAngleAtVertex(center: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3): number {
    const edge1 = new THREE.Vector3().subVectors(p1, center).normalize();
    const edge2 = new THREE.Vector3().subVectors(p2, center).normalize();
    return Math.acos(Math.max(-1, Math.min(1, edge1.dot(edge2))));
}

function calculateTarget2DAngles(angles3D: Map<string, number>, tolerance: number): Map<string, number> {
    // For angle-based unwrapping, we typically want to preserve angles or adjust them minimally
    const angles2D = new Map<string, number>();

    angles3D.forEach((angle, key) => {
        // Apply distortion tolerance - angles can be adjusted within tolerance
        const adjustment = (Math.random() - 0.5) * tolerance * angle;
        angles2D.set(key, Math.max(0.01, Math.min(Math.PI - 0.01, angle + adjustment)));
    });

    return angles2D;
}

function buildAngleConstraints(indices: Uint32Array, angles2D: Map<string, number>): any {
    // This would typically involve building a system of equations based on angle constraints
    // For now, return a simplified representation
    return {
        indices: Array.from(indices),
        angles: angles2D,
        numVertices: Math.max(...indices) + 1
    };
}

function solveAngleConstraints(constraints: any, numVertices: number): number[] {
    // Simplified solver - in practice, this would use sophisticated optimization
    const uvCoords = new Array(numVertices * 2).fill(0);

    // Initialize with random positions
    for (let i = 0; i < uvCoords.length; i++) {
        uvCoords[i] = Math.random() * 100;
    }

    // Apply simple relaxation based on angle constraints
    const iterations = 50;
    for (let iter = 0; iter < iterations; iter++) {
        // Simplified: just apply some smoothing
        for (let i = 0; i < numVertices; i++) {
            // This would implement proper angle-based relaxation
            // For now, just apply minimal adjustment
            uvCoords[i * 2] += (Math.random() - 0.5) * 0.1;
            uvCoords[i * 2 + 1] += (Math.random() - 0.5) * 0.1;
        }
    }

    return uvCoords;
}

function postProcessAngleBasedUV(uvCoords: number[], positions: Float32Array, indices: Uint32Array): number[] {
    // Post-process to ensure reasonable layout
    return scaleAndTranslateUV(uvCoords);
}

// Quality assessment functions
function selectBestUnwrapResult(results: UnwrappedPattern[], geometry: THREE.BufferGeometry): UnwrappedPattern {
    let bestResult = results[0];
    let bestScore = -Infinity;

    results.forEach(result => {
        const distortionMetrics = calculateComprehensiveDistortion(geometry, result);

        // Score based on multiple factors
        const areaScore = 1 / (1 + distortionMetrics.average_area_distortion);
        const angleScore = 1 / (1 + distortionMetrics.average_angle_distortion);
        const packingScore = result.packing_efficiency || 0.5;

        const totalScore = areaScore * 0.4 + angleScore * 0.4 + packingScore * 0.2;

        if (totalScore > bestScore) {
            bestScore = totalScore;
            bestResult = result;
        }
    });

    console.log(`Selected best result with score: ${bestScore.toFixed(3)}`);
    return bestResult;
}

function applyUVRelaxationStep(
    positions: Float32Array,
    uvCoords: number[],
    indices: number[],
    options: UnwrapOptions
): number[] {
    const newUVCoords = [...uvCoords];
    const numVertices = uvCoords.length / 2;

    // Build vertex adjacency for relaxation
    const adjacency: number[][] = Array.from({ length: numVertices }, () => []);

    for (let i = 0; i < indices.length; i += 3) {
        const a = indices[i];
        const b = indices[i + 1];
        const c = indices[i + 2];

        adjacency[a].push(b, c);
        adjacency[b].push(c, a);
        adjacency[c].push(a, b);
    }

    // Apply Laplacian smoothing with area preservation
    for (let i = 0; i < numVertices; i++) {
        if (adjacency[i].length === 0) continue;

        let sumU = 0, sumV = 0;
        adjacency[i].forEach(neighbor => {
            sumU += uvCoords[neighbor * 2];
            sumV += uvCoords[neighbor * 2 + 1];
        });

        const avgU = sumU / adjacency[i].length;
        const avgV = sumV / adjacency[i].length;

        // Blend with original position to prevent over-smoothing
        const blendFactor = 0.1;
        newUVCoords[i * 2] = uvCoords[i * 2] * (1 - blendFactor) + avgU * blendFactor;
        newUVCoords[i * 2 + 1] = uvCoords[i * 2 + 1] * (1 - blendFactor) + avgV * blendFactor;
    }

    return newUVCoords;
}

function calculateMaxUVChange(previousUV: number[], currentUV: number[]): number {
    let maxChange = 0;

    for (let i = 0; i < previousUV.length; i++) {
        const change = Math.abs(currentUV[i] - previousUV[i]);
        maxChange = Math.max(maxChange, change);
    }

    return maxChange;
}

function calculateTriangleAreaDistortion(
    p0: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3,
    uv0: THREE.Vector2, uv1: THREE.Vector2, uv2: THREE.Vector2
): number {
    // Calculate 3D triangle area
    const edge1_3d = new THREE.Vector3().subVectors(p1, p0);
    const edge2_3d = new THREE.Vector3().subVectors(p2, p0);
    const area3D = edge1_3d.cross(edge2_3d).length() / 2;

    // Calculate 2D triangle area
    const edge1_2d = new THREE.Vector2().subVectors(uv1, uv0);
    const edge2_2d = new THREE.Vector2().subVectors(uv2, uv0);
    const area2D = Math.abs(edge1_2d.x * edge2_2d.y - edge1_2d.y * edge2_2d.x) / 2;

    // Return relative area distortion
    if (area3D > 0 && area2D > 0) {
        return Math.abs(Math.log(area2D / area3D));
    }
    return 0;
}

function calculateTriangleAngleDistortion(
    p0: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3,
    uv0: THREE.Vector2, uv1: THREE.Vector2, uv2: THREE.Vector2
): number {
    // Calculate angles in 3D
    const angle3D_0 = calculateAngleAtVertex(p0, p1, p2);
    const angle3D_1 = calculateAngleAtVertex(p1, p2, p0);
    const angle3D_2 = calculateAngleAtVertex(p2, p0, p1);

    // Calculate angles in 2D
    const angle2D_0 = calculateAngle2D(uv0, uv1, uv2);
    const angle2D_1 = calculateAngle2D(uv1, uv2, uv0);
    const angle2D_2 = calculateAngle2D(uv2, uv0, uv1);

    // Return average angle distortion
    const distortion0 = Math.abs(angle3D_0 - angle2D_0);
    const distortion1 = Math.abs(angle3D_1 - angle2D_1);
    const distortion2 = Math.abs(angle3D_2 - angle2D_2);

    return (distortion0 + distortion1 + distortion2) / 3;
}

function calculateAngle2D(center: THREE.Vector2, p1: THREE.Vector2, p2: THREE.Vector2): number {
    const edge1 = new THREE.Vector2().subVectors(p1, center).normalize();
    const edge2 = new THREE.Vector2().subVectors(p2, center).normalize();
    return Math.acos(Math.max(-1, Math.min(1, edge1.dot(edge2))));
}

// Manufacturing optimization functions
function alignWithGrain(uvCoords: number[]): number[] {
    // Align the pattern with material grain (typically along longest dimension)
    const bounds = calculateUVBounds(uvCoords);

    if (bounds.height > bounds.width) {
        // Already aligned with grain
        return uvCoords;
    }

    // Rotate 90 degrees to align with grain
    const result: number[] = [];
    const centerX = bounds.width / 2;
    const centerY = bounds.height / 2;

    for (let i = 0; i < uvCoords.length; i += 2) {
        const x = uvCoords[i] - centerX;
        const y = uvCoords[i + 1] - centerY;

        // Rotate 90 degrees: (x,y) -> (-y,x)
        result.push(-y + centerY, x + centerX);
    }

    return result;
}

function minimizeWaste(uvCoords: number[], indices: number[]): number[] {
    // Optimize packing to minimize material waste
    // This could involve more sophisticated nesting algorithms
    return uvCoords; // Simplified for now
}

function addSeamAllowances(uvCoords: number[], seamEdges: string[], allowanceMM: number): number[] {
    // Add seam allowances around the pattern boundary
    // This is a simplified implementation
    const result = [...uvCoords];

    // For each boundary vertex, offset outward by allowance amount
    // This would need proper boundary detection and normal calculation

    return result;
}

function calculateUVBounds(uvCoords: number[]): { width: number; height: number; minX: number; minY: number; maxX: number; maxY: number } {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    for (let i = 0; i < uvCoords.length; i += 2) {
        minX = Math.min(minX, uvCoords[i]);
        maxX = Math.max(maxX, uvCoords[i]);
        minY = Math.min(minY, uvCoords[i + 1]);
        maxY = Math.max(maxY, uvCoords[i + 1]);
    }

    return {
        width: maxX - minX,
        height: maxY - minY,
        minX, minY, maxX, maxY
    };
}

function identifyUVIslands(pattern: UnwrappedPattern): UVIsland[] {
    // Identify connected components in UV space
    const numVertices = pattern.vertices_2d.length / 2;
    const visited = new Array(numVertices).fill(false);
    const islands: UVIsland[] = [];

    for (let i = 0; i < numVertices; i++) {
        if (visited[i]) continue;

        const island = findConnectedComponent(i, pattern.indices, visited);
        if (island.length > 0) {
            const uvCoords: number[] = [];
            const triangles: number[] = [];

            island.forEach(vertexIndex => {
                uvCoords.push(
                    pattern.vertices_2d[vertexIndex * 2],
                    pattern.vertices_2d[vertexIndex * 2 + 1]
                );
            });

            // Find triangles that belong to this island
            for (let j = 0; j < pattern.indices.length; j += 3) {
                const a = pattern.indices[j];
                const b = pattern.indices[j + 1];
                const c = pattern.indices[j + 2];

                if (island.includes(a) && island.includes(b) && island.includes(c)) {
                    triangles.push(a, b, c);
                }
            }

            const bounds = calculateUVBounds(uvCoords);

            islands.push({
                id: islands.length,
                vertices: island,
                uvCoords,
                triangles,
                bounds: {
                    min: { x: bounds.minX, y: bounds.minY },
                    max: { x: bounds.maxX, y: bounds.maxY }
                },
                area: calculateTriangulatedArea(uvCoords, triangles)
            });
        }
    }

    return islands;
}

function findConnectedComponent(startVertex: number, indices: number[], visited: boolean[]): number[] {
    const component: number[] = [];
    const stack = [startVertex];

    while (stack.length > 0) {
        const vertex = stack.pop()!;
        if (visited[vertex]) continue;

        visited[vertex] = true;
        component.push(vertex);

        // Find all connected vertices
        for (let i = 0; i < indices.length; i += 3) {
            const a = indices[i];
            const b = indices[i + 1];
            const c = indices[i + 2];

            if (vertex === a) {
                if (!visited[b]) stack.push(b);
                if (!visited[c]) stack.push(c);
            } else if (vertex === b) {
                if (!visited[a]) stack.push(a);
                if (!visited[c]) stack.push(c);
            } else if (vertex === c) {
                if (!visited[a]) stack.push(a);
                if (!visited[b]) stack.push(b);
            }
        }
    }

    return component;
}

function calculatePackingEfficiency(pattern: UnwrappedPattern): number {
    // Calculate how efficiently the pattern uses the bounding rectangle
    const bounds = calculateUVBounds(pattern.vertices_2d);
    const boundingArea = bounds.width * bounds.height;
    const patternArea = calculateTriangulatedArea(pattern.vertices_2d, pattern.indices);

    return boundingArea > 0 ? patternArea / boundingArea : 0;
}

// Export enhanced functions
export {
    professionalUnwrap as default,
    cylindricalUnwrapEnhanced as cylindricalUnwrap,
    conformalUnwrap,
    angleBasedUnwrap,
    hybridUnwrap,
    calculateComprehensiveDistortion,
    identifyUVIslands,
    calculatePackingEfficiency
};