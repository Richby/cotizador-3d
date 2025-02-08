"use client";

import { useState, useEffect } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import ModelViewer from ".././components/ModelViewer";
import { estimatePrintCost, calculateVolume } from "../../lib/calculations"; // Asegúrate de que las rutas sean correctas
import { useDropzone } from 'react-dropzone';

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
  const [layerMultiplier, setLayerMultiplier] = useState<number>(1.0);
  const [infillMultiplier, setInfillMultiplier] = useState<number>(1.0);
  const [scale, setScale] = useState<number>(1); // Escala como fracción (1 = 100%)
    const [fileSizeMultiplier, setFileSizeMultiplier] = useState<number>(1.0);


  // Cargar filamentos desde la API (asumiendo que tienes /api/filaments)
  useEffect(() => {
    const fetchFilaments = async () => {
      try {
        const res = await fetch("/api/filaments");
        if (res.ok) {
          const data = await res.json();
          setFilaments(data);
          if (data.length > 0) {
            setSelectedFilamentId(data[0].id); // Seleccionar el primer filamento
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

  // --- Funciones de Manejo de Eventos ---
    const handleMaterialChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedFilamentId(event.target.value);
    };

    const handleLayerHeightChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setLayerMultiplier(parseFloat(event.target.value));
    };

    const handleInfillDensityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setInfillMultiplier(parseFloat(event.target.value));
    };
    const handleScaleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newScale = parseFloat(event.target.value);
        setScale(newScale / 100); // Convertir porcentaje a fracción
    };

    //Actualizar dimensiones.
    useEffect(() => {
      if (dimensions) {
          setDimensions({
              width: dimensions.width * scale,
              height: dimensions.height * scale,
              depth: dimensions.depth * scale
          });
      }
    },[scale]);


    //useEffect para calcular costo
    useEffect(() => {
        if (dimensions && selectedFilamentId && filaments.length > 0) {
          const filament = filaments.find((f) => f.id === selectedFilamentId);
          if (filament) {
            const volume = calculateVolume(dimensions);
            const cost = estimatePrintCost(volume, filament.costPerCubicMM, layerMultiplier, infillMultiplier, fileSizeMultiplier);
            setQuote(cost);
          }
        }
      }, [dimensions, selectedFilamentId, filaments, layerMultiplier, infillMultiplier, scale, fileSizeMultiplier]);

    //Para modificar las dimensiones individualmente.
    const handleDimensionChange = (dimension: 'width' | 'height' | 'depth', value: number) => {
        if(dimensions)
            setDimensions(prevDimensions => ({
                ...prevDimensions!,
                [dimension]: value,
        }));
    };

  const handleFileChange = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const uploadedFile = acceptedFiles[0];
        setFile(uploadedFile); // Guarda el archivo en el estado
        setFileSizeMultiplier(Math.log(uploadedFile.size / 100000 + 1) + 1);
        loadModel(uploadedFile);
    }
  };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: handleFileChange,
        accept: {
            'model/stl': ['.stl'],
            'model/obj': ['.obj']
        }
    });

  const loadModel = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target?.result) return;
      if (file.name.endsWith(".stl")) {
        const loader = new STLLoader();
        const geometry = loader.parse(event.target.result);
        setGeometry(geometry);
      } else if (file.name.endsWith(".obj")) {
        const loader = new OBJLoader();
        const object = loader.parse(event.target.result as string);
        if (object.children.length > 0 && object.children[0] instanceof THREE.Mesh) {
          setGeometry(object.children[0].geometry);
        }
      }
    };
    reader.readAsArrayBuffer(file);
  };
    //Opciones para los selectores
    const layerHeights = [
        { name: "0.1 mm (Alta calidad)", multiplier: 1.2 },
        { name: "0.2 mm (Calidad estándar)", multiplier: 1.0 },
        { name: "0.3 mm (Baja calidad)", multiplier: 0.8 },
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
        <div className="md:w-1/2">
          {/* Dropzone */}
          <div {...getRootProps()} className={`p-4 border-2 border-dashed rounded-md ${isDragActive ? 'border-blue-500' : 'border-gray-300'}`}>
            <input {...getInputProps()} />
            <p>Arrastra y suelta un archivo STL/OBJ aquí, o haz clic para seleccionar un archivo.</p>
            {file && <p>Archivo seleccionado: {file.name}</p>}
          </div>

          {/* Selector de Filamentos */}
          {filaments.length > 0 && (
            <div className="mt-4">
              <label htmlFor="filament-select" className="block text-sm font-medium text-gray-700">
                Material:
              </label>
              <select
                id="filament-select"
                value={selectedFilamentId || ""}
                onChange={handleMaterialChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="" disabled>
                  Selecciona un material
                </option>
                {filaments.map((filament) => (
                  <option key={filament.id} value={filament.id}>
                    {filament.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Selector de Altura de Capa */}
          <div className="mt-4">
            <label htmlFor="layer-height-select" className="block text-sm font-medium text-gray-700">
              Altura de Capa:
            </label>
            <select
              id="layer-height-select"
              value={layerMultiplier}
              onChange={handleLayerHeightChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              {layerHeights.map((layer) => (
                <option key={layer.name} value={layer.multiplier}>
                  {layer.name}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Densidad de Relleno */}
          <div className="mt-4">
            <label htmlFor="infill-density-select" className="block text-sm font-medium text-gray-700">
              Densidad de Relleno:
            </label>
            <select
              id="infill-density-select"
              value={infillMultiplier}
              onChange={handleInfillDensityChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              {infillDensities.map((infill) => (
                <option key={infill.name} value={infill.multiplier}>
                  {infill.name}
                </option>
              ))}
            </select>
          </div>

          {/* Mostrar Dimensiones */}
          {dimensions && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold">Dimensiones del Modelo:</h3>
              <label className="block text-sm font-medium text-gray-700">Ancho (mm):</label>
              <input
                type="number"
                className="mb-2 p-2 border rounded w-full"
                value={dimensions.width.toFixed(2)}
                onChange={(e) => handleDimensionChange('width', parseFloat(e.target.value))}
              />
              <label className="block text-sm font-medium text-gray-700">Alto (mm):</label>
              <input
                type="number"
                className="mb-2 p-2 border rounded w-full"
                value={dimensions.height.toFixed(2)}
                onChange={(e) => handleDimensionChange('height', parseFloat(e.target.value))}
              />
              <label className="block text-sm font-medium text-gray-700">Profundidad (mm):</label>
              <input
                type="number"
                className="mb-2 p-2 border rounded w-full"
                value={dimensions.depth.toFixed(2)}
                onChange={(e) => handleDimensionChange('depth', parseFloat(e.target.value))}
              />
            </div>
          )}
            {/* Control de Escalado */}
            <div className="mt-4">
                <label htmlFor="scale-slider" className="block text-sm font-medium text-gray-700">
                    Escala:
                </label>
                <input
                    type="range"
                    id="scale-slider"
                    min="0.1"  // Mínimo 10%
                    max="2"  // Máximo 200%
                    step="0.01" // Pasos de 1%
                    value={scale}
                    onChange={handleScaleChange}
                    className="mt-1 block w-full"
                />
                <p className="text-center">{`${(scale * 100).toFixed(0)}%`}</p>
            </div>

          {/* Mostrar Cotización */}
          {quote !== null && (
            <div className="mt-4">
              <p>Costo Estimado: ${quote.toFixed(2)} MXN</p>
            </div>
          )}
        </div>

        <div className="md:w-1/2">
          {/* Visor 3D */}
          {geometry && <ModelViewer geometry={geometry} setDimensions={setDimensions}  scale={scale}/>}
        </div>
      </div>
    </main>
  );
}