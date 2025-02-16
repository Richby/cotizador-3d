"use client";

import { useState, useEffect } from "react";
import * as THREE from "three";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import ModelViewer from "./components/ModelViewer";
import {
  calculateVolume,
  estimatePrintCost,
  validateScaledDimensions,
  calculateMaxAllowedScale,
} from ".././lib/calculations";
import { useDropzone } from "react-dropzone";

interface Dimensions {
  width: number;
  height: number;
  depth: number;
}

interface Filament {
  id: string;
  name: string;
  costPerCubicMM: number;
}

export default function UploadPage() {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<Dimensions | null>(null);
  const [scaledDimensions, setScaledDimensions] = useState<Dimensions | null>(null);
  const [selectedFilamentId, setSelectedFilamentId] = useState<string | null>(null);
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [quote, setQuote] = useState<number | null>(null);
  const [uniformScale, setUniformScale] = useState<number>(1); // Escala uniforme (1 = 100%)
  const [independentScales, setIndependentScales] = useState<Dimensions>({ width: 1, height: 1, depth: 1 }); // Escalas individuales
  const [isIndependentScaling, setIsIndependentScaling] = useState<boolean>(false); // Modo de escalado
  const [maxUniformScale, setMaxUniformScale] = useState<number>(2); // Máximo para el slider uniforme
  const [maxIndependentScales, setMaxIndependentScales] = useState<Dimensions>({ width: 2, height: 2, depth: 2 }); // Máximos para sliders independientes

  // Cargar filamentos desde la API
  useEffect(() => {
    const fetchFilaments = async () => {
      try {
        const res = await fetch("/api/filaments");
        if (res.ok) {
          const data = await res.json();
          setFilaments(data);
          if (data.length > 0) {
            setSelectedFilamentId(data[0].id);
          }
        } else {
          console.error("Error fetching filaments:", await res.text());
        }
      } catch (error) {
        console.error("Error fetching filaments:", error);
      }
    };
    fetchFilaments();
  }, []);

  // Calcular costo cuando cambian las dimensiones escaladas
  useEffect(() => {
    if (scaledDimensions && selectedFilamentId && filaments.length > 0) {
      const filament = filaments.find((f) => f.id === selectedFilamentId);
      if (filament) {
        const volume = calculateVolume(scaledDimensions);
        const cost = estimatePrintCost(volume, filament.costPerCubicMM);
        setQuote(cost);
      }
    }
  }, [scaledDimensions, selectedFilamentId, filaments]);

  // Actualizar dimensiones escaladas cuando cambia la escala uniforme
  useEffect(() => {
    if (originalDimensions && !isIndependentScaling) {
      const validation = validateScaledDimensions(originalDimensions, uniformScale);
      if (!validation.isValid) {
        alert(validation.message);
        const maxScale = calculateMaxAllowedScale(originalDimensions);
        setUniformScale(maxScale);
        return;
      }

      const newDimensions = {
        width: originalDimensions.width * uniformScale,
        height: originalDimensions.height * uniformScale,
        depth: originalDimensions.depth * uniformScale,
      };
      setScaledDimensions(newDimensions);
    }
  }, [uniformScale, originalDimensions, isIndependentScaling]);

  // Actualizar dimensiones escaladas cuando cambian las escalas independientes
  useEffect(() => {
    if (originalDimensions && isIndependentScaling) {
      const validation = validateScaledDimensions(originalDimensions, Math.max(...Object.values(independentScales)));
      if (!validation.isValid) {
        alert(validation.message);
        const maxScale = calculateMaxAllowedScale(originalDimensions);
        setIndependentScales({ width: maxScale, height: maxScale, depth: maxScale });
        return;
      }

      const newDimensions = {
        width: originalDimensions.width * independentScales.width,
        height: originalDimensions.height * independentScales.height,
        depth: originalDimensions.depth * independentScales.depth,
      };
      setScaledDimensions(newDimensions);
    }
  }, [independentScales, originalDimensions, isIndependentScaling]);

  // Calcular el máximo factor de escala permitido cuando se carga un modelo
  useEffect(() => {
    if (originalDimensions) {
      const maxScale = calculateMaxAllowedScale(originalDimensions);
      setMaxUniformScale(maxScale);

      const maxWidthScale = 300 / originalDimensions.width;
      const maxHeightScale = 300 / originalDimensions.height;
      const maxDepthScale = 330 / originalDimensions.depth;

      setMaxIndependentScales({
        width: maxWidthScale,
        height: maxHeightScale,
        depth: maxDepthScale,
      });
    }
  }, [originalDimensions]);

  const handleFileChange = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const uploadedFile = acceptedFiles[0];
      loadModel(uploadedFile);
    }
  };

  const loadModel = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target?.result) return;

      let loader: THREE.Loader;
      let fileGeometry: THREE.BufferGeometry;

      if (file.name.endsWith(".stl")) {
        loader = new STLLoader();
        try {
          fileGeometry = (loader as STLLoader).parse(event.target.result as ArrayBuffer);
          processGeometry(fileGeometry);
        } catch (error) {
          console.error("Error parsing STL file:", error);
        }
      } else if (file.name.endsWith(".obj")) {
        loader = new OBJLoader();
        try {
          const object = (loader as OBJLoader).parse(event.target.result as string);
          if (object.children.length > 0 && object.children[0] instanceof THREE.Mesh) {
            const mesh = object.children[0] as THREE.Mesh;
            if (mesh.geometry instanceof THREE.BufferGeometry) {
              fileGeometry = mesh.geometry;
              processGeometry(fileGeometry);
            }
          }
        } catch (error) {
          console.error("Error parsing OBJ file:", error);
        }
      }
    };

    reader.onerror = (error) => {
      console.error("FileReader error:", error);
    };

    reader.readAsArrayBuffer(file);
  };

  const processGeometry = (geometry: THREE.BufferGeometry) => {
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    if (!box) return;

    // Centrar la geometría en el origen
    geometry.center();

    // Calcular dimensiones originales
    const width = box.max.x - box.min.x;
    const height = box.max.y - box.min.y;
    const depth = box.max.z - box.min.z;

    setOriginalDimensions({ width, height, depth });
    setScaledDimensions({ width, height, depth }); // Inicialmente no hay escala
    setGeometry(geometry);
  };

  const handleUniformScaleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newScale = parseFloat(event.target.value);
    setUniformScale(newScale);
    setIsIndependentScaling(false); // Desactivar escalado independiente
  };

  const handleIndependentScaleChange = (axis: keyof Dimensions, value: number) => {
    setIndependentScales((prev) => ({ ...prev, [axis]: value }));
    setIsIndependentScaling(true); // Activar escalado independiente
  };

  const toggleScalingMode = () => {
    setIsIndependentScaling((prev) => !prev);
    if (!isIndependentScaling) {
      // Restablecer escalas independientes a 1 cuando se desactiva el escalado independiente
      setIndependentScales({ width: 1, height: 1, depth: 1 });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileChange,
    accept: {
      "model/stl": [".stl"],
      "model/obj": [".obj"],
    },
  });

  return (
    <main className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6 text-orange-500">Cotizador 3D</h1>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Panel izquierdo */}
        <div className="md:w-1/2">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`p-6 border-2 border-dashed rounded-md transition-colors ${
              isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
            }`}
          >
            <input {...getInputProps()} />
            <p className="text-center text-gray-700">
              Arrastra y suelta un archivo STL/OBJ aquí, o haz clic para seleccionar uno.
            </p>
          </div>

          {/* Selector de material */}
          {filaments.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Material:</label>
              <select
                value={selectedFilamentId || ""}
                onChange={(e) => setSelectedFilamentId(e.target.value)}
                className="mt-2 p-2 border rounded w-full"
              >
                {filaments.map((filament) => (
                  <option key={filament.id} value={filament.id}>
                    {filament.name} - ${filament.costPerCubicMM.toFixed(2)}/mm³
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Escalado uniforme */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Escala Uniforme:</label>
            <input
              type="range"
              min="0.1"
              max={maxUniformScale}
              step="0.01"
              value={uniformScale}
              onChange={handleUniformScaleChange}
              disabled={isIndependentScaling}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-center">{`${(uniformScale * 100).toFixed(0)}%`}</p>
          </div>

          {/* Alternar entre escalado uniforme e independiente */}
          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isIndependentScaling}
                onChange={toggleScalingMode}
                className="mr-2"
              />
              Activar Escalado Independiente
            </label>
          </div>

          {/* Escalado independiente */}
          {isIndependentScaling && scaledDimensions && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-800">Escalado Independiente:</h3>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700">Ancho (mm):</label>
                <input
                  type="range"
                  min="0.1"
                  max={maxIndependentScales.width}
                  step="0.01"
                  value={independentScales.width}
                  onChange={(e) =>
                    handleIndependentScaleChange("width", parseFloat(e.target.value))
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-center">{scaledDimensions.width.toFixed(2)} mm</p>
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700">Alto (mm):</label>
                <input
                  type="range"
                  min="0.1"
                  max={maxIndependentScales.height}
                  step="0.01"
                  value={independentScales.height}
                  onChange={(e) =>
                    handleIndependentScaleChange("height", parseFloat(e.target.value))
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-center">{scaledDimensions.height.toFixed(2)} mm</p>
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700">Profundidad (mm):</label>
                <input
                  type="range"
                  min="0.1"
                  max={maxIndependentScales.depth}
                  step="0.01"
                  value={independentScales.depth}
                  onChange={(e) =>
                    handleIndependentScaleChange("depth", parseFloat(e.target.value))
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-center">{scaledDimensions.depth.toFixed(2)} mm</p>
              </div>
            </div>
          )}

          {/* Resumen del pedido */}
          {quote !== null && (
            <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-800">Resumen del Pedido:</h3>
              <p className="mt-2 text-gray-700">
                <strong>Dimensiones:</strong> {scaledDimensions?.width.toFixed(2)} x{" "}
                {scaledDimensions?.height.toFixed(2)} x {scaledDimensions?.depth.toFixed(2)} mm
              </p>
              <p className="text-gray-700">
                <strong>Costo Estimado:</strong> ${quote.toFixed(2)} MXN
              </p>
              <button className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded w-full transition-colors">
                Agregar al Carrito
              </button>
            </div>
          )}
        </div>

        {/* Panel derecho */}
        <div className="md:w-1/2">
          {/* Visor 3D */}
          {geometry && scaledDimensions && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Vista Previa del Modelo</h2>
              <ModelViewer geometry={geometry} scale={scaledDimensions} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}