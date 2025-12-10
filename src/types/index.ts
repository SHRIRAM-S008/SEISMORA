
// Model uploaded by user
export interface Model3D {
    id: string;
    hospital_id: string;
    filename: string;
    file_url: string;
    file_size: number;
    file_format: 'stl' | 'obj' | 'glb' | 'gltf';
    model_type: 'limb' | 'socket' | 'other';
    patient_id?: string;
    notes?: string;
    status: 'uploading' | 'processing' | 'completed' | 'error';
    created_at: string;
    updated_at: string;
}

// 3D measurements calculated from model
export interface Measurements3D {
    id: string;
    model_id: string;

    // Dimensions (in centimeters)
    length_cm: number;
    width_cm: number;
    depth_cm: number;

    // Surface and volume
    surface_area_cm2: number;
    volume_cm3: number;

    // Circumferences at different heights
    circumferences: CircumferenceData[];

    // Mesh quality info
    mesh_info: MeshInfo;

    calculated_at: string;
}

// Circumference at a specific height
export interface CircumferenceData {
    height_cm: number;        // distance from bottom
    height_percent: number;   // 0-100%
    circumference_cm: number;
    diameter_cm: number;
    area_cm2: number;         // cross-section area
}

// Mesh quality information
export interface MeshInfo {
    vertex_count: number;
    face_count: number;
    is_watertight: boolean;
    has_holes: boolean;
    bounding_box: {
        min_x: number;
        max_x: number;
        min_y: number;
        max_y: number;
        min_z: number;
        max_z: number;
    };
}

// Unwrapped flat pattern
export interface UnwrappedPattern {
    id: string;
    model_id: string;

    // Unwrap method used
    method: 'cylindrical' | 'lscm' | 'abf';

    // 2D vertices after unwrap
    vertices_2d: number[];  // [x1, y1, x2, y2, ...]

    // Triangle indices (same as 3D)
    indices: number[];

    // Seam line vertices
    seam_vertices: number[];

    // Flat measurements
    flat_width_cm: number;
    flat_height_cm: number;
    flat_perimeter_cm: number;
    flat_area_cm2: number;

    created_at: string;
}

// Combined report data
export interface AnalysisReport {
    model: Model3D;
    measurements: Measurements3D;
    unwrapped_pattern: UnwrappedPattern;
    recommendations: string[];
    generated_at: string;
}
