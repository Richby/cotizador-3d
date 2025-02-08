// components/ui/Dropzone.tsx
'use client';
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface DropzoneProps {
  onFileAccepted: (file: File) => void;
}

const Dropzone: React.FC<DropzoneProps> = ({ onFileAccepted }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileAccepted(acceptedFiles[0]); // Solo se acepta un archivo
    }
  }, [onFileAccepted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false, // Solo se acepta un archivo a la vez
    accept: {
      'application/sla': ['.stl'], //stl MIME type
      'text/plain': ['.gcode']  //gcode MIME type
    }
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed border-gray-300 rounded-md p-4
        text-center cursor-pointer transition-colors duration-200
        ${isDragActive ? 'bg-gray-100 border-gray-500' : 'hover:bg-gray-50'}
      `}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Suelta el archivo aquí...</p>
      ) : (
        <p>Arrastra y suelta un archivo .stl o .gcode aquí, o haz clic para seleccionar uno.</p>
      )}
    </div>
  );
};

export default Dropzone;