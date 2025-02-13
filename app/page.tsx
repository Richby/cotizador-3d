"use client";

import { useState, useEffect } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

import { useDropzone } from "react-dropzone";
import ModelViewer from "./components/ModelViewer";
import FilamentSelector from "./components/ui/FilamentSelector";
import CostDisplay from "./components/ui/CostDisplay";
import Button from "./components/ui/Button";

import { estimatePrintCost } from "@/lib/calculations";

interface Dimensions {
  width: number;
  height: number;
  depth: number;
}

export default function Home() {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [dimensions, setDimensions] = useState<Dimensions | null>(null);

  const [filaments, setFilaments] = useState<any[]>([]);
  const [selectedFilament, setSelectedFilament] = useState<string | null>(null);

  const [quote, setQuote] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);

  // scale => inicia en 1
  const [scale, setScale] = useState<number>(1);

  // Cargar filamentos
  useEffect(() => {
    const fetchFilaments = async () => {
      try {
        const res = await fetch("/api/filaments");
        if (res.ok) {
          const data = await res.json();
          setFilaments(data);
          if (data.length > 0) setSelectedFilament(data[0].id);
        } else {
          console.error("Error fetching filaments:", await res.text());
        }
      } catch (error) {
        console.error("Error fetching filaments:", error);
      }
    };
    fetchFilaments();
  }, []);

  // Calcular costo
  useEffect(() => {
    if (dimensions && selectedFilament && filaments.length > 0) {
      const sel = filaments.find(f => f.id === selectedFilament);
      if (sel) {
        const volume = dimensions.width * dimensions.height * dimensions.depth;
        const cost = estimatePrintCost(volume, sel.costPerCubicMM);
        setQuote(cost);
      }
    }
  }, [dimensions, selectedFilament, filaments]);

  // Dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "model/stl": [".stl"],
      "model/obj": [".obj"]
    },
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const uploadedFile = acceptedFiles[0];
        setFile(uploadedFile);
        loadModel(uploadedFile);
      }
    }
  });

  // Cargar Modelo: leer OBJ como texto, STL como ArrayBuffer
  function loadModel(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target?.result) return;

      if (file.name.endsWith(".stl")) {
        const loader = new STLLoader();
        const geom = loader.parse(e.target.result as ArrayBuffer);
        setGeometry(geom);
      } else if (file.name.endsWith(".obj")) {
        const loader = new OBJLoader();
        const object = loader.parse(e.target.result as string);
        if (object.children.length > 0 && object.children[0] instanceof THREE.Mesh) {
          const mesh = object.children[0] as THREE.Mesh;
          if (mesh.geometry instanceof THREE.BufferGeometry) {
            setGeometry(mesh.geometry);
          }
        }
      }
    };

    // Leer según la extensión
    if (file.name.endsWith(".stl")) {
      reader.readAsArrayBuffer(file);
    } else if (file.name.endsWith(".obj")) {
      reader.readAsText(file, "utf-8");
    }
  }

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Cotizador 3D</h1>

      <div className="flex flex-col md:flex-row gap-4">
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

          {/* Selector de filamento */}
          {filaments.length > 0 && (
            <FilamentSelector
              filaments={filaments}
              selectedFilamentId={selectedFilament}
              onChange={setSelectedFilament}
            />
          )}

          {/* Dimensiones */}
          {dimensions && (
            <div className="mt-4">
              <p>Ancho: {dimensions.width.toFixed(2)} mm</p>
              <p>Alto: {dimensions.height.toFixed(2)} mm</p>
              <p>Profundidad: {dimensions.depth.toFixed(2)} mm</p>
            </div>
          )}

          {/* Costo */}
          {quote !== null && <CostDisplay cost={quote} />}

          <Button className="mt-4">Agregar al carrito</Button>
        </div>

        <div className="md:w-1/2">
          {geometry && (
            <ModelViewer
              geometry={geometry}
              setDimensions={setDimensions}
              scale={scale}  // <= Importante: usa 1 o un factor > 0
            />
          )}
        </div>
      </div>
    </main>
  );
}
