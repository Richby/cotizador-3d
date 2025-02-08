// components/ModelViewer.tsx  (VERSIÓN SIMPLIFICADA PARA DEBUG)
// components/ModelViewer.tsx
'use client';
import React, { useState, useRef, useCallback } from 'react';
// ... otras importaciones ...
import Dropzone from './ui/Dropzone'; // Asegúrate de que la ruta sea correcta
import * as THREE from 'three';
import { useStore } from '@/store/useStore';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { Box3, BufferGeometry, Mesh, Vector3 } from 'three';
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

const ModelViewer: React.FC = () => {
  // ... (estado, useRef, etc.) ...
    const { setDimensions, setModelLoaded } = useStore();
    const [model, setModel] = useState<THREE.Group | null>(null);
    const [loading, setLoading] = useState(false);
    const controlsRef = useRef<any>();

  const onFileAccepted = useCallback(async (file: File) => {
    // ... (tu lógica para manejar el archivo) ...
    setLoading(true);
    setModel(null); // Limpia el modelo anterior
    setDimensions({ x: 0, y: 0, z: 0 });

    if (!file) {
      setLoading(false);
      return;
    }

    if (file.name.toLowerCase().endsWith('.stl')) {
      const reader = new FileReader();

      reader.onload = (event: ProgressEvent<FileReader>) => {
        if (event.target && event.target.result) {
          const loader = new STLLoader();
          const geometry = loader.parse(event.target.result as ArrayBuffer) as BufferGeometry;

          geometry.computeBoundingBox();
          if (geometry.boundingBox) {
            const boundingBox: Box3 = geometry.boundingBox;
            const size = new Vector3();
            boundingBox.getSize(size);
            setDimensions({ x: size.x, y: size.y, z: size.z });
          }

          const modelGroup = new THREE.Group();
          modelGroup.add(new Mesh(geometry));
          setModel(modelGroup);
          setLoading(false);
          setModelLoaded(true);
        }
      };

      reader.onerror = () => {
        setLoading(false);
        setModelLoaded(false);
        alert('Error al leer el archivo.');
      };

      reader.readAsArrayBuffer(file);
    } else if (file.name.toLowerCase().endsWith('.gcode')) {
      // Lógica para procesar G-Code (pendiente de implementación)
      setModelLoaded(true);
    } else {
      alert('Formato de archivo no soportado, sube un archivo .stl o .gcode');
      setLoading(false);
      setModelLoaded(false);
    }
  }, [setDimensions, setModelLoaded]);

  return (
    <div style={{ width: '100%', height: '500px' }}>
      <Dropzone onFileAccepted={onFileAccepted} /> {/* <-- PASAR LA PROP CORRECTAMENTE */}
      {loading && <p>Cargando modelo...</p>}
      {model && (
        <Canvas camera={{ position: [10, 10, 10] }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[0, 10, 0]} intensity={0.5} />
          <primitive object={model} />
          <OrbitControls ref={controlsRef} makeDefault />
        </Canvas>
      )}
    </div>
  );
};

export default ModelViewer;