import * as THREE from 'three';
import type { Measurements3D, CircumferenceData, MeshInfo } from '@/types';
import { mergeVertices } from './utils';

// Main function: calculate all measurements
export function calculateAllMeasurements(
    geometry: THREE.BufferGeometry,
    modelId: string
): Measurements3D {
    // Ensure geometry is indexed
    if (!geometry.getIndex()) {
        geometry = mergeVertices(geometry);
    }

    // Calculate bounding box
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    const size = new THREE.Vector3();
    box.getSize(size);

    // Calculate measurements
    const surfaceArea = calculateSurfaceArea(geometry);
    const volume = calculateVolume(geometry);
    const circumferences = calculateCircumferences(geometry, 10);
    const meshInfo = calculateMeshInfo(geometry);

    return {
        id: crypto.randomUUID(),
        model_id: modelId,
        length_cm: size.z * 0.1, // mm -> cm
        width_cm: size.x * 0.1, // mm -> cm
        depth_cm: size.y * 0.1, // mm -> cm
        surface_area_cm2: surfaceArea * 0.01, // mm² -> cm²
        volume_cm3: volume * 0.001, // mm³ -> cm³
        circumferences,
        mesh_info: meshInfo,
        calculated_at: new Date().toISOString()
    };
}

// Calculate surface area by summing triangle areas
export function calculateSurfaceArea(geometry: THREE.BufferGeometry): number {
    const positions = geometry.getAttribute('position').array as Float32Array;
    const indices = geometry.getIndex()?.array;

    let totalArea = 0;

    const v1 = new THREE.Vector3();
    const v2 = new THREE.Vector3();
    const v3 = new THREE.Vector3();
    const edge1 = new THREE.Vector3();
    const edge2 = new THREE.Vector3();
    const cross = new THREE.Vector3();

    if (indices) {
        // Indexed geometry
        for (let i = 0; i < indices.length; i += 3) {
            const a = indices[i] * 3;
            const b = indices[i + 1] * 3;
            const c = indices[i + 2] * 3;

            v1.set(positions[a], positions[a + 1], positions[a + 2]);
            v2.set(positions[b], positions[b + 1], positions[b + 2]);
            v3.set(positions[c], positions[c + 1], positions[c + 2]);

            edge1.subVectors(v2, v1);
            edge2.subVectors(v3, v1);
            cross.crossVectors(edge1, edge2);

            totalArea += cross.length() / 2;
        }
    } else {
        // Non-indexed geometry
        for (let i = 0; i < positions.length; i += 9) {
            v1.set(positions[i], positions[i + 1], positions[i + 2]);
            v2.set(positions[i + 3], positions[i + 4], positions[i + 5]);
            v3.set(positions[i + 6], positions[i + 7], positions[i + 8]);

            edge1.subVectors(v2, v1);
            edge2.subVectors(v3, v1);
            cross.crossVectors(edge1, edge2);

            totalArea += cross.length() / 2;
        }
    }

    return totalArea;
}

// Calculate volume using signed tetrahedron method
export function calculateVolume(geometry: THREE.BufferGeometry): number {
    const positions = geometry.getAttribute('position').array as Float32Array;
    const indices = geometry.getIndex()?.array;

    let totalVolume = 0;

    const v1 = new THREE.Vector3();
    const v2 = new THREE.Vector3();
    const v3 = new THREE.Vector3();

    const processTriangle = (a: number, b: number, c: number) => {
        v1.set(positions[a], positions[a + 1], positions[a + 2]);
        v2.set(positions[b], positions[b + 1], positions[b + 2]);
        v3.set(positions[c], positions[c + 1], positions[c + 2]);

        // Signed volume of tetrahedron with origin
        const volume = v1.dot(v2.clone().cross(v3)) / 6;
        totalVolume += volume;
    };

    if (indices) {
        for (let i = 0; i < indices.length; i += 3) {
            processTriangle(
                indices[i] * 3,
                indices[i + 1] * 3,
                indices[i + 2] * 3
            );
        }
    } else {
        for (let i = 0; i < positions.length; i += 9) {
            processTriangle(i, i + 3, i + 6);
        }
    }

    return Math.abs(totalVolume);
}

// Calculate circumferences at multiple heights
export function calculateCircumferences(
    geometry: THREE.BufferGeometry,
    sampleCount: number
): CircumferenceData[] {
    const positions = geometry.getAttribute('position').array as Float32Array;

    // Find Z range (assuming Z is height axis)
    let minZ = Infinity;
    let maxZ = -Infinity;

    for (let i = 2; i < positions.length; i += 3) {
        minZ = Math.min(minZ, positions[i]);
        maxZ = Math.max(maxZ, positions[i]);
    }

    const results: CircumferenceData[] = [];
    const heightRange = maxZ - minZ;

    for (let s = 0; s < sampleCount; s++) {
        const heightPercent = (s / (sampleCount - 1)) * 100;
        const targetZ = minZ + (s / (sampleCount - 1)) * heightRange;
        const tolerance = heightRange / sampleCount / 2;

        // Find vertices near this height
        const verticesAtHeight: { x: number; y: number }[] = [];

        for (let i = 0; i < positions.length; i += 3) {
            const z = positions[i + 2];
            if (Math.abs(z - targetZ) < tolerance) {
                verticesAtHeight.push({
                    x: positions[i],
                    y: positions[i + 1]
                });
            }
        }

        // Calculate circumference from vertices
        const circumference = calculatePolygonPerimeter(verticesAtHeight);
        const diameter = circumference / Math.PI;
        const area = Math.PI * Math.pow(diameter / 2, 2);

        results.push({
            height_cm: (targetZ - minZ) * 0.1, // mm -> cm
            height_percent: heightPercent,
            circumference_cm: circumference * 0.1, // mm -> cm
            diameter_cm: diameter * 0.1, // mm -> cm
            area_cm2: area * 0.01 // mm² -> cm²
        });
    }

    return results;
}

// Calculate perimeter of polygon formed by points
function calculatePolygonPerimeter(
    points: { x: number; y: number }[]
): number {
    if (points.length < 3) return 0;

    // Find center
    const center = {
        x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
        y: points.reduce((sum, p) => sum + p.y, 0) / points.length
    };

    // Sort by angle around center
    const sorted = [...points].sort((a, b) => {
        const angleA = Math.atan2(a.y - center.y, a.x - center.x);
        const angleB = Math.atan2(b.y - center.y, b.x - center.x);
        return angleA - angleB;
    });

    // Sum edge lengths
    let perimeter = 0;
    for (let i = 0; i < sorted.length; i++) {
        const p1 = sorted[i];
        const p2 = sorted[(i + 1) % sorted.length];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        perimeter += Math.sqrt(dx * dx + dy * dy);
    }

    return perimeter;
}

// Calculate mesh quality information
export function calculateMeshInfo(geometry: THREE.BufferGeometry): MeshInfo {
    const positions = geometry.getAttribute('position').array as Float32Array;
    const indices = geometry.getIndex()?.array;

    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;

    // Count edges and check manifold
    const edgeMap = new Map<string, number>();

    if (indices) {
        for (let i = 0; i < indices.length; i += 3) {
            const a = indices[i];
            const b = indices[i + 1];
            const c = indices[i + 2];

            const edges = [
                [Math.min(a, b), Math.max(a, b)],
                [Math.min(b, c), Math.max(b, c)],
                [Math.min(c, a), Math.max(c, a)]
            ];

            edges.forEach(([v1, v2]) => {
                const key = `${v1}-${v2}`;
                edgeMap.set(key, (edgeMap.get(key) || 0) + 1);
            });
        }
    }

    // Check if watertight (all edges shared by exactly 2 faces)
    let isWatertight = true;
    let hasHoles = false;

    for (const count of edgeMap.values()) {
        if (count !== 2) {
            isWatertight = false;
            if (count === 1) hasHoles = true;
        }
    }

    return {
        vertex_count: positions.length / 3,
        face_count: indices ? indices.length / 3 : positions.length / 9,
        is_watertight: isWatertight,
        has_holes: hasHoles,
        bounding_box: {
            min_x: box.min.x,
            max_x: box.max.x,
            min_y: box.min.y,
            max_y: box.max.y,
            min_z: box.min.z,
            max_z: box.max.z
        }
    };
}
