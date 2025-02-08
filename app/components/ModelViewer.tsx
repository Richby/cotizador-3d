// app/components/ModelViewer.tsx
'use client'; // <--  ¡CRUCIAL!  Debe ser un Client Component
import React, { useState, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { STLLoader } from 'three-stdlib';
import { Box3, Vector3, BufferGeometry, Mesh, Group } from 'three';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';
import Dropzone from './ui/Dropzone';
import axios from 'axios'; // Importa axios

const ModelViewer: React.FC = () => {
  const { setDimensions, setModelLoaded, setCost, setError } = useStore();
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [loading, setLoading] = useState(false);
  const controlsRef = useRef<any>();

    const onFileAccepted = useCallback(async (file: File) => {
    setLoading(true);
    setModel(null);
    setDimensions({ x: 0, y: 0, z: 0 });
    setError(null); // Limpia errores anteriores
    setCost(null);

    if (!file) {
      setLoading(false);
      return;
    }

    if (file.name.toLowerCase().endsWith('.stl')) {
      const reader = new FileReader();

      reader.onload = async (event: ProgressEvent<FileReader>) => { // <-- async aquí
        try {
          if (event.target && event.target.result) {
            const loader = new STLLoader();
            const geometry = loader.parse(event.target.result as ArrayBuffer) as BufferGeometry;

            geometry.computeBoundingBox();
            if (geometry.boundingBox) {
              const boundingBox: Box3 = geometry.boundingBox;
              const size = new Vector3();
              boundingBox.getSize(size);
              setDimensions({ x: size.x, y: size.y, z: size.z });

                // Obtiene el estado actual de Zustand *dentro* del callback asíncrono
                const { selectedFilamentId, infill, layerHeight } = useStore.getState();

              // Envía la petición a la API *solo* si tenemos un filamento seleccionado
                if (selectedFilamentId) {
                  const response = await axios.post<{ cost: number }>('/api/calculate-cost', {
                    dimensions: { x: size.x, y: size.y, z: size.z },
                    filamentId: selectedFilamentId,
                    infill,
                    layerHeight,
                  });
                    setCost(response.data.cost);
                }
            }

            const modelGroup = new Group();
            modelGroup.add(new Mesh(geometry));
            setModel(modelGroup);
            setModelLoaded(true);
          }
        } catch (error:any) {
          console.error("Error en onFileAccepted:", error);
            setError(error.message || 'Error al procesar el archivo.'); // Guarda el error en el store
        } finally {
          setLoading(false);
        }
      };

      reader.onerror = () => {
        setLoading(false);
        setModelLoaded(false);
        setError('Error al leer el archivo.'); // Guarda el error en el store
      };

      reader.readAsArrayBuffer(file);
    } else if (file.name.toLowerCase().endsWith('.gcode')) {
      // TODO: Lógica para procesar G-Code (pendiente de implementación)
      setModelLoaded(true);
    } else {
      setError('Formato de archivo no soportado. Sube un archivo .stl o .gcode'); // Guarda el error en el store
      setLoading(false);
      setModelLoaded(false);
    }
  }, [setDimensions, setModelLoaded, setCost, setError]); // Dependencias correctas


  return (
    <div style={{ width: '100%', height: '500px' }}>
      <Dropzone onFileAccepted={onFileAccepted} />
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