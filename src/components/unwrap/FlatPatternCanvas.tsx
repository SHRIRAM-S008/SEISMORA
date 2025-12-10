'use client';

import { useEffect, useRef } from 'react';
import type { UnwrappedPattern } from '@/types';

interface FlatPatternCanvasProps {
    pattern: UnwrappedPattern | null;
    showGrid?: boolean;
    showSeam?: boolean;
}

export default function FlatPatternCanvas({
    pattern,
    showGrid = true,
    showSeam = true
}: FlatPatternCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!pattern || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const padding = 40;
        const scale = Math.min(
            (canvas.width - padding * 2) / pattern.flat_width_cm,
            (canvas.height - padding * 2) / pattern.flat_height_cm
        );

        // Clear canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        if (showGrid) {
            drawGrid(ctx, canvas.width, canvas.height, scale, padding);
        }

        // Transform to pattern coordinates
        ctx.save();
        ctx.translate(padding, padding);
        ctx.scale(scale, scale);

        // Draw triangles
        ctx.strokeStyle = '#0066cc';
        ctx.lineWidth = 0.5 / scale;

        const vertices = pattern.vertices_2d;
        const indices = pattern.indices;

        for (let i = 0; i < indices.length; i += 3) {
            const a = indices[i] * 2;
            const b = indices[i + 1] * 2;
            const c = indices[i + 2] * 2;

            ctx.beginPath();
            ctx.moveTo(vertices[a], vertices[a + 1]);
            ctx.lineTo(vertices[b], vertices[b + 1]);
            ctx.lineTo(vertices[c], vertices[c + 1]);
            ctx.closePath();
            ctx.stroke();
        }

        // Draw seam line
        if (showSeam && pattern.seam_vertices.length > 0) {
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 2 / scale;
            ctx.setLineDash([5 / scale, 3 / scale]);

            ctx.beginPath();
            pattern.seam_vertices.forEach((vertexIndex, i) => {
                const x = vertices[vertexIndex * 2];
                const y = vertices[vertexIndex * 2 + 1];

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.stroke();
            ctx.setLineDash([]);
        }

        ctx.restore();

        // Draw measurements
        drawMeasurements(ctx, pattern, scale, padding, canvas.width, canvas.height);

    }, [pattern, showGrid, showSeam]);

    return (
        <div className="bg-white rounded-lg p-4 shadow">
            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="w-full border border-gray-200 rounded"
            />

            {pattern && (
                <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
                    <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-gray-500">Width</p>
                        <p className="font-semibold">{pattern.flat_width_cm.toFixed(1)} cm</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-gray-500">Height</p>
                        <p className="font-semibold">{pattern.flat_height_cm.toFixed(1)} cm</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-gray-500">Perimeter</p>
                        <p className="font-semibold">{pattern.flat_perimeter_cm.toFixed(1)} cm</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-gray-500">Area</p>
                        <p className="font-semibold">{pattern.flat_area_cm2.toFixed(1)} cm²</p>
                    </div>
                </div>
            )}
        </div>
    );
}

function drawGrid(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    scale: number,
    padding: number
) {
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    // Draw vertical lines every 5cm
    const gridSpacing = 5 * scale;

    for (let x = padding; x < width - padding; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
        ctx.stroke();
    }

    // Draw horizontal lines every 5cm
    for (let y = padding; y < height - padding; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }
}

function drawMeasurements(
    ctx: CanvasRenderingContext2D,
    pattern: UnwrappedPattern,
    scale: number,
    padding: number,
    canvasWidth: number,
    canvasHeight: number
) {
    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';

    // Width label
    const patternWidth = pattern.flat_width_cm * scale;
    ctx.textAlign = 'center';
    ctx.fillText(
        `${pattern.flat_width_cm.toFixed(1)} cm`,
        padding + patternWidth / 2,
        canvasHeight - 10
    );

    // Height label
    const patternHeight = pattern.flat_height_cm * scale;
    ctx.save();
    ctx.translate(15, padding + patternHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${pattern.flat_height_cm.toFixed(1)} cm`, 0, 0);
    ctx.restore();
}
