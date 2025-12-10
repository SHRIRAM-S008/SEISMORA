'use client';

import { useEffect, useRef } from 'react';
import type { UnwrappedPattern } from '@/types';

interface UVMappingViewerProps {
    pattern: UnwrappedPattern;
    show3DModel?: boolean;
}

export default function UVMappingViewer({ pattern, show3DModel = false }: UVMappingViewerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current || !pattern.vertices_2d || !pattern.indices) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        // Clear canvas
        ctx.fillStyle = '#1a1a1a'; // Dark background like Blender
        ctx.fillRect(0, 0, rect.width, rect.height);

        // Calculate bounds
        const uvs = pattern.vertices_2d;
        let minU = Infinity, maxU = -Infinity;
        let minV = Infinity, maxV = -Infinity;

        for (let i = 0; i < uvs.length; i += 2) {
            minU = Math.min(minU, uvs[i]);
            maxU = Math.max(maxU, uvs[i]);
            minV = Math.min(minV, uvs[i + 1]);
            maxV = Math.max(maxV, uvs[i + 1]);
        }

        const uvWidth = maxU - minU;
        const uvHeight = maxV - minV;
        const padding = 40;
        const scale = Math.min(
            (rect.width - padding * 2) / uvWidth,
            (rect.height - padding * 2) / uvHeight
        );

        // Transform UV coordinates to canvas coordinates
        const toCanvasX = (u: number) => (u - minU) * scale + padding;
        const toCanvasY = (v: number) => rect.height - ((v - minV) * scale + padding);

        // Draw grid
        drawGrid(ctx, rect.width, rect.height, padding, scale, minU, minV, uvWidth, uvHeight);

        // Draw UV islands/triangles
        ctx.strokeStyle = '#4a9eff'; // Blue edges like Blender
        ctx.lineWidth = 1.5;
        ctx.fillStyle = 'rgba(74, 158, 255, 0.15)'; // Semi-transparent fill

        const indices = pattern.indices;
        for (let i = 0; i < indices.length; i += 3) {
            const i1 = indices[i] * 2;
            const i2 = indices[i + 1] * 2;
            const i3 = indices[i + 2] * 2;

            const x1 = toCanvasX(uvs[i1]);
            const y1 = toCanvasY(uvs[i1 + 1]);
            const x2 = toCanvasX(uvs[i2]);
            const y2 = toCanvasY(uvs[i2 + 1]);
            const x3 = toCanvasX(uvs[i3]);
            const y3 = toCanvasY(uvs[i3 + 1]);

            // Fill triangle
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x3, y3);
            ctx.closePath();
            ctx.fill();

            // Stroke triangle
            ctx.stroke();
        }

        // Draw seam vertices if available
        if (pattern.seam_vertices && pattern.seam_vertices.length > 0) {
            ctx.fillStyle = '#ff4444'; // Red for seams
            ctx.strokeStyle = '#ff4444';
            ctx.lineWidth = 2;

            for (const vertexIndex of pattern.seam_vertices) {
                const i = vertexIndex * 2;
                if (i < uvs.length) {
                    const x = toCanvasX(uvs[i]);
                    const y = toCanvasY(uvs[i + 1]);

                    // Draw small circle for seam vertex
                    ctx.beginPath();
                    ctx.arc(x, y, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        // Draw UV bounds rectangle
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(
            toCanvasX(minU),
            toCanvasY(maxV),
            uvWidth * scale,
            uvHeight * scale
        );
        ctx.setLineDash([]);

    }, [pattern]);

    function drawGrid(
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        padding: number,
        scale: number,
        minU: number,
        minV: number,
        uvWidth: number,
        uvHeight: number
    ) {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 0.5;

        // Draw vertical grid lines
        const gridSpacing = 0.1; // 10% of UV space
        for (let u = 0; u <= 1; u += gridSpacing) {
            const x = (u * scale) + padding;
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, height - padding);
            ctx.stroke();
        }

        // Draw horizontal grid lines
        for (let v = 0; v <= 1; v += gridSpacing) {
            const y = height - (v * scale + padding);
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }

        // Draw axes
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1.5;

        // U axis (horizontal)
        ctx.beginPath();
        ctx.moveTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();

        // V axis (vertical)
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.stroke();

        // Draw axis labels
        ctx.fillStyle = '#999';
        ctx.font = '12px monospace';
        ctx.fillText('U', width - padding + 10, height - padding + 5);
        ctx.fillText('V', padding - 5, padding - 10);
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">UV Layout Editor</h3>
                <div className="flex items-center gap-2 text-xs text-gray-300">
                    <span>Method: {pattern.unwrap_method?.toUpperCase() || 'CYLINDRICAL'}</span>
                    {pattern.distortion_metrics && (
                        <span className="px-2 py-1 bg-gray-700 rounded">
                            Avg Distortion: {(pattern.distortion_metrics.average_area_distortion * 100).toFixed(1)}%
                        </span>
                    )}
                </div>
            </div>
            <div className="relative" style={{ height: '600px' }}>
                <canvas
                    ref={canvasRef}
                    className="w-full h-full"
                    style={{ imageRendering: 'crisp-edges' }}
                />

                {/* UV Info Overlay */}
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white text-xs p-3 rounded space-y-1">
                    <div>Vertices: {pattern.vertices_2d ? pattern.vertices_2d.length / 2 : 0}</div>
                    <div>Triangles: {pattern.indices ? pattern.indices.length / 3 : 0}</div>
                    {pattern.seam_vertices && (
                        <div className="text-red-400">Seam Vertices: {pattern.seam_vertices.length}</div>
                    )}
                    {pattern.packing_efficiency && (
                        <div>Packing: {(pattern.packing_efficiency * 100).toFixed(1)}%</div>
                    )}
                </div>

                {/* Legend */}
                <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white text-xs p-3 rounded space-y-2">
                    <div className="font-semibold mb-2">Legend</div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-blue-400 bg-blue-400 bg-opacity-20"></div>
                        <span>UV Islands</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                        <span>Seam Points</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-1 border border-dashed border-gray-500"></div>
                        <span>UV Bounds</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
