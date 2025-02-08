// app/components/ui/CostDisplay.tsx
'use client';
import { useStore } from '@/store/useStore';

const CostDisplay: React.FC = () => {
  const { cost, error } = useStore(); // Obtiene el costo y el error

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Costo Estimado:</h2>
      {error && <p className="text-red-500">{error}</p>} {/* Muestra el error */}
      {cost !== null ? (
        <p className="text-2xl font-bold text-green-600">
          {cost.toFixed(2)} MXN
        </p>
      ) : (
        <p>Selecciona un modelo y opciones para calcular el costo.</p>
      )}
    </div>
  );
};

export default CostDisplay;