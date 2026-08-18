import type { PizzaSize } from './menu';

export interface CartLine {
  key: string;
  slug: string;
  nombre: string;
  size?: PizzaSize;
  sizeLabel?: string;
  precio: number;
  quantity: number;
  imagen?: string;
}

const CART_KEY = 'formula1-cart';

export function cartLineKey(slug: string, size?: PizzaSize): string {
  return size ? `${slug}:${size}` : slug;
}

export function getCart(): CartLine[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

export function saveCart(cart: CartLine[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  const count = cart.reduce((sum, line) => sum + line.quantity, 0);
  window.dispatchEvent(new CustomEvent('cart-updated', { detail: { count } }));
}

export function getCartCount(): number {
  return getCart().reduce((sum, line) => sum + line.quantity, 0);
}

export function getCartTotal(): number {
  return getCart().reduce((sum, line) => sum + line.precio * line.quantity, 0);
}

export function addToCart(line: Omit<CartLine, 'quantity'> & { quantity?: number }): void {
  const cart = getCart();
  const existing = cart.find((item) => item.key === line.key);

  if (existing) {
    existing.quantity += line.quantity ?? 1;
  } else {
    cart.push({ ...line, quantity: line.quantity ?? 1 });
  }

  saveCart(cart);
}

export function updateCartQuantity(key: string, quantity: number): void {
  let cart = getCart();

  if (quantity <= 0) {
    cart = cart.filter((line) => line.key !== key);
  } else {
    const line = cart.find((item) => item.key === key);
    if (line) line.quantity = quantity;
  }

  saveCart(cart);
}

export function clearCart(): void {
  saveCart([]);
}
