"use client";

import * as THREE from "three";
import { useRef } from "react";

interface LaserLineProps {
  progress: number; // 0 to 1
  minZ: number;
  maxZ: number;
  axis?: "y" | "z";
}

export function LaserLine({ progress, minZ, maxZ, axis = "z" }: LaserLineProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const zPos = minZ + (maxZ - minZ) * progress;

  return (
    <mesh
      ref={meshRef}
      position={axis === "z" ? [0, 0, zPos] : [0, zPos, 0]}
    >
      <planeGeometry args={[60, 0.5]} />
      <meshBasicMaterial color="red" transparent opacity={0.8} />
    </mesh>
  );
}
