export interface BoardSpace {
  id: number;
  name: string;
  type: 'property' | 'railroad' | 'utility' | 'corner' | 'tax' | 'chance' | 'community-chest' | 'jail';
  color?: string;
  price?: number;
  rent?: number[];
  taxAmount?: number;
  position: 'bottom' | 'left' | 'top' | 'right';
}

export const boardSpaces: BoardSpace[] = [
  { id: 0, name: 'GO', type: 'corner', position: 'bottom' },
  { id: 1, name: 'Barrio Aranjuez', type: 'property', color: 'brown', price: 60000, rent: [2000, 10000, 30000, 90000, 160000, 250000], position: 'bottom' },
  { id: 2, name: 'Arca Comunitaria', type: 'community-chest', position: 'bottom' },
  { id: 3, name: 'Barrio Manrique', type: 'property', color: 'brown', price: 60000, rent: [4000, 20000, 60000, 180000, 320000, 450000], position: 'bottom' },
  { id: 4, name: 'Impuesto de Renta DIAN', type: 'tax', taxAmount: 200000, position: 'bottom' },
  { id: 5, name: 'Metro Línea A', type: 'railroad', price: 200000, position: 'bottom' },
  { id: 6, name: 'Bello Centro', type: 'property', color: 'lightblue', price: 100000, rent: [6000, 30000, 90000, 270000, 400000, 550000], position: 'bottom' },
  { id: 7, name: 'Suerte', type: 'chance', position: 'bottom' },
  { id: 8, name: 'Copacabana', type: 'property', color: 'lightblue', price: 100000, rent: [6000, 30000, 90000, 270000, 400000, 550000], position: 'bottom' },
  { id: 9, name: 'Girardota', type: 'property', color: 'lightblue', price: 120000, rent: [8000, 40000, 100000, 300000, 450000, 600000], position: 'bottom' },
  
  { id: 10, name: 'Cárcel', type: 'corner', position: 'right' },
  { id: 11, name: 'Itagüí Centro', type: 'property', color: 'pink', price: 140000, rent: [10000, 50000, 150000, 450000, 625000, 750000], position: 'right' },
  { id: 12, name: 'EPM Energía', type: 'utility', price: 150000, position: 'right' },
  { id: 13, name: 'El Guayabo', type: 'property', color: 'pink', price: 140000, rent: [10000, 50000, 150000, 450000, 625000, 750000], position: 'right' },
  { id: 14, name: 'La Estrella', type: 'property', color: 'pink', price: 160000, rent: [12000, 60000, 180000, 500000, 700000, 900000], position: 'right' },
  { id: 15, name: 'Metro Línea B', type: 'railroad', price: 200000, position: 'right' },
  { id: 16, name: 'Envigado Centro', type: 'property', color: 'orange', price: 180000, rent: [14000, 70000, 200000, 550000, 750000, 950000], position: 'right' },
  { id: 17, name: 'Arca Comunitaria', type: 'community-chest', position: 'right' },
  { id: 18, name: 'Zona Rosa', type: 'property', color: 'orange', price: 180000, rent: [14000, 70000, 200000, 550000, 750000, 950000], position: 'right' },
  { id: 19, name: 'Sabaneta', type: 'property', color: 'orange', price: 200000, rent: [16000, 80000, 220000, 600000, 800000, 1000000], position: 'right' },
  
  { id: 20, name: 'Parqueadero Gratis', type: 'corner', position: 'top' },
  { id: 21, name: 'Laureles', type: 'property', color: 'red', price: 220000, rent: [18000, 90000, 250000, 700000, 875000, 1050000], position: 'top' },
  { id: 22, name: 'Suerte', type: 'chance', position: 'top' },
  { id: 23, name: 'Carlos E. Restrepo', type: 'property', color: 'red', price: 220000, rent: [18000, 90000, 250000, 700000, 875000, 1050000], position: 'top' },
  { id: 24, name: 'Estadio', type: 'property', color: 'red', price: 240000, rent: [20000, 100000, 300000, 750000, 925000, 1100000], position: 'top' },
  { id: 25, name: 'Metrocable', type: 'railroad', price: 200000, position: 'top' },
  { id: 26, name: 'La 70', type: 'property', color: 'yellow', price: 260000, rent: [22000, 110000, 330000, 800000, 975000, 1150000], position: 'top' },
  { id: 27, name: 'Nutibara', type: 'property', color: 'yellow', price: 260000, rent: [22000, 110000, 330000, 800000, 975000, 1150000], position: 'top' },
  { id: 28, name: 'Acueducto EPM', type: 'utility', price: 150000, position: 'top' },
  { id: 29, name: 'El Tesoro', type: 'property', color: 'yellow', price: 280000, rent: [24000, 120000, 360000, 850000, 1025000, 1200000], position: 'top' },
  
  { id: 30, name: 'Vaya a Bellavista', type: 'corner', position: 'left' },
  { id: 31, name: 'Manila', type: 'property', color: 'green', price: 300000, rent: [26000, 130000, 390000, 900000, 1100000, 1275000], position: 'left' },
  { id: 32, name: 'El Poblado Centro', type: 'property', color: 'green', price: 300000, rent: [26000, 130000, 390000, 900000, 1100000, 1275000], position: 'left' },
  { id: 33, name: 'Arca Comunitaria', type: 'community-chest', position: 'left' },
  { id: 34, name: 'Zona Rosa Poblado', type: 'property', color: 'green', price: 320000, rent: [28000, 150000, 450000, 1000000, 1200000, 1400000], position: 'left' },
  { id: 35, name: 'Tranvía', type: 'railroad', price: 200000, position: 'left' },
  { id: 36, name: 'Suerte', type: 'chance', position: 'left' },
  { id: 37, name: 'El Poblado', type: 'property', color: 'darkblue', price: 350000, rent: [35000, 175000, 500000, 1100000, 1300000, 1500000], position: 'left' },
  { id: 38, name: 'Impuesto de Lujo', type: 'tax', taxAmount: 1500000, position: 'left' },
  { id: 39, name: 'Llanogrande', type: 'property', color: 'darkblue', price: 400000, rent: [50000, 200000, 600000, 1400000, 1700000, 2000000], position: 'left' }
];