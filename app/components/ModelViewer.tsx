"use client";

import { useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";

interface ModelViewerProps {
    geometry: THREE.BufferGeometry | null;
    setDimensions: (dimensions: { width: number; height: number; depth: number }) => void;
    scale: number; // Recibe la escala como prop
}

// Componente hijo para la escena (TODA la lógica de Three.js aquí)
const SceneContent = ({ geometry, setDimensions, scale }: ModelViewerProps & { scale: number }) => {
    const { camera } = useThree();
    const meshRef = useRef<THREE.Mesh>(null);

    useEffect(() => {
        if (geometry) {
            geometry.computeBoundingBox();
            const box = geometry.boundingBox;

            if (box) {
                // 1. Centrar la geometría PRIMERO
                geometry.center();

                // 2. Calcular dimensiones DESPUÉS de centrar y APLICAR LA ESCALA
                let width = (box.max.x - box.min.x) * scale;
                let height = (box.max.y - box.min.y) * scale;
                let depth = (box.max.z - box.min.z) * scale;

                // 3. Mover el Mesh *ANTES* de ajustar la cámara
                if (meshRef.current) {
                    meshRef.current.position.y = height / 2;
                    // Aplicar la escala al mesh *directamente*
                    meshRef.current.scale.set(scale, scale, scale);
                }

                // 4. Ajuste de la Cámara (Ortográfica)
                const size = box.getSize(new THREE.Vector3());
                const maxSize = Math.max(size.x, size.z); // Usamos X y Z
                const aspect = size.x / size.z;

                if (camera instanceof THREE.OrthographicCamera) {
                    camera.left = -maxSize * aspect / 2;
                    camera.right = maxSize * aspect / 2;
                    camera.top = maxSize / 2;
                    camera.bottom = -maxSize / 2;
                    camera.near = 0.1;
                    camera.far = 1000 * maxSize;
                    camera.position.set(0, maxSize * 2, 0); // Posición encima
                    camera.lookAt(0, height / 2, 0);  // Mirar al centro
                    camera.zoom = 1; // Zoom inicial
                    camera.updateProjectionMatrix(); //SIEMPRE actualizar
                }

                // Guardar las dimensiones *escaladas*
                setDimensions({ width, height, depth });

            }
        }
    }, [geometry, setDimensions, camera, scale]); // Dependencia en scale


    function Grid() {
        return (
            <gridHelper args={[50, 50, 'gray', 'lightgray']} position={[0, -0.001, 0]} />
        )
    }

    return (
        <>
            <ambientLight intensity={0.3} />
            <hemisphereLight args={["white", "#444444"]} intensity={0.5} />
            <directionalLight position={[2, 5, 3]} intensity={1} castShadow />
            <directionalLight position={[-5, 2, -2]} intensity={0.5} />
            {geometry && (
                <mesh ref={meshRef} geometry={geometry} material={new THREE.MeshStandardMaterial({ color: "green", roughness: 0.6, metalness: 0.1 })} castShadow receiveShadow />
            )}
            {/*  OrbitControls de drei  */}
            <OrbitControls
                enableDamping={true}
                makeDefault
                enablePan={false}
                minPolarAngle={Math.PI / 2}
                maxPolarAngle={Math.PI / 2}
                enableRotate={false}
                target={[0, geometry?.boundingBox ? geometry.boundingBox.max.y * scale : 0, 0]} //Objetivo correcto
            />
            <Environment preset="studio" />
            <Grid />
            <axesHelper args={[5]} position={[0, 0.001, 0]} />
        </>
    );
};


const ModelViewer: React.FC<ModelViewerProps> = ({ geometry, setDimensions, scale }) => { // Recibe scale
    const containerRef = useRef<HTMLDivElement>(null);

     return (
        <div ref={containerRef} className="mt-6 bg-gray-200 rounded-md overflow-hidden aspect-square">
            {/*  Cámara ortográfica, configuración inicial */}
            <Canvas shadows orthographic camera={{ position: [0, 10, 0], zoom: 50 }}>
                <SceneContent geometry={geometry} setDimensions={setDimensions} scale={scale}/>
            </Canvas>
        </div>
    );
};

export default ModelViewer;