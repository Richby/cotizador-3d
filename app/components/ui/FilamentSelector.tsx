// app/components/ui/FilamentSelector.tsx
'use client';
import { useStore } from '@/store/useStore';
interface Filament {
  id: number;
  name: string;
}

interface FilamentSelectorProps {
    filaments: Filament[];
}

const FilamentSelector: React.FC<FilamentSelectorProps> = ({ filaments }) => {
  const { setSelectedFilamentId } = useStore();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(event.target.value, 10); // Convierte a número
    setSelectedFilamentId(id);
  };

  return (
    <div>
      <label htmlFor="filament-select" className="block text-sm font-medium text-gray-700">
        Selecciona un filamento:
      </label>
      <select
        id="filament-select"
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        onChange={handleChange}
      >
        <option value="">-- Selecciona --</option>
        {filaments.map((filament) => (
          <option key={filament.id} value={filament.id}>
            {filament.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilamentSelector;