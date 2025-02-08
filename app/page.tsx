"use client";

import { useState, useEffect } from 'react';
import ModelViewer from './components/ModelViewer';
import { calculateVolume, estimatePrintCost } from '../lib/calculations'; //Verificar que exista
//import Dropzone from '../components/ui/Dropzone';  // Quitamos esto
import FilamentSelector from './components/ui/FilamentSelector'; //Asumiendo una ubicación
import CostDisplay from './components/ui/CostDisplay'; //Asumiendo una ubicación
import Button from "./components/ui/Button";  //Asumiendo que tienes un tsconfig/jsconfig, sino, usa '../components/ui/Button'
import { useDropzone } from 'react-dropzone'; // Importa useDropzone
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

interface Dimensions {
    width: number;
    height: number;
    depth: number;
}



export default function Home() {
    const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
    const [dimensions, setDimensions] = useState<Dimensions | null>(null);
    const [selectedFilament, setSelectedFilament] = useState<string | null>(null);
    const [filaments, setFilaments] = useState<any[]>([]); // Cambia 'any' por el tipo correcto
    const [quote, setQuote] = useState<number | null>(null);
    const [file, setFile] = useState<File | null>(null);


    useEffect(() => {
        const fetchFilaments = async () => {
            try {
                const res = await fetch('/api/filaments');
                if (res.ok) {
                    const data = await res.json();
                    setFilaments(data);
                    if (data.length > 0) {
                        setSelectedFilament(data[0].id);
                    }
                } else {
                    console.error('Error fetching filaments:', await res.text());
                }
            } catch (error) {
                console.error('Error fetching filaments:', error);
            }
        };
        fetchFilaments();
    }, []);



    useEffect(() => {
        if (dimensions && selectedFilament && filaments.length > 0) {
            const selectedFilamentData = filaments.find(f => f.id === selectedFilament);
            if (selectedFilamentData) {
                const volume = dimensions.width * dimensions.height * dimensions.depth;
                const cost = estimatePrintCost(volume, selectedFilamentData.costPerCubicMM);
                setQuote(cost);
            }
        }
    }, [dimensions, selectedFilament, filaments]);



    const { getRootProps, getInputProps, isDragActive } = useDropzone({  //Configuración del dropzone
        accept: {
            'model/stl': ['.stl'],
            'model/obj': ['.obj']
        },
        onDrop: acceptedFiles => {
            if (acceptedFiles.length > 0) {
                const uploadedFile = acceptedFiles[0];
                setFile(uploadedFile); // Guardar el archivo en el estado
                loadModel(uploadedFile);
            }
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
                //Verificar que haya un mesh
                if (object.children.length > 0 && object.children[0] instanceof THREE.Mesh) {
                  setGeometry(object.children[0].geometry);
                }
            }
        };
        reader.readAsArrayBuffer(file); // Para archivos binarios como STL y OBJ
    };

    return (
        <main className="p-4">
            <h1 className="text-2xl font-bold text-center">Cotizador 3D</h1>
            <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-1/2">
                    {/* Usar react-dropzone directamente */}
                    <div {...getRootProps()} className={`p-4 border-2 border-dashed rounded-md ${isDragActive ? 'border-blue-500' : 'border-gray-300'}`}>
                        <input {...getInputProps()} />
                        <p>Arrastra y suelta un archivo STL/OBJ aquí, o haz clic para seleccionar un archivo.</p>
                        {file && <p>Archivo seleccionado: {file.name}</p>}
                    </div>

                    {filaments.length > 0 && (
                        <FilamentSelector
                            filaments={filaments}
                            selectedFilamentId={selectedFilament}
                            onChange={setSelectedFilament}
                        />
                    )}
                    {dimensions && (
                        <div className="mt-4">
                            <p>Ancho: {dimensions.width.toFixed(2)} mm</p>
                            <p>Alto: {dimensions.height.toFixed(2)} mm</p>
                            <p>Profundidad: {dimensions.depth.toFixed(2)} mm</p>
                        </div>
                    )}
                    {quote !== null && <CostDisplay cost={quote} />}
                    <Button>Agregar al carrito</Button>
                </div>

                <div className="md:w-1/2">
                   {geometry && <ModelViewer geometry={geometry} setDimensions={setDimensions} scale={0} />}
                </div>
            </div>
        </main>
    );
}