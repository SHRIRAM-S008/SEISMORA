import * as THREE from 'three';

/**
 * Creates a checkerboard texture for UV preview visualization
 * @param size - Size of the texture (default: 512)
 * @param checkSize - Size of each checker square (default: 32)
 * @returns THREE.Texture
 */
export function createCheckerboardTexture(size: number = 512, checkSize: number = 32): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Failed to get 2D context for checkerboard texture');
    }

    // Draw checkerboard pattern
    const numChecks = size / checkSize;

    for (let i = 0; i < numChecks; i++) {
        for (let j = 0; j < numChecks; j++) {
            const isEven = (i + j) % 2 === 0;
            ctx.fillStyle = isEven ? '#ffffff' : '#cccccc';
            ctx.fillRect(i * checkSize, j * checkSize, checkSize, checkSize);
        }
    }

    // Add grid lines for better visibility
    ctx.strokeStyle = '#999999';
    ctx.lineWidth = 1;

    for (let i = 0; i <= numChecks; i++) {
        ctx.beginPath();
        ctx.moveTo(i * checkSize, 0);
        ctx.lineTo(i * checkSize, size);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * checkSize);
        ctx.lineTo(size, i * checkSize);
        ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;

    return texture;
}

/**
 * Creates a distortion visualization texture based on distortion values
 * @param distortionValues - Array of distortion values (0-1 range)
 * @param width - Width of the texture
 * @param height - Height of the texture
 * @returns THREE.DataTexture
 */
export function createDistortionTexture(
    distortionValues: number[],
    width: number = 512,
    height: number = 512
): THREE.DataTexture {
    const size = width * height;
    const data = new Uint8Array(4 * size);

    // If no distortion values provided, create a neutral texture
    if (!distortionValues || distortionValues.length === 0) {
        for (let i = 0; i < size; i++) {
            const stride = i * 4;
            data[stride] = 128;     // R
            data[stride + 1] = 128; // G
            data[stride + 2] = 128; // B
            data[stride + 3] = 255; // A
        }
    } else {
        // Map distortion values to colors (blue = low, green = medium, red = high)
        for (let i = 0; i < size; i++) {
            const distortion = distortionValues[i % distortionValues.length] || 0;
            const color = getDistortionColor(distortion);

            const stride = i * 4;
            data[stride] = color.r;
            data[stride + 1] = color.g;
            data[stride + 2] = color.b;
            data[stride + 3] = 255;
        }
    }

    const texture = new THREE.DataTexture(data, width, height);
    texture.needsUpdate = true;

    return texture;
}

/**
 * Maps a distortion value to a color (heat map style)
 * @param distortion - Distortion value (0-1 range)
 * @returns RGB color object
 */
function getDistortionColor(distortion: number): { r: number; g: number; b: number } {
    // Clamp distortion to 0-1 range
    const d = Math.max(0, Math.min(1, distortion));

    // Blue (low) -> Green (medium) -> Yellow -> Red (high)
    if (d < 0.25) {
        // Blue to Cyan
        const t = d / 0.25;
        return {
            r: 0,
            g: Math.floor(t * 255),
            b: 255
        };
    } else if (d < 0.5) {
        // Cyan to Green
        const t = (d - 0.25) / 0.25;
        return {
            r: 0,
            g: 255,
            b: Math.floor((1 - t) * 255)
        };
    } else if (d < 0.75) {
        // Green to Yellow
        const t = (d - 0.5) / 0.25;
        return {
            r: Math.floor(t * 255),
            g: 255,
            b: 0
        };
    } else {
        // Yellow to Red
        const t = (d - 0.75) / 0.25;
        return {
            r: 255,
            g: Math.floor((1 - t) * 255),
            b: 0
        };
    }
}

/**
 * Creates a gradient texture for various visualization purposes
 * @param colorStart - Starting color (hex string)
 * @param colorEnd - Ending color (hex string)
 * @param size - Size of the texture
 * @returns THREE.Texture
 */
export function createGradientTexture(
    colorStart: string = '#0000ff',
    colorEnd: string = '#ff0000',
    size: number = 256
): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Failed to get 2D context for gradient texture');
    }

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, size, 0);
    gradient.addColorStop(0, colorStart);
    gradient.addColorStop(1, colorEnd);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    return texture;
}

/**
 * Creates a normal map texture from height data
 * @param heightData - Array of height values
 * @param width - Width of the texture
 * @param height - Height of the texture
 * @param strength - Strength of the normal effect (default: 1.0)
 * @returns THREE.DataTexture
 */
export function createNormalMapTexture(
    heightData: number[],
    width: number,
    height: number,
    strength: number = 1.0
): THREE.DataTexture {
    const size = width * height;
    const data = new Uint8Array(4 * size);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = y * width + x;

            // Sample neighboring heights
            const hL = heightData[Math.max(0, i - 1)] || 0;
            const hR = heightData[Math.min(size - 1, i + 1)] || 0;
            const hD = heightData[Math.max(0, i - width)] || 0;
            const hU = heightData[Math.min(size - 1, i + width)] || 0;

            // Calculate normal
            const dx = (hR - hL) * strength;
            const dy = (hU - hD) * strength;
            const dz = 1.0;

            // Normalize
            const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
            const nx = dx / len;
            const ny = dy / len;
            const nz = dz / len;

            // Convert to RGB (0-255 range)
            const stride = i * 4;
            data[stride] = Math.floor((nx * 0.5 + 0.5) * 255);
            data[stride + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
            data[stride + 2] = Math.floor((nz * 0.5 + 0.5) * 255);
            data[stride + 3] = 255;
        }
    }

    const texture = new THREE.DataTexture(data, width, height);
    texture.needsUpdate = true;

    return texture;
}
