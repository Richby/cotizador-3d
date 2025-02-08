
import create from 'zustand';

interface Dimensions {
    x: number;
    y: number;
    z: number;
}

interface AppState {
    isLoading: boolean;
    dimensions: Dimensions;
    selectedFilamentId: number | null;
    infill: number;
    layerHeight: number;
    cost: number | null;
    modelLoaded: boolean;
    error: string | null; // Agrega estado para errores
    setLoading: (isLoading: boolean) => void;
    setDimensions: (dimensions: Dimensions) => void;
    setSelectedFilamentId: (filamentId: number | null) => void;
    setInfill: (infill: number) => void;
    setLayerHeight: (layerHeight: number) => void;
    setCost: (cost: number | null) => void;
    setError: (error: string | null) => void; // Función para establecer errores
    setModelLoaded:(isLoaded: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
    isLoading: false,
    dimensions: { x: 0, y: 0, z: 0 },
    selectedFilamentId: null,
    infill: 0.2,
    layerHeight: 0.2,
    cost: null,
    modelLoaded: false,
    error: null, // Estado inicial de error
    setLoading: (isLoading) => set({ isLoading }),
    setDimensions: (dimensions) => set({ dimensions }),
    setSelectedFilamentId: (selectedFilamentId) => set({ selectedFilamentId }),
    setInfill: (infill) => set({ infill }),
    setLayerHeight: (layerHeight) => set({ layerHeight }),
    setCost: (cost) => set({ cost }),
    setError: (error) => set({ error }), // Función para establecer errores
    setModelLoaded: (isLoaded) => set({modelLoaded: isLoaded}),
}));