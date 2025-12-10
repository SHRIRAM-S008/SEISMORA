import { UVQualityReport, CutMesh } from './types';
import * as THREE from 'three';

export function validateUVMapping(
    uvCoordinates: Float32Array,
    originalGeometry: THREE.BufferGeometry,
    cutMesh?: CutMesh
): UVQualityReport {
    const positions = originalGeometry.getAttribute('position').array as Float32Array;
    const indices = originalGeometry.getIndex()?.array as Uint32Array;

    if (!indices) {
        throw new Error('Indexed geometry required for validation');
    }

    const numTris = indices.length / 3;
    const distortionMap = new Float32Array(numTris);

    // Calculate per-triangle distortion
    for (let i = 0; i < numTris; i++) {
        const i0 = indices[i * 3];
        const i1 = indices[i * 3 + 1];
        const i2 = indices[i * 3 + 2];

        // Get 3D triangle vertices
        const v0_3d = new THREE.Vector3(
            positions[i0 * 3],
            positions[i0 * 3 + 1],
            positions[i0 * 3 + 2]
        );
        const v1_3d = new THREE.Vector3(
            positions[i1 * 3],
            positions[i1 * 3 + 1],
            positions[i1 * 3 + 2]
        );
        const v2_3d = new THREE.Vector3(
            positions[i2 * 3],
            positions[i2 * 3 + 1],
            positions[i2 * 3 + 2]
        );

        // Calculate 3D triangle area
        const edge1_3d = new THREE.Vector3().subVectors(v1_3d, v0_3d);
        const edge2_3d = new THREE.Vector3().subVectors(v2_3d, v0_3d);
        const area3D = edge1_3d.cross(edge2_3d).length() / 2;

        // Get 2D UV triangle vertices
        const u0 = uvCoordinates[i0 * 2];
        const v0 = uvCoordinates[i0 * 2 + 1];
        const u1 = uvCoordinates[i1 * 2];
        const v1 = uvCoordinates[i1 * 2 + 1];
        const u2 = uvCoordinates[i2 * 2];
        const v2 = uvCoordinates[i2 * 2 + 1];

        // Calculate 2D triangle area using cross product
        const area2D = Math.abs(
            (u1 - u0) * (v2 - v0) - (u2 - u0) * (v1 - v0)
        ) / 2;

        // Distortion is the ratio of areas
        // Ideal is 1.0 (same area), >1 means stretching, <1 means compression
        if (area3D > 0 && area2D > 0) {
            const ratio = area2D / area3D;
            // Normalize to 0-1 range where 0 is perfect, 1 is bad
            // We'll use log scale to handle both compression and stretching
            distortionMap[i] = Math.abs(Math.log(ratio));
        } else {
            distortionMap[i] = 0; // Degenerate triangle
        }
    }

    // Calculate overall quality metrics
    let totalDistortion = 0;
    let maxDistortion = 0;
    for (let i = 0; i < numTris; i++) {
        totalDistortion += distortionMap[i];
        maxDistortion = Math.max(maxDistortion, distortionMap[i]);
    }
    const avgDistortion = totalDistortion / numTris;

    const recommendations: string[] = [];
    if (avgDistortion > 0.5) {
        recommendations.push('High average distortion detected. Consider adjusting seam placement.');
    }
    if (maxDistortion > 2.0) {
        recommendations.push('Extreme distortion in some areas. Manual UV editing may be needed.');
    }

    return {
        distortionMap,
        seamQuality: Math.max(0, 1 - avgDistortion),
        coverage: 0.7, // Placeholder
        overlaps: 0,   // Placeholder
        recommendations
    };
}

