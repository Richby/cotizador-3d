"use client";

import { useState, useEffect } from "react";
import * as THREE from "three";
// Loaders:
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";

import ModelViewer from "../components/ModelViewer";   // Ajusta la ruta según tu estructura
import { calculateVolume, estimatePrintCost } from "@/lib/calculations";
import { useDropzone } from 'react-dropzone';

// Interfaces simples
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
  const [dimensions, setDimensions] = useState<Dimensions | null>(null);

  const [selectedFilamentId, setSelectedFilamentId] = useState<string | null>(null);
  const [filaments, setFilaments] = useState<Filament[]>([]);

  const [quote, setQuote] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);

  // Multiplicadores
  const [layerMultiplier, setLayerMultiplier] = useState<number>(1.0);
  const [infillMultiplier, setInfillMultiplier] = useState<number>(1.0);
  const [scale, setScale] = useState<number>(1);       // Ojo: inicia en 1 (100%)
  const [fileSizeMultiplier, setFileSizeMultiplier] = useState<number>(1.0);

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

  // Recalcular cotización al cambiar dimensiones/filamento/etc.
  useEffect(() => {
    if (dimensions && selectedFilamentId && filaments.length > 0) {
      const filament = filaments.find(f => f.id === selectedFilamentId);
      if (filament) {
        const volume = calculateVolume(dimensions);
        const cost = estimatePrintCost(
          volume,
          filament.costPerCubicMM,
          layerMultiplier,
          infillMultiplier,
          fileSizeMultiplier
        );
        setQuote(cost);
      }
    }
  }, [dimensions, selectedFilamentId, filaments, layerMultiplier, infillMultiplier, fileSizeMultiplier]);

  // Dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileChange,
    accept: {
      "model/stl": [".stl"],
      "model/obj": [".obj"]
    }
  });

  function handleFileChange(acceptedFiles: File[]) {
    if (acceptedFiles.length > 0) {
      const uploadedFile = acceptedFiles[0];
      setFile(uploadedFile);
      setFileSizeMultiplier(Math.log(uploadedFile.size / 100000 + 1) + 1);
      loadModel(uploadedFile);
    }
  }

  // Cargar modelo
  function loadModel(file: File) {
    const reader = new FileReader();

    reader.onload = (event) => {
      if (!event.target?.result) return;

      // Chequear extensión
      if (file.name.endsWith(".stl")) {
        // STL se lee como ArrayBuffer
        const loader = new STLLoader();
        try {
          const fileGeometry = loader.parse(event.target.result as ArrayBuffer);
          setGeometry(fileGeometry);
        } catch (error) {
          console.error("Error parsing STL file:", error);
        }
      } else if (file.name.endsWith(".obj")) {
        // OBJ se lee como texto
        const loader = new OBJLoader();
        try {
          const object = loader.parse(event.target.result as string);
          if (object.children.length > 0 && object.children[0] instanceof THREE.Mesh) {
            const mesh = object.children[0] as THREE.Mesh;
            if (mesh.geometry instanceof THREE.BufferGeometry) {
              setGeometry(mesh.geometry);
            } else {
              console.error("OBJ child geometry is not BufferGeometry");
            }
          } else {
            console.error("OBJ does not contain a valid Mesh");
          }
        } catch (error) {
          console.error("Error parsing OBJ file:", error);
        }
      } else {
        console.error("Unsupported file format:", file.name);
      }
    };

    // Leer según la extensión
    if (file.name.endsWith(".stl")) {
      reader.readAsArrayBuffer(file);
    } else if (file.name.endsWith(".obj")) {
      reader.readAsText(file, "utf-8");
    }
  }

  // Handlers de selects y sliders
  function handleMaterialChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedFilamentId(e.target.value);
  }

  function handleLayerHeightChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setLayerMultiplier(parseFloat(e.target.value));
  }

  function handleInfillDensityChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setInfillMultiplier(parseFloat(e.target.value));
  }

  function handleScaleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newScale = parseFloat(e.target.value);
    setScale(newScale / 100);  // De % a factor
  }

  // Modificar dimensiones manualmente
  function handleDimensionChange(dimension: "width" | "height" | "depth", value: number) {
    if (!dimensions) return;
    setDimensions(prev => ({ ...prev!, [dimension]: value }));
  }

  // Listas de ejemplo
  const layerHeights = [
    { name: "0.1 mm (Alta calidad)", multiplier: 1.2 },
    { name: "0.2 mm (Estándar)", multiplier: 1.0 },
    { name: "0.3 mm (Rápido)", multiplier: 0.8 },
  ];

  const infillDensities = [
    { name: "10% (Bajo)", multiplier: 0.8 },
    { name: "25% (Medio)", multiplier: 1.0 },
    { name: "50% (Alto)", multiplier: 1.3 },
  ];

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Cotizador 3D</h1>
      <div className="flex flex-col md:flex-row gap-4">
        
        {/* Columna izquierda */}
        <div className="md:w-1/2">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`p-4 border-2 border-dashed rounded-md ${isDragActive ? "border-blue-500" : "border-gray-300"}`}
          >
            <input {...getInputProps()} />
            <p>Arrastra y suelta un archivo STL/OBJ aquí, o haz clic para seleccionar uno.</p>
            {file && <p>Archivo seleccionado: {file.name}</p>}
          </div>

          {/* Selector de filamentos */}
          {filaments.length > 0 && (
            <select
              value={selectedFilamentId || ""}
              onChange={handleMaterialChange}
              className="mt-4 p-2 border rounded w-full"
            >
              {filaments.map((filament) => (
                <option key={filament.id} value={filament.id}>
                  {filament.name}
                </option>
              ))}
            </select>
          )}

          {/* Selección de altura de capa */}
          <label className="block text-sm font-medium text-gray-700 mt-4">Altura de Capa</label>
          <select
            className="mb-4 p-2 border rounded w-full"
            onChange={handleLayerHeightChange}
            value={layerMultiplier}
          >
            {layerHeights.map((layer) => (
              <option key={layer.name} value={layer.multiplier}>
                {layer.name}
              </option>
            ))}
          </select>

          {/* Selección de relleno */}
          <label className="block text-sm font-medium text-gray-700">Densidad de Relleno</label>
          <select
            className="mb-4 p-2 border rounded w-full"
            onChange={handleInfillDensityChange}
            value={infillMultiplier}
          >
            {infillDensities.map((inf) => (
              <option key={inf.name} value={inf.multiplier}>
                {inf.name}
              </option>
            ))}
          </select>

          {/* Dimensiones */}
          {dimensions && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold">Dimensiones del Modelo (mm):</h3>

              <label className="block text-sm font-medium text-gray-700">Ancho</label>
              <input
                type="number"
                className="mb-2 p-2 border rounded w-full"
                value={dimensions.width.toFixed(2)}
                onChange={(e) => handleDimensionChange("width", parseFloat(e.target.value))}
              />

              <label className="block text-sm font-medium text-gray-700">Alto</label>
              <input
                type="number"
                className="mb-2 p-2 border rounded w-full"
                value={dimensions.height.toFixed(2)}
                onChange={(e) => handleDimensionChange("height", parseFloat(e.target.value))}
              />

              <label className="block text-sm font-medium text-gray-700">Profundidad</label>
              <input
                type="number"
                className="mb-2 p-2 border rounded w-full"
                value={dimensions.depth.toFixed(2)}
                onChange={(e) => handleDimensionChange("depth", parseFloat(e.target.value))}
              />
            </div>
          )}

          {/* Escalado */}
          <div className="mt-4">
            <label htmlFor="scale-slider" className="block text-sm font-medium text-gray-700">
              Escala:
            </label>
            <input
              type="range"
              id="scale-slider"
              min="10"
              max="200"
              step="1"
              value={scale * 100}
              onChange={handleScaleChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-center">{`${(scale * 100).toFixed(0)}%`}</p>
          </div>

          {/* Mostrar Cotización */}
          {quote !== null && (
            <div className="mt-4">
              <p>Costo Estimado: ${quote.toFixed(2)} MXN</p>
            </div>
          )}

          {/* Botón (placeholder) */}
          <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Agregar al Carrito
          </button>
        </div>

        {/* Columna derecha: Visor 3D */}
        <div className="md:w-1/2">
          {geometry && (
            <ModelViewer
              geometry={geometry}
              setDimensions={setDimensions}
              scale={scale}   // Ojo: scale ya no es 0
            />
          )}
        </div>
      </div>
    </main>
  );
}
