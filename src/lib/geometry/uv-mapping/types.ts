export interface MeshAnalysis {
    boundaries: number[][]; // Boundary loops
    genus: number;          // Number of holes
    components: number[][];  // Connected components
    distortionMetric: number;
}

export interface SeamPlacement {
    seamEdges: Array<[number, number]>;
    cutVertices: Set<number>;
    distortionScore: number;
}

export interface CutMesh {
    vertices: Float32Array;
    triangles: Uint32Array;
    uvs?: Float32Array;
    seamEdges: Array<[number, number]>;
}

export interface LSCMResult {
    uvCoordinates: Float32Array; // [u1, v1, u2, v2, ...]
    distortion: number;
    seamLength: number;
}

export interface DistortionMetrics {
    averageAngleDistortion: number;
    averageAreaDistortion: number;
    maxStretch: number;
    overallQuality: number;
}

export interface UVQualityReport {
    distortionMap: Float32Array; // Per-triangle distortion
    seamQuality: number;
    coverage: number;           // iHow much of UV space is used is t
    overlaps: number;          // Number of overlapping triangles
    recommendations: string[];
}

export interface UnwrappedPattern {
    id: string;
    model_id: string;
    method: 'lscm' | 'cylindrical';
    vertices_2d: number[];
    indices: number[];
    seam_vertices: number[];
    flat_width_cm: number;
    flat_height_cm: number;
    flat_perimeter_cm: number;
    flat_area_cm2: number;
    distortion_values?: number[]; // Per-vertex distortion (0-1 range ideal, >1 for stretch)
    created_at: string;
}
