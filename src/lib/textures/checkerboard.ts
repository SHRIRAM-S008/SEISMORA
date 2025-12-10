import * as THREE from 'three';

/**
 * Generate a checkerboard texture for UV visualization
 * Similar to Blender's UV editing checkerboard
 */
export function createCheckerboardTexture(
    size: number = 512,
    squareSize: number = 32,
    color1: THREE.Color = new THREE.Color(0x333333),
    color2: THREE.Color = new THREE.Color(0xcccccc)
): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Could not get 2D context');
    }

    // Draw checkerboard pattern
    const numSquares = Math.floor(size / squareSize);

    for (let y = 0; y < numSquares; y++) {
        for (let x = 0; x < numSquares; x++) {
            const isEven = (x + y) % 2 === 0;
            ctx.fillStyle = isEven ? `#${color1.getHexString()}` : `#${color2.getHexString()}`;
            ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
        }
    }

    // Add grid lines for better visibility
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x <= numSquares; x++) {
        ctx.beginPath();
        ctx.moveTo(x * squareSize, 0);
        ctx.lineTo(x * squareSize, size);
        ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= numSquares; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * squareSize);
        ctx.lineTo(size, y * squareSize);
        ctx.stroke();
    }

    // Create texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;

    return texture;
}

/**
 * Create a colored UV grid texture (alternative style)
 */
export function createUVGridTexture(size: number = 512): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Could not get 2D context');
    }

    // Background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, size, size);

    // Draw colored grid
    const gridSize = size / 8;

    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            // Create gradient colors
            const hue = (x / 8) * 360;
            const lightness = 30 + (y / 8) * 40;

            ctx.fillStyle = `hsl(${hue}, 70%, ${lightness}%)`;
            ctx.fillRect(
                x * gridSize + 2,
                y * gridSize + 2,
                gridSize - 4,
                gridSize - 4
            );
        }
    }

    // Add border lines
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;

    for (let i = 0; i <= 8; i++) {
        // Vertical
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, size);
        ctx.stroke();

        // Horizontal
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(size, i * gridSize);
        ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;

    return texture;
}
