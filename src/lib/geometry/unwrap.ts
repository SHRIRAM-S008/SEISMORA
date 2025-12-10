import * as THREE from 'three';
import type { UnwrappedPattern } from '@/types';

// Main unwrap function - cylindrical method
export function cylindricalUnwrap(
    geometry: THREE.BufferGeometry,
    modelId: string
): UnwrappedPattern {
    const positions = geometry.getAttribute('position').array as Float32Array;
    const indices = geometry.getIndex()?.array;

    if (!indices) {
        throw new Error('Geometry must be indexed for unwrapping');
    }

    // Step 1: Find height range (Z-axis)
    let minZ = Infinity;
    let maxZ = -Infinity;

    for (let i = 2; i < positions.length; i += 3) {
        minZ = Math.min(minZ, positions[i]);
        maxZ = Math.max(maxZ, positions[i]);
    }

    // Step 2: Calculate average radius for reference circumference
    let radiusSum = 0;
    let count = 0;

    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        const radius = Math.sqrt(x * x + y * y);
        radiusSum += radius;
        count++;
    }

    const avgRadius = radiusSum / count;
    const referenceCircumference = 2 * Math.PI * avgRadius;

    // Step 3: Unwrap each vertex
    const vertices2D: number[] = [];
    const seamVertices: number[] = [];

    let minX2D = Infinity;
    let maxX2D = -Infinity;
    let minY2D = Infinity;
    let maxY2D = -Infinity;

    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        const z = positions[i + 2];

        // Calculate angle around Z-axis
        const angle = Math.atan2(y, x); // -π to +π

        // Normalize angle to 0-1 range
        const normalizedAngle = (angle + Math.PI) / (2 * Math.PI);

        // Convert to 2D coordinates
        const x2D = normalizedAngle * referenceCircumference;
        const y2D = z - minZ; // Height from bottom

        vertices2D.push(x2D, y2D);

        // Track bounds
        minX2D = Math.min(minX2D, x2D);
        maxX2D = Math.max(maxX2D, x2D);
        minY2D = Math.min(minY2D, y2D);
        maxY2D = Math.max(maxY2D, y2D);

        // Check if this vertex is on the seam (angle ≈ 0)
        if (Math.abs(angle) < 0.1) {
            seamVertices.push(i / 3);
        }
    }

    // Step 4: Normalize to start from (0, 0)
    const normalizedVertices2D: number[] = [];

    for (let i = 0; i < vertices2D.length; i += 2) {
        normalizedVertices2D.push(
            vertices2D[i] - minX2D,
            vertices2D[i + 1] - minY2D
        );
    }

    // Step 5: Calculate flat measurements
    const flatWidth = maxX2D - minX2D;
    const flatHeight = maxY2D - minY2D;
    const flatPerimeter = 2 * (flatWidth + flatHeight); // Approximate
    const flatArea = calculateFlatArea(normalizedVertices2D, Array.from(indices));

    return {
        id: crypto.randomUUID(),
        model_id: modelId,
        method: 'cylindrical',
        vertices_2d: normalizedVertices2D,
        indices: Array.from(indices),
        seam_vertices: seamVertices,
        flat_width_cm: flatWidth * 0.1, // mm -> cm
        flat_height_cm: flatHeight * 0.1, // mm -> cm
        flat_perimeter_cm: flatPerimeter * 0.1, // mm -> cm
        flat_area_cm2: flatArea * 0.01, // mm² -> cm²
        created_at: new Date().toISOString()
    };
}

// Calculate area of flat pattern
function calculateFlatArea(
    vertices2D: number[],
    indices: number[]
): number {
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
        const area = Math.abs(
            (x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1)
        ) / 2;

        totalArea += area;
    }

    return totalArea;
}

// Handle seam crossing triangles
export function fixSeamCrossing(
    vertices2D: number[],
    indices: number[],
    circumference: number
): { vertices: number[]; indices: number[] } {
    const newVertices = [...vertices2D];
    const newIndices = [...indices];

    for (let i = 0; i < indices.length; i += 3) {
        const a = indices[i] * 2;
        const b = indices[i + 1] * 2;
        const c = indices[i + 2] * 2;

        const x1 = vertices2D[a];
        const x2 = vertices2D[b];
        const x3 = vertices2D[c];

        // Check if triangle crosses seam (large X difference)
        const threshold = circumference * 0.5;

        if (Math.abs(x1 - x2) > threshold ||
            Math.abs(x2 - x3) > threshold ||
            Math.abs(x3 - x1) > threshold) {
            // This triangle crosses the seam - duplicate vertices
            // Add circumference to vertices on the "left" side

            const avgX = (x1 + x2 + x3) / 3;

            if (x1 < avgX - threshold) {
                const newIndex = newVertices.length / 2;
                newVertices.push(x1 + circumference, vertices2D[a + 1]);
                newIndices[i] = newIndex;
            }
            if (x2 < avgX - threshold) {
                const newIndex = newVertices.length / 2;
                newVertices.push(x2 + circumference, vertices2D[b + 1]);
                newIndices[i + 1] = newIndex;
            }
            if (x3 < avgX - threshold) {
                const newIndex = newVertices.length / 2;
                newVertices.push(x3 + circumference, vertices2D[c + 1]);
                newIndices[i + 2] = newIndex;
            }
        }
    }

    return { vertices: newVertices, indices: newIndices };
}
