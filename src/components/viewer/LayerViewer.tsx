"use client";

import { useState } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Center } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import * as THREE from "three";

interface LayerViewerProps {
  layers: string[];   // Array of STL file URLs
}

function LayerModel({ geometry, visible }: { geometry: THREE.BufferGeometry; visible: boolean }) {
  return (
    <mesh visible={visible} rotation={[Math.PI / 2, 0, 0]}>
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial color="#ffffff" />
    </mesh>
  );
}

export function LayerViewer({ layers }: LayerViewerProps) {
  const stlGeometries = useLoader(STLLoader, layers);
  const [current, setCurrent] = useState(0);
  const max = stlGeometries.length - 1;

  return (
    <div className="relative w-full h-[600px] rounded-lg border bg-card">
      {/* THREE Canvas */}
      <Canvas camera={{ position: [0, 0, 15], fov: 40 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <directionalLight position={[-5, -5, -5]} intensity={0.6} />
        <pointLight position={[0, 5, 0]} intensity={0.8} />

        <Center>
          {stlGeometries.map((geo, i) => (
            <LayerModel key={i} geometry={geo} visible={i === current} />
          ))}
        </Center>

        <OrbitControls 
          enableZoom={true} 
          enablePan={true} 
          enableRotate={true}
          minDistance={5}
          maxDistance={25}
        />
      </Canvas>

      {/* Slider UI */}
      <div className="absolute bottom-4 w-full px-6">
        <div className="bg-background/90 backdrop-blur-sm rounded-lg p-4 border">
          <input
            type="range"
            min={0}
            max={max}
            value={current}
            onChange={(e) => setCurrent(Number(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm font-medium">
              Layer {current + 1} / {max + 1}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrent(Math.max(0, current - 1))}
                disabled={current === 0}
                className="px-2 py-1 text-xs bg-muted hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed rounded"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrent(Math.min(max, current + 1))}
                disabled={current === max}
                className="px-2 py-1 text-xs bg-muted hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed rounded"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
