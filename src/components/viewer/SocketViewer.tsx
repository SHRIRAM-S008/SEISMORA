"use client";

import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Center, Environment } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';

interface SocketModelProps {
    autoRotate?: boolean;
    modelPath?: string;
}

function SocketModel({ autoRotate = true, modelPath = '/socket-model.obj' }: SocketModelProps) {
    const meshRef = useRef<THREE.Group>(null);

    // Load the OBJ model (default socket-model, can be overridden)
    const obj = useLoader(OBJLoader, modelPath);

    // Auto-rotate the model
    useFrame((state, delta) => {
        if (meshRef.current && autoRotate) {
            meshRef.current.rotation.y += delta * 0.3;
        }
    });

    // Calculate bounding box and center the model
    const clone = obj.clone();
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 3 / maxDim; // Fit to viewport

    return (
        <group ref={meshRef}>
            <Center>
                <primitive object={obj} scale={scale} />
            </Center>
        </group>
    );
}

interface SocketViewerProps {
    autoRotate?: boolean;
    className?: string;
    modelPath?: string;
}

export default function SocketViewer({ autoRotate = true, className = "", modelPath }: SocketViewerProps) {
    return (
        <div className={`w-full h-full ${className}`}>
            <Canvas
                camera={{ position: [3, 2, 5], fov: 45 }}
                gl={{ antialias: true, alpha: true }}
            >
                <Suspense fallback={null}>
                    {/* Lighting */}
                    <ambientLight intensity={0.6} />
                    <directionalLight position={[10, 10, 5]} intensity={1.2} />
                    <directionalLight position={[-10, -10, -5]} intensity={0.6} />
                    <pointLight position={[0, 5, 0]} intensity={0.8} />
                    <spotLight position={[0, 10, 0]} angle={0.3} intensity={0.5} />

                    {/* Environment for reflections */}
                    <Environment preset="studio" />

                    {/* The 3D Model */}
                    <SocketModel autoRotate={autoRotate} modelPath={modelPath} />

                    {/* Controls */}
                    <OrbitControls
                        enableZoom={true}
                        enablePan={true}
                        enableRotate={true}
                        autoRotate={autoRotate}
                        autoRotateSpeed={1.5}
                        minDistance={1}
                        maxDistance={15}
                        target={[0, 0, 0]}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
}
