// app/components/ui/CostDisplay.tsx
// components/ui/CostDisplay.tsx
import React from 'react';

// Define la interfaz para las props
interface CostDisplayProps {
  cost: number;
}

// Usa la interfaz como el tipo de las props del componente
const CostDisplay: React.FC<CostDisplayProps> = ({ cost }) => {
  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold">Cotización Estimada:</h3>
      <p><strong>Precio:</strong> ${cost.toFixed(2)} MXN</p>
    </div>
  );
};

export default CostDisplay;