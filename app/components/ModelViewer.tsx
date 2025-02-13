"use client";

import { useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface ModelViewerProps {
  geometry: THREE.BufferGeometry | null;
  setDimensions: (dims: { width: number; height: number; depth: number }) => void;
  scale: number;
}

function SceneContent({ geometry, setDimensions, scale }: ModelViewerProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (geometry) {
      // Calcular bounding box
      geometry.computeBoundingBox();
      const box = geometry.boundingBox;
      if (box) {
        // Centrar
        geometry.center();

        // Dimensiones reales antes de escalar
        const width = box.max.x - box.min.x;
        const height = box.max.y - box.min.y;
        const depth = box.max.z - box.min.z;

        // Escalar y posicionar
        if (meshRef.current) {
          meshRef.current.position.y = (height * scale) / 2; // para “ponerlo sobre el piso”
          meshRef.current.scale.set(scale, scale, scale);
        }

        // Pasar dimensiones escaladas
        setDimensions({
          width: width * scale,
          height: height * scale,
          depth: depth * scale,
        });
      }
    }
  }, [geometry, setDimensions, scale]);

  return (
    <>
      <ambientLight intensity={0.5} />
      {geometry && (
        <mesh ref={meshRef} geometry={geometry}>
          <meshStandardMaterial color="green" />
        </mesh>
      )}

      {/* Opcional: se ve mejor la iluminación */}
      <Environment preset="studio" />

      {/* OrbitControls para poder girar/rotar la vista */}
      <OrbitControls makeDefault />
    </>
  );
}

const ModelViewer: React.FC<ModelViewerProps> = ({ geometry, setDimensions, scale }) => {
  return (
    <div className="mt-6 bg-gray-200 rounded-md overflow-hidden aspect-square">
      <Canvas
        shadows
        orthographic
        camera={{ position: [0, 10, 10], zoom: 50, up: [0, 1, 0] }}
      >
        <SceneContent geometry={geometry} setDimensions={setDimensions} scale={scale} />
      </Canvas>
    </div>
  );
};

export default ModelViewer;
