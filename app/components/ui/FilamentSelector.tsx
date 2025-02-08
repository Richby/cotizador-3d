// components/ui/FilamentSelector.tsx
import React from 'react';

// Definir la interfaz FilamentSelectorProps
interface FilamentSelectorProps {
    filaments: { id: string; name: string; costPerCubicMM: number }[]; // Define la estructura de tus filamentos
    selectedFilamentId: string | null;  // El ID del filamento seleccionado
    onChange: (filamentId: string | null) => void; // Función para manejar el cambio
}

const FilamentSelector: React.FC<FilamentSelectorProps> = ({ filaments, selectedFilamentId, onChange }) => {
    return (
        <select
            value={selectedFilamentId || ''} // Usar un string vacío como valor por defecto
            onChange={(e) => onChange(e.target.value)}
            className="mt-4 p-2 border rounded w-full"
        >
            {filaments.map((filament) => (
                <option key={filament.id} value={filament.id}>
                    {filament.name}
                </option>
            ))}
        </select>
    );
};

export default FilamentSelector;