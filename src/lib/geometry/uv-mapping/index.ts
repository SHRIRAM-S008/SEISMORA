import * as THREE from 'three';
import { analyzeMesh } from './analysis';
import { findOptimalSeams } from './seams';
import { lscmUnwrap } from './lscm';
import { optimizeUVLayout } from './optimization';
import { validateUVMapping } from './validation';
import { UVQualityReport, UnwrappedPattern } from './types';

export async function performProfessionalUVMapping(
    geometry: THREE.BufferGeometry
): Promise<{
    uvPattern: UnwrappedPattern;
    qualityReport: UVQualityReport;
    recommendations: string[];
}> {

    // Step 1: Analyze mesh
    // console.log('Analyzing mesh topology...');
    const analysis = analyzeMesh(geometry);

    // Step 2: Find optimal seam placement
    // console.log('Computing optimal seam placement...');
    const seamPlacement = findOptimalSeams(geometry, analysis);

    // Step 3: Perform LSCM unwrapping
    // console.log('Performing LSCM unwrapping...');
    const lscmResult = lscmUnwrap(geometry, seamPlacement);

    // Step 4: Optimize layout
    // console.log('Optimizing UV layout...');
    const optimizedUV = optimizeUVLayout(lscmResult.uvCoordinates);

    // Step 5: Validate quality
    // console.log('Validating unwrap quality...');
    const qualityReport = validateUVMapping(optimizedUV, geometry);

    // Step 6: Convert to output format
    // Calculate bounds of UV coordinates
    let minU = Infinity, maxU = -Infinity;
    let minV = Infinity, maxV = -Infinity;

    for (let i = 0; i < optimizedUV.length; i += 2) {
        minU = Math.min(minU, optimizedUV[i]);
        maxU = Math.max(maxU, optimizedUV[i]);
        minV = Math.min(minV, optimizedUV[i + 1]);
        maxV = Math.max(maxV, optimizedUV[i + 1]);
    }

    // Normalize UV coordinates to start from (0, 0)
    const normalizedUV: number[] = [];
    for (let i = 0; i < optimizedUV.length; i += 2) {
        normalizedUV.push(optimizedUV[i] - minU);
        normalizedUV.push(optimizedUV[i + 1] - minV);
    }

    // Calculate dimensions
    const uvWidth = maxU - minU;
    const uvHeight = maxV - minV;

    // Estimate scale factor from 3D geometry
    const positions = geometry.getAttribute('position').array as Float32Array;
    const bbox = new THREE.Box3();
    for (let i = 0; i < positions.length; i += 3) {
        bbox.expandByPoint(new THREE.Vector3(
            positions[i],
            positions[i + 1],
            positions[i + 2]
        ));
    }
    const size3D = new THREE.Vector3();
    bbox.getSize(size3D);
    const avgSize = (size3D.x + size3D.y + size3D.z) / 3;

    // Scale UV to approximate real-world dimensions (in mm, then convert to cm)
    const scaleFactor = avgSize / Math.max(uvWidth, uvHeight);
    const flatWidthCm = (uvWidth * scaleFactor) * 0.1;  // mm to cm
    const flatHeightCm = (uvHeight * scaleFactor) * 0.1;

    // Calculate flat area by summing triangle areas in 2D
    const indices = geometry.getIndex()?.array || [];
    let flatArea = 0;
    for (let i = 0; i < indices.length; i += 3) {
        const i0 = indices[i];
        const i1 = indices[i + 1];
        const i2 = indices[i + 2];

        const u0 = normalizedUV[i0 * 2];
        const v0 = normalizedUV[i0 * 2 + 1];
        const u1 = normalizedUV[i1 * 2];
        const v1 = normalizedUV[i1 * 2 + 1];
        const u2 = normalizedUV[i2 * 2];
        const v2 = normalizedUV[i2 * 2 + 1];

        const area = Math.abs((u1 - u0) * (v2 - v0) - (u2 - u0) * (v1 - v0)) / 2;
        flatArea += area;
    }
    flatArea *= scaleFactor * scaleFactor * 0.01; // mm² to cm²

    const flatPerimeter = 2 * (flatWidthCm + flatHeightCm); // Approximate

    const uvPattern: UnwrappedPattern = {
        id: crypto.randomUUID(),
        model_id: '',
        method: 'lscm',
        vertices_2d: normalizedUV,
        indices: Array.from(geometry.getIndex()?.array || []),
        seam_vertices: Array.from(seamPlacement.cutVertices),
        flat_width_cm: flatWidthCm,
        flat_height_cm: flatHeightCm,
        flat_perimeter_cm: flatPerimeter,
        flat_area_cm2: flatArea,
        distortion_values: Array.from(qualityReport.distortionMap),
        created_at: new Date().toISOString()
    };

    return {
        uvPattern,
        qualityReport,
        recommendations: qualityReport.recommendations
    };
}
