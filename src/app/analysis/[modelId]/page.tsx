"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import * as THREE from 'three';
import { supabase } from '@/lib/supabase/client';
import { calculateAllMeasurements } from '@/lib/geometry/measurements';
import { cylindricalUnwrap } from '@/lib/geometry/unwrap';
import { mergeVertices } from '@/lib/geometry/utils';
import ModelViewer3D from '@/components/viewer/ModelViewer3D';
import MeasurementPanel from '@/components/measurements/MeasurementPanel';
import FlatPatternCanvas from '@/components/unwrap/FlatPatternCanvas';
import SVGExportButton from '@/components/unwrap/SVGExportButton';
import { downloadReport } from '@/lib/pdf/generateReport';
import type { Model3D, Measurements3D, UnwrappedPattern } from '@/types';
import demoUnwrapImage from '../../../../WhatsApp Image 2025-12-11 at 23.01.35.jpeg';

// Dynamically import SocketViewer to avoid SSR issues with Three.js
const SocketViewer = dynamic(() => import('@/components/viewer/SocketViewer'), { ssr: false });

export default function AnalysisPage() {
    const params = useParams();
    const router = useRouter();
    const modelId = params.modelId as string;

    const [model, setModel] = useState<Model3D | null>(null);
    const [measurements, setMeasurements] = useState<Measurements3D | null>(null);
    const [pattern, setPattern] = useState<UnwrappedPattern | null>(null);
    const [activeTab, setActiveTab] = useState<'3d' | 'flat'>('3d');
    const [isCalculating, setIsCalculating] = useState(false);
    const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

    // Load model data from database
    useEffect(() => {
        if (modelId === 'demo-model') {
            setModel({
                id: 'demo-model',
                hospital_id: 'demo',
                filename: 'socket-model.obj',
                file_url: '/socket-model.obj',
                file_size: 0,
                file_format: 'obj',
                model_type: 'socket',
                upload_source: 'manual',
                status: 'completed',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
            return;
        }

        async function loadModel() {
            const { data, error } = await supabase
                .from('models')
                .select('*')
                .eq('id', modelId)
                .single();

            if (error) {
                console.error('Error loading model:', error);
                // Retry logic or mock data could go here if DB fails
                return;
            }

            setModel(data);
        }

        loadModel();
    }, [modelId]);

    // Calculate measurements when geometry is loaded
    const handleGeometryLoaded = async (loadedGeometry: THREE.BufferGeometry) => {
        // Ensure geometry is indexed for unwrapping
        let geometryToUse = loadedGeometry;
        if (!geometryToUse.getIndex()) {
            geometryToUse = mergeVertices(geometryToUse);
        }

        setGeometry(geometryToUse);
        setIsCalculating(true);

        try {
            // Calculate measurements
            const calculatedMeasurements = calculateAllMeasurements(geometryToUse, modelId);
            setMeasurements(calculatedMeasurements);

            // Save to database only if not demo
            if (modelId !== 'demo-model') {
                await supabase.from('measurements').upsert({
                    ...calculatedMeasurements
                });

                // Update model status
                await supabase
                    .from('models')
                    .update({ status: 'completed' })
                    .eq('id', modelId);
            }

        } catch (err) {
            console.error('Error calculating measurements:', err);
        } finally {
            setIsCalculating(false);
        }
    };

    // Generate unwrapped pattern
    const handleUnwrap = async () => {
        if (!geometry) return;

        setIsCalculating(true);

        try {
            // Create basic topology from geometry
            const positions = geometry.getAttribute('position').array as Float32Array;
            const indices = geometry.getIndex()?.array as Uint32Array;
            
            if (!indices) {
                throw new Error('Geometry must be indexed for unwrapping');
            }
            
            const topology = {
                vertices: positions,
                indices: indices,
                edges: new Map(),
                boundaries: [],
                genus: 0
            };
            
            const unwrappedPattern = await cylindricalUnwrap(geometry, modelId, topology, {
                method: 'cylindrical' as any,
                seamPlacement: 'auto',
                distortionTolerance: 0.1,
                enableRelaxation: true,
                maxIterations: 100,
                preserveAspectRatio: true,
                manufacturingMode: false
            });
            setPattern(unwrappedPattern);

            // Save to database only if not demo
            if (modelId !== 'demo-model') {
                await supabase.from('unwrapped_patterns').upsert({
                    ...unwrappedPattern
                });
            }

            // Switch to flat view
            setActiveTab('flat');

        } catch (err) {
            console.error('Error unwrapping:', err);
        } finally {
            setIsCalculating(false);
        }
    };

    const handleDownloadPDF = () => {
        if (model && measurements) {
            downloadReport(model, measurements, pattern || undefined);
        }
    };

    return (
        <main className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-20">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ← Back
                        </button>
                        <h1 className="text-xl font-semibold text-gray-900 truncate max-w-xs">
                            {model?.filename || 'Loading...'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleUnwrap}
                            disabled={!geometry || isCalculating}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isCalculating ? 'Processing...' : 'Unwrap Model'}
                        </button>

                        <button
                            onClick={handleDownloadPDF}
                            disabled={!measurements}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                        >
                            Export PDF
                        </button>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('3d')}
                            className={`py-3 px-4 border-b-2 transition-colors ${activeTab === '3d'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            3D View
                        </button>
                        <button
                            onClick={() => setActiveTab('flat')}
                            disabled={modelId !== 'demo-model' && !pattern}
                            className={`py-3 px-4 border-b-2 transition-colors ${activeTab === 'flat'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                } disabled:opacity-50`}
                        >
                            Flat Pattern
                        </button>

                        {activeTab === 'flat' && pattern && (
                            <div className="ml-auto flex items-center">
                                <SVGExportButton pattern={pattern} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 gap-6">
                    {/* Main Viewer Area */}
                    <div className="space-y-4">
                        {activeTab === '3d' && (
                            <ModelViewer3D
                                fileUrl={model?.file_url || ''}
                                onGeometryLoaded={handleGeometryLoaded}
                            />
                        )}

                        {activeTab === 'flat' && modelId === 'demo-model' && (
                            <div className="bg-white rounded-lg shadow-lg overflow-hidden flex items-center justify-center">
                                {/* Show flat pattern OBJ when unwrapped for demo model */}
                                <div className="w-full h-[700px]">
                                    <SocketViewer
                                        autoRotate={false}
                                        className="w-full h-full"
                                        modelPath="/unwarppping.obj"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'flat' && modelId !== 'demo-model' && pattern && (
                            <FlatPatternCanvas
                                pattern={pattern}
                                showGrid={true}
                                showSeam={true}
                            />
                        )}

                        {/* Measurement Panel below the model */}
                        <MeasurementPanel
                            measurements={measurements}
                            isLoading={isCalculating && !measurements}
                        />
                    </div>

                    {/* Instructions */}
                    <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                        <h4 className="font-semibold mb-2">Instructions</h4>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>Rotate the model to inspect geometry</li>
                            <li>Click <span className="font-bold">Unwrap Model</span> to generate the cutting pattern</li>
                            <li>Download PDF for the full clinical report</li>
                        </ul>
                    </div>
                </div>
            </div>
        </main>
    );
}