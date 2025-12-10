// /src/types/index.ts - Complete Type Definitions

// ===== CORE MODEL TYPES =====

export interface Model3D {
    id: string;
    hospital_id: string;
    filename: string;
    file_url: string;
    file_size: number;
    file_format: 'stl' | 'obj' | 'glb' | 'gltf';
    model_type: 'limb' | 'socket' | 'insert' | 'liner' | 'other';
    patient_id?: string;
    notes?: string;
    status: 'uploading' | 'processing' | 'completed' | 'error';

    // Enhanced metadata
    upload_source: 'manual' | 'scan' | 'cad' | 'api';
    processing_time_ms?: number;
    error_message?: string;

    created_at: string;
    updated_at: string;
}

// ===== MEASUREMENT TYPES =====

export interface Measurements3D {
    id: string;
    model_id: string;

    // Basic dimensions (in centimeters)
    length_cm: number;
    width_cm: number;
    depth_cm: number;

    // Surface and volume
    surface_area_cm2: number;
    volume_cm3: number;

    // Multiple circumference measurements
    circumferences: CircumferenceData[];

    // Key measurements for prosthetics
    key_measurements: KeyMeasurements;

    // Mesh quality information
    mesh_info: MeshInfo;

    // Processing metadata
    calculation_method: 'precise' | 'fast';
    calculation_time_ms: number;
    calculated_at: string;
}

export interface CircumferenceData {
    height_cm: number;          // Distance from bottom
    height_percent: number;     // 0-100% of total height
    circumference_cm: number;   // Perimeter at this height
    diameter_cm: number;        // Average diameter
    area_cm2: number;          // Cross-section area

    // Shape analysis
    eccentricity: number;       // How circular (0=perfect circle, 1=very elliptical)
    shape_factor: number;       // Area/perimeter² ratio
    convexity: number;         // How convex the shape is
}

export interface KeyMeasurements {
    // Critical measurements for prosthetics
    proximal_circumference_cm: number;    // Top circumference
    distal_circumference_cm: number;      // Bottom circumference  
    mid_circumference_cm: number;         // Middle circumference

    // Tapering analysis
    taper_angle_degrees: number;          // Cone angle
    taper_ratio: number;                  // Proximal/distal ratio

    // Volume distribution
    proximal_third_volume_cm3: number;    // Volume in top 1/3
    middle_third_volume_cm3: number;      // Volume in middle 1/3
    distal_third_volume_cm3: number;      // Volume in bottom 1/3
}

export interface MeshInfo {
    vertex_count: number;
    face_count: number;
    edge_count: number;

    // Quality metrics
    is_watertight: boolean;
    has_holes: boolean;
    has_non_manifold_edges: boolean;
    has_degenerate_faces: boolean;

    // Geometric properties
    bounding_box: BoundingBox;
    center_of_mass: Vector3D;
    principal_axes: PrincipalAxes;

    // Quality scores
    mesh_quality_score: number;          // 0-1, higher is better
    triangle_quality_avg: number;        // Average triangle quality
    aspect_ratio_avg: number;            // Average aspect ratio
}

// ===== ADVANCED UNWRAPPING TYPES =====

// Unwrap method type
export type UnwrapMethod = 'cylindrical' | 'lscm' | 'abf' | 'angle_based' | 'conformal' | 'hybrid' | 'custom' | 'adaptive';

export interface UnwrappedPattern {
    id: string;
    model_id: string;

    // Method and configuration
    unwrap_method: UnwrapMethod;
    unwrap_config?: UnwrapConfig;

    // Legacy support - simple 2D vertices array
    vertices_2d?: number[];  // [x1, y1, x2, y2, ...]
    indices?: number[];      // Triangle indices
    seam_vertices?: number[]; // Vertex indices on seam

    // UV Islands (multiple disconnected pieces)
    uv_islands?: UVIsland[];

    // Global pattern properties
    flat_width_cm: number;
    flat_height_cm: number;
    flat_perimeter_cm: number;
    flat_area_cm2: number;

    // Packing efficiency
    packing_efficiency?: number;          // 0-1, how well islands fill the UV space
    wasted_area_percent?: number;         // Percentage of unused UV space

    // Seam analysis
    seam_edges?: SeamEdge[] | string[];  // Support both formats
    total_seam_length_cm?: number;
    seam_to_surface_ratio?: number;       // Seam length / surface perimeter


    // Quality metrics
    distortion_metrics?: DistortionMetrics;
    distortion_values?: number[];         // Legacy per-vertex distortion
    quality_assessment?: QualityAssessment;

    // Processing info
    processing_time_ms?: number;
    manufacturing_ready?: boolean;
    created_at: string;
}

export interface UVIsland {
    id: number;                          // Island identifier
    vertices: number[];                  // Original 3D vertex indices
    triangles: number[];                 // Triangle indices (local to island)
    uv_coordinates: Float32Array;        // 2D UV coordinates [u1,v1,u2,v2,...]

    // Island properties
    bounds: UVBounds;
    area_2d: number;                    // 2D area in UV space
    area_3d: number;                    // Original 3D surface area
    boundary_vertices: number[];         // Vertices on the island boundary

    // Island-specific distortion
    local_distortion: DistortionData;

    // Packing info
    position: { x: number; y: number };  // Position in final UV layout
    rotation: number;                    // Applied rotation in radians
    scale: number;                       // Applied uniform scale
}

export interface UnwrapConfig {
    // LSCM specific
    pin_vertices?: number[];             // Vertices to pin for LSCM
    boundary_condition: 'free' | 'pinned' | 'circular';

    // Seam settings
    seam_detection: 'automatic' | 'manual' | 'curvature_based';
    seam_angle_threshold: number;        // Degrees
    seam_curvature_threshold: number;

    // Packing settings
    island_padding: number;              // Padding between islands (0-1)
    rotation_steps: number;              // Steps for rotation optimization

    // Quality settings
    max_distortion: number;              // Maximum allowed distortion
    prefer_angle_preservation: boolean;   // Favor angle vs area preservation
}

// ===== DISTORTION ANALYSIS =====

export interface DistortionMetrics {
    // Global metrics
    average_area_distortion: number;     // Mean area distortion
    average_angle_distortion: number;    // Mean angle distortion
    max_area_distortion: number;         // Worst area distortion
    max_angle_distortion: number;        // Worst angle distortion

    // Distribution analysis
    distortion_histogram?: DistortionBin[];
    high_distortion_regions?: number[];   // Vertex indices with high distortion

    // Per-vertex data
    vertex_area_distortion?: number[];    // Per-vertex area distortion values
    vertex_angle_distortion?: number[];   // Per-vertex angle distortion values
    vertex_stretch_directions?: number[]; // Principal stretch directions
    vertex_distortions?: number[];        // Legacy combined distortion values
    rms_distortion?: number;              // Root mean square distortion
}

export interface DistortionData {
    area_distortion: number;             // Area change ratio
    angle_distortion: number;            // Angle preservation measure  
    stretch_ratio: number;               // Maximum stretch ratio
    compression_ratio: number;           // Maximum compression ratio
    principal_directions: [number, number]; // Principal stretch directions
}

export interface DistortionBin {
    range: [number, number];             // Distortion value range
    count: number;                       // Number of vertices in this range
    percentage: number;                  // Percentage of total vertices
}

// ===== SEAM ANALYSIS =====

export interface SeamEdge {
    vertex_indices: [number, number];    // Edge vertex indices
    length_3d: number;                  // Length in 3D space
    curvature: number;                  // Edge curvature
    dihedral_angle: number;             // Angle between adjacent faces
    visibility_score: number;           // How visible this seam will be (0-1)
    cut_priority: number;               // Priority for cutting (higher = cut first)
}

// ===== QUALITY ASSESSMENT =====

export interface QualityAssessment {
    overall_score: number;               // 0-1, higher is better

    // Individual quality metrics
    distortion_score: number;           // How well shape is preserved
    seam_placement_score: number;       // How well seams are placed
    packing_score: number;              // How efficiently space is used
    manufacturability_score: number;     // How suitable for manufacturing

    // Quality categories
    quality_grade: 'excellent' | 'good' | 'acceptable' | 'poor';

    // Issues and recommendations
    issues: QualityIssue[];
    recommendations: string[];
}

export interface QualityIssue {
    type: 'high_distortion' | 'bad_seam' | 'overlap' | 'poor_packing' | 'manufacturability';
    severity: 'critical' | 'warning' | 'info';
    description: string;
    affected_vertices: number[];
    suggested_fix: string;
}

// ===== CROSS-SECTION ANALYSIS =====

export interface CrossSectionAnalysis {
    height_cm: number;
    height_percent: number;

    // Geometric properties
    perimeter_cm: number;
    area_cm2: number;
    centroid: { x: number; y: number };

    // Shape analysis
    bounding_box: { width: number; height: number };
    convex_hull_area: number;
    solidity: number;                    // Area / convex hull area

    // Contour properties
    contour_points: Array<{ x: number; y: number }>;
    smoothness: number;                  // Measure of contour smoothness
    symmetry_score: number;              // How symmetric the cross-section is
}

// ===== EXPORT AND REPORTING =====

export interface AnalysisReport {
    // Core data
    model: Model3D;
    measurements: Measurements3D;
    unwrapped_pattern: UnwrappedPattern;
    cross_sections: CrossSectionAnalysis[];

    // Analysis summary
    summary: AnalysisReportSummary;

    // Export settings
    export_settings: ExportSettings;

    // Metadata
    generated_at: string;
    report_version: string;
}

export interface AnalysisReportSummary {
    // Key findings
    model_classification: string;        // Auto-detected model type
    suitability_scores: {
        prosthetic_socket: number;       // 0-1 score for socket suitability
        liner_insert: number;           // 0-1 score for liner suitability
        manufacturing: number;          // 0-1 score for manufacturability
    };

    // Critical measurements
    key_dimensions: string[];           // Human-readable key measurements
    volume_classification: 'small' | 'medium' | 'large';

    // Recommendations
    manufacturing_recommendations: string[];
    fitting_recommendations: string[];
    quality_recommendations: string[];
}

export interface ExportSettings {
    // PDF settings
    include_3d_visualizations: boolean;
    include_measurements_table: boolean;
    include_cross_sections: boolean;
    include_flat_pattern: boolean;

    // SVG/Manufacturing settings
    svg_units: 'mm' | 'cm' | 'inch';
    include_seam_allowance: boolean;
    seam_allowance_mm: number;
    include_grain_line: boolean;
    include_notches: boolean;
}

// ===== UTILITY TYPES =====

export interface Vector3D {
    x: number;
    y: number;
    z: number;
}

export interface BoundingBox {
    min: Vector3D;
    max: Vector3D;
    size: Vector3D;
    center: Vector3D;
}

export interface UVBounds {
    min: { x: number; y: number };
    max: { x: number; y: number };
    width: number;
    height: number;
    center: { x: number; y: number };
}

export interface PrincipalAxes {
    primary: Vector3D;                  // Longest axis
    secondary: Vector3D;                // Medium axis  
    tertiary: Vector3D;                 // Shortest axis
    eigenvalues: [number, number, number]; // Axis lengths
}

// ===== VALIDATION TYPES =====

export interface ValidationResult {
    is_valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    quality_score: number;
    quality: 'excellent' | 'good' | 'acceptable' | 'poor';
}

export interface ValidationError {
    code: string;
    message: string;
    severity: 'critical' | 'error' | 'warning';
    affected_components: string[];
}

export interface ValidationWarning {
    code: string;
    message: string;
    suggestion: string;
    impact: 'high' | 'medium' | 'low';
}

// ===== PROCESSING STATES =====

export type ProcessingStage =
    | 'loading'
    | 'parsing'
    | 'calculating_measurements'
    | 'detecting_seams'
    | 'unwrapping'
    | 'optimizing_layout'
    | 'calculating_distortion'
    | 'validating_quality'
    | 'generating_report'
    | 'completed'
    | 'error';

export interface ProcessingStatus {
    stage: ProcessingStage;
    progress_percent: number;
    estimated_time_remaining_ms: number;
    current_operation: string;
    error_message?: string;
}

// ===== CONSTANTS =====

export const QUALITY_THRESHOLDS = {
    EXCELLENT_DISTORTION: 0.05,         // <5% distortion
    GOOD_DISTORTION: 0.15,              // <15% distortion  
    ACCEPTABLE_DISTORTION: 0.35,        // <35% distortion

    MIN_PACKING_EFFICIENCY: 0.7,        // 70% minimum packing
    GOOD_PACKING_EFFICIENCY: 0.85,      // 85% good packing

    MAX_SEAM_TO_SURFACE_RATIO: 0.3,     // Max 30% seam to surface ratio
} as const;

export const SUPPORTED_FILE_FORMATS = ['stl', 'obj', 'glb', 'gltf'] as const;
export const UNWRAP_METHODS = ['cylindrical', 'lscm', 'abf', 'angle_based'] as const;
export const MODEL_TYPES = ['limb', 'socket', 'insert', 'liner', 'other'] as const;