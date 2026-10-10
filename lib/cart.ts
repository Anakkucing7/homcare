import { categories, type Service } from "./services";

export type CartItem = { name: string; quantity: number };
const storageKey = "homecare-cart-v1";
const services = new Map<string, Service>(categories.flatMap((category) => category.services.map((service) => [service.name, service])));

export function getCart(): CartItem[] {
  try {
    const saved: unknown = JSON.parse(window.sessionStorage.getItem(storageKey) ?? "[]");
    if (!Array.isArray(saved)) return [];
    return saved.flatMap((item): CartItem[] => {
      if (!item || typeof item.name !== "string" || !services.has(item.name) || !Number.isInteger(item.quantity) || item.quantity < 1) return [];
      return [{ name: item.name, quantity: Math.min(item.quantity, 99) }];
    });
  } catch {
    return [];
  }
}

function saveCart(cart: CartItem[]) {
  window.sessionStorage.setItem(storageKey, JSON.stringify(cart));
}

export function addToCart(name: string) {
  if (!services.has(name)) return;
  const cart = getCart();
  const item = cart.find((entry) => entry.name === name);
  if (item) item.quantity = Math.min(item.quantity + 1, 99);
  else cart.push({ name, quantity: 1 });
  saveCart(cart);
}

export function changeCartQuantity(name: string, change: -1 | 1) {
  const cart = getCart().flatMap((item) => {
    if (item.name !== name) return [item];
    const quantity = item.quantity + change;
    return quantity > 0 ? [{ ...item, quantity: Math.min(quantity, 99) }] : [];
  });
  saveCart(cart);
  return cart;
}

export function removeFromCart(name: string) {
  const cart = getCart().filter((item) => item.name !== name);
  saveCart(cart);
  return cart;
}
