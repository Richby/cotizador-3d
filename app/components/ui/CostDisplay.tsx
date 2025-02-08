// app/(components)/ui/CostDisplay.tsx
'use client';
import { useStore } from '@/store/useStore';

const CostDisplay: React.FC = () => {
  const { cost } = useStore();

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Costo Estimado:</h2>
      {cost !== null ? (
        <p className="text-2xl font-bold text-green-600">
          {cost.toFixed(2)} MXN {/* Muestra el costo con 2 decimales y la moneda */}
        </p>
      ) : (
        <p>Selecciona un modelo y opciones para calcular el costo.</p>
      )}
    </div>
  );
};

export default CostDisplay;