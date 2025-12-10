'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { parseModelFile } from '@/lib/geometry/parsers';

interface ModelViewer3DProps {
    fileUrl: string;
    onGeometryLoaded?: (geometry: THREE.BufferGeometry) => void;
}

export default function ModelViewer3D({ fileUrl, onGeometryLoaded }: ModelViewer3DProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    return (
        <div className="w-full h-[600px] bg-gray-900 rounded-lg overflow-hidden relative">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-300">Loading 3D model...</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-900/20 z-10">
                    <p className="text-red-400">{error}</p>
                </div>
            )}

            <Canvas
                camera={{ position: [0, 0, 10], fov: 50, near: 0.1, far: 1000 }}
                onCreated={({ camera }) => {
                    camera.up.set(0, 0, 1); // Set Z as up direction
                    camera.updateProjectionMatrix();
                    setIsLoading(false);
                }}
            >
                <Suspense fallback={null}>
                    <Scene
                        fileUrl={fileUrl}
                        onGeometryLoaded={onGeometryLoaded}
                        onError={setError}
                    />
                </Suspense>
            </Canvas>

            {/* Controls Legend */}
            <div className="absolute bottom-4 left-4 text-xs text-gray-400 space-y-1">
                <p>🖱️ Drag: Rotate</p>
                <p>🔄 Scroll: Zoom</p>
                <p>⌨️ Shift+Drag: Pan</p>
            </div>
        </div>
    );
}

interface SceneProps {
    fileUrl: string;
    onGeometryLoaded?: (geometry: THREE.BufferGeometry) => void;
    onError: (error: string) => void;
}

function Scene({ fileUrl, onGeometryLoaded, onError }: SceneProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
    const { camera } = useThree();

    useEffect(() => {
        const loadModel = async () => {
            try {
                const response = await fetch(fileUrl);
                const blob = await response.blob();
                const file = new File([blob], fileUrl.split('/').pop() || 'model.stl');

                const loadedGeometry = await parseModelFile(file);
                loadedGeometry.center();
                loadedGeometry.computeVertexNormals();

                // Auto-fit camera to model with better scaling
                loadedGeometry.computeBoundingBox();
                const box = loadedGeometry.boundingBox!;
                const size = new THREE.Vector3();
                box.getSize(size);
                
                // Calculate the bounding sphere for better fitting
                const center = new THREE.Vector3();
                box.getCenter(center);
                const radius = box.getBoundingSphere(new THREE.Sphere(center)).radius;
                
                // Adjust camera position based on model size
                const fov = 50; // Field of view in degrees
                const distance = radius / Math.tan((fov * Math.PI) / 360);
                camera.position.z = distance * 1.2; // Reduce padding for closer view
                
                // Scale the geometry to a reasonable size
                const targetSize = 10; // Target size for the largest dimension
                const scale = targetSize / Math.max(size.x, size.y, size.z);
                loadedGeometry.scale(scale, scale, scale);
                
                // Update the bounding box after scaling
                loadedGeometry.computeBoundingBox();
                loadedGeometry.computeBoundingSphere();

                setGeometry(loadedGeometry);
                onGeometryLoaded?.(loadedGeometry);

            } catch (err) {
                console.error('Error loading model:', err);
                onError('Failed to load 3D model');
            }
        };

        loadModel();
    }, [fileUrl, camera, onGeometryLoaded, onError]);

    // Auto-rotate
    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.2;
        }
    });

    return (
        <>
            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <directionalLight position={[10, 10, 10]} intensity={0.8} />
            <directionalLight position={[-10, -10, -10]} intensity={0.3} />

            {/* Model */}
            {geometry && (
                <mesh ref={meshRef} geometry={geometry}>
                    <meshPhongMaterial
                        color={0x00aaff}
                        shininess={100}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            )}

            {/* Grid */}
            <Grid
                position={[0, 0, 0]}
                args={[20, 20]}
                cellSize={0.5}
                cellThickness={0.5}
                cellColor="#6f6f6f"
                sectionSize={2}
                sectionThickness={1}
                sectionColor="#9d4b4b"
                fadeDistance={50}
                fadeStrength={1.5}
            />

            {/* Controls */}
            <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={10}
                maxDistance={500}
            />
        </>
    );
}
