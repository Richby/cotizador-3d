"use client";

import { useRef, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";

interface Dimensions {
  width: number;
  height: number;
  depth: number;
}

interface ModelViewerProps {
  geometry: THREE.BufferGeometry | null;
  scale: Dimensions; // Aceptar dimensiones escaladas
}

function SceneContent({ geometry, scale }: ModelViewerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  useEffect(() => {
    if (!geometry) return;

    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    if (!box) return;

    const originalWidth = box.max.x - box.min.x;
    const originalHeight = box.max.y - box.min.y;
    const originalDepth = box.max.z - box.min.z;

    if (meshRef.current) {
      // Aplicar escalado independiente
      meshRef.current.scale.set(
        scale.width / originalWidth,
        scale.height / originalHeight,
        scale.depth / originalDepth
      );
      meshRef.current.position.set(0, 0, 0);
    }

    // Ajustar la cámara según las dimensiones escaladas
    const baseZoom = 400;
    const maxDimension = Math.max(scale.width, scale.height, scale.depth);
    camera.zoom = baseZoom / maxDimension;
    camera.position.set(0, 0, 10);
    camera.updateProjectionMatrix();
  }, [geometry, scale, camera]);

  return (
    <>
      <ambientLight intensity={0.5} />
      {geometry && (
        <mesh ref={meshRef} geometry={geometry}>
          <meshStandardMaterial color="green" />
        </mesh>
      )}
      <Environment preset="studio" />
      <OrbitControls makeDefault />
    </>
  );
}

export default function ModelViewer({ geometry, scale }: ModelViewerProps) {
  return (
    <div className="aspect-square bg-gray-200 rounded-md overflow-hidden">
      <Canvas orthographic camera={{ position: [0, 0, 10], zoom: 1 }}>
        <SceneContent geometry={geometry} scale={scale} />
      </Canvas>
    </div>
  );
}