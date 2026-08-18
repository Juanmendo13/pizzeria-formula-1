import menuData from '../data/menu.json';
import { slugify } from './menu-slug';

export type ProductType = 'pizza' | 'item';

export type PizzaSize = 'pequeña' | 'mediana' | 'familiar';

export interface Product {
  slug: string;
  type: ProductType;
  id: string;
  nombre: string;
  ingredientes?: string;
  descripcion?: string;
  imagen?: string;
  categoria?: string;
  categoriaId?: string;
  precios?: Record<PizzaSize, number>;
  precio?: string;
  precioNumero?: number;
  nuevo?: boolean;
}

export function parsePrecio(precio: string): number {
  return parseFloat(precio.replace('€', '').replace(',', '.').trim()) || 0;
}

export function formatEuro(amount: number): string {
  return `${amount.toFixed(2).replace('.', ',')}€`;
}

export function getAllProducts(): Product[] {
  const pizzas: Product[] = menuData.pizzas.map((p) => ({
    slug: `pizza-${p.id}`,
    type: 'pizza',
    id: p.id,
    nombre: p.nombre,
    ingredientes: p.ingredientes,
    imagen: p.imagen,
    precios: p.precios,
  }));

  const items: Product[] = menuData.otrasCategorias.flatMap((cat) =>
    cat.items.map((item) => ({
      slug: `${cat.id}-${slugify(item.nombre)}`,
      type: 'item' as const,
      id: `${cat.id}-${slugify(item.nombre)}`,
      nombre: item.nombre,
      descripcion: item.descripcion,
      imagen: cat.imagen,
      categoria: cat.categoria,
      categoriaId: cat.id,
      precio: item.precio,
      precioNumero: parsePrecio(item.precio),
      nuevo: item.nuevo,
    })),
  );

  return [...pizzas, ...items];
}

export function getProductBySlug(slug: string): Product | undefined {
  return getAllProducts().find((p) => p.slug === slug);
}

export const PIZZA_SIZE_LABELS: Record<PizzaSize, string> = {
  pequeña: 'Pequeña',
  mediana: 'Mediana',
  familiar: 'Familiar',
};
