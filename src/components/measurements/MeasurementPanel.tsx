'use client';

import { useState, useMemo } from 'react';
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { Measurements3D, QualityAssessment } from '@/types';

interface MeasurementPanelProps {
    measurements: Measurements3D | null;
    isLoading?: boolean;
    qualityAssessment?: QualityAssessment | null;
    showAdvanced?: boolean;
    onExport?: () => void;
}

function ChartLineInteractive({ 
    measurements, 
    unitSystem, 
    convertLength 
}: { 
    measurements: Measurements3D;
    unitSystem: 'metric' | 'imperial';
    convertLength: (cm: number) => number;
}) {
    const [activeChart, setActiveChart] =
        useState<'circumference' | 'diameter'>("circumference")

    const chartData = measurements.circumferences.map(c => ({
        height: `${c.height_percent.toFixed(1)}%`,
        circumference: convertLength(c.circumference_cm),
        diameter: convertLength(c.diameter_cm)
    }));
    
    console.log('Chart data:', chartData);

    const chartConfig = {
      circumference: {
        label: "Circumference",
        color: "#6366F1",
      },
      diameter: {
        label: "Diameter",
        color: "#10B981",
      },
    } satisfies ChartConfig;

    const total = useMemo(
        () => ({
          circumference: measurements.circumferences.reduce((acc, curr) => acc + convertLength(curr.circumference_cm), 0),
          diameter: measurements.circumferences.reduce((acc, curr) => acc + convertLength(curr.diameter_cm), 0),
        }),
        [measurements, unitSystem]
      )

    return (
        <Card className="py-4 sm:py-0">
          <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
            <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
              <CardTitle>Circumference Profile - Interactive</CardTitle>
              <CardDescription>
                Showing measurements along the height of the model
              </CardDescription>
            </div>
            <div className="flex">
              {["circumference", "diameter"].map((key) => {
                const chart = key as keyof typeof chartConfig
                return (
                  <button
                    key={chart}
                    data-active={activeChart === chart}
                    className="data-[active=true]:bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                    onClick={() => setActiveChart(chart)}
                  >
                    <span className="text-muted-foreground text-xs">
                      {chartConfig[chart].label}
                    </span>
                    <span className="text-lg leading-none font-bold sm:text-3xl">
                      {total[key as keyof typeof total].toFixed(1)}
                    </span>
                  </button>
                )
              })}
            </div>
          </CardHeader>
          <CardContent className="px-2 sm:p-6">
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[250px] w-full"
            >
              <LineChart
                accessibilityLayer
                data={chartData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="height"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="w-[150px]"
                      nameKey="views"
                      labelFormatter={(value) => `Height: ${value}`}
                    />
                  }
                />
                <Line
                  dataKey={activeChart}
                  type="monotone"
                  stroke={chartConfig[activeChart].color}
                  strokeWidth={2}
                  dot={true}
                  connectNulls={true}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )
}

export default function MeasurementPanel({
    measurements,
    isLoading,
    qualityAssessment,
    onExport
}: MeasurementPanelProps) {
    const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');

    const convertLength = (cm: number) => unitSystem === 'metric' ? cm : cm / 2.54;
    const convertArea = (cm2: number) => unitSystem === 'metric' ? cm2 : cm2 / 6.4516;
    const convertVolume = (cm3: number) => unitSystem === 'metric' ? cm3 : cm3 / 16.387;

    const lengthUnit = unitSystem === 'metric' ? 'cm' : 'in';
    const areaUnit = unitSystem === 'metric' ? 'cm²' : 'in²';
    const volumeUnit = unitSystem === 'metric' ? 'cm³' : 'in³';

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-32 bg-gray-200 rounded" />
                </div>
            </div>
        );
    }

    if (!measurements) {
        return (
            <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-600">No measurements available</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Measurements</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setUnitSystem(prev => prev === 'metric' ? 'imperial' : 'metric')}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                    >
                        {unitSystem === 'metric' ? 'Metric' : 'Imperial'}
                    </button>
                    {onExport && (
                        <button
                            onClick={onExport}
                            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                        >
                            Export
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="border border-gray-200 rounded p-3">
                        <div className="text-xs text-gray-500 mb-1">Length</div>
                        <div className="text-xl font-semibold text-gray-900">
                            {convertLength(measurements.length_cm).toFixed(1)}
                            <span className="text-sm font-normal text-gray-500 ml-1">{lengthUnit}</span>
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded p-3">
                        <div className="text-xs text-gray-500 mb-1">Width</div>
                        <div className="text-xl font-semibold text-gray-900">
                            {convertLength(measurements.width_cm).toFixed(1)}
                            <span className="text-sm font-normal text-gray-500 ml-1">{lengthUnit}</span>
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded p-3">
                        <div className="text-xs text-gray-500 mb-1">Surface Area</div>
                        <div className="text-xl font-semibold text-gray-900">
                            {convertArea(measurements.surface_area_cm2).toFixed(1)}
                            <span className="text-sm font-normal text-gray-500 ml-1">{areaUnit}</span>
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded p-3">
                        <div className="text-xs text-gray-500 mb-1">Volume</div>
                        <div className="text-xl font-semibold text-gray-900">
                            {convertVolume(measurements.volume_cm3).toFixed(1)}
                            <span className="text-sm font-normal text-gray-500 ml-1">{volumeUnit}</span>
                        </div>
                    </div>
                </div>

                {/* Quality Score */}
                {qualityAssessment && (
                    <div className="border border-gray-200 rounded p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Quality Score</span>
                            <span className="text-sm font-semibold text-gray-900">
                                {Math.round(qualityAssessment.overall_score * 100)}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-indigo-600 h-2 rounded-full transition-all"
                                style={{ width: `${qualityAssessment.overall_score * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Interactive Chart */}
                <ChartLineInteractive 
                    measurements={measurements}
                    unitSystem={unitSystem}
                    convertLength={convertLength}
                />

                {/* Data Table */}
                <div className="border border-gray-200 rounded overflow-hidden">
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                        <div className="text-sm font-medium text-gray-700">Detailed Measurements</div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="text-left px-4 py-2 font-medium text-gray-700">Height (%)</th>
                                    <th className="text-left px-4 py-2 font-medium text-gray-700">Circumference ({lengthUnit})</th>
                                    <th className="text-left px-4 py-2 font-medium text-gray-700">Diameter ({lengthUnit})</th>
                                </tr>
                            </thead>
                            <tbody>
                                {measurements.circumferences.map((circ, index) => (
                                    <tr key={index} className="border-t border-gray-100 hover:bg-gray-50">
                                        <td className="px-4 py-2">{circ.height_percent.toFixed(1)}%</td>
                                        <td className="px-4 py-2">{convertLength(circ.circumference_cm).toFixed(1)}</td>
                                        <td className="px-4 py-2">{convertLength(circ.diameter_cm).toFixed(1)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quality Details */}
                {qualityAssessment && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="border border-gray-200 rounded p-3">
                            <div className="text-xs text-gray-500 mb-1">Distortion</div>
                            <div className="text-lg font-semibold text-gray-900">
                                {Math.round(qualityAssessment.distortion_score * 100)}%
                            </div>
                        </div>
                        <div className="border border-gray-200 rounded p-3">
                            <div className="text-xs text-gray-500 mb-1">Seam Placement</div>
                            <div className="text-lg font-semibold text-gray-900">
                                {Math.round(qualityAssessment.seam_placement_score * 100)}%
                            </div>
                        </div>
                        <div className="border border-gray-200 rounded p-3">
                            <div className="text-xs text-gray-500 mb-1">Packing</div>
                            <div className="text-lg font-semibold text-gray-900">
                                {Math.round(qualityAssessment.packing_score * 100)}%
                            </div>
                        </div>
                        <div className="border border-gray-200 rounded p-3">
                            <div className="text-xs text-gray-500 mb-1">Manufacturing</div>
                            <div className="text-lg font-semibold text-gray-900">
                                {Math.round(qualityAssessment.manufacturability_score * 100)}%
                            </div>
                        </div>
                    </div>
                )}

                {/* Mesh Info */}
                <div className="border border-gray-200 rounded p-4">
                    <div className="text-sm font-medium text-gray-700 mb-3">Mesh Information</div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Vertices</span>
                            <span className="font-medium text-gray-900">{measurements.mesh_info.vertex_count.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Faces</span>
                            <span className="font-medium text-gray-900">{measurements.mesh_info.face_count.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Watertight</span>
                            <span className={`font-medium ${measurements.mesh_info.is_watertight ? 'text-green-600' : 'text-red-600'}`}>
                                {measurements.mesh_info.is_watertight ? 'Yes' : 'No'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Quality</span>
                            <span className="font-medium text-gray-900">
                                {Math.round(measurements.mesh_info.mesh_quality_score * 100)}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
