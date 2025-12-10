'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import type { UnwrappedPattern, UVIsland, DistortionMetrics } from '@/types';

interface FlatPatternCanvasProps {
    pattern: UnwrappedPattern | null;
    showGrid?: boolean;
    showSeam?: boolean;
    showDistortion?: boolean;
    showUVIslands?: boolean;
    showMeasurements?: boolean;
    showManufacturingGuides?: boolean;
    onPatternClick?: (point: { x: number; y: number }) => void;
    onExportReady?: (canvas: HTMLCanvasElement) => void;
}

interface ViewportState {
    scale: number;
    offsetX: number;
    offsetY: number;
    isDragging: boolean;
    lastMousePos: { x: number; y: number };
}

interface RenderSettings {
    wireframeColor: string;
    seamColor: string;
    distortionColors: {
        low: string;
        medium: string;
        high: string;
    };
    backgroundColor: string;
    gridColor: string;
    textColor: string;
    islandColors: string[];
}

export default function FlatPatternCanvas({
    pattern,
    showGrid = true,
    showSeam = true,
    showDistortion = false,
    showUVIslands = false,
    showMeasurements = true,
    showManufacturingGuides = false,
    onPatternClick,
    onExportReady
}: FlatPatternCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIsland, setSelectedIsland] = useState<number | null>(null);
    const [measurementMode, setMeasurementMode] = useState(false);
    const [measurementPoints, setMeasurementPoints] = useState<Array<{ x: number, y: number }>>([]);

    // Viewport state for zoom and pan
    const [viewport, setViewport] = useState<ViewportState>({
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        isDragging: false,
        lastMousePos: { x: 0, y: 0 }
    });

    // Enhanced render settings
    const renderSettings: RenderSettings = useMemo(() => ({
        wireframeColor: '#2563eb',
        seamColor: '#dc2626',
        distortionColors: {
            low: '#10b981',
            medium: '#f59e0b',
            high: '#ef4444'
        },
        backgroundColor: '#ffffff',
        gridColor: '#e5e7eb',
        textColor: '#374151',
        islandColors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#f97316', '#06b6d4']
    }), []);

    // Optimized pattern bounds calculation
    const patternBounds = useMemo(() => {
        if (!pattern?.vertices_2d || pattern.vertices_2d.length === 0) {
            return { minX: 0, maxX: 100, minY: 0, maxY: 100, width: 100, height: 100 };
        }

        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

        for (let i = 0; i < pattern.vertices_2d.length; i += 2) {
            const x = pattern.vertices_2d[i];
            const y = pattern.vertices_2d[i + 1];
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        }

        return {
            minX, maxX, minY, maxY,
            width: maxX - minX,
            height: maxY - minY
        };
    }, [pattern?.vertices_2d]);

    // Mouse event handlers for interactivity
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (measurementMode) {
            // Convert screen coordinates to pattern coordinates
            const patternX = (x - viewport.offsetX) / viewport.scale;
            const patternY = (y - viewport.offsetY) / viewport.scale;

            setMeasurementPoints(prev => {
                if (prev.length >= 2) return [{ x: patternX, y: patternY }];
                return [...prev, { x: patternX, y: patternY }];
            });
            return;
        }

        setViewport(prev => ({
            ...prev,
            isDragging: true,
            lastMousePos: { x, y }
        }));

        if (onPatternClick) {
            const patternX = (x - viewport.offsetX) / viewport.scale;
            const patternY = (y - viewport.offsetY) / viewport.scale;
            onPatternClick({ x: patternX, y: patternY });
        }
    }, [viewport, measurementMode, onPatternClick]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!viewport.isDragging || !canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const deltaX = x - viewport.lastMousePos.x;
        const deltaY = y - viewport.lastMousePos.y;

        setViewport(prev => ({
            ...prev,
            offsetX: prev.offsetX + deltaX,
            offsetY: prev.offsetY + deltaY,
            lastMousePos: { x, y }
        }));
    }, [viewport.isDragging, viewport.lastMousePos]);

    const handleMouseUp = useCallback(() => {
        setViewport(prev => ({ ...prev, isDragging: false }));
    }, []);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        if (!canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.max(0.1, Math.min(5, viewport.scale * scaleFactor));

        // Zoom towards mouse position
        const scaleChange = newScale / viewport.scale;
        const newOffsetX = mouseX - (mouseX - viewport.offsetX) * scaleChange;
        const newOffsetY = mouseY - (mouseY - viewport.offsetY) * scaleChange;

        setViewport(prev => ({
            ...prev,
            scale: newScale,
            offsetX: newOffsetX,
            offsetY: newOffsetY
        }));
    }, [viewport]);

    // Auto-fit pattern to canvas
    const autoFit = useCallback(() => {
        if (!canvasRef.current || !pattern) return;

        const canvas = canvasRef.current;
        const padding = 60;

        const scaleX = (canvas.width - padding * 2) / patternBounds.width;
        const scaleY = (canvas.height - padding * 2) / patternBounds.height;
        const optimalScale = Math.min(scaleX, scaleY, 2); // Max scale of 2x

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const patternCenterX = (patternBounds.minX + patternBounds.maxX) / 2;
        const patternCenterY = (patternBounds.minY + patternBounds.maxY) / 2;

        setViewport({
            scale: optimalScale,
            offsetX: centerX - patternCenterX * optimalScale,
            offsetY: centerY - patternCenterY * optimalScale,
            isDragging: false,
            lastMousePos: { x: 0, y: 0 }
        });
    }, [pattern, patternBounds]);

    // Enhanced rendering function
    const render = useCallback(() => {
        if (!pattern || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas with background
        ctx.fillStyle = renderSettings.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Save context for transformations
        ctx.save();

        // Apply viewport transformations
        ctx.translate(viewport.offsetX, viewport.offsetY);
        ctx.scale(viewport.scale, viewport.scale);

        // Draw grid
        if (showGrid) {
            drawEnhancedGrid(ctx, patternBounds, renderSettings);
        }

        // Draw manufacturing guides
        if (showManufacturingGuides) {
            drawManufacturingGuides(ctx, pattern, renderSettings);
        }

        // Draw UV islands with different colors
        if (showUVIslands && pattern.uv_islands) {
            drawUVIslands(ctx, pattern.uv_islands, renderSettings, selectedIsland);
        } else {
            // Draw main pattern
            drawPattern(ctx, pattern, renderSettings, showDistortion);
        }

        // Draw seam lines
        if (showSeam) {
            drawSeamLines(ctx, pattern, renderSettings);
        }

        // Draw measurement lines
        if (measurementPoints.length > 0) {
            drawMeasurementLines(ctx, measurementPoints, renderSettings);
        }

        ctx.restore();

        // Draw UI overlays (not transformed)
        if (showMeasurements) {
            drawMeasurementOverlay(ctx, pattern, canvas.width, canvas.height);
        }

        // Draw quality indicators
        if (pattern.distortion_metrics) {
            drawQualityIndicators(ctx, pattern.distortion_metrics, canvas.width);
        }

    }, [pattern, viewport, renderSettings, showGrid, showSeam, showDistortion, showUVIslands,
        showMeasurements, showManufacturingGuides, selectedIsland, measurementPoints, patternBounds]);

    // Animation loop for smooth interactions
    useEffect(() => {
        const animate = () => {
            render();
            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [render]);

    // Auto-fit on pattern change
    useEffect(() => {
        if (pattern) {
            setTimeout(autoFit, 100);
        }
    }, [pattern, autoFit]);

    // Export functionality
    useEffect(() => {
        if (onExportReady && canvasRef.current) {
            onExportReady(canvasRef.current);
        }
    }, [onExportReady, pattern]);

    const resetMeasurements = () => {
        setMeasurementPoints([]);
    };

    const calculateDistance = (p1: { x: number, y: number }, p2: { x: number, y: number }) => {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    };

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Enhanced Toolbar */}
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        🎨 Flat Pattern Viewer
                        {pattern?.unwrap_method && (
                            <span className="text-sm font-normal text-gray-500 capitalize">
                                ({pattern.unwrap_method})
                            </span>
                        )}
                    </h3>
                </div>

                <div className="flex items-center gap-2">
                    {/* Measurement Tool */}
                    <button
                        onClick={() => {
                            setMeasurementMode(!measurementMode);
                            resetMeasurements();
                        }}
                        className={`px-3 py-1 rounded text-sm transition-colors ${measurementMode
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        title="Measure distances"
                    >
                        📏 Measure
                    </button>

                    {/* Zoom Controls */}
                    <div className="flex items-center gap-1 bg-gray-200 rounded">
                        <button
                            onClick={() => setViewport(prev => ({
                                ...prev,
                                scale: Math.min(5, prev.scale * 1.2)
                            }))}
                            className="px-2 py-1 hover:bg-gray-300 rounded-l text-sm"
                            title="Zoom in"
                        >
                            +
                        </button>
                        <span className="px-2 py-1 text-sm text-gray-600 min-w-[4rem] text-center">
                            {Math.round(viewport.scale * 100)}%
                        </span>
                        <button
                            onClick={() => setViewport(prev => ({
                                ...prev,
                                scale: Math.max(0.1, prev.scale * 0.8)
                            }))}
                            className="px-2 py-1 hover:bg-gray-300 rounded-r text-sm"
                            title="Zoom out"
                        >
                            -
                        </button>
                    </div>

                    {/* Auto Fit */}
                    <button
                        onClick={autoFit}
                        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm transition-colors"
                        title="Fit to view"
                    >
                        🔍 Fit
                    </button>

                    {/* Quality Toggle */}
                    {pattern?.distortion_metrics && (
                        <button
                            onClick={() => setSelectedIsland(selectedIsland !== null ? null : 0)}
                            className={`px-3 py-1 rounded text-sm transition-colors ${selectedIsland !== null
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            title="Toggle quality view"
                        >
                            ⭐ Quality
                        </button>
                    )}
                </div>
            </div>

            {/* Interactive Canvas */}
            <div className="relative">
                <canvas
                    ref={canvasRef}
                    width={1000}
                    height={700}
                    className={`w-full h-[700px] ${measurementMode ? 'cursor-crosshair' : 'cursor-move'}`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onWheel={handleWheel}
                />

                {/* Loading Overlay */}
                {isLoading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Rendering pattern...</p>
                        </div>
                    </div>
                )}

                {/* Measurement Display */}
                {measurementPoints.length === 2 && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow">
                        <h4 className="font-medium text-gray-800 mb-1">📏 Measurement</h4>
                        <p className="text-sm text-gray-600">
                            Distance: <span className="font-semibold">
                                {calculateDistance(measurementPoints[0], measurementPoints[1]).toFixed(2)} cm
                            </span>
                        </p>
                        <button
                            onClick={resetMeasurements}
                            className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                        >
                            Clear measurement
                        </button>
                    </div>
                )}

                {/* Instructions */}
                {measurementMode && measurementPoints.length < 2 && (
                    <div className="absolute bottom-4 left-4 bg-blue-100 border border-blue-300 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                            Click two points to measure distance
                        </p>
                    </div>
                )}

                {/* Controls Help */}
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white rounded-lg p-2 text-xs space-y-1">
                    <p>🖱️ Drag: Pan view</p>
                    <p>🔄 Scroll: Zoom in/out</p>
                    <p>📏 Measure: Click two points</p>
                </div>
            </div>

            {/* Enhanced Pattern Statistics */}
            {pattern && (
                <div className="p-4 bg-gray-50 border-t">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                        <StatCard
                            label="Width"
                            value={`${(pattern.flat_width_cm || 0).toFixed(1)} cm`}
                            icon="↔️"
                            color="blue"
                        />
                        <StatCard
                            label="Height"
                            value={`${(pattern.flat_height_cm || 0).toFixed(1)} cm`}
                            icon="↕️"
                            color="green"
                        />
                        <StatCard
                            label="Area"
                            value={`${(pattern.flat_area_cm2 || 0).toFixed(1)} cm²`}
                            icon="🎨"
                            color="purple"
                        />
                        <StatCard
                            label="Perimeter"
                            value={`${(pattern.flat_perimeter_cm || 0).toFixed(1)} cm`}
                            icon="⭕"
                            color="orange"
                        />
                        {pattern.packing_efficiency && (
                            <StatCard
                                label="Packing"
                                value={`${(pattern.packing_efficiency * 100).toFixed(1)}%`}
                                icon="📦"
                                color="teal"
                            />
                        )}
                        {pattern.total_seam_length_cm && (
                            <StatCard
                                label="Seam Length"
                                value={`${pattern.total_seam_length_cm.toFixed(1)} cm`}
                                icon="✂️"
                                color="red"
                            />
                        )}
                    </div>

                    {/* Distortion Summary */}
                    {pattern.distortion_metrics && (
                        <div className="mt-4 p-3 bg-white rounded-lg border">
                            <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                                📊 Quality Summary
                            </h4>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600">Avg Distortion</p>
                                    <p className="font-semibold text-lg">
                                        {(pattern.distortion_metrics.average_area_distortion * 100).toFixed(1)}%
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Max Distortion</p>
                                    <p className="font-semibold text-lg">
                                        {(pattern.distortion_metrics.max_area_distortion * 100).toFixed(1)}%
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Quality Grade</p>
                                    <p className={`font-semibold text-lg ${pattern.distortion_metrics.average_area_distortion < 0.05 ? 'text-green-600' :
                                        pattern.distortion_metrics.average_area_distortion < 0.15 ? 'text-blue-600' :
                                            pattern.distortion_metrics.average_area_distortion < 0.35 ? 'text-yellow-600' :
                                                'text-red-600'
                                        }`}>
                                        {pattern.distortion_metrics.average_area_distortion < 0.05 ? 'Excellent' :
                                            pattern.distortion_metrics.average_area_distortion < 0.15 ? 'Good' :
                                                pattern.distortion_metrics.average_area_distortion < 0.35 ? 'Fair' : 'Poor'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Enhanced drawing functions
function drawEnhancedGrid(
    ctx: CanvasRenderingContext2D,
    bounds: any,
    settings: RenderSettings
) {
    ctx.strokeStyle = settings.gridColor;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([]);

    const gridSize = 10; // 1cm grid
    const startX = Math.floor(bounds.minX / gridSize) * gridSize;
    const endX = Math.ceil(bounds.maxX / gridSize) * gridSize;
    const startY = Math.floor(bounds.minY / gridSize) * gridSize;
    const endY = Math.ceil(bounds.maxY / gridSize) * gridSize;

    // Draw vertical lines
    for (let x = startX; x <= endX; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = startY; y <= endY; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
    }

    // Draw major grid lines every 5cm
    ctx.strokeStyle = settings.gridColor.replace('e5e7eb', 'c1c7cd');
    ctx.lineWidth = 1;

    for (let x = startX; x <= endX; x += gridSize * 5) {
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        ctx.stroke();
    }

    for (let y = startY; y <= endY; y += gridSize * 5) {
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
    }
}

function drawPattern(
    ctx: CanvasRenderingContext2D,
    pattern: UnwrappedPattern,
    settings: RenderSettings,
    showDistortion: boolean
) {
    if (!pattern.vertices_2d || !pattern.indices) return;

    const vertices = pattern.vertices_2d;
    const indices = pattern.indices;

    // Draw filled triangles with distortion colors if available
    if (showDistortion && pattern.distortion_values) {
        for (let i = 0; i < indices.length; i += 3) {
            const a = indices[i] * 2;
            const b = indices[i + 1] * 2;
            const c = indices[i + 2] * 2;

            // Calculate average distortion for this triangle
            const distA = pattern.distortion_values[indices[i]] || 0;
            const distB = pattern.distortion_values[indices[i + 1]] || 0;
            const distC = pattern.distortion_values[indices[i + 2]] || 0;
            const avgDistortion = (distA + distB + distC) / 3;

            // Color based on distortion
            const color = avgDistortion < 0.1 ? settings.distortionColors.low :
                avgDistortion < 0.3 ? settings.distortionColors.medium :
                    settings.distortionColors.high;

            ctx.fillStyle = color + '40'; // Add transparency
            ctx.strokeStyle = color;
            ctx.lineWidth = 0.5;

            ctx.beginPath();
            ctx.moveTo(vertices[a], vertices[a + 1]);
            ctx.lineTo(vertices[b], vertices[b + 1]);
            ctx.lineTo(vertices[c], vertices[c + 1]);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    } else {
        // Draw wireframe
        ctx.strokeStyle = settings.wireframeColor;
        ctx.lineWidth = 0.8;
        ctx.setLineDash([]);

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
    }
}

function drawUVIslands(
    ctx: CanvasRenderingContext2D,
    islands: UVIsland[],
    settings: RenderSettings,
    selectedIsland: number | null
) {
    islands.forEach((island, index) => {
        const isSelected = selectedIsland === index;
        const color = settings.islandColors[index % settings.islandColors.length];

        ctx.fillStyle = color + (isSelected ? '60' : '20');
        ctx.strokeStyle = color;
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.setLineDash(isSelected ? [5, 2] : []);

        // Draw island triangles
        for (let i = 0; i < island.triangles.length; i += 3) {
            const a = island.triangles[i] * 2;
            const b = island.triangles[i + 1] * 2;
            const c = island.triangles[i + 2] * 2;

            if (a < island.uvCoords.length && b < island.uvCoords.length && c < island.uvCoords.length) {
                ctx.beginPath();
                ctx.moveTo(island.uvCoords[a], island.uvCoords[a + 1]);
                ctx.lineTo(island.uvCoords[b], island.uvCoords[b + 1]);
                ctx.lineTo(island.uvCoords[c], island.uvCoords[c + 1]);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
        }

        // Draw island label
        if (island.bounds) {
            const centerX = (island.bounds.min.x + island.bounds.max.x) / 2;
            const centerY = (island.bounds.min.y + island.bounds.max.y) / 2;

            ctx.fillStyle = settings.textColor;
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`Island ${index + 1}`, centerX, centerY);
        }
    });

    ctx.setLineDash([]);
}

function drawSeamLines(
    ctx: CanvasRenderingContext2D,
    pattern: UnwrappedPattern,
    settings: RenderSettings
) {
    if (!pattern.seam_edges || pattern.seam_edges.length === 0) return;

    ctx.strokeStyle = settings.seamColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);

    // Draw seam edges
    pattern.seam_edges.forEach(edge => {
        const vertices = edge.split('-').map(Number);
        if (vertices.length >= 2 && pattern.vertices_2d) {
            const startIdx = vertices[0] * 2;
            const endIdx = vertices[1] * 2;

            if (startIdx < pattern.vertices_2d.length && endIdx < pattern.vertices_2d.length) {
                ctx.beginPath();
                ctx.moveTo(pattern.vertices_2d[startIdx], pattern.vertices_2d[startIdx + 1]);
                ctx.lineTo(pattern.vertices_2d[endIdx], pattern.vertices_2d[endIdx + 1]);
                ctx.stroke();
            }
        }
    });

    ctx.setLineDash([]);
}

function drawManufacturingGuides(
    ctx: CanvasRenderingContext2D,
    pattern: UnwrappedPattern,
    settings: RenderSettings
) {
    if (!pattern.vertices_2d) return;

    // Draw seam allowance guides
    const seamAllowance = 5; // 5mm seam allowance

    ctx.strokeStyle = '#9333ea';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    // Create offset outline for seam allowance
    // This is a simplified version - in production, you'd use a proper offset algorithm
    const vertices = pattern.vertices_2d;
    const indices = pattern.indices;

    // Find boundary edges
    const edges = new Map<string, number>();
    for (let i = 0; i < indices.length; i += 3) {
        const a = indices[i];
        const b = indices[i + 1];
        const c = indices[i + 2];

        const edges_triangle = [
            [Math.min(a, b), Math.max(a, b)].join('-'),
            [Math.min(b, c), Math.max(b, c)].join('-'),
            [Math.min(c, a), Math.max(c, a)].join('-')
        ];

        edges_triangle.forEach(edge => {
            edges.set(edge, (edges.get(edge) || 0) + 1);
        });
    }

    // Draw boundary edges with seam allowance
    edges.forEach((count, edge) => {
        if (count === 1) { // Boundary edge
            const [v1, v2] = edge.split('-').map(Number);
            const x1 = vertices[v1 * 2];
            const y1 = vertices[v1 * 2 + 1];
            const x2 = vertices[v2 * 2];
            const y2 = vertices[v2 * 2 + 1];

            // Calculate normal vector
            const dx = x2 - x1;
            const dy = y2 - y1;
            const len = Math.sqrt(dx * dx + dy * dy);
            const nx = -dy / len * seamAllowance;
            const ny = dx / len * seamAllowance;

            ctx.beginPath();
            ctx.moveTo(x1 + nx, y1 + ny);
            ctx.lineTo(x2 + nx, y2 + ny);
            ctx.stroke();
        }
    });

    // Draw grain line
    const centerX = (pattern.flat_width_cm || 0) / 2;
    const centerY = (pattern.flat_height_cm || 0) / 2;

    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 5]);

    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 20);
    ctx.lineTo(centerX, centerY + 20);
    ctx.stroke();

    // Draw grain line arrow
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 20);
    ctx.lineTo(centerX - 3, centerY - 15);
    ctx.lineTo(centerX + 3, centerY - 15);
    ctx.closePath();
    ctx.fill();

    ctx.setLineDash([]);

    // Draw notches for alignment
    if (pattern.seam_edges && pattern.seam_edges.length > 0) {
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 2;

        // Add notches at key seam points
        const notchPositions = [0.25, 0.5, 0.75]; // 25%, 50%, 75% along seams

        notchPositions.forEach(pos => {
            // This is simplified - would need actual seam path calculation
            const notchX = centerX + Math.cos(pos * Math.PI * 2) * 20;
            const notchY = centerY + Math.sin(pos * Math.PI * 2) * 20;

            ctx.beginPath();
            ctx.moveTo(notchX - 3, notchY);
            ctx.lineTo(notchX + 3, notchY);
            ctx.moveTo(notchX, notchY - 3);
            ctx.lineTo(notchX, notchY + 3);
            ctx.stroke();
        });
    }
}

function drawMeasurementLines(
    ctx: CanvasRenderingContext2D,
    points: Array<{ x: number, y: number }>,
    settings: RenderSettings
) {
    if (points.length < 2) return;

    const [p1, p2] = points;

    // Draw measurement line
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();

    // Draw measurement points
    ctx.fillStyle = '#059669';
    [p1, p2].forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw dimension text
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    const distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

    ctx.fillStyle = settings.textColor;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${distance.toFixed(2)} cm`, midX, midY - 10);
}

function drawMeasurementOverlay(
    ctx: CanvasRenderingContext2D,
    pattern: UnwrappedPattern,
    canvasWidth: number,
    canvasHeight: number
) {
    // Draw dimension arrows and labels around the pattern
    ctx.strokeStyle = '#6b7280';
    ctx.fillStyle = '#6b7280';
    ctx.lineWidth = 1;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';

    const padding = 30;

    // Width dimension (bottom)
    const bottomY = canvasHeight - padding + 20;
    ctx.beginPath();
    ctx.moveTo(padding, bottomY);
    ctx.lineTo(canvasWidth - padding, bottomY);
    ctx.stroke();

    // Width arrows
    drawArrow(ctx, padding, bottomY, -5, 0);
    drawArrow(ctx, canvasWidth - padding, bottomY, 5, 0);

    ctx.fillText(
        `${pattern.flat_width_cm.toFixed(1)} cm`,
        canvasWidth / 2,
        bottomY + 15
    );

    // Height dimension (right)
    const rightX = canvasWidth - padding + 20;
    ctx.beginPath();
    ctx.moveTo(rightX, padding);
    ctx.lineTo(rightX, canvasHeight - padding);
    ctx.stroke();

    // Height arrows
    drawArrow(ctx, rightX, padding, 0, -5);
    drawArrow(ctx, rightX, canvasHeight - padding, 0, 5);

    ctx.save();
    ctx.translate(rightX + 15, canvasHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${pattern.flat_height_cm.toFixed(1)} cm`, 0, 0);
    ctx.restore();
}

function drawArrow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    dx: number,
    dy: number
) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dx, y + dy);
    ctx.lineTo(x + dx * 0.7 - dy * 0.3, y + dy * 0.7 + dx * 0.3);
    ctx.moveTo(x + dx, y + dy);
    ctx.lineTo(x + dx * 0.7 + dy * 0.3, y + dy * 0.7 - dx * 0.3);
    ctx.stroke();
}

function drawQualityIndicators(
    ctx: CanvasRenderingContext2D,
    distortionMetrics: DistortionMetrics,
    canvasWidth: number
) {
    // Draw quality indicator in top-right corner
    const x = canvasWidth - 150;
    const y = 20;

    // Background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.roundRect(x - 10, y - 5, 140, 60, 5);
    ctx.fill();

    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.roundRect(x - 10, y - 5, 140, 60, 5);
    ctx.stroke();

    // Quality text
    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Pattern Quality:', x, y + 12);

    // Add null checks and default values
    if (!distortionMetrics || typeof distortionMetrics.average_area_distortion === 'undefined' ||
        typeof distortionMetrics.max_area_distortion === 'undefined') {
        ctx.fillStyle = '#6b7280';
        ctx.font = '10px sans-serif';
        ctx.fillText('Metrics unavailable', x, y + 28);
        return;
    }

    const avgDistortion = distortionMetrics.average_area_distortion || 0;
    const maxDistortion = distortionMetrics.max_area_distortion || 0;

    const qualityColor = avgDistortion < 0.05 ? '#10b981' :
        avgDistortion < 0.15 ? '#3b82f6' :
            avgDistortion < 0.35 ? '#f59e0b' : '#ef4444';

    ctx.fillStyle = qualityColor;
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(
        avgDistortion < 0.05 ? 'Excellent' :
            avgDistortion < 0.15 ? 'Good' :
                avgDistortion < 0.35 ? 'Fair' : 'Poor',
        x,
        y + 28
    );

    ctx.fillStyle = '#6b7280';
    ctx.font = '10px sans-serif';
    ctx.fillText(`Avg: ${(avgDistortion * 100).toFixed(1)}%`, x, y + 42);
    ctx.fillText(`Max: ${(maxDistortion * 100).toFixed(1)}%`, x + 70, y + 42);
}

// Stat Card Component
interface StatCardProps {
    label: string;
    value: string;
    icon: string;
    color: 'blue' | 'green' | 'purple' | 'orange' | 'teal' | 'red';
}

function StatCard({ label, value, icon, color }: StatCardProps) {
    const colorClasses = {
        blue: 'border-blue-200 bg-blue-50 text-blue-800',
        green: 'border-green-200 bg-green-50 text-green-800',
        purple: 'border-purple-200 bg-purple-50 text-purple-800',
        orange: 'border-orange-200 bg-orange-50 text-orange-800',
        teal: 'border-teal-200 bg-teal-50 text-teal-800',
        red: 'border-red-200 bg-red-50 text-red-800'
    };

    return (
        <div className={`p-3 rounded-lg border ${colorClasses[color]} text-center transition-transform hover:scale-105`}>
            <div className="text-lg mb-1">{icon}</div>
            <p className="text-xs text-gray-600 mb-1 uppercase tracking-wide">{label}</p>
            <p className="font-bold text-sm">{value}</p>
        </div>
    );
}

// Enhanced Canvas 2D Context extension for rounded rectangles
if (typeof CanvasRenderingContext2D !== 'undefined') {
    CanvasRenderingContext2D.prototype.roundRect = function (
        x: number,
        y: number,
        width: number,
        height: number,
        radius: number
    ) {
        this.beginPath();
        this.moveTo(x + radius, y);
        this.lineTo(x + width - radius, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.lineTo(x + width, y + height - radius);
        this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.lineTo(x + radius, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
        this.closePath();
    };
}

// Type augmentation for the roundRect method
declare global {
    interface CanvasRenderingContext2D {
        roundRect(x: number, y: number, width: number, height: number, radius: number): void;
    }
}
