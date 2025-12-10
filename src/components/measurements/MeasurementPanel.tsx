'use client';

import type { Measurements3D } from '@/types';

interface MeasurementPanelProps {
    measurements: Measurements3D | null;
    isLoading?: boolean;
}

export default function MeasurementPanel({ measurements, isLoading }: MeasurementPanelProps) {
    if (isLoading) {
        return (
            <div className="bg-white rounded-lg p-6 shadow">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/2" />
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-12 bg-gray-100 rounded" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!measurements) {
        return (
            <div className="bg-white rounded-lg p-6 shadow">
                <p className="text-gray-500">No measurements available</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-gray-50 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                    📊 Measurements
                </h2>
            </div>

            {/* Basic Dimensions */}
            <div className="p-6 border-b">
                <h3 className="text-sm font-medium text-gray-500 mb-3">
                    DIMENSIONS
                </h3>
                <div className="grid grid-cols-3 gap-4">
                    <MetricCard
                        label="Length"
                        value={measurements.length_cm}
                        unit="cm"
                    />
                    <MetricCard
                        label="Width"
                        value={measurements.width_cm}
                        unit="cm"
                    />
                    <MetricCard
                        label="Depth"
                        value={measurements.depth_cm}
                        unit="cm"
                    />
                </div>
            </div>

            {/* Surface & Volume */}
            <div className="p-6 border-b">
                <h3 className="text-sm font-medium text-gray-500 mb-3">
                    SURFACE & VOLUME
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <MetricCard
                        label="Surface Area"
                        value={measurements.surface_area_cm2}
                        unit="cm²"
                    />
                    <MetricCard
                        label="Volume"
                        value={measurements.volume_cm3}
                        unit="cm³"
                    />
                </div>
            </div>

            {/* Circumferences */}
            <div className="p-6 border-b">
                <h3 className="text-sm font-medium text-gray-500 mb-3">
                    CIRCUMFERENCES
                </h3>
                <div className="space-y-2">
                    {measurements.circumferences.slice(0, 5).map((circ, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded"
                        >
                            <span className="text-sm text-gray-600">
                                Height {circ.height_cm.toFixed(1)} cm
                            </span>
                            <span className="font-medium text-gray-900">
                                {circ.circumference_cm.toFixed(1)} cm
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mesh Info */}
            <div className="p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-3">
                    MESH QUALITY
                </h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Vertices</span>
                        <span className="text-gray-900">
                            {measurements.mesh_info.vertex_count.toLocaleString()}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Faces</span>
                        <span className="text-gray-900">
                            {measurements.mesh_info.face_count.toLocaleString()}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Watertight</span>
                        <span className={measurements.mesh_info.is_watertight ? 'text-green-600' : 'text-yellow-600'}>
                            {measurements.mesh_info.is_watertight ? '✓ Yes' : '⚠ No'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface MetricCardProps {
    label: string;
    value: number;
    unit: string;
}

function MetricCard({ label, value, unit }: MetricCardProps) {
    return (
        <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-xl font-semibold text-gray-900">
                {value.toFixed(1)}
                <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>
            </p>
        </div>
    );
}
