'use client';

import { useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';

interface CrossSectionSliderProps {
    geometry: THREE.BufferGeometry | null;
    onSliceChange?: (height: number, circumference: number) => void;
}

export default function CrossSectionSlider({ geometry, onSliceChange }: CrossSectionSliderProps) {
    const [sliderValue, setSliderValue] = useState(50);
    const [metrics, setMetrics] = useState<{ height: number; circumference: number } | null>(null);

    // Memoize bounds
    const bounds = useMemo(() => {
        if (!geometry) return null;
        geometry.computeBoundingBox();
        const box = geometry.boundingBox!;
        return {
            min: box.min.z,
            max: box.max.z,
            range: box.max.z - box.min.z
        };
    }, [geometry]);

    // Calculate slice when slider changes
    useEffect(() => {
        if (!geometry || !bounds) return;

        const targetZ = bounds.min + (sliderValue / 100) * bounds.range;

        // Find intersection points at this height
        const positions = geometry.getAttribute('position').array as Float32Array;
        const points: { x: number; y: number }[] = [];

        // Simple tolerance-based slicing
        // A better approach for exact circumference uses plane intersection with triangle edges
        // but this approximation is fast for UI
        const tolerance = bounds.range * 0.01; // 1% tolerance

        for (let i = 0; i < positions.length; i += 3) {
            if (Math.abs(positions[i + 2] - targetZ) < tolerance) {
                points.push({ x: positions[i], y: positions[i + 1] });
            }
        }

        const circumference = calculatePerimeter(points);
        const heightCm = (targetZ - bounds.min) * 100; // Assuming units are meters, convert to cm? 
        // Actually our measurements.ts assumed units were meters and multiplied by 100
        // Let's stick to consistent units. If raw units are "units", lets just report "units" or assume consistency.
        // In measurements.ts: size.z * 100. So we treat raw units as meters? Or just scale 100x.

        const calculatedMetrics = {
            height: (targetZ - bounds.min) * 100, // scaled
            circumference: circumference * 100 // scaled
        };

        setMetrics(calculatedMetrics);
        onSliceChange?.(calculatedMetrics.height, calculatedMetrics.circumference);

    }, [geometry, sliderValue, bounds]);

    function calculatePerimeter(points: { x: number; y: number }[]): number {
        if (points.length < 3) return 0;

        // Sort by angle center
        const cx = points.reduce((s, p) => s + p.x, 0) / points.length;
        const cy = points.reduce((s, p) => s + p.y, 0) / points.length;

        points.sort((a, b) => {
            return Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx);
        });

        let p = 0;
        for (let i = 0; i < points.length; i++) {
            const next = points[(i + 1) % points.length];
            const dx = points[i].x - next.x;
            const dy = points[i].y - next.y;
            p += Math.sqrt(dx * dx + dy * dy);
        }
        return p;
    }

    if (!geometry) return null;

    return (
        <div className="bg-white rounded-lg p-4 shadow mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Cross Section Analysis</h3>

            <div className="flex items-center gap-4 mb-2">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderValue}
                    onChange={(e) => setSliderValue(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm font-medium w-12 text-right">{sliderValue}%</span>
            </div>

            {metrics && (
                <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                    <div className="bg-gray-50 p-2 rounded">
                        <span className="text-gray-500 block">Height</span>
                        <span className="font-semibold">{metrics.height.toFixed(1)} cm</span>
                    </div>
                    <div className="bg-blue-50 p-2 rounded text-blue-800">
                        <span className="text-blue-600 block">Circumference</span>
                        <span className="font-semibold">{metrics.circumference.toFixed(1)} cm</span>
                    </div>
                </div>
            )}
        </div>
    );
}
