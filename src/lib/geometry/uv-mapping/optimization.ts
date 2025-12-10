import { CutMesh } from './types';

export function optimizeUVLayout(
    uvCoordinates: Float32Array,
    cutMesh?: CutMesh
): Float32Array {
    const optimized = new Float32Array(uvCoordinates);

    // Normalize to 0-1
    let minU = Infinity, maxU = -Infinity;
    let minV = Infinity, maxV = -Infinity;

    for (let i = 0; i < optimized.length; i += 2) {
        minU = Math.min(minU, optimized[i]);
        maxU = Math.max(maxU, optimized[i]);
        minV = Math.min(minV, optimized[i + 1]);
        maxV = Math.max(maxV, optimized[i + 1]);
    }

    const width = maxU - minU;
    const height = maxV - minV;
    const scale = 1.0 / Math.max(width, height, 0.0001);

    for (let i = 0; i < optimized.length; i += 2) {
        optimized[i] = (optimized[i] - minU) * scale;
        optimized[i + 1] = (optimized[i + 1] - minV) * scale;
    }

    return optimized;
}
