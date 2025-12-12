"use client";

import { useState, useRef, useMemo } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Center } from "@react-three/drei";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { LaserLine } from "./LaserLine";

interface CTReconstructionProps {
  layers: string[];
  finalModelUrl?: string;
}

function CTReconstructionScene({
  layers,
  finalModelUrl,
  playing,
  setPlaying,
  progress,
  setProgress,
}: {
  layers: string[];
  finalModelUrl?: string;
  playing: boolean;
  setPlaying: (v: boolean) => void;
  progress: number;
  setProgress: (v: number) => void;
}) {
  const stlGeometries = useLoader(STLLoader, layers);
  const finalGeometry = finalModelUrl
    ? useLoader(STLLoader, finalModelUrl)
    : null;
  const groupRef = useRef<THREE.Group>(null);
  const duration = 8; // seconds
  const startTimeRef = useRef<number | null>(null);

  const materials = useMemo(
    () =>
      stlGeometries.map(
        () =>
          new THREE.MeshStandardMaterial({
            color: "#ffffff",
            transparent: true,
            opacity: 0,
          })
      ),
    [stlGeometries]
  );

  const finalMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#ffffff",
        transparent: true,
        opacity: 0,
      }),
    []
  );

  const bounds = useMemo(() => {
    const box = new THREE.Box3();
    let minZ = Infinity;
    let maxZ = -Infinity;

    stlGeometries.forEach((geo) => {
      geo.computeBoundingBox();
      if (geo.boundingBox) {
        minZ = Math.min(minZ, geo.boundingBox.min.z);
        maxZ = Math.max(maxZ, geo.boundingBox.max.z);
      }
    });

    if (!isFinite(minZ) || !isFinite(maxZ)) {
      minZ = -10;
      maxZ = 10;
    }

    box.set(new THREE.Vector3(-10, -10, minZ), new THREE.Vector3(10, 10, maxZ));

    return { minZ, maxZ };
  }, [stlGeometries]);

  useFrame((state, delta) => {
    if (!playing) {
      startTimeRef.current = null;
      return;
    }

    if (startTimeRef.current === null) {
      startTimeRef.current = state.clock.getElapsedTime();
    }

    const elapsed = state.clock.getElapsedTime() - startTimeRef.current;
    const p = Math.min(elapsed / duration, 1);
    setProgress(p);

    const angle = p * Math.PI * 0.6;
    state.camera.position.x = 30 * Math.sin(angle);
    state.camera.position.y = 15;
    state.camera.position.z = 30 * Math.cos(angle);
    state.camera.lookAt(0, 0, 0);

    if (p >= 1) {
      setPlaying(false);
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight intensity={1} position={[5, 5, 5]} />

      <Center>
        <group ref={groupRef}>
          {stlGeometries.map((geo, i) => {
            const visibleCount = Math.floor(progress * stlGeometries.length);
            const isVisible = i <= visibleCount;
            const material = materials[i];
            material.opacity = isVisible ? 1 : 0;

            return (
              <mesh
                key={i}
                geometry={geo}
                material={material}
                rotation={[Math.PI / 2, 0, 0]}
                visible={isVisible}
              />
            );
          })}
        </group>
      </Center>

      {finalGeometry && (
        <Center>
          <mesh
            geometry={finalGeometry}
            material={(() => {
              const t = THREE.MathUtils.clamp((progress - 0.8) / 0.2, 0, 1);
              finalMaterial.opacity = t;
              return finalMaterial;
            })()}
            rotation={[Math.PI / 2, 0, 0]}
          />
        </Center>
      )}

      <LaserLine progress={progress} minZ={bounds.minZ} maxZ={bounds.maxZ} axis="z" />

      <OrbitControls enableZoom={true} />
    </>
  );
}

export function CTReconstruction({ layers, finalModelUrl }: CTReconstructionProps) {
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);

  const handleStart = () => {
    setProgress(0);
    // Reset timing so replay starts from beginning
    // (startTimeRef is managed inside the scene via useRef)
    setPlaying(true);
  };

  const handlePause = () => {
    setPlaying(false);
  };

  return (
    <div className="relative w-full h-[600px] bg-black rounded-lg">
      <Canvas camera={{ position: [0, 0, 30], fov: 45 }}>
        <CTReconstructionScene
          layers={layers}
          finalModelUrl={finalModelUrl}
          playing={playing}
          setPlaying={setPlaying}
          progress={progress}
          setProgress={setProgress}
        />
      </Canvas>

      <div className="absolute bottom-4 w-full flex justify-center gap-3">
        {!playing ? (
          <button
            onClick={handleStart}
            className="px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            
            			Start Reconstruction
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="px-4 py-2 bg-muted text-foreground rounded"
          >
            Pause
          </button>
        )}
      </div>
    </div>
  );
}
