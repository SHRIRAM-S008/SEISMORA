"use client";

import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Center, Environment } from "@react-three/drei";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { LaserLine } from "./LaserLine";

interface AnimatedSocketProps {
  autoRotate?: boolean;
  playing: boolean;
  progress: number;
  setProgress: (p: number) => void;
}

function AnimatedSocket({ autoRotate = true, playing, progress, setProgress }: AnimatedSocketProps) {
  const groupRef = useRef<THREE.Group>(null);
  const obj = useLoader(OBJLoader, "/socket-model.obj");

  const { scale, minY, maxY } = useMemo(() => {
    const clone = obj.clone();
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = 2 / maxDim;

    const minY = box.min.y * scale;
    const maxY = box.max.y * scale;

    return { scale, minY, maxY };
  }, [obj]);

  const startTimeRef = useRef<number | null>(null);
  const duration = 6; // seconds

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

    if (groupRef.current) {
      const t = THREE.MathUtils.clamp(p, 0.02, 1);
      groupRef.current.scale.y = t;
    }

    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.2;
    }
  });

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.3,
        transparent: false,
        opacity: 1,
      }),
    []
  );

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} />
      <directionalLight position={[-10, -10, -5]} intensity={0.6} />
      <pointLight position={[0, 5, 0]} intensity={0.8} />
      <Environment preset="studio" />

      <Center>
        <group ref={groupRef} position={[0, -minY, 0]} scale={[1, 0.02, 1]}>
          <primitive object={obj} scale={scale} material={material} />
        </group>
      </Center>

      <LaserLine progress={progress} minZ={minY} maxZ={maxY} axis="y" />
    </>
  );
}

export function SocketBuildAnimation() {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleStart = () => {
    setProgress(0);
    setPlaying(true);
  };

  const handlePause = () => {
    setPlaying(false);
  };

  return (
    <div className="relative w-full h-[600px] bg-black rounded-lg">
      <Canvas camera={{ position: [3, 2, 5], fov: 45 }} gl={{ localClippingEnabled: true }}>
        <AnimatedSocket
          autoRotate={false}
          playing={playing}
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
