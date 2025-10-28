export interface Store {
  id: string;
  name: string;
  category: string;
  logo?: string;
  latitude: number;
  longitude: number;
  address: string;
}

export interface StoreWithDistance extends Store {
  distance: number;
}

// Mock stores for demonstration (São Paulo area coordinates)
export const MOCK_STORES: Store[] = [
  {
    id: '1',
    name: 'Café do Centro',
    category: 'Cafeteria',
    latitude: -23.5505,
    longitude: -46.6333,
    address: 'Av. Paulista, 1000',
  },
  {
    id: '2',
    name: 'Loja Mix Presentes',
    category: 'Presentes',
    latitude: -23.5489,
    longitude: -46.6388,
    address: 'Rua Augusta, 500',
  },
  {
    id: '3',
    name: 'Restaurante Bom Sabor',
    category: 'Restaurante',
    latitude: -23.5615,
    longitude: -46.6562,
    address: 'Rua da Consolação, 2000',
  },
  {
    id: '4',
    name: 'Farmácia Saúde',
    category: 'Farmácia',
    latitude: -23.5470,
    longitude: -46.6420,
    address: 'Av. Brigadeiro, 300',
  },
  {
    id: '5',
    name: 'Padaria Pão Quente',
    category: 'Padaria',
    latitude: -23.5520,
    longitude: -46.6300,
    address: 'Rua Haddock Lobo, 150',
  },
];
